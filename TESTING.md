# SentinelAuth — Complete Testing Guide

> **Who is this for?** Anyone who wants to test and understand how SentinelAuth works,
> using Postman, Insomnia, or the browser console — without writing any code.

---

## Before You Start

### Start the server

```bash
cd server
npm run dev
```

You should see: `Server running on port 5000`

### Import the Postman collection

A ready-to-use Postman collection file is included at the root of this project:

```
SentinelAuth.postman_collection.json
```

**How to import:**
1. Open Postman
2. Click **Import** (top left)
3. Drag and drop `SentinelAuth.postman_collection.json`
4. The full collection appears in your sidebar

All requests are pre-wired. You just fill in values and hit **Send**.

---

## How Postman is Set Up

Every request uses a **baseUrl** variable so you only change one place if the port changes.

```
baseUrl = http://localhost:5000
```

The Login request includes a **Test Script** that automatically saves your tokens after a
successful login:

```javascript
// This runs automatically after you click Send on the Login request
const json = pm.response.json();
if (json.success) {
  pm.collectionVariables.set('accessToken', json.data.accessToken);
  pm.collectionVariables.set('refreshToken', json.data.refreshToken);
}
```

After login, all other requests automatically use `{{accessToken}}` in the
`Authorization: Bearer {{accessToken}}` header. You never paste tokens manually.

---

## Step-by-Step Test Order

Follow these steps in order. Each step builds on the previous one.

---

### STEP 1 — Health Check

**What it does:** Confirms the server is alive.

```
GET http://localhost:5000/health
```

No headers needed. Just hit Send.

**You should see:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-03T10:00:00.000Z"
}
```

If you see a connection error, the server is not running.

---

### STEP 2 — Register a New Account

**What it does:** Creates a user. The server hashes the password with Argon2 and sends
a 6-digit OTP to the email address for verification.

**Request:**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json
```

**Body:**
```json
{
  "email": "alice@example.com",
  "password": "AlicePass@123",
  "name": "Alice"
}
```

**Successful response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "userId": "a1b2c3d4-0000-0000-0000-000000000001"
  }
}
```

**Copy the `userId`.** You need it in the next step.

**Errors to understand:**

| What you send | What you get |
|---|---|
| `"password": "abc"` | `400` — Password must be at least 8 characters |
| `"password": "password123"` | `400` — Password appears in known data breaches |
| Same email twice | `409` — Email already in use |
| Missing `email` field | `422` — Validation error |

---

### STEP 3 — Verify Your Email

**What it does:** Confirms you own the email address using the 6-digit OTP that was sent.

> Check the email inbox of `alice@example.com`. If you are running the mail service locally
> (Mailtrap, Mailhog, etc.) check there. The code expires in **10 minutes** and works **once**.

**Request:**
```
POST http://localhost:5000/api/auth/verify-email
Content-Type: application/json
```

**Body:**
```json
{
  "userId": "a1b2c3d4-0000-0000-0000-000000000001",
  "code": "482931"
}
```

**Successful response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": null
}
```

**Errors to understand:**

| What you send | What you get |
|---|---|
| Wrong code | `400` — Invalid or expired OTP |
| Right code used twice | `400` — Invalid or expired OTP (single-use) |
| Right code after 10 min | `400` — Invalid or expired OTP (expired) |

---

### STEP 4 — Login

**What it does:** Validates credentials and returns two tokens:
- `accessToken` — short-lived JWT (15 minutes). Used on every API request.
- `refreshToken` — long-lived JWT (7 days). Used only to get a new access token.

**Request:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "alice@example.com",
  "password": "AlicePass@123"
}
```

**Successful response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhMWIyYzNkNC0wMDAwIiwiZW1haWwiOiJhbGljZUBleGFtcGxlLmNvbSIsInJvbGUiOiJVU0VSIiwianRpIjoiOTk5IiwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTc0NjI2MDAwMCwiZXhwIjoxNzQ2MjYwOTAwfQ.sig",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhMWIyYzNkNC0wMDAwIiwic2Vzc2lvbklkIjoic2Vzc2lvbi11dWlkIiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NDYyNjAwMDAsImV4cCI6MTc0NjM0NjQwMH0.sig"
  }
}
```

