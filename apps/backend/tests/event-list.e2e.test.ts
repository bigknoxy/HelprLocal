import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { hashPassword, signJwt, verifyJwt, comparePassword } from '../utils/auth.ts';
import type { User } from '../models/User.ts';
import type { Event } from '../models/Event.ts';

const app = express();
app.use(bodyParser.json());
const users: User[] = [];
const events: Event[] = [];
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
app.post('/api/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const normalizedEmail = normalizeEmail(email);
  if (users.find((u) => u.email === normalizedEmail)) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const passwordHash = await hashPassword(password);
  const newUser: User = {
    id: String(users.length + 1),
    name,
    email: normalizedEmail,
    passwordHash,
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  users.push(newUser);
  res.status(201).json({ message: 'User registered successfully' });
});
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);
  const user = users.find((u) => u.email === normalizedEmail);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  let valid = false;
  if (user && user.passwordHash) {
    valid = await comparePassword(password, user.passwordHash);
  }
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = signJwt({ id: user.id, role: user.role });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});
interface AuthenticatedRequest extends express.Request {
  user?: any;
}
function requireOrgAdmin(
  req: AuthenticatedRequest,
  res: express.Response,
  next: express.NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  const token = authHeader ? authHeader.split(' ')[1] : '';
  const payload = verifyJwt(token ?? '');
  if (!payload || payload.role !== 'org_admin') {
    return res.status(403).json({ error: 'Forbidden: org admin only' });
  }
  req.user = payload;
  next();
}
app.post('/api/events', requireOrgAdmin, (req: AuthenticatedRequest, res: express.Response) => {
  const {
    title,
    description,
    date,
    startTime,
    endTime,
    location,
    requiredVolunteers,
    skillsRequired,
  } = req.body;
  if (
    !title ||
    !description ||
    !date ||
    !startTime ||
    !endTime ||
    !location ||
    !requiredVolunteers
  ) {
    return res.status(400).json({ error: 'Missing required event fields' });
  }
  const newEvent: Event = {
    id: String(events.length + 1),
    organizationId: req.user.id,
    title,
    description,
    date: new Date(date),
    startTime,
    endTime,
    location,
    requiredVolunteers: Number(requiredVolunteers),
    skillsRequired: skillsRequired || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  events.push(newEvent);
  res.status(201).json(newEvent);
});
app.get('/api/events', (req, res) => {
  let filteredEvents = events;
  const { date, location, skill } = req.query;
  if (date) {
    filteredEvents = filteredEvents.filter(
      (e) => e.date.toISOString().slice(0, 10) === String(date),
    );
  }
  if (location) {
    filteredEvents = filteredEvents.filter((e) =>
      e.location.toLowerCase().includes(String(location).toLowerCase()),
    );
  }
  if (skill) {
    filteredEvents = filteredEvents.filter(
      (e) => e.skillsRequired && e.skillsRequired.includes(String(skill)),
    );
  }
  res.json(filteredEvents);
});

describe('Event Listing Endpoints', () => {
  let orgToken = '';
  beforeAll(async () => {
    // Register org admin
    await request(app)
      .post('/api/register')
      .send({
        name: 'Org Admin',
        email: 'org@example.com',
        password: 'OrgPass123!',
        role: 'org_admin',
      });
    // Login org admin
    const orgRes = await request(app)
      .post('/api/login')
      .send({ email: 'org@example.com', password: 'OrgPass123!' });
    orgToken = orgRes.body.token;
    // Create events
    await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${orgToken}`)
      .send({
        title: 'Beach Cleanup',
        description: 'Help clean the local beach.',
        date: '2025-08-10T09:00:00.000Z',
        startTime: '09:00',
        endTime: '12:00',
        location: 'Main Beach',
        requiredVolunteers: 10,
        skillsRequired: ['teamwork'],
      });
    await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${orgToken}`)
      .send({
        title: 'Park Planting',
        description: 'Plant trees in the park.',
        date: '2025-08-11T10:00:00.000Z',
        startTime: '10:00',
        endTime: '13:00',
        location: 'Central Park',
        requiredVolunteers: 5,
        skillsRequired: ['gardening'],
      });
  });

  it('lists all events', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it('filters events by date', async () => {
    const res = await request(app).get('/api/events?date=2025-08-10');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe('Beach Cleanup');
  });

  it('filters events by location', async () => {
    const res = await request(app).get('/api/events?location=park');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe('Park Planting');
  });

  it('filters events by skill', async () => {
    const res = await request(app).get('/api/events?skill=teamwork');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe('Beach Cleanup');
  });
});
