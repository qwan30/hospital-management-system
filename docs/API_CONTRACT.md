# Hospital Management System — API Contract

**Version:** v1 | **Base URL:** `/api/v1` | **Last Updated:** 2026-06-14
**Total Endpoints:** 118 mapped controller methods across 32 controllers

Canonical API contract for the Hospital Management System. All frontend and integration consumers must reference this document. Replaces the following now-removed scattered files: root `API_CONTRACT.md`, `docs/04-api/`, `docs/05-api/`, `docs/API_ENDPOINTS_COMPREHENSIVE.md`.

---

## 1. Response Envelope

Every API response uses a uniform JSON envelope:

```json
{
  "success": true,
  "data": {},
  "message": "string",
  "error": null,
  "pagination": null,
  "timestamp": "2026-06-14T00:00:00Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `success` | `boolean` | Whether the request succeeded |
| `data` | `object` / `array` | Response payload; `null` on error |
| `message` | `string` | Human-readable result message |
| `error` | `object` / `null` | Error details (`code`, `message`); `null` on success |
| `pagination` | `object` / `null` | Pagination metadata (`total`, `page`, `limit`, `totalPages`); `null` when absent |
| `timestamp` | `string` (ISO 8601) | Server-side response timestamp |

Error responses use the same envelope with `success: false`, `data: null`, and an `error` object containing `code`, `message`, and `timestamp`.

PDF endpoints (`/api/v1/medical-records/preview.pdf`, `/api/v1/medical-records/{recordId}/prescription.pdf`) return `application/pdf` instead of the JSON envelope.

---

## 2. Authentication

### 2.1 Staff Authentication

```
POST /api/v1/auth/login     — Staff login, returns JWT access token + httpOnly refresh cookie
POST /api/v1/auth/refresh   — Refresh access token via cookie or request body
POST /api/v1/auth/logout    — Logout, clears refresh cookie
```

**Login Request:**
```json
{ "email": "doctor1@hospital.vn", "password": "Doctor@1234" }
```

**Login Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "fullName": "Dr. Nguyen Van An",
    "role": "DOCTOR",
    "tokens": { "accessToken": "eyJhbGci...", "refreshToken": null, "expiresInSeconds": 900 }
  },
  "message": "Authenticated successfully"
}
```

- Access token returned in response body
- Refresh token set as httpOnly cookie (`hms_refresh_token`)
- `refreshToken` field in response is always `null`

### 2.2 Patient Authentication

```
POST /api/v1/patient-auth/claim   — First-time portal activation with identity proof
POST /api/v1/patient-auth/login   — Patient portal login
POST /api/v1/patient-auth/refresh — Refresh patient access token
POST /api/v1/patient-auth/logout  — Logout, clears patient refresh cookie
```

**Claim Request:**
```json
{ "cccdHash": "sha256-hash", "email": "patient@example.com", "password": "Patient@1234" }
```

Same token response structure as staff auth. Patient refresh cookie: `hms_refresh_token_patient`.

### 2.3 JWT Architecture

| Property | Value |
|----------|-------|
| Signing algorithm | HMAC-SHA (key from `JWT_SECRET`) |
| Access token location | `Authorization: Bearer <token>` header |
| Access token expiry | 900 seconds (15 min) |
| Refresh token location | httpOnly cookie (primary), also accepted in body |
| Refresh token expiry | 604,800 seconds (7 days) |
| Staff cookie name | `hms_refresh_token` |
| Patient cookie name | `hms_refresh_token_patient` |

**Claims (access token):** `sub` (UUID), `role` (ADMIN/DOCTOR/NURSE/RECEPTIONIST/PHARMACIST/ACCOUNTANT/PATIENT), `name` (display name), `iat`, `exp`

**Cookie properties:** httpOnly, SameSite=Lax (configurable), Path-scoped to `/api/v1/auth` or `/api/v1/patient-auth`

### 2.4 RBAC Authorization

Role-based access control enforced via `@PreAuthorize("@rbac.hasPermission(authentication, 'PERMISSION_NAME')")`.

