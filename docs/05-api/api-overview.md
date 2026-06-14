# API Overview

**Status:** aligned with the repository on 2026-06-14.
**Base URL:** `/api/v1`
**Total endpoints:** 118 mapped controller methods across 32 controllers.

Response envelope, authentication, rate limiting, and complete endpoint inventory for the Hospital Management System REST API.

---

## Response Envelope

Every API response uses a uniform JSON envelope defined in `ApiResponse` (under `backend/controller/src/main/java/com/hospital/shared/api`):

```json
{
  "success": true,
  "data": {},
  "message": "string",
  "error": null,
  "pagination": null,
  "timestamp": "2026-04-26T00:00:00Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `success` | `boolean` | Indicates whether the request succeeded |
| `data` | `object` or `array` | Response payload; `null` on error |
| `message` | `string` | Human-readable result message |
| `error` | `object` or `null` | Error details (`code`, `message`); `null` on success |
| `pagination` | `object` or `null` | Pagination metadata (`total`, `page`, `limit`, `totalPages`); `null` when absent |
| `timestamp` | `string` | ISO 8601 timestamp of the response |

PDF endpoints (`/api/v1/medical-records/preview.pdf`, `/api/v1/medical-records/{recordId}/prescription.pdf`) return `application/pdf` instead of the JSON envelope.

---

## Authentication

- **Staff endpoints** require a JWT Bearer access token in the `Authorization` header (`Bearer <token>`).
- **Patient portal endpoints** require a separate JWT Bearer access token in the `Authorization` header.
- **Refresh mechanism:** both staff and patient auth flows set an httpOnly refresh cookie on login. The refresh endpoint reads the cookie automatically or accepts a `refreshToken` in the request body.
- **Public endpoints** (content, news, departments, doctors, booking) require no authentication.
- **Authorization:** role-based access control (RBAC) enforced via `@PreAuthorize("@rbac.hasPermission(authentication, 'PERMISSION_NAME')")` annotations. Staff roles include ADMIN, DOCTOR, NURSE, RECEPTIONIST, ACCOUNTANT, PHARMACIST.

---

## Rate Limiting

- Public endpoints are rate-limited per the configuration property `HMS_PUBLIC_RATE_LIMIT_PER_MINUTE`.
- Default: **30 requests per minute**.
- Configured via `security.http.public-rate-limit-per-minute` in `application.yml`.
- Authenticated staff and patient endpoints are not publicly rate-limited.

---

## Endpoint Inventory

### Staff Authentication

Base path: `/api/v1/auth`
Controller: `AuthController` (`backend/controller/src/main/java/com/hospital/api/auth/AuthController.java`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/login` | Public | Staff login, returns JWT access token + httpOnly refresh cookie |
| POST | `/api/v1/auth/refresh` | Public | Refresh access token using refresh cookie or request body |
| POST | `/api/v1/auth/logout` | Public | Logout, clears refresh cookie |

### Patient Authentication

