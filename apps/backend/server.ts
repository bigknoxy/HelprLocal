import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';
const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`, req.body);
  next();
});

// In-memory data stores for MVP
const users: { id: string; email: string; password: string; role: string }[] = [];
const events: any[] = [];
const signups: { eventId: string; userId: string; timestamp: Date }[] = [];
const notifications: { recipientId: string; type: string; message: string; timestamp: Date }[] = [];

// AuthenticatedRequest type
interface AuthenticatedRequest extends express.Request {
  user?: any;
}

// requireAuth middleware
function requireAuth(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });
  const token = authHeader.replace('Bearer ', '');
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
// Registration endpoint
app.post('/api/auth/register', (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Missing email, password, or role' });
  }
  if (users.find((u) => u.email === email)) {
    return res.status(409).json({ error: 'User already exists' });
  }
  const id = String(users.length + 1);
  users.push({ id, email, password, role });
  const token = jwt.sign({ id, email, role }, process.env.JWT_SECRET || 'changeme');
  res.status(201).json({ token, user: { id, email, role } });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'changeme',
  );
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

// ... previous code ...
app.post(
  '/api/events/:id/signup',
  requireAuth,
  (req: AuthenticatedRequest, res: express.Response) => {
    const eventId = req.params.id;
    const userId = req.user?.id;
    console.log('Signup attempt:', req.user);
    if (!userId) {
      return res.status(401).json({ error: 'Invalid user' });
    }
    // RBAC: Only volunteers can sign up
    if (req.user?.role !== 'volunteer') {
      return res.status(403).json({ error: 'Only volunteers can sign up for events' });
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
    if (event) {
      notifications.push({
        recipientId: event.organizationId,
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
    }
    res.status(201).json({ message: 'Signup successful' });
  },
);

// Notifications listing endpoint
app.get('/api/notifications', requireAuth, (req: AuthenticatedRequest, res: express.Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Invalid user' });
  }
  const userNotifications = notifications.filter((n) => n.recipientId === String(userId));
  res.json(userNotifications);
});

const PORT = process.env.PORT || 4000;
try {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  // Catch-all 404 handler
  app.use((req, res) => {
    console.error(`[404] ${req.method} ${req.url} - Not Found`);
    res.status(404).json({ error: 'Not Found' });
  });
} catch (err) {
  console.error('Server startup error:', err);
}