| Role | Scope |
|------|-------|
| `ADMIN` | Full system: users, departments, rooms, schedules, stats, monitoring, audit, content, news |
| `DOCTOR` | Clinical: appointments, medical records, queue, vital signs, lab results, own schedule |
| `NURSE` | Queue management, vital signs, clinical data entry |
| `RECEPTIONIST` | Patient registration, appointment booking, check-in |
| `PHARMACIST` | Inventory items, lots, movements, dispense |
| `ACCOUNTANT` | Invoices, pricing, revenue reports, audit-log reads |
| `PATIENT` | Portal: own appointments, lab results, messages, profile |

---

## 3. Error Codes

### 3.1 Error Envelope

```json
{
  "success": false,
  "data": null,
  "error": { "code": "validation_error", "message": "email: must not be empty" },
  "message": "email: must not be empty",
  "pagination": null,
  "timestamp": "2026-06-14T10:30:00Z"
}
```

### 3.2 HTTP Status → Error Code Mapping

| HTTP | Code | When It Fires |
|------|------|---------------|
| 400 | `validation_error` | Invalid request body, parameters, or business rule |
| 401 | `unauthorized` | Missing, expired, or invalid credentials |
| 403 | `forbidden` | Authenticated but insufficient role/permission |
| 404 | `not_found` | Resource does not exist |
| 409 | `conflict` | Valid request conflicts with current server state (slot taken, duplicate, etc.) |
| 415 | `unsupported_media_type` | Unsupported Content-Type |
| 429 | `rate_limited` | Too many requests per minute on public endpoint |
| 500 | `internal_error` | Unexpected server error (generic message only — stack traces never exposed) |

### 3.3 Exception → Error Mapping

| Exception | HTTP | Code |
|-----------|------|------|
| `NotFoundException` | 404 | `not_found` |
| `ConflictException` | 409 | `conflict` |
| `BadCredentialsException` | 401 | `unauthorized` |
| `IllegalArgumentException` | 400 | `validation_error` |
| `AccessDeniedException` | 403 | `forbidden` |
| `AuthorizationDeniedException` | 403 | `forbidden` |
| `MethodArgumentNotValidException` | 400 | `validation_error` |
| `ConstraintViolationException` | 400 | `validation_error` |
| `ExpiredJwtException` | 401 | `unauthorized` |
| `JwtException` | 401 | `unauthorized` |
| `Exception` (catch-all) | 500 | `internal_error` |

### 3.4 Request Processing Pipeline

```
RateLimitFilter → JwtAuthenticationFilter → Controller → @RestControllerAdvice (RestExceptionHandler) → Response
```

`SecurityErrorResponseWriter` handles filter-layer errors (401/403/429) where `@RestControllerAdvice` cannot apply.

---

## 4. Rate Limiting

- Public endpoints rate-limited via `HMS_PUBLIC_RATE_LIMIT_PER_MINUTE` (default: **30 requests/minute**)
- Sliding-window counter keyed by remote IP
- Tracked via Micrometer counter `hms.security.rate_limit.rejections`
- **Rate-limited endpoints:** `POST /auth/login`, `POST /auth/refresh`, `POST /appointments`, `POST /chatbot/messages`
- Authenticated staff/patient endpoints are NOT rate-limited

---

## 5. Endpoint Inventory

### 5.1 Public Content & Discovery

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/content/home` | Public | Homepage content sections |
| GET | `/api/v1/news` | Public | Published news articles |
| GET | `/api/v1/departments` | Public | List active departments |
| GET | `/api/v1/departments/{departmentId}` | Public | Department detail with doctors |
| GET | `/api/v1/departments/{departmentId}/doctors` | Public | Doctors in a department |
| GET | `/api/v1/doctors` | Public | List active doctors |
| GET | `/api/v1/doctors/{doctorId}` | Public | Doctor detail |
| GET | `/api/v1/doctors/{doctorId}/slots?date=YYYY-MM-DD` | Public | Available time slots |

### 5.2 Public Booking & Chatbot

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/appointments` | Public | Create appointment booking |
| POST | `/api/v1/chatbot/messages` | Public | Submit chatbot message |

