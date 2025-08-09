# HelprLocal

... (existing content above) ...

---

## Backend API: Event Management & Notifications

### 3. Create Event

- **Endpoint:** `POST /api/events`
- **Description:** Create a new event (org admin only).
- **Auth:** JWT required, role must be `org_admin`.

#### Request Body

```json
{
  "title": "Beach Cleanup",
  "description": "Help clean the local beach.",
  "date": "2025-08-10T09:00:00.000Z",
  "startTime": "09:00",
  "endTime": "12:00",
  "location": "Main Beach",
  "requiredVolunteers": 10,
  "skillsRequired": ["teamwork"]
}
```

#### Response (Success)

- **Status:** `201 Created`
- **Body:** Event object

#### Response (Error)

| Status | Example Response                                         | Description    |
| ------ | -------------------------------------------------------- | -------------- |
| 400    | `{ "error": "Missing required event fields" }`           | Missing fields |
| 403    | `{ "error": "Forbidden: org admin only" }`               | Not org admin  |
| 401    | `{ "error": "Missing or invalid authorization header" }` | No/invalid JWT |

---

### 4. List Events

- **Endpoint:** `GET /api/events`
- **Description:** List all events, with optional filters.
- **Auth:** Not required.

#### Query Parameters

- `date` (YYYY-MM-DD): Filter by date
- `location`: Filter by location substring
- `skill`: Filter by required skill

#### Response (Success)

- **Status:** `200 OK`
- **Body:** Array of event objects

---

### 5. Event Signup

- **Endpoint:** `POST /api/events/:id/signup`
- **Description:** Volunteer signs up for an event.
- **Auth:** JWT required, role must be `volunteer`.

#### Response (Success)

- **Status:** `201 Created`
- **Body:** `{ "message": "Signup successful" }`

#### Response (Error)

| Status | Example Response                                  | Description          |
| ------ | ------------------------------------------------- | -------------------- |
| 401    | `{ "error": "Invalid user" }`                     | No/invalid JWT       |
| 404    | `{ "error": "Event not found" }`                  | Event does not exist |
| 409    | `{ "error": "Already signed up for this event" }` | Duplicate signup     |

---

### 6. Notifications

- **Endpoint:** `GET /api/notifications`
- **Description:** List notifications for the authenticated user (volunteer or org admin).
- **Auth:** JWT required.

#### Response (Success)

- **Status:** `200 OK`
- **Body:** Array of notification objects

#### Notification Object

```json
{
  "recipientId": "1",
  "type": "signup",
  "message": "User 2 signed up for event Beach Cleanup",
  "timestamp": "2025-08-09T02:19:00.000Z"
}
```

#### Response (Error)

| Status | Example Response              | Description    |
| ------ | ----------------------------- | -------------- |
| 401    | `{ "error": "Invalid user" }` | No/invalid JWT |

---

## API Usage Notes

- All endpoints expect and return JSON.
- JWT must be sent in the `Authorization: Bearer <token>` header for protected endpoints.
- All date fields are ISO 8601 strings.
- Error responses always include an `error` field.

---

## Edge Cases & Security

- Email normalization prevents duplicate accounts.
- Passwords are hashed with bcrypt.
- JWT tokens expire in 7 days.
- Volunteers cannot sign up for the same event twice.
- Org admins only see notifications for their events.

---

For questions or suggestions, open an issue or contact the maintainers.
