import type { User, Event, Notification } from '../../../../packages/types/index';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // for cookies/session
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'API error');
  }
  return res.json();
}

// Login API
export async function login(email: string, password: string): Promise<User> {
  return apiRequest<User>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// Register API
export async function register(
  name: string,
  email: string,
  password: string,
  role: 'volunteer' | 'org_admin',
  organizationId?: string,
  skills?: string[],
): Promise<User> {
  return apiRequest<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role, organizationId, skills }),
  });
}

// Fetch notifications
export async function fetchNotifications(): Promise<Notification[]> {
  const data = await apiRequest<Notification[]>('/notifications');
  return data as Notification[];
}

// Logout API
export async function logout(): Promise<void> {
  await apiRequest<void>('/auth/logout', { method: 'POST' });
}

// Example usage for fetching events
export async function fetchEvents(): Promise<Event[]> {
  return apiRequest<Event[]>('/events');
}
