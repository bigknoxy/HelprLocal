export interface Organization {
  id: string;
  name: string;
  email: string;
  description?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}