**The Postman test script saves both tokens automatically.** After this step, all
authenticated requests will work without pasting anything.

**Brute force protection test:**

Send the wrong password **5 times in a row**:
```json
{ "email": "alice@example.com", "password": "WRONGPASSWORD" }
```

On the 5th attempt you get:
```json
{
  "success": false,
  "message": "Account locked due to too many failed attempts"
}
```

The account is locked for 15 minutes.

---

### STEP 5 — Get Your Profile

**What it does:** Fetches the logged-in user's details. Requires the access token in the header.

**Request:**
```
GET http://localhost:5000/api/users/me
Authorization: Bearer {{accessToken}}
```

In Postman the `{{accessToken}}` is filled in automatically from the login step.

**Successful response (200):**
```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-0000-0000-0000-000000000001",
    "email": "alice@example.com",
    "name": "Alice",
    "role": "USER",
    "isEmailVerified": true,
    "isActive": true,
    "lastLoginAt": "2026-05-03T10:00:00.000Z",
    "createdAt": "2026-05-03T09:00:00.000Z"
  }
}
```

**Test with no token:**
Remove the Authorization header and send again:
```json
{ "success": false, "message": "No token provided" }
```

**Test with a fake token:**
```
Authorization: Bearer thisisnotarealtoken
```
```json
{ "success": false, "message": "Invalid or expired token" }
```

---

### STEP 6 — Sessions

Every login creates a **session** row in the database. It tracks which device/browser
is logged in and links to the refresh token.

#### 6a. List Your Sessions

```
GET http://localhost:5000/api/sessions
Authorization: Bearer {{accessToken}}
```

**Successful response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "sess-0001-uuid",
      "deviceId": "abc123fingerprint",
      "userAgent": "PostmanRuntime/7.43.0",
      "ip": "127.0.0.1",
      "isRevoked": false,
      "expiresAt": "2026-05-10T10:00:00.000Z",
      "createdAt": "2026-05-03T10:00:00.000Z"
    }
  ]
}
```

**To see multiple sessions:** Login from Postman AND from the browser at
`http://localhost:3000`. Then call this endpoint — you will see one entry per login.

#### 6b. Revoke One Session (sign out one device)

Copy a `session id` from the list above, then:

```
DELETE http://localhost:5000/api/sessions/sess-0001-uuid
Authorization: Bearer {{accessToken}}
```

**Successful response:**
```json
{ "success": true, "message": "Session revoked", "data": null }
```

The refresh token for that session is now dead. The access token for that session
still technically works for up to 15 minutes (it is a self-contained JWT), but it
cannot be renewed.

#### 6c. Revoke All Sessions (sign out everywhere)

```
DELETE http://localhost:5000/api/sessions
Authorization: Bearer {{accessToken}}
```

Every refresh token for this user is now dead.

---

### STEP 7 — Refresh Token

**What it does:** When the access token expires (after 15 min), call this to get a new pair
without asking the user to log in again. The Axios client in the browser does this
automatically — this step shows you what happens under the hood.

**Request:**
```
POST http://localhost:5000/api/auth/refresh
Content-Type: application/json
```

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Successful response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ... new access token ...",
    "refreshToken": "eyJ... new refresh token ..."
  }
}
```

**Important:** The old refresh token is **immediately revoked**. If you try to use it again:
```json
{ "success": false, "message": "Invalid or expired refresh token" }
```

This is **refresh token rotation** — it prevents a stolen refresh token from being used
indefinitely.

---

### STEP 8 — Logout

**What it does:**
1. Adds the current access token's unique ID (`jti`) to a Redis blacklist
2. Marks the current session as revoked

**Request:**
```
POST http://localhost:5000/api/auth/logout
Authorization: Bearer {{accessToken}}
```

**Successful response:**
```json
{ "success": true, "message": "Logged out successfully", "data": null }
```

**Test immediately after logout (use the same old accessToken):**
```
GET http://localhost:5000/api/users/me
Authorization: Bearer <the token you just used to logout>
```

Result:
```json
{ "success": false, "message": "Token has been revoked" }
```

This happens instantly because of Redis. Without the blacklist, the old JWT would still
work for another ~15 minutes.

---

### STEP 9 — API Keys

API keys are for **scripts, automations, and external tools** — not browsers.
They do not expire automatically (unless you set an expiry) and never need refreshing.

#### 9a. Create an API Key

You must be logged in (access token required).

**Request:**
```
POST http://localhost:5000/api/keys
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

