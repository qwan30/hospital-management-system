# Authentication API

**Status:** aligned with the repository on 2026-06-14.

Authentication flows for staff and patient portal users. The system uses JWT access tokens with httpOnly refresh cookies.

---

## Overview

The HMS provides two independent authentication domains:

| Domain | Base Path | Controller | Users |
|--------|-----------|------------|-------|
| Staff | `/api/v1/auth` | `AuthController` | Doctors, nurses, receptionists, pharmacists, accountants, admins |
| Patient | `/api/v1/patient-auth` | `PatientAuthController` | Portal patients |

Both use the same underlying `JwtTokenService` with separate cookie namespaces.

---

## Token Architecture

### JWT Access Token

- **Format:** Signed JWT (HMAC-SHA with configurable secret from `JWT_SECRET`)
- **Location:** `Authorization: Bearer <token>` request header
- **Expiration:** 900 seconds (15 minutes) -- configurable via `security.jwt.access-token-expiration-seconds`
- **Claims:**
  - `sub`: User UUID
  - `role`: User role (`ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST`, `PHARMACIST`, `ACCOUNTANT`, `PATIENT`)
  - `name`: User display name
  - `iat`: Issued-at timestamp
  - `exp`: Expiration timestamp

### Refresh Token

- **Format:** Signed JWT with `"type": "refresh"` and `"scope": "staff"` or `"scope": "patient"` claims
- **Location:** httpOnly cookie (primary), also accepted in request body
- **Expiration:** 604,800 seconds (7 days) -- configurable via `security.jwt.refresh-token-expiration-seconds`
- **Cookie names:**
  - Staff: `hms_refresh_token` (configurable via `security.jwt.refresh-cookie-name`)
  - Patient: `hms_refresh_token_patient` (`refreshCookieName + "_patient"`)

Refresh cookies are:
- `httpOnly`: Not accessible via JavaScript
- `secure`: Configurable via `HMS_SECURE_COOKIES` (default `false` for development)
- `sameSite`: Configurable via `HMS_REFRESH_COOKIE_SAME_SITE` (default `Lax`)
- Path-scoped: Staff cookie bound to `/api/v1/auth`, patient cookie bound to `/api/v1/patient-auth`

---

## Staff Authentication Flow

### Login

```
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "doctor1@hospital.vn",
  "password": "Doctor@1234"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "fullName": "Dr. Nguyen Van An",
    "role": "DOCTOR",
    "tokens": {
      "accessToken": "eyJhbGci...",
      "refreshToken": null,
      "expiresInSeconds": 900
    }
  },
  "message": "Authenticated successfully"
}
```

- Access token is returned in the response body.
- Refresh token is set as an httpOnly cookie (`hms_refresh_token`).
- The `refreshToken` field in the response is always `null` for security.

**Error responses:**
- `401` with code `unauthorized` if credentials are invalid
- `429` with code `rate_limited` if rate limit exceeded

### Refresh

```
POST /api/v1/auth/refresh
```

Two methods are supported for providing the refresh token:
1. Cookie (primary): The httpOnly `hms_refresh_token` cookie is sent automatically by the browser.
2. Request body (fallback):

```json
{
  "refreshToken": "eyJhbGci..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": null,
    "expiresInSeconds": 900
  },
  "message": "Access token refreshed"
}
```

- A new access token is returned.
- A new refresh cookie is issued (rotation).
- The `refreshToken` field in the response is always `null`.

### Logout

```
POST /api/v1/auth/logout
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": "Logged out",
  "message": "Logged out"
}
```

- The refresh cookie is cleared (Max-Age set to 0).
- No server-side token blacklist is maintained (tokens are stateless).

---

## Patient Authentication Flow

### Claim (First-Time Activation)

```
POST /api/v1/patient-auth/claim
```

Creates a patient portal account using patient identification information.

**Request Body:**
```json
{
  "cccdHash": "sha256-hash",
  "email": "patient@example.com",
  "password": "Patient@1234"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "fullName": "Nguyen Thi Hoa",
    "role": "PATIENT",
    "tokens": {
      "accessToken": "eyJhbGci...",
      "refreshToken": null,
      "expiresInSeconds": 900
    }
  },
  "message": "Patient portal access activated"
}
```

### Login

```
POST /api/v1/patient-auth/login
```

**Request Body:**
```json
{
  "email": "patient@example.com",
  "password": "Patient@1234"
}
```

**Response (200 OK):** Same structure as staff login, with role set to `PATIENT`.

### Refresh

```
POST /api/v1/patient-auth/refresh
```

Same mechanics as staff refresh, but using the `hms_refresh_token_patient` cookie. Request body fallback is also supported.

### Logout

```
POST /api/v1/patient-auth/logout
```

Clears the `hms_refresh_token_patient` cookie.

---

## JWT Configuration Reference

Configured via `application.yml` under `security.jwt`:

| Property | Default | Environment Variable | Description |
|----------|---------|---------------------|-------------|
| `secret` | -- | `JWT_SECRET` | HMAC signing key (required) |
| `access-token-expiration-seconds` | 900 | -- | Access token lifetime |
| `refresh-token-expiration-seconds` | 604800 | -- | Refresh token lifetime (7 days) |
| `refresh-cookie-name` | `hms_refresh_token` | -- | Cookie name for staff refresh token |

