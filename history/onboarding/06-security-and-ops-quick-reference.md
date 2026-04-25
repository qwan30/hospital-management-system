# Security and Ops Quick Reference

## Security Chain
- Main file: `backend/api/src/main/java/com/hospital/api/config/SecurityConfig.java`
- Filters:
  - `RateLimitFilter`
  - `JwtAuthenticationFilter`
- Method authorization uses `@PreAuthorize`.

## Public vs Protected Routes

### Public by security config
- `/actuator/health`
- `/swagger-ui/**`
- `/v3/api-docs/**`
- `/api/v1/auth/**`
- `/api/v1/patient-auth/**`
- `GET /api/v1/departments/**`
- `GET /api/v1/doctors/**`
- `GET /api/v1/content/**`
- `GET /api/v1/news`
- `POST /api/v1/ai/analyze-symptoms`
- `POST /api/v1/appointments`
- `POST /api/v1/chatbot/messages`

### Protected by default
- everything else

## JWT Model
- Config file:
  - `backend/api/src/main/java/com/hospital/api/config/JwtProperties.java`
- Token logic:
  - `backend/api/src/main/java/com/hospital/api/auth/JwtTokenService.java`

### Access token
- subject: user or patient UUID
- claims:
  - `role`
  - `name`
- default TTL from `application.yml`: 900 seconds

### Refresh token
- claims:
  - `type=refresh`
  - `scope=staff` or `scope=patient`
- default TTL from `application.yml`: 604800 seconds

## Refresh Cookies

| Audience | Cookie name source | Cookie path |
| --- | --- | --- |
| Staff | `refreshCookieName()` | `/api/v1/auth` |
| Patient | `patientRefreshCookieName()` | `/api/v1/patient-auth` |

Cookie behavior is controlled by `security.http.*` in `application.yml`, including:
- `secure-cookies`
- `refresh-cookie-same-site`
- `allow-credentials`

## CORS Defaults
- Configured in `SecurityConfig.corsConfigurationSource()`
- Default allowed origins:
  - `http://localhost:3000`
  - `http://localhost:4173`
- Allowed methods:
  - `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- Allowed headers:
  - `Authorization`, `Content-Type`, `Accept`, `Origin`

## Rate-Limited Routes
- Implemented in `backend/api/src/main/java/com/hospital/api/config/RateLimitFilter.java`
- Only selected POST routes are limited:
  - `/api/v1/auth/login`
  - `/api/v1/auth/refresh`
  - `/api/v1/ai/analyze-symptoms`
  - `/api/v1/appointments`
  - `/api/v1/chatbot/messages`
  - `/api/v1/internal-assistant/messages`

### Default limits from `application.yml`
- public rate limit per minute: `30`
- internal assistant rate limit per minute: `12`

### Keying behavior
- most public routes use remote IP
- internal assistant prefers authenticated subject; otherwise falls back to remote IP

## Role Restrictions That Matter
- Doctors can only access and mutate their own appointments, schedules, and prescriptions.
- Nurses can access queue and patient-scoped assistant context only for current queue patients.
- Patients can access only portal routes under `ROLE_PATIENT`.
- Admins can use the internal assistant only in docs mode.
- Finance and inventory routes are limited to accountant/admin roles.

## Patient Identifier Protection
- File:
  - `backend/core/src/main/java/com/hospital/core/patient/PatientIdentifierProtector.java`
- Behavior:
  - encrypts CCCD using AES-GCM with a SHA-256-derived key
  - hashes plaintext CCCD with SHA-256 for deterministic lookup
- Secret source:
  - `security.patient-identifier.secret`
  - defaults to `JWT_SECRET` if not explicitly provided

## Email and Gemini Integration Toggles
- Main config:
  - `backend/api/src/main/resources/application.yml`

### Gemini
- `integration.gemini.enabled`
- `integration.gemini.api-key`
- `integration.gemini.model`

### Gmail
- `integration.gmail.enabled`
- `integration.gmail.client-id`
- `integration.gmail.client-secret`
- `integration.gmail.refresh-token`
- `integration.gmail.sender-email`

### Operational behavior
- `AiAnalysisService` falls back to a heuristic response if Gemini fails.
- `EmailService` delegates to the Gmail client seam and logs whether mail was sent.

## Practical Ops Notes
- Build when test debt blocks full compile:
  - `mvn -q -pl api -am package '-Dmaven.test.skip=true'`
- Runtime docs:
  - `README.md`
  - `docs/HMS_DeploymentGuide.md`
  - `docs/HMS_IntegrationGuide.md`
- Primary bootstrap files:
  - `docker-compose.yml`
  - `backend/Dockerfile`
  - `backend/api/src/main/resources/application.yml`

## Immediate Red Flags To Notice
- backend test baseline is not green
- frontend build baseline is not green
- Docker-backed runtime was not verified in this environment
- vital-signs table definition needs explicit schema verification
