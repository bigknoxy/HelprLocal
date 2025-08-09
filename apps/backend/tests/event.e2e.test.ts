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
// Extend Express Request type for user
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

describe('Event Endpoints', () => {
  let orgToken = '';
  let volunteerToken = '';
  beforeAll(async () => {
    // Register org admin
    await request(app).post('/api/register').send({
      name: 'Org Admin',
      email: 'org@example.com',
      password: 'OrgPass123!',
      role: 'org_admin',
    });
    // Register volunteer
    await request(app).post('/api/register').send({
      name: 'Volunteer',
      email: 'vol@example.com',
      password: 'VolPass123!',
      role: 'volunteer',
    });
    // Login org admin
    const orgRes = await request(app)
      .post('/api/login')
      .send({ email: 'org@example.com', password: 'OrgPass123!' });
    orgToken = orgRes.body.token;
    // Login volunteer
    const volRes = await request(app)
      .post('/api/login')
      .send({ email: 'vol@example.com', password: 'VolPass123!' });
    volunteerToken = volRes.body.token;
  });

  it('allows org admin to create event', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${orgToken}`)
      .send({
        title: 'Beach Cleanup',
        description: 'Help clean the local beach.',
        date: new Date().toISOString(),
        startTime: '09:00',
        endTime: '12:00',
        location: 'Main Beach',
        requiredVolunteers: 10,
        skillsRequired: ['teamwork'],
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Beach Cleanup');
  });

  it('rejects event creation with missing fields', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${orgToken}`)
      .send({ title: 'Incomplete Event' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('rejects event creation for non-org user', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${volunteerToken}`)
      .send({
        title: 'Beach Cleanup',
        description: 'Help clean the local beach.',
        date: new Date().toISOString(),
        startTime: '09:00',
        endTime: '12:00',
        location: 'Main Beach',
        requiredVolunteers: 10,
      });
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  it('rejects event creation with missing/invalid JWT', async () => {
    const res = await request(app).post('/api/events').send({
      title: 'Beach Cleanup',
      description: 'Help clean the local beach.',
      date: new Date().toISOString(),
      startTime: '09:00',
      endTime: '12:00',
      location: 'Main Beach',
      requiredVolunteers: 10,
    });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});
