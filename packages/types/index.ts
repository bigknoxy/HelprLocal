export interface Event {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  requiredVolunteers: number;
  skillsRequired?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Signup {
  id: string;
  eventId: string;
  userId: string;
  signupTime: Date;
  status: 'confirmed' | 'cancelled';
  hoursVolunteered?: number;
}

export interface Organization {
  id: string;
  name: string;
  email: string;
  description?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'volunteer' | 'org_admin';
  organizationId?: string;
  skills?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  date: Date;
  read: boolean;
}