Security HTTP properties under `security.http`:

| Property | Default | Environment Variable | Description |
|----------|---------|---------------------|-------------|
| `allowed-origins[0]` | `http://localhost:3000` | `HMS_ALLOWED_ORIGIN_PRIMARY` | CORS allowed origin |
| `allowed-origins[1]` | `http://localhost:4173` | `HMS_ALLOWED_ORIGIN_SECONDARY` | CORS allowed origin |
| `allow-credentials` | `false` | `HMS_ALLOW_CREDENTIALS` | CORS credentials flag |
| `secure-cookies` | `false` | `HMS_SECURE_COOKIES` | Cookie secure flag |
| `refresh-cookie-same-site` | `Lax` | `HMS_REFRESH_COOKIE_SAME_SITE` | Cookie SameSite attribute |
| `public-rate-limit-per-minute` | 30 | `HMS_PUBLIC_RATE_LIMIT_PER_MINUTE` | Public endpoint rate limit |

---

## JWT Implementation Details

### JwtTokenService

Located at `backend/application/src/main/java/com/hospital/api/auth/JwtTokenService.java`.

Key methods:

| Method | Description |
|--------|-------------|
| `generateAccessToken(UserEntity)` | Creates access JWT with `sub`, `role`, `name` claims |
| `generateAccessToken(UUID, String, String)` | Creates access JWT from raw identity data |
| `generateRefreshToken(UserEntity)` | Creates refresh JWT with `type: refresh` and `scope: staff` |
| `generateRefreshToken(UUID, String)` | Creates refresh JWT with custom scope |
| `parseClaims(String)` | Validates signature and parses JWT claims |
| `refreshCookieName()` | Returns staff cookie name |
| `patientRefreshCookieName()` | Returns patient cookie name |

Token generation uses JJWT (io.jsonwebtoken) with `Jwts.builder()` and HMAC-SHA signing via `Keys.hmacShaKeyFor()`.

### JwtAuthenticationFilter

Located at `backend/controller/src/main/java/com/hospital/api/auth/JwtAuthenticationFilter.java`.

A `OncePerRequestFilter` that intercepts every request:

1. Reads the `Authorization` header.
2. If it starts with `Bearer `, extracts the token.
3. Parses and validates the JWT via `JwtTokenService.parseClaims()`.
4. Extracts the `role` claim and creates a `UsernamePasswordAuthenticationToken` with `ROLE_{role}` authority.
5. Sets the authentication in `SecurityContextHolder`.
6. On failure, clears the security context and writes a standardized error response via `SecurityErrorResponseWriter`.

**Error handling:**
- `ExpiredJwtException` -> 401, `"Access token has expired"`
- `JwtException` / `IllegalArgumentException` -> 401, `"Bearer token is malformed"`
- Missing or blank `role` claim -> 401, `"Bearer token is malformed"`

If no `Authorization` header is present, the filter chain continues without authentication (protected endpoints reject via Spring Security configuration).

---

## RBAC Permissions

The system defines 7 roles with 36 RBAC permissions:

| Role | Typical Permissions |
|------|---------------------|
| `ADMIN` | Full system access: users, departments, rooms, schedules, stats, monitoring, audit logs, content, news |
| `DOCTOR` | Clinical workflows: appointments, medical records, queue, vital signs, lab results, own schedule |
| `NURSE` | Queue management, vital signs, basic clinical data entry |
| `RECEPTIONIST` | Patient registration, appointment booking, check-in |
| `PHARMACIST` | Inventory items, lots, movements, dispense operations |
| `ACCOUNTANT` | Invoices, pricing, revenue reports |
| `PATIENT` | Portal access: own appointments, lab results, messages, profile |

---

## Security Flow Diagram

```
Client                    Server
  |                         |
  |--- POST /auth/login --->|
  |                         |-- Validate credentials
  |                         |-- JwtTokenService.generateAccessToken()
  |                         |-- JwtTokenService.generateRefreshToken()
  |<--- 200 + cookie -------|-- Set-Cookie: hms_refresh_token (httpOnly)
  |    { accessToken }      |
  |                         |
  |--- GET /protected ----->|
  |    Authorization:       |-- JwtAuthenticationFilter
  |    Bearer <accessToken> |-- parseClaims() -> SecurityContextHolder
  |<--- 200 response -------|
  |                         |
  |--- POST /auth/refresh ->|
  |    Cookie: hms_refresh  |-- Validate refresh token
  |    _token=<refresh>     |-- Rotate tokens
  |<--- 200 + new cookie ---|-- Set-Cookie: hms_refresh_token (new)
  |    { newAccessToken }   |
  |                         |
  |--- POST /auth/logout -->|
  |<--- 200 + clear cookie -|-- Set-Cookie: hms_refresh_token (maxAge=0)
```

---

## Frontend Integration

The frontend stores the access token in `sessionStorage` (not `localStorage`). The `apiRequest` utility in `web/src/lib/api-client.ts`:

1. Reads the token from `sessionStorage`.
2. Attaches it as `Authorization: Bearer <token>`.
3. On 401 responses, attempts a refresh via `POST /api/v1/auth/refresh`.
4. If refresh fails, redirects to the login page.

Staff and patient authentication use separate session storage keys and API base paths.
