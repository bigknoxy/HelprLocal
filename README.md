# HelprLocal

## Project Overview

HelprLocal is a hyper-local volunteer matching platform designed to help small non-profits, community gardens, and local event organizers connect with volunteers for specific, short-term tasks. Unlike major volunteer management software, HelprLocal is lightweight, easy to use, and focused on "micro-volunteering" opportunities that might otherwise get lost in the noise of social media.

### Real-World Problem

Small organizations often need just a handful of volunteers for specific events (e.g., "We need 3 people to help at the food bank this Saturday from 9-12"). They lack the resources for complex software, and their calls for help on social media are often overlooked.

### Project Solution

HelprLocal provides a simple, two-sided platform:

- **Organizations:** Can sign up and post micro-volunteering opportunities with dates, times, tasks, and the number of volunteers needed.
- **Volunteers:** Can browse opportunities in their local area and sign up for a slot with one click. The platform handles sending confirmation and reminder notifications.

### Key Skills Demonstrated

- **Full-Stack Development:** React frontend, Express backend, TypeScript throughout.
- **Database Design:** Models for Users, Organizations, Events, and Signups (currently in-memory for MVP).
- **User Roles & Permissions:** Distinct dashboards and capabilities for volunteers vs. organization admins.
- **Notifications System:** Organizations are notified when a volunteer signs up; volunteers receive reminders.

### Potential Enhancements

- Skill-based matching (e.g., request volunteers with "graphic design" skills)
- Reputation system (track hours, thank volunteers)
- Calendar integration (add commitments to Google/Outlook)

---

## How to Run the Project

### Prerequisites

- Node.js (v18+ recommended)
- npm (v9+ recommended)

### Install Dependencies

From the project root:

```bash
npm install
```

### Start the Backend

From the project root:

```bash
npx ts-node apps/backend/server.ts
```

The backend runs on [http://localhost:4000](http://localhost:4000).

### Start the Frontend

From the project root:

```bash
cd apps/frontend
npm run start
```

The frontend runs on [http://localhost:3000](http://localhost:3000).

---

## Usage

- **Register:** Use the "Sign Up" link on the login screen to create a volunteer or organization account.
- **Login:** Log in with your credentials.
- **Organizations:** Can post new events and view signups.
- **Volunteers:** Can browse events and sign up for available slots.
- **Notifications:** Both roles receive notifications for signups and reminders.

---

## API Summary

- **POST /api/auth/register:** Register a new user (volunteer or org admin)
- **POST /api/auth/login:** Log in and receive a JWT
- **POST /api/events:** Create a new event (org admin only)
- **GET /api/events:** List all events
- **POST /api/events/:id/signup:** Volunteer signs up for an event
- **GET /api/notifications:** List notifications for the authenticated user

---

## Edge Cases & Security

- Email normalization prevents duplicate accounts
- Passwords are hashed (planned for MVP)
- JWT tokens for authentication
- Volunteers cannot sign up for the same event twice
- Org admins only see notifications for their events

---

## Contributing

For questions or suggestions, open an issue or contact the maintainers at [https://github.com/bigknoxy/HelprLocal](https://github.com/bigknoxy/HelprLocal).
