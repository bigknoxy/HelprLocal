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
const signups: { eventId: string; userId: string; timestamp: Date }[] = [];
const notifications: { recipientId: string; type: string; message: string; timestamp: Date }[] = [];
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
function requireAuth(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  const token = (authHeader && authHeader.split(' ')[1]) || '';
  const payload = verifyJwt(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  req.user = payload;
  next();
}
app.post('/api/events', (req: AuthenticatedRequest, res: express.Response) => {
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
    organizationId: '1',
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
app.post(
  '/api/events/:id/signup',
  requireAuth,
  (req: AuthenticatedRequest, res: express.Response) => {
    const eventId = req.params.id;
    const userId = typeof req.user?.id === 'string' ? req.user.id : '';
    if (!userId) {
      return res.status(401).json({ error: 'Invalid user' });
    }
    const event = events.find((e) => e.id === eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (signups.find((s) => s.eventId === eventId && s.userId === userId)) {
      return res.status(409).json({ error: 'Already signed up for this event' });
    }
    signups.push({ eventId, userId, timestamp: new Date() });
    // Notification for org admin
    notifications.push({
      recipientId: String(event.organizationId),
      type: 'signup',
      message: `User ${userId} signed up for event ${event.title}`,
      timestamp: new Date(),
    });
    // Notification for volunteer
    notifications.push({
      recipientId: userId,
      type: 'signup',
      message: `You signed up for event ${event.title}`,
      timestamp: new Date(),
    });
    res.status(201).json({ message: 'Signup successful' });
  },
);
app.get('/api/notifications', requireAuth, (req: AuthenticatedRequest, res: express.Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Invalid user' });
  }
  const userNotifications = notifications.filter((n) => n.recipientId === userId);
  res.json(userNotifications);
});

describe('Notifications Endpoints', () => {
  let volunteerToken = '';
  let orgAdminToken = '';
  let eventId = '';
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
    orgAdminToken = orgRes.body.token;
    // Login volunteer
    const volRes = await request(app)
      .post('/api/login')
      .send({ email: 'vol@example.com', password: 'VolPass123!' });
    volunteerToken = volRes.body.token;
    // Create event
    const eventRes = await request(app)
      .post('/api/events')
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
    eventId = eventRes.body.id;
  });

  it('returns empty notifications for new users', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${volunteerToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('creates notifications for both org admin and volunteer on signup', async () => {
    // Volunteer signs up
    const signupRes = await request(app)
      .post(`/api/events/${eventId}/signup`)
      .set('Authorization', `Bearer ${volunteerToken}`)
      .send();
    expect(signupRes.status).toBe(201);
    // Volunteer notifications
    const volNotifRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${volunteerToken}`);
    expect(volNotifRes.status).toBe(200);
    expect(volNotifRes.body.length).toBe(1);
    expect(volNotifRes.body[0].message).toContain('You signed up for event');
    // Org admin notifications
    const orgNotifRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${orgAdminToken}`);
    expect(orgNotifRes.status).toBe(200);
    expect(orgNotifRes.body.length).toBe(1);
    expect(orgNotifRes.body[0].message).toContain('signed up for event');
  });

  it('requires JWT for notifications endpoint', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('rejects invalid JWT for notifications endpoint', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});
