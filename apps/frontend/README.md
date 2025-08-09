# HelprLocal Frontend

## Tech Stack

- React + TypeScript (Create React App)
- Tailwind CSS (v3, mobile-first, responsive)
- React Router
- Redux Toolkit
- React Query
- Prettier, ESLint (with accessibility plugin)

## Folder Structure

- `/components` — Reusable UI components
- `/pages` — Route-based pages (Register, Login, Events, Event Details, Notifications, Profile)
- `/api` — API utilities
- `/contexts` — React context providers
- `/hooks` — Custom hooks

## Setup Instructions

1. `npm install` — Install dependencies
2. `npm start` — Run development server
3. `npm run build` — Build for production

## Shared Types

- Shared backend models (User, Event, Signup, Organization) are available in the frontend via a relative import:
  ```ts
  import type { User, Event, Signup, Organization } from '../../../../packages/types/index';
  ```
- This enables type-safe API calls and consistent contracts between frontend and backend.

## API Client

- Use `src/api/client.ts` for all API requests. Example usage:
  ```ts
  import { login, fetchEvents } from './api/client';
  // login(email, password), fetchEvents()
  ```
- The API client handles base URL, error handling, and authentication.

## Architecture Notes

- Mobile-first, fully responsive UI
- All new features use feature flags
- TypeScript for all code
- Organized imports, consistent formatting (Prettier, ESLint)
- Accessibility best practices (eslint-plugin-jsx-a11y)

## Tailwind CSS

- Config: `tailwind.config.js` (content: `src/**/*.{js,jsx,ts,tsx}`)
- Directives: `@tailwind base; @tailwind components; @tailwind utilities;` in `src/index.css`

## Routing

- See `src/App.tsx` for route setup

## Placeholder Pages

- Register, Login, Events, Event Details, Notifications, Profile

---

For more details, see the backend README and AGENTS.md for full-stack guidelines.
