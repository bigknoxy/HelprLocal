# HelprLocal Backend Documentation

## Event Signup Endpoint

### Endpoint

`POST /api/events/:eventId/signup`

### Description

Allows a volunteer to sign up for an event. Organization admins are explicitly forbidden from signing up for events.

### Role-Based Access Control (RBAC)

- **Volunteers**: Allowed to sign up for events.
- **Organization Admins**: Forbidden from signing up.
- **Unauthenticated Users**: Forbidden.

### Request

- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "notes": "Optional notes from volunteer" }`

### Responses & Status Codes

- **201 Created**: Signup successful.
- **403 Forbidden**:
  - User is an organization admin (not allowed).
  - User is unauthenticated or lacks volunteer role.
- **409 Conflict**:
  - Volunteer has already signed up for this event.
- **404 Not Found**:
  - Event does not exist.
- **401 Unauthorized**:
  - Invalid or missing authentication token.

### Example Response

```json
// 201 Created
{
  "signupId": "abc123",
  "eventId": "evt456",
  "userId": "vol789",
  "notes": "Looking forward to helping!"
}
```

---

## Automated Test Coverage

### Event Signup

- **Positive Cases**: Volunteers can sign up for events.
- **Negative Cases**:
  - Organization admins and unauthenticated users are forbidden.
  - Duplicate signups return conflict.
  - Nonexistent events return not found.
  - Invalid payloads are rejected.

### Notifications

- Volunteers receive notifications upon successful signup.
- Edge cases (e.g., notification failures) are covered.

### Boundary & Error Cases

- All RBAC scenarios are tested.
- Payload validation and error handling are covered.
- System robust against malformed requests and role violations.

---

## Jest/ts-jest ESM + TypeScript Configuration

- **Jest** is configured to support ESM modules and TypeScript via `ts-jest`.
- Key settings in `jest.config.mjs`:
  - `preset: 'ts-jest/presets/js-with-ts-esm'`
  - `testEnvironment: 'node'`
  - `extensionsToTreatAsEsm: ['.ts']`
  - `moduleFileExtensions: ['ts', 'js', 'json', 'mjs']`
- All test files use `.ts` and import ESM modules natively.
- For future maintainers: update `tsconfig.json` and `jest.config.mjs` if adding new ESM features or changing TypeScript settings.

---

## QA Status

- **All backend tests pass.**
- The system is robust against role-based and payload errors.
- Automated tests cover all critical and edge cases for event signup and notifications.
