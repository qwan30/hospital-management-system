# Functional Requirements — Hospital Management System

**Status:** Code-verified against API contract — 2026-06-14
**Source:** `docs/05-api/api-contract.md` + `backend/controller/src/main/java/`
**New file:** fills the functional-requirements.md slot from universal-docs template

Every FR below is traceable to an implemented API endpoint. No requirement listed here lacks a working implementation.

---

## FR-1: Public Appointment Booking

| FR ID | Requirement | Endpoint | Auth |
|-------|------------|----------|------|
| FR-1.1 | Display active departments | `GET /api/v1/departments` | Public |
| FR-1.2 | Display department detail with doctors | `GET /api/v1/departments/{id}` | Public |
| FR-1.3 | Display doctors in department | `GET /api/v1/departments/{id}/doctors` | Public |
| FR-1.4 | Display all active doctors | `GET /api/v1/doctors` | Public |
| FR-1.5 | Display doctor detail | `GET /api/v1/doctors/{id}` | Public |
| FR-1.6 | Display available slots per doctor/date | `GET /api/v1/doctors/{id}/slots?date=` | Public |
| FR-1.7 | Submit appointment booking | `POST /api/v1/appointments` | Public |
| FR-1.8 | Generate confirmation code (HMS-XXXXXXXX) | `POST /api/v1/appointments` | Public |
| FR-1.9 | Send confirmation email (Gmail API) | Internal (EmailService) | — |
| FR-1.10 | Display homepage content sections | `GET /api/v1/content/home` | Public |
| FR-1.11 | Display published news | `GET /api/v1/news` | Public |

## FR-2: Authentication & Session Management

| FR ID | Requirement | Endpoint | Auth |
|-------|------------|----------|------|
| FR-2.1 | Staff login (email + password) | `POST /api/v1/auth/login` | Public |
| FR-2.2 | JWT access token (15min) + httpOnly refresh cookie (7d) | `POST /api/v1/auth/login` | Public |
| FR-2.3 | Refresh access token | `POST /api/v1/auth/refresh` | Public |
| FR-2.4 | Staff logout (clear cookie) | `POST /api/v1/auth/logout` | Public |
| FR-2.5 | Patient portal login | `POST /api/v1/patient-auth/login` | Public |
| FR-2.6 | Patient account claim (first-time) | `POST /api/v1/patient-auth/claim` | Public |
| FR-2.7 | Patient session refresh | `POST /api/v1/patient-auth/refresh` | Public |
| FR-2.8 | Patient logout | `POST /api/v1/patient-auth/logout` | Public |

## FR-3: Appointment Management (Staff)

| FR ID | Requirement | Endpoint | Permission |
|-------|------------|----------|------------|
| FR-3.1 | List appointments (filter: status, doctor, date) | `GET /api/v1/appointments` | APPOINTMENT_READ |
| FR-3.2 | Today's appointments | `GET /api/v1/appointments/today` | QUEUE_READ |
| FR-3.3 | Appointment detail | `GET /api/v1/appointments/{id}` | APPOINTMENT_READ |
| FR-3.4 | Update appointment metadata | `PUT /api/v1/appointments/{id}` | APPOINTMENT_UPDATE |
| FR-3.5 | Cancel appointment | `DELETE /api/v1/appointments/{id}` | APPOINTMENT_CANCEL |
| FR-3.6 | Auto-restrict doctors to own appointments | (controller logic) | DOCTOR |
| FR-3.7 | Create follow-up appointment | `POST /.../appointments/{id}/follow-up` | Staff |
| FR-3.8 | Update appointment status | `PUT /.../appointments/{id}/status` | Staff |

## FR-4: Queue & Patient Intake

| FR ID | Requirement | Endpoint | Permission |
|-------|------------|----------|------------|
| FR-4.1 | Today's queue board | `GET /api/v1/queue/today` | QUEUE_READ |
| FR-4.2 | Check in patient | `POST /api/v1/appointments/{id}/checkin` | QUEUE_UPDATE |
| FR-4.3 | Record vital signs | `POST /api/v1/appointments/{id}/vital-signs` | VITAL_SIGNS_CREATE |
| FR-4.4 | Get vital signs | `GET /api/v1/appointments/{id}/vital-signs` | VITAL_SIGNS_READ |
| FR-4.5 | Call patient to room | `POST /api/v1/queue/{id}/call` | QUEUE_UPDATE |
| FR-4.6 | Skip patient (back of queue) | `POST /api/v1/queue/{id}/skip` | QUEUE_UPDATE |
| FR-4.7 | Assign room | `POST /api/v1/queue/{id}/assign-room` | QUEUE_UPDATE |
| FR-4.8 | Start consultation | `POST /api/v1/queue/{id}/start-consultation` | QUEUE_UPDATE |
| FR-4.9 | Complete visit | `POST /api/v1/queue/{id}/complete` | QUEUE_UPDATE |

## FR-5: Electronic Health Records