### 5.3 Clinical Workflows (Staff)

**Appointments:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/appointments` | Staff | List with filters (status, doctorId, date) |
| GET | `/api/v1/appointments/today` | Staff | Today's appointments |
| GET | `/api/v1/appointments/{appointmentId}` | Staff | Appointment detail |
| PUT | `/api/v1/appointments/{appointmentId}` | Staff | Update metadata |
| DELETE | `/api/v1/appointments/{appointmentId}` | Staff | Cancel appointment |
| POST | `/api/v1/appointments/{appointmentId}/checkin` | Staff | Check in patient |
| PUT | `/api/v1/appointments/{appointmentId}/status` | Staff | Update status |
| POST | `/api/v1/appointments/{appointmentId}/vital-signs` | Staff | Record vital signs |
| GET | `/api/v1/appointments/{appointmentId}/vital-signs` | Staff | Get vital signs |
| POST | `/api/v1/appointments/{appointmentId}/follow-up` | Staff | Create follow-up |
| GET | `/api/v1/appointments/{appointmentId}/follow-up` | Staff | Follow-up detail |

**Queue:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/queue/today` | Staff | Today's queue board |
| POST | `/api/v1/queue/{appointmentId}/call` | Staff | Call patient to room |
| POST | `/api/v1/queue/{appointmentId}/skip` | Staff | Move to back of queue |
| POST | `/api/v1/queue/{appointmentId}/assign-room` | Staff | Assign consultation room |
| POST | `/api/v1/queue/{appointmentId}/start-consultation` | Staff | Mark consultation started |
| POST | `/api/v1/queue/{appointmentId}/complete` | Staff | Complete visit |

**Medical Records:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/medical-records` | Staff | Create medical record with diagnosis, notes, prescriptions |
| POST | `/api/v1/medical-records/preview.pdf` | Staff | Preview prescription PDF |
| GET | `/api/v1/medical-records/{recordId}/prescription.pdf` | Staff | Download prescription PDF |

**Patient Records & History:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/patient-records?query=...` | Staff | Search patient records |
| GET | `/api/v1/patient-records/{patientId}` | Staff | Patient record detail |
| GET | `/api/v1/patients/{cccd}/history` | Staff | Patient history by CCCD |

**Vital Signs:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/vital-signs` | Staff | Create vital signs |
| GET | `/api/v1/vital-signs/{appointmentId}` | Staff | Get by appointment |
| PUT | `/api/v1/vital-signs/{vitalSignId}` | Staff | Update |
| DELETE | `/api/v1/vital-signs/{vitalSignId}` | Staff | Delete |

**Lab Results:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/lab-results` | Staff | Create lab result |
| GET | `/api/v1/lab-results/{resultId}` | Staff | Get lab result |
| GET | `/api/v1/appointments/{appointmentId}/lab-results` | Staff | Lab results for appointment |
| DELETE | `/api/v1/lab-results/{resultId}` | Staff | Delete |

**Doctor Schedule:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/me/schedule?date=YYYY-MM-DD\|week=YYYY-Www` | Doctor | Own schedule |

### 5.4 Finance (Accountant/Admin)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/invoices?status=...` | Staff | List invoices |
| POST | `/api/v1/invoices` | Staff | Create invoice |
| POST | `/api/v1/invoices/{invoiceId}/payments` | Staff | Record payment |
| POST | `/api/v1/invoices/{invoiceId}/void` | Staff | Void invoice |
| GET | `/api/v1/pricing` | Staff | List pricing rules |
| POST | `/api/v1/pricing` | Staff | Create pricing rule |
| PUT | `/api/v1/pricing/{pricingId}` | Staff | Update pricing rule |
| GET | `/api/v1/reports/revenue/daily?date=YYYY-MM-DD` | Staff | Daily revenue |
| GET | `/api/v1/reports/revenue/monthly?month=YYYY-MM` | Staff | Monthly revenue |

