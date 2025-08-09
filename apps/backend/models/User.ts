export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'volunteer' | 'org_admin';
  organizationId?: string; // If org admin
  skills?: string[];
  createdAt: Date;
  updatedAt: Date;
}
