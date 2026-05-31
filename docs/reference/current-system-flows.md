# Current System Flows

**Status:** current flow map for the May 14, 2026 repository baseline.
**Canonical runtime:** Spring Boot backend on `8081`, PostgreSQL on `5432`, and the Next.js app in `web/` on `3000`.

This document summarizes the active product flows from source, route, and OpenAPI evidence. Use it with the route inventory and role matrix instead of treating route-file existence as proof that a workflow is fully backend-integrated.

## 1. Current Runtime Surface

| Surface | Current source | Local target | Notes |
| --- | --- | --- | --- |
| Backend composition root | `backend/start` | `http://localhost:8081` | Spring Boot app, actuator health, Swagger UI, Flyway migrations |
| Database | `docker-compose.yml` | `localhost:5432` | PostgreSQL 15 using `pgvector/pgvector:pg15` |
| Frontend app | `web/` | `http://localhost:3000` | Canonical Next.js 16 / React 19 app |
| Reference prototypes | `frontend/` | none | Design-reference material, not the active runtime |

The current OpenAPI surface exposes 89 API paths and 117 operations under `/api/v1` plus SpringDoc and actuator support endpoints. The current Next.js route tree contains 65 `page.tsx` files and 71 route/layout files under `web/src/app`.

## 2. End-To-End Flow Map

| Flow | Entry routes | Main API families | Primary roles | Integration status |
| --- | --- | --- | --- | --- |
| Public discovery and booking | `/`, `/departments`, `/departments/[id]`, `/doctors`, `/news`, `/booking` | `/content/home`, `/departments`, `/doctors`, `/appointments`, `/chatbot/messages` | Guest | Public pages and appointment creation are active; chatbot is deterministic booking guidance |
| Staff authentication | `/staff/login`, `/auth/logout`, `/session-expired`, `/forbidden` | `/auth/login`, `/auth/refresh`, `/auth/logout` | Staff roles | Backend JWT and refresh-cookie flow is active; frontend stores staff access token in session storage |
| Staff queue operations | `/staff/queue`, `/staff/nurse-intake`, `/staff/vital-signs` | `/queue/today`, `/appointments/today`, `/appointments/{id}/checkin`, `/queue/{appointmentId}/call`, `/queue/{appointmentId}/assign-room`, `/queue/{appointmentId}/start-consultation`, `/queue/{appointmentId}/complete`, `/queue/{appointmentId}/skip` | Admin, Nurse, Receptionist | Backend-integrated queue, check-in, room assignment, consultation, completion, filtering, and row-level error states |
| Doctor clinical work | `/staff/doctor/dashboard`, `/staff/schedule`, `/staff/patients`, `/staff/medical-records/[id]/edit`, `/staff/prescriptions/preview`, `/staff/lab-results`, `/staff/lab-results/new`, `/staff/vital-signs` | `/me/schedule`, `/patient-records`, `/patients/{cccd}/history`, `/medical-records`, `/appointments/{id}/status`, `/appointments/{id}/follow-up`, `/lab-results`, `/vital-signs` | Admin, Doctor, Nurse where permitted | Clinical APIs are active; lab create is Admin/Doctor only; route guards and backend RBAC define role-specific access |
| Patient portal | `/portal/login`, `/portal/claim`, `/portal/overview`, `/portal/appointments`, `/portal/lab-results`, `/portal/messages`, `/portal/profile`, `/portal/records` | `/patient-auth/*`, `/patient-portal/overview`, `/patient-portal/appointments`, `/patient-portal/lab-results`, `/patient-portal/messages`, `/patient-portal/profile` | Patient | Portal authentication and read flows are active; patient-side message sending and appointment rescheduling are not implemented |
| Inventory and pharmacy | `/staff/inventory`, `/staff/prescriptions/preview` | `/inventory/items`, `/inventory/lots`, `/inventory/movements`, `/inventory/alerts`, `/medical-records/{recordId}/prescription.pdf` | Admin, Pharmacist, Doctor where permitted | Inventory item, lot, movement, and alert APIs are active; prescription PDF preview is available |
| Finance | `/staff/invoices`, `/staff/pricing`, `/staff/revenue` | `/invoices`, `/invoices/{invoiceId}/payments`, `/invoices/{invoiceId}/void`, `/pricing`, `/reports/revenue/daily`, `/reports/revenue/monthly` | Admin, Accountant | Invoice, payment, pricing, and revenue APIs are active; external payment-gateway integration is out of scope |
| Admin operations | `/admin/dashboard`, `/admin/users`, `/admin/departments`, `/admin/rooms`, `/admin/news`, `/admin/public-content`, `/admin/monitoring`, `/admin/audit-logs` | `/admin/users`, `/admin/departments`, `/admin/rooms`, `/admin/news`, `/admin/public-content`, `/admin/monitoring`, `/admin/audit-logs`, `/admin/stats` | Admin; Accountant for audit logs | Admin management APIs are active; audit logs cover security, queue, inventory, and admin events |

## 3. Authentication And Authorization

Staff authentication uses `/api/v1/auth/login` and stores the staff access token under `hms_staff_access_token` in browser session storage. Refresh tokens are delivered as HTTP-only cookies on the backend auth path.

Patient authentication uses `/api/v1/patient-auth/*` and protects `/api/v1/patient-portal/*` endpoints.

Frontend route guards are UX and navigation protection only. Backend authorization and 401/403 responses remain the source of truth for protected actions.

## 4. Local Run Commands

Backend and database:

```powershell
docker compose up -d postgres
cd backend
mvn.cmd -pl start -am -DskipTests package
$env:HMS_ALLOW_CREDENTIALS = "true"
java -jar start\target\start-0.1.0-SNAPSHOT.jar
```

Frontend:

```powershell
cd web
npm.cmd run dev -- -p 3000
```

Verification:

```powershell
Invoke-RestMethod http://localhost:8081/actuator/health
Invoke-RestMethod http://localhost:8081/v3/api-docs
```

For browser login from `http://localhost:3000`, the backend must allow credentials for the frontend origin. The Docker Compose backend service sets `HMS_ALLOW_CREDENTIALS: "true"`.

## 5. Current Limitations

- Frontend route files exist for many screens, but selected flows are backend-integrated.
- Patient portal message send/reply is not implemented.
- Patient self-cancel and reschedule APIs are not implemented.
- A separate live nurse room-board API is not implemented; queue assign-room is the active room workflow.
- Receptionist and pharmacist seeded demo accounts exist. Optional release-demo seeding adds synthetic cross-role UAT data when `HMS_RELEASE_DEMO_SEED_ENABLED=true`.
- External payment-gateway integration is out of scope; finance APIs cover invoices, payments, pricing, and revenue reporting.
- Docker Desktop is required for Testcontainers-backed integration tests and full compose verification.

## 6. Source Checks

Use these sources when this flow map needs maintenance:

- `web/src/app`
- `web/e2e/helpers/routes.ts`
- `web/src/lib/rbac.ts`
- `backend/controller/src/main/java`
- `backend/application/src/main/java/com/hospital/core/security/RbacAuthorizationService.java`
- `backend/start/src/main/resources/application.yml`
- `backend/start/src/main/resources/db/migration`
- `docker-compose.yml`
- `docs/reference/frontend-route-inventory.md`
- `docs/reference/role-screen-api-matrix.md`
