export interface Event {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  date: Date;
  startTime: string; // e.g. '09:00'
  endTime: string; // e.g. '12:00'
  location: string;
  requiredVolunteers: number;
  skillsRequired?: string[];
  createdAt: Date;
  updatedAt: Date;
}