**Body — with specific permissions and an expiry date:**
```json
{
  "name": "My CI/CD Script",
  "permissions": ["read:profile", "read:sessions"],
  "expiresAt": "2026-12-31"
}
```

**Body — permanent key with full access (no permission restriction):**
```json
{
  "name": "Admin Script"
}
```

**Successful response (201):**
```json
{
  "success": true,
  "message": "API key created. Store it securely — it will not be shown again.",
  "data": {
    "id": "key-uuid-0001",
    "name": "My CI/CD Script",
    "prefix": "sk_a1b2c3",
    "key": "sk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z",
    "permissions": ["read:profile", "read:sessions"],
    "lastUsedAt": null,
    "expiresAt": "2026-12-31T00:00:00.000Z",
    "isActive": true,
    "createdAt": "2026-05-03T10:00:00.000Z"
  }
}
```

**Copy `data.key` now.** The database only stores a hash of it. There is no way to
retrieve the full key again — if you lose it, revoke and create a new one.

The `prefix` field (`sk_a1b2c3`) is what you see in the dashboard to identify keys
without exposing the full secret.

#### 9b. Use the API Key

Instead of `Authorization: Bearer <token>`, use `X-Api-Key: <your full key>`.

```
GET http://localhost:5000/api/users/me
X-Api-Key: sk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z
```

**Successful response:** Same profile data as the JWT flow.

**Try it in the browser console** (open DevTools → Console at `http://localhost:3000`):
```javascript
fetch('http://localhost:5000/api/users/me', {
  headers: { 'X-Api-Key': 'sk_a1b2c3...your full key...' }
})
  .then(r => r.json())
  .then(data => console.log(data));
```

**What the server does internally on each API key request:**
1. Reads the `X-Api-Key` header
2. Computes an HMAC-SHA256 hash of the raw key
3. Finds the matching `keyHash` in the database
4. Checks `isActive === true`
5. Checks `expiresAt` has not passed
6. Checks the owner's account is still active
7. Sets `req.user` — route continues normally
8. Updates `lastUsedAt` in the background (non-blocking)

#### 9c. List Your API Keys

```
GET http://localhost:5000/api/keys
Authorization: Bearer {{accessToken}}
```

**Response:** Only returns active keys. The `key` field is NOT included — only the
`prefix` so you can identify which key is which.

```json
{
  "success": true,
  "data": [
    {
      "id": "key-uuid-0001",
      "name": "My CI/CD Script",
      "prefix": "sk_a1b2c3",
      "permissions": ["read:profile", "read:sessions"],
      "lastUsedAt": "2026-05-03T10:05:00.000Z",
      "expiresAt": "2026-12-31T00:00:00.000Z",
      "isActive": true,
      "createdAt": "2026-05-03T10:00:00.000Z"
    }
  ]
}
```

#### 9d. Revoke an API Key

```
DELETE http://localhost:5000/api/keys/key-uuid-0001
Authorization: Bearer {{accessToken}}
```

**Test immediately after:** Use the revoked key:
```
GET http://localhost:5000/api/users/me
X-Api-Key: sk_a1b2c3...
```
```json
{ "success": false, "message": "Invalid or inactive API key" }
```

---

### STEP 10 — Admin Endpoints

Only users with `role: ADMIN` can access these. The fastest way to create an admin
for testing is to update the database directly:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'alice@example.com';
```

Then login again as Alice — the new token will carry the `ADMIN` role.

#### 10a. List All Users

```
GET http://localhost:5000/api/admin/users?page=1&limit=20
Authorization: Bearer {{adminToken}}
```

#### 10b. Lock a User

```
POST http://localhost:5000/api/admin/users/<user-id>/lock
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "durationMinutes": 60
}
```

After locking, the user cannot login for 60 minutes.

#### 10c. Unlock a User

```
POST http://localhost:5000/api/admin/users/<user-id>/unlock
Authorization: Bearer {{adminToken}}
```

#### 10d. Change a User's Role

```
PATCH http://localhost:5000/api/admin/users/<user-id>/role
Authorization: Bearer {{adminToken}}
Content-Type: application/json