| FR ID | Requirement | Endpoint | Permission |
|-------|------------|----------|------------|
| FR-5.1 | Create medical record (diagnosis, notes, Rx) | `POST /api/v1/medical-records` | MEDICAL_RECORD_CREATE |
| FR-5.2 | Preview prescription PDF | `POST /api/v1/medical-records/preview.pdf` | MEDICAL_RECORD_CREATE |
| FR-5.3 | Download prescription PDF | `GET /api/v1/medical-records/{id}/prescription.pdf` | MEDICAL_RECORD_READ |
| FR-5.4 | Search patient records | `GET /api/v1/patient-records?query=` | PATIENT_RECORD_READ |
| FR-5.5 | View patient record with history | `GET /api/v1/patient-records/{id}` | PATIENT_RECORD_READ |
| FR-5.6 | Lookup by national ID (CCCD) | `GET /api/v1/patients/{cccd}/history` | PATIENT_RECORD_READ |

## FR-6: Pharmacy & Inventory

| FR ID | Requirement | Endpoint | Permission |
|-------|------------|----------|------------|
| FR-6.1 | CRUD inventory items | `GET/POST/PUT/DELETE /api/v1/inventory/items` | INVENTORY_* |
| FR-6.2 | CRUD inventory lots | `GET/POST/PUT /api/v1/inventory/lots` | INVENTORY_* |
| FR-6.3 | List/record inventory movements | `GET/POST /api/v1/inventory/movements` | INVENTORY_* |
| FR-6.4 | Dispense medication (reduce stock) | `POST /api/v1/inventory/dispense` | INVENTORY_UPDATE |
| FR-6.5 | Low-stock alerts | `GET /api/v1/inventory/alerts?date=` | INVENTORY_READ |

## FR-7: Billing & Revenue

| FR ID | Requirement | Endpoint | Permission |
|-------|------------|----------|------------|
| FR-7.1 | List/create/void invoices | `/api/v1/invoices/**` | INVOICE_* |
| FR-7.2 | Record payment | `POST /api/v1/invoices/{id}/payments` | INVOICE_UPDATE |
| FR-7.3 | CRUD pricing rules | `/api/v1/pricing/**` | PRICING_* |
| FR-7.4 | Daily revenue report | `GET /api/v1/reports/revenue/daily` | REVENUE_REPORT_READ |
| FR-7.5 | Monthly revenue report | `GET /api/v1/reports/revenue/monthly` | REVENUE_REPORT_READ |

## FR-8: Patient Portal

| FR ID | Requirement | Endpoint | Role |
|-------|------------|----------|------|
| FR-8.1 | Dashboard overview | `GET /api/v1/patient-portal/overview` | PATIENT |
| FR-8.2 | Own appointments | `GET /api/v1/patient-portal/appointments` | PATIENT |
| FR-8.3 | Own lab results | `GET /api/v1/patient-portal/lab-results` | PATIENT |
| FR-8.4 | Message threads | `GET /api/v1/patient-portal/messages` | PATIENT |
| FR-8.5 | View/update profile | `GET/PUT /api/v1/patient-portal/profile` | PATIENT |

## FR-9: Admin Operations

| FR ID | Requirement | Endpoints | Role |
|-------|------------|----------|------|
| FR-9.1 | User CRUD + activate/deactivate/role change | `/api/v1/admin/users/**` (8 endpoints) | ADMIN |
| FR-9.2 | Department CRUD + doctor assignment | `/api/v1/admin/departments/**` (7 endpoints) | ADMIN |
| FR-9.3 | Room CRUD + status (READY/OCCUPIED/MAINTENANCE) | `/api/v1/admin/rooms/**` (6 endpoints) | ADMIN |
| FR-9.4 | Schedule template CRUD | `/api/v1/admin/schedule-templates/**` (3 endpoints) | ADMIN |
| FR-9.5 | Special closure CRUD | `/api/v1/admin/special-closures/**` (3 endpoints) | ADMIN |
| FR-9.6 | Time slot generation + block/delete | `/api/v1/admin/slots/**` (4 endpoints) | ADMIN |
| FR-9.7 | System statistics | `GET /api/v1/admin/stats` | ADMIN |
| FR-9.8 | Monitoring snapshot | `GET /api/v1/admin/monitoring` | ADMIN |
| FR-9.9 | Audit log with filters | `GET /api/v1/admin/audit-logs` | ADMIN, ACCOUNTANT |
| FR-9.10 | Content + news management | `/api/v1/admin/content/**` (3), `/api/v1/admin/news/**` (3), `/api/v1/admin/public-content/**` (3) | ADMIN |

## FR-10: Non-Functional Requirements

| NFR ID | Requirement | Implementation |
|--------|-------------|----------------|
| NFR-10.1 | PHI encryption at rest | AES-GCM-256 (`PatientIdentifierProtector`) |
| NFR-10.2 | PHI indexing without plaintext | SHA-256 hash of CCCD/CMND |
| NFR-10.3 | Stateless JWT auth | 15min access + 7-day httpOnly refresh cookie |
| NFR-10.4 | RBAC (36 permissions) | `@PreAuthorize` annotations on all protected endpoints |
| NFR-10.5 | Rate limiting (public endpoints) | 30 req/min via `RateLimitFilter` |
| NFR-10.6 | Audit trail | `AuditLogService` — immutable entries |
| NFR-10.7 | CORS protection | Configurable origins via `HMS_ALLOWED_ORIGIN_*` |
| NFR-10.8 | Structured logging + metrics | SLF4J + Prometheus + Grafana |
| NFR-10.9 | Database versioning | 20 Flyway migrations |
| NFR-10.10 | Containerized deployment | Docker Compose with health checks + Nginx reverse proxy |

---

*60+ functional requirements + 10 NFRs — verified against 118 API endpoints on 2026-06-14.*