### 5.5 Inventory (Pharmacist/Admin)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/inventory/items` | Staff | List items |
| POST | `/api/v1/inventory/items` | Staff | Create item |
| PUT | `/api/v1/inventory/items/{itemId}` | Staff | Update item |
| DELETE | `/api/v1/inventory/items/{itemId}` | Staff | Delete item |
| GET | `/api/v1/inventory/lots` | Staff | List lots |
| POST | `/api/v1/inventory/lots` | Staff | Create lot |
| PUT | `/api/v1/inventory/lots/{lotId}` | Staff | Update lot |
| GET | `/api/v1/inventory/movements` | Staff | List movements |
| POST | `/api/v1/inventory/movements` | Staff | Record movement |
| POST | `/api/v1/inventory/dispense` | Staff | Dispense medication |
| GET | `/api/v1/inventory/alerts?date=YYYY-MM-DD` | Staff | Low-stock alerts |

### 5.6 Patient Portal

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/patient-portal/overview` | Patient | Dashboard overview |
| GET | `/api/v1/patient-portal/appointments` | Patient | Appointment list |
| GET | `/api/v1/patient-portal/lab-results` | Patient | Lab results |
| GET | `/api/v1/patient-portal/messages` | Patient | Message threads |
| GET | `/api/v1/patient-portal/profile` | Patient | Profile |
| PUT | `/api/v1/patient-portal/profile` | Patient | Update profile |

### 5.7 Admin

**Users:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/admin/users` | Admin | List users |
| GET | `/api/v1/admin/users/{userId}` | Admin | User detail |
| POST | `/api/v1/admin/users` | Admin | Create user |
| PUT | `/api/v1/admin/users/{userId}` | Admin | Update user |
| DELETE | `/api/v1/admin/users/{userId}` | Admin | Soft-delete user |
| POST | `/api/v1/admin/users/{userId}/activate` | Admin | Activate user |
| POST | `/api/v1/admin/users/{userId}/deactivate` | Admin | Deactivate user |
| PUT | `/api/v1/admin/users/{userId}/role` | Admin | Change role |

**Departments:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/admin/departments` | Admin | List departments |
| GET | `/api/v1/admin/departments/{departmentId}` | Admin | Department detail |
| POST | `/api/v1/admin/departments` | Admin | Create department |
| PUT | `/api/v1/admin/departments/{departmentId}` | Admin | Update department |
| DELETE | `/api/v1/admin/departments/{departmentId}` | Admin | Soft-delete |
| POST | `/api/v1/admin/departments/{departmentId}/assign-doctor` | Admin | Assign doctor |
| DELETE | `/api/v1/admin/departments/{departmentId}/remove-doctor/{doctorId}` | Admin | Remove doctor |

**Rooms, Schedules, Closures, Slots:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET/POST/PUT/DELETE | `/api/v1/admin/rooms[/{roomId}]` | Admin | Room CRUD |
| PUT | `/api/v1/admin/rooms/{roomId}/status` | Admin | Room status (READY/OCCUPIED/MAINTENANCE) |
| GET/POST/PUT | `/api/v1/admin/schedule-templates[/{templateId}]` | Admin | Schedule templates |
| GET/POST/PUT | `/api/v1/admin/special-closures[/{closureId}]` | Admin | Special closures |
| GET | `/api/v1/admin/slots` | Admin | Time slots |
| POST | `/api/v1/admin/slots/generate` | Admin | Generate slots |
| PUT | `/api/v1/admin/slots/{slotId}/block` | Admin | Block slot |
| DELETE | `/api/v1/admin/slots/{slotId}` | Admin | Delete slot |

**Stats, Monitoring, Audit, Content, News:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/admin/stats` | Admin | System statistics |
| GET | `/api/v1/admin/monitoring` | Admin | Monitoring snapshot |
| GET | `/api/v1/admin/audit-logs?entityType=&action=&limit=50` | Admin, Accountant | Audit logs |
| GET/POST/PUT | `/api/v1/admin/content/sections[/{sectionId}]` | Admin | Homepage content |
| GET/POST/PUT | `/api/v1/admin/public-content[/{contentId}]` | Admin | Public content |
| GET/POST/PUT | `/api/v1/admin/news[/{articleId}]` | Admin | News articles |