{
  "role": "MODERATOR"
}
```

Valid values: `USER`, `MODERATOR`, `ADMIN`

#### 10e. Audit Logs

Every action in the system is recorded. See them all:

```
GET http://localhost:5000/api/admin/audit-logs?page=1&limit=50
Authorization: Bearer {{adminToken}}
```

Filter by a specific user:
```
GET http://localhost:5000/api/admin/audit-logs?userId=<user-id>&page=1&limit=50
Authorization: Bearer {{adminToken}}
```

---

## Password Flow — Forgot / Reset

### Forgot Password

```
POST http://localhost:5000/api/auth/forgot-password
Content-Type: application/json

{
  "email": "alice@example.com"
}
```

**Always returns success**, even if the email does not exist. This is intentional — it
prevents attackers from discovering which emails are registered.

### Reset Password

After receiving the OTP by email:

```
POST http://localhost:5000/api/auth/reset-password
Content-Type: application/json

{
  "userId": "a1b2c3d4-0000-0000-0000-000000000001",
  "code": "839201",
  "newPassword": "NewAlicePass@456"
}
```

**What happens:** All existing sessions are revoked (forced logout everywhere), then the
new password hash is saved.

---

## Security Checklist — Things to Test

| Test | How | Expected |
|---|---|---|
| Expired access token | Wait 15 min, then use it | `401 Invalid or expired token` |
| Reused refresh token | Call `/refresh` twice with same token | 2nd call → `401` |
| Blacklisted access token | Logout, use old token | `401 Token has been revoked` |
| Brute force lockout | Wrong password 5 times | `401 Account locked` |
| Locked account | Login as locked user | `401 Account is deactivated` |
| Expired API key | Use a key past `expiresAt` | `401 Invalid or inactive API key` |
| Revoked API key | Revoke, then use | `401 Invalid or inactive API key` |
| Non-admin on admin route | Regular user token on `/api/admin/*` | `403 Insufficient permissions` |
| Missing required field | Send register without email | `422 Validation error` |
| Breached password | Register with `password123` | `400 Password appears in known data breaches` |
| Rate limiting | >10 auth requests in 15 min | `429 Too Many Requests` |

---

## All API Endpoints — Quick Reference

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | None | Server health check |
| `POST` | `/api/auth/register` | None | Create account |
| `POST` | `/api/auth/login` | None | Login, get tokens |
| `POST` | `/api/auth/logout` | Bearer | Logout, blacklist token |
| `POST` | `/api/auth/refresh` | None | Renew access token |
| `POST` | `/api/auth/verify-email` | None | Verify OTP from email |
| `POST` | `/api/auth/forgot-password` | None | Send reset OTP |
| `POST` | `/api/auth/reset-password` | None | Reset password with OTP |
| `POST` | `/api/auth/change-password` | Bearer | Change password while logged in |
| `GET` | `/api/users/me` | Bearer or X-Api-Key | Get profile |
| `PATCH` | `/api/users/me` | Bearer | Update name |
| `DELETE` | `/api/users/me` | Bearer | Delete account |
| `GET` | `/api/sessions` | Bearer | List active sessions |
| `DELETE` | `/api/sessions/:id` | Bearer | Revoke one session |
| `DELETE` | `/api/sessions` | Bearer | Revoke all sessions |
| `POST` | `/api/keys` | Bearer | Create API key |
| `GET` | `/api/keys` | Bearer | List API keys |
| `DELETE` | `/api/keys/:id` | Bearer | Revoke API key |
| `GET` | `/api/admin/users` | Bearer + ADMIN | List all users |
| `GET` | `/api/admin/users/:id` | Bearer + ADMIN | Get one user |
| `PATCH` | `/api/admin/users/:id/role` | Bearer + ADMIN | Change role |
| `POST` | `/api/admin/users/:id/lock` | Bearer + ADMIN | Lock account |
| `POST` | `/api/admin/users/:id/unlock` | Bearer + ADMIN | Unlock account |
| `GET` | `/api/admin/audit-logs` | Bearer + ADMIN | View audit logs |
| `GET` | `/api/admin/sessions` | Bearer + ADMIN | View all sessions |