Base path: `/api/v1/patient-auth`
Controller: `PatientAuthController` (`backend/controller/src/main/java/com/hospital/api/patientauth/PatientAuthController.java`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/patient-auth/claim` | Public | Patient portal account claim (first-time activation with identity proof) |
| POST | `/api/v1/patient-auth/login` | Public | Patient portal login, returns JWT access token + httpOnly refresh cookie |
| POST | `/api/v1/patient-auth/refresh` | Public | Refresh patient access token |
| POST | `/api/v1/patient-auth/logout` | Public | Logout, clears patient refresh cookie |

### Public Content

Controllers: `PublicContentController`, `DepartmentController`, `DoctorController`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/content/home` | Public | Homepage content sections (hero, features, about) |
| GET | `/api/v1/news` | Public | Published news articles |
| GET | `/api/v1/departments` | Public | List all active departments |
| GET | `/api/v1/departments/{departmentId}` | Public | Department detail including doctor list |
| GET | `/api/v1/departments/{departmentId}/doctors` | Public | Doctors belonging to a specific department |
| GET | `/api/v1/doctors` | Public | List all active doctors |
| GET | `/api/v1/doctors/{doctorId}` | Public | Single doctor detail |
| GET | `/api/v1/doctors/{doctorId}/slots?date=YYYY-MM-DD` | Public | Available time slots for a doctor on a given date |

Source files:
- `PublicContentController` (`backend/controller/src/main/java/com/hospital/api/content/PublicContentController.java`)
- `DepartmentController` (`backend/controller/src/main/java/com/hospital/api/department/DepartmentController.java`)
- `DoctorController` (`backend/controller/src/main/java/com/hospital/api/doctor/DoctorController.java`)

### Chatbot

Controller: `ChatbotController` (`backend/controller/src/main/java/com/hospital/api/chatbot/ChatbotController.java`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/chatbot/messages` | Public | Submit a message to the chatbot and receive a reply |

### Public Booking

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/appointments` | Public | Create an appointment booking (no authentication; accepts patient identity, doctor, slots, symptoms) |

Controller: `AppointmentController` public create method (`backend/controller/src/main/java/com/hospital/api/appointment/AppointmentController.java`)

### Clinical Workflows

Controllers: `AppointmentController`, `QueueController`, `MedicalRecordController`, `PatientRecordController`, `PatientController`, `VitalSignsController`, `LabResultController`

#### Appointments

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/appointments` | Staff | List appointments with optional filters (status, doctorId, date, page, size) |
| GET | `/api/v1/appointments/today` | Staff | List today's appointments (optionally filters by date query param) |
| GET | `/api/v1/appointments/{appointmentId}` | Staff | Get appointment detail with patient, doctor, medical record |
| PUT | `/api/v1/appointments/{appointmentId}` | Staff | Update appointment metadata |
| DELETE | `/api/v1/appointments/{appointmentId}` | Staff | Cancel an appointment |
| POST | `/api/v1/appointments/{appointmentId}/checkin` | Staff | Check in a patient for their appointment |
| PUT | `/api/v1/appointments/{appointmentId}/status` | Staff | Update appointment status |
| POST | `/api/v1/appointments/{appointmentId}/vital-signs` | Staff | Record vital signs for an appointment |
| GET | `/api/v1/appointments/{appointmentId}/vital-signs` | Staff | Get vital signs for an appointment |
| POST | `/api/v1/appointments/{appointmentId}/follow-up` | Staff | Create a follow-up appointment |
| GET | `/api/v1/appointments/{appointmentId}/follow-up` | Staff | Get follow-up details for an appointment |

#### Queue

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/queue/today` | Staff | Get today's queue |
| POST | `/api/v1/queue/{appointmentId}/call` | Staff | Call patient to consultation room |
| POST | `/api/v1/queue/{appointmentId}/skip` | Staff | Move patient to back of ready queue |
| POST | `/api/v1/queue/{appointmentId}/assign-room` | Staff | Assign a room to the patient |
| POST | `/api/v1/queue/{appointmentId}/start-consultation` | Staff | Mark consultation as started |
| POST | `/api/v1/queue/{appointmentId}/complete` | Staff | Complete queue visit |

#### Medical Records

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/medical-records` | Staff | Create a medical record with diagnosis, notes, prescriptions |
| POST | `/api/v1/medical-records/preview.pdf` | Staff | Preview a prescription as PDF (without persisting) |
| GET | `/api/v1/medical-records/{recordId}/prescription.pdf` | Staff | Download a prescription PDF |

#### Patient Records

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/patient-records?query=...` | Staff | Search patient records by query |
| GET | `/api/v1/patient-records/{patientId}` | Staff | Get patient record detail with appointment and medical history |

#### Patient History by CCCD

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/patients/{cccd}/history` | Staff | Get patient history by CCCD (national ID) |

#### Vital Signs (Standalone CRUD)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/vital-signs` | Staff | Create vital signs record |
| GET | `/api/v1/vital-signs/{appointmentId}` | Staff | Get vital signs by appointment |
| PUT | `/api/v1/vital-signs/{vitalSignId}` | Staff | Update vital signs record |
| DELETE | `/api/v1/vital-signs/{vitalSignId}` | Staff | Delete vital signs record |

#### Lab Results

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/lab-results` | Staff | Create a lab result |
| GET | `/api/v1/lab-results/{resultId}` | Staff | Get a lab result by ID |
| GET | `/api/v1/appointments/{appointmentId}/lab-results` | Staff | List lab results for an appointment |
| DELETE | `/api/v1/lab-results/{resultId}` | Staff | Delete a lab result |

#### Doctor Schedule

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/me/schedule?date=YYYY-MM-DD|week=YYYY-Www` | Doctor | Get current doctor's schedule by date or ISO week |

Controller: `ScheduleController` (`backend/controller/src/main/java/com/hospital/api/schedule/ScheduleController.java`)

### Finance

Controllers: `InvoiceController`, `PricingController`, `RevenueReportController`

#### Invoices

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/invoices?status=...` | Staff (accountant/admin) | List invoices, optionally filtered by status |
| POST | `/api/v1/invoices` | Staff (accountant/admin) | Create an invoice for an appointment |
| POST | `/api/v1/invoices/{invoiceId}/payments` | Staff (accountant/admin) | Record a payment against an invoice |
| POST | `/api/v1/invoices/{invoiceId}/void` | Staff (accountant/admin) | Void an invoice |

#### Pricing

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/pricing` | Staff (accountant/admin) | List service pricing rules |
| POST | `/api/v1/pricing` | Staff (accountant/admin) | Create a pricing rule |
| PUT | `/api/v1/pricing/{pricingId}` | Staff (accountant/admin) | Update a pricing rule |

#### Revenue Reports

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/reports/revenue/daily?date=YYYY-MM-DD` | Staff (accountant/admin) | Daily revenue report |
| GET | `/api/v1/reports/revenue/monthly?month=YYYY-MM` | Staff (accountant/admin) | Monthly revenue report |

Source files:
- `InvoiceController` (`backend/controller/src/main/java/com/hospital/api/invoice/InvoiceController.java`)
- `PricingController` (`backend/controller/src/main/java/com/hospital/api/invoice/PricingController.java`)
- `RevenueReportController` (`backend/controller/src/main/java/com/hospital/api/invoice/RevenueReportController.java`)

### Inventory

Controller: `InventoryController` (`backend/controller/src/main/java/com/hospital/api/inventory/InventoryController.java`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/inventory/items` | Staff (pharmacist/admin) | List all inventory items |
| POST | `/api/v1/inventory/items` | Staff (pharmacist/admin) | Create a new inventory item |
| PUT | `/api/v1/inventory/items/{itemId}` | Staff (pharmacist/admin) | Update an inventory item |
| DELETE | `/api/v1/inventory/items/{itemId}` | Staff (pharmacist/admin) | Delete an inventory item |
| GET | `/api/v1/inventory/lots` | Staff (pharmacist/admin) | List all inventory lots |
| POST | `/api/v1/inventory/lots` | Staff (pharmacist/admin) | Create a new inventory lot |
| PUT | `/api/v1/inventory/lots/{lotId}` | Staff (pharmacist/admin) | Update an inventory lot |
| GET | `/api/v1/inventory/movements` | Staff (pharmacist/admin) | List inventory movements |
| POST | `/api/v1/inventory/movements` | Staff (pharmacist/admin) | Record an inventory movement |
| POST | `/api/v1/inventory/dispense` | Staff (pharmacist/admin) | Dispense medication (reduces stock) |
| GET | `/api/v1/inventory/alerts?date=YYYY-MM-DD` | Staff (pharmacist/admin) | List low-stock alerts for a given date |

### Patient Portal

Controller: `PatientPortalController` (`backend/controller/src/main/java/com/hospital/api/patientportal/PatientPortalController.java`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/patient-portal/overview` | Patient | Portal dashboard overview (upcoming appointments, counts) |
| GET | `/api/v1/patient-portal/appointments` | Patient | Patient's appointment list |
| GET | `/api/v1/patient-portal/lab-results` | Patient | Patient's lab results |
| GET | `/api/v1/patient-portal/messages` | Patient | Patient's message threads |
| GET | `/api/v1/patient-portal/profile` | Patient | Patient profile |
| PUT | `/api/v1/patient-portal/profile` | Patient | Update patient profile |

### Admin

#### Users

Controller: `AdminUserController` (`backend/controller/src/main/java/com/hospital/api/admin/AdminUserController.java`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/admin/users` | Admin | List all staff users |
| GET | `/api/v1/admin/users/{userId}` | Admin | Get a single staff user by ID |
| POST | `/api/v1/admin/users` | Admin | Create a new staff user |
| PUT | `/api/v1/admin/users/{userId}` | Admin | Update staff user details |
| DELETE | `/api/v1/admin/users/{userId}` | Admin | Soft-delete (deactivate) a staff user |
| POST | `/api/v1/admin/users/{userId}/activate` | Admin | Activate a deactivated staff account |
| POST | `/api/v1/admin/users/{userId}/deactivate` | Admin | Deactivate a staff account without deleting |
| PUT | `/api/v1/admin/users/{userId}/role` | Admin | Change the role of a staff user |

#### Departments

Controller: `AdminDepartmentController` (`backend/controller/src/main/java/com/hospital/api/admin/AdminDepartmentController.java`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/admin/departments` | Admin | List all departments |
| GET | `/api/v1/admin/departments/{departmentId}` | Admin | Get a single department by ID |
| POST | `/api/v1/admin/departments` | Admin | Create a new department |
| PUT | `/api/v1/admin/departments/{departmentId}` | Admin | Update an existing department |
| DELETE | `/api/v1/admin/departments/{departmentId}` | Admin | Soft-delete (deactivate) a department |
| POST | `/api/v1/admin/departments/{departmentId}/assign-doctor` | Admin | Assign a doctor to a department |
| DELETE | `/api/v1/admin/departments/{departmentId}/remove-doctor/{doctorId}` | Admin | Remove a doctor from a department |

#### Rooms

Controller: `AdminRoomController` (`backend/controller/src/main/java/com/hospital/api/admin/AdminRoomController.java`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/admin/rooms` | Admin | List all rooms |
| GET | `/api/v1/admin/rooms/{roomId}` | Admin | Get a single room by ID |
| POST | `/api/v1/admin/rooms` | Admin | Create a new room |
| PUT | `/api/v1/admin/rooms/{roomId}` | Admin | Update room details |
| PUT | `/api/v1/admin/rooms/{roomId}/status` | Admin | Update room operational status (READY / OCCUPIED / MAINTENANCE) |
| DELETE | `/api/v1/admin/rooms/{roomId}` | Admin | Soft-delete (deactivate) a room |

#### Schedule Templates

Controller: `AdminScheduleTemplateController` (`backend/controller/src/main/java/com/hospital/api/admin/AdminScheduleTemplateController.java`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/admin/schedule-templates` | Admin | List all doctor schedule templates |
| POST | `/api/v1/admin/schedule-templates` | Admin | Create a schedule template |
| PUT | `/api/v1/admin/schedule-templates/{templateId}` | Admin | Update a schedule template |

#### Special Closures

Controller: `AdminSpecialClosureController` (`backend/controller/src/main/java/com/hospital/api/admin/AdminSpecialClosureController.java`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/admin/special-closures` | Admin | List all special closures |
| POST | `/api/v1/admin/special-closures` | Admin | Create a special closure |
| PUT | `/api/v1/admin/special-closures/{closureId}` | Admin | Update a special closure |

#### Time Slots

Controller: `AdminTimeSlotController` (`backend/controller/src/main/java/com/hospital/api/admin/AdminTimeSlotController.java`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/admin/slots` | Admin | Get all time slots |
| POST | `/api/v1/admin/slots/generate` | Admin | Generate time slots from schedule templates (idempotent) |
| PUT | `/api/v1/admin/slots/{slotId}/block` | Admin | Manually block a time slot |
| DELETE | `/api/v1/admin/slots/{slotId}` | Admin | Delete an AVAILABLE or BLOCKED slot |

#### Stats & Monitoring

Controllers: `AdminStatsController`, `AdminMonitoringController`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/admin/stats` | Admin | System statistics (user counts, appointment counts, revenue) |
| GET | `/api/v1/admin/monitoring` | Admin | System monitoring snapshot (queue depth, active consultations, room status) |

Source files:
- `AdminStatsController` (`backend/controller/src/main/java/com/hospital/api/admin/AdminStatsController.java`)
- `AdminMonitoringController` (`backend/controller/src/main/java/com/hospital/api/admin/AdminMonitoringController.java`)

#### Audit Logs

Controller: `AdminAuditLogController` (`backend/controller/src/main/java/com/hospital/api/admin/AdminAuditLogController.java`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/admin/audit-logs?entityType=&action=&limit=50` | Admin, Accountant | List audit log entries with optional filters |

#### Content Sections (Homepage)

Controller: `AdminContentController` (`backend/controller/src/main/java/com/hospital/api/admin/AdminContentController.java`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/admin/content/sections` | Admin | List all homepage content sections |
| POST | `/api/v1/admin/content/sections` | Admin | Create a homepage content section |
| PUT | `/api/v1/admin/content/sections/{sectionId}` | Admin | Update a homepage content section |

#### Public Content Management

Controller: `AdminPublicContentController` (`backend/controller/src/main/java/com/hospital/api/admin/AdminPublicContentController.java`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/admin/public-content` | Admin | List all public content entries |
| POST | `/api/v1/admin/public-content` | Admin | Create a public content entry |
| PUT | `/api/v1/admin/public-content/{contentId}` | Admin | Update a public content entry |

#### News Management

Controller: `AdminNewsController` (`backend/controller/src/main/java/com/hospital/api/admin/AdminNewsController.java`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/admin/news` | Admin | List all news articles (including unpublished) |
| POST | `/api/v1/admin/news` | Admin | Create a news article |
| PUT | `/api/v1/admin/news/{articleId}` | Admin | Update a news article |

### AI Integration (Internal)

Controller: `AiIntegrationController` (`backend/controller/src/main/java/com/hospital/api/ai/AiIntegrationController.java`)

These endpoints provide read-only data for external AI/assistant integrations. They require `PATIENT_RECORD_READ` permission.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/ai/health` | Staff | Health check for AI integration module |
| GET | `/api/v1/ai/patients?query=...` | Staff | Search patients for AI integration |
| GET | `/api/v1/ai/patients/{patientId}/snapshot` | Staff | Get a compact patient snapshot (allergies, medications, recent labs) |
| GET | `/api/v1/ai/patients/{patientId}/timeline` | Staff | Get patient timeline (appointments and labs chronologically) |
| GET | `/api/v1/ai/patients/{patientId}/permissions?userId=...` | Staff | Check if a user has access to a patient's data |
| GET | `/api/v1/ai/changes?since=ISO_TIMESTAMP` | Staff | Get changed entity IDs since a given timestamp |

---

## Removed Endpoints

The following endpoint families have been intentionally removed and must not be used:

| Endpoint | Reason |
|----------|--------|
| `/api/v1/ai/analyze-symptoms` | AI symptom analysis feature removed (external model backed) |
| `/api/v1/internal-assistant/**` | Internal assistant feature removed (V11 Flyway migration) |
| `/api/v1/admin/knowledge-documents/**` | Knowledge document management removed |
| `/api/v1/admin/monitoring/internal-assistant` | Internal assistant monitoring removed |

Reference: `docs/reference/removed-endpoints.md`

---

## Endpoint Statistics

| Category | Controllers | Endpoints | Auth scope |
|----------|-------------|-----------|------------|
| Staff Authentication | 1 | 3 | Public |
| Patient Authentication | 1 | 4 | Public |
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

*The count of 118 excludes the four removed endpoint families documented above.*