### 5.8 AI Integration (Internal)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/ai/health` | Staff | Health check |
| GET | `/api/v1/ai/patients?query=...` | Staff | Search patients |
| GET | `/api/v1/ai/patients/{patientId}/snapshot` | Staff | Patient snapshot |
| GET | `/api/v1/ai/patients/{patientId}/timeline` | Staff | Patient timeline |
| GET | `/api/v1/ai/patients/{patientId}/permissions?userId=...` | Staff | Permission check |
| GET | `/api/v1/ai/changes?since=ISO_TIMESTAMP` | Staff | Changed entities |

---

## 6. Removed Endpoints

The following endpoint families have been intentionally removed (V11 Flyway migration) and must not be used:

| Endpoint | Reason |
|----------|--------|
| `/api/v1/ai/analyze-symptoms` | AI symptom analysis removed |
| `/api/v1/internal-assistant/**` | Internal assistant removed |
| `/api/v1/admin/knowledge-documents/**` | Knowledge documents removed |
| `/api/v1/admin/monitoring/internal-assistant` | Internal assistant monitoring removed |

---

## 7. Endpoint Statistics

| Category | Controllers | Endpoints | Auth Scope |
|----------|-------------|-----------|------------|
| Staff Auth | 1 | 3 | Public |
| Patient Auth | 1 | 4 | Public |
| Public Content & Discovery | 3 | 8 | Public |
| Chatbot | 1 | 1 | Public |
| Public Booking | 1 | 1 | Public |
| Clinical Workflows | 6 | 28 | Staff |
| Finance | 3 | 9 | Staff (Accountant/Admin) |
| Inventory | 1 | 11 | Staff (Pharmacist/Admin) |
| Patient Portal | 1 | 6 | Patient |
| Admin | 11 | 41 | Admin |
| AI Integration | 1 | 6 | Staff |
| **Total** | **32** | **118** | |

---

## 8. JWT Configuration Reference

| Property | Default | Env Variable | Description |
|----------|---------|-------------|-------------|
| `security.jwt.secret` | — | `JWT_SECRET` | HMAC signing key (required) |
| `security.jwt.access-token-expiration-seconds` | 900 | — | Access token lifetime |
| `security.jwt.refresh-token-expiration-seconds` | 604800 | — | Refresh token lifetime |
| `security.jwt.refresh-cookie-name` | `hms_refresh_token` | — | Staff cookie name |
| `security.http.allowed-origins[0]` | `http://localhost:3000` | `HMS_ALLOWED_ORIGIN_PRIMARY` | CORS origin |
| `security.http.allow-credentials` | `false` | `HMS_ALLOW_CREDENTIALS` | CORS credentials |
| `security.http.secure-cookies` | `false` | `HMS_SECURE_COOKIES` | Cookie secure flag |
| `security.http.refresh-cookie-same-site` | `Lax` | `HMS_REFRESH_COOKIE_SAME_SITE` | Cookie SameSite |
| `security.http.public-rate-limit-per-minute` | 30 | `HMS_PUBLIC_RATE_LIMIT_PER_MINUTE` | Rate limit |

---

## 9. Frontend Integration

The frontend uses `frontend/src/lib/api-client.ts` as the base fetch wrapper:

1. Reads the access token from `sessionStorage`
2. Attaches it as `Authorization: Bearer <token>`
3. On 401 responses, attempts automatic token refresh
4. If refresh fails, redirects to login page

Staff and patient auth use separate session storage keys and API base paths. API base URL configurable via `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:8081`).

---

## 10. Verification

After endpoint changes, update this file and run:

```bash
cd backend && mvn test          # 148 integration tests
```

For frontend route coverage:
```bash
cd frontend && npm run test:e2e:ci   # 183+ Playwright scenarios
```

---

*Source of truth: `backend/controller/src/main/java` — all endpoint mapping annotations verified against 32 controllers.*
