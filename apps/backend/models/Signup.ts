export interface Signup {
  id: string;
  eventId: string;
  userId: string;
  signupTime: Date;
  status: 'confirmed' | 'cancelled';
  hoursVolunteered?: number;
}
