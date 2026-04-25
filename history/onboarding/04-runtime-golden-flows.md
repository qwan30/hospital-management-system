# Runtime Golden Flows

These traces were built from code, tests, and GitNexus context. They are static traces unless otherwise noted; runtime execution still needs Docker-backed verification on a machine with a working daemon.

## 1. Staff Login and Refresh

### Entry
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`

### Auth rule
- Public endpoints, but they mint staff credentials for later protected access.

### Step trace
1. `backend/api/src/main/java/com/hospital/api/auth/AuthController.java`
   - `login(...)` accepts `LoginRequest`, calls `AuthService.login(...)`, and writes an HttpOnly refresh cookie.
2. `backend/api/src/main/java/com/hospital/api/auth/AuthService.java`
   - loads the active user by email
   - verifies the BCrypt password hash
   - delegates token creation to `JwtTokenService`
3. `backend/api/src/main/java/com/hospital/api/auth/JwtTokenService.java`
   - creates access token with `sub`, `role`, and `name`
   - creates refresh token with `type=refresh` and `scope=staff`
4. Later protected requests pass through:
   - `backend/api/src/main/java/com/hospital/api/auth/JwtAuthenticationFilter.java`
   - malformed or expired bearer tokens are rejected before controller logic.
5. `AuthController.refresh(...)` prefers the refresh cookie on path `/api/v1/auth` and rotates the next refresh token.

### Side effects
- Writes refresh cookie.
- No database write for login itself.

### Failure modes
- unknown email or password
- malformed refresh token
- wrong refresh scope
- expired access token on protected routes

## 2. Patient Claim, Login, and Portal Overview

### Entry
- `POST /api/v1/patient-auth/claim`
- `POST /api/v1/patient-auth/login`
- `GET /api/v1/patient-portal/overview`

### Auth rule
- claim/login are public
- portal endpoints require `ROLE_PATIENT`

### Step trace
1. `backend/api/src/main/java/com/hospital/api/patientauth/PatientAuthController.java`
   - handles claim/login/refresh/logout and writes the patient-specific refresh cookie.
2. `backend/api/src/main/java/com/hospital/api/patientauth/PatientAuthService.java`
   - claim path verifies patient identity by email + DOB + normalized full name + hashed CCCD
   - creates or reuses `PatientAccountEntity`
   - login path validates patient password
3. `backend/api/src/main/java/com/hospital/api/auth/JwtTokenService.java`
   - patient refresh token uses `scope=patient`
4. `backend/api/src/main/java/com/hospital/api/patientportal/PatientPortalController.java`
   - reads patient ID from the JWT subject
5. `backend/core/src/main/java/com/hospital/core/patientportal/PatientPortalService.java`
   - loads patient
   - loads appointments, lab results, and message threads
   - computes next appointment and unread counts

### Side effects
- Claim may create or update `patient_accounts`.
- Refresh rotates the patient refresh cookie.

### Failure modes
- failed identity verification during claim
- patient account missing or inactive during refresh
- patient portal access attempted without patient token

## 3. Public Booking and Slot Locking

### Entry
- optional: `POST /api/v1/ai/analyze-symptoms`
- main write: `POST /api/v1/appointments`

### Auth rule
- Public

### Step trace
1. `backend/api/src/main/java/com/hospital/api/ai/AiController.java`
   - optional symptom-analysis step; returns a recommended duration and complexity.
2. `backend/api/src/main/java/com/hospital/api/appointment/AppointmentController.java`
   - `createAppointment(...)` accepts `AppointmentCreateRequest`.
3. `backend/core/src/main/java/com/hospital/core/appointment/AppointmentWriteService.java`
   - verifies doctor exists and is active
   - pessimistically loads the first slot
   - computes how many contiguous slots are needed from `aiDurationMinutes`
   - locks the window via `TimeSlotRepository.lockWindow(...)`
   - validates slot contiguity and availability
   - creates or updates the patient via encrypted CCCD + hashed lookup
   - marks slots as booked
   - saves the appointment with confirmation code and `CONFIRMED` status
4. `backend/core/src/main/java/com/hospital/core/email/EmailService.java`
   - sends appointment confirmation through the Gmail integration seam

### Side effects
- upserts patient record
- mutates slot status
- inserts appointment
- may send confirmation email

### Failure modes
- doctor not found
- slot not found
- slot belongs to a different doctor
- not enough contiguous slots
- slot already reserved
- validation failure on request DTO

## 4. Nurse Queue and Check-In

### Entry
- `GET /api/v1/queue/today`
- `POST /api/v1/appointments/{appointmentId}/checkin`

### Auth rule
- `ROLE_NURSE`

### Step trace
1. `backend/api/src/main/java/com/hospital/api/queue/QueueController.java`
   - delegates to `AppointmentWorkflowService.listQueueForDate(...)`.
2. `backend/core/src/main/java/com/hospital/core/appointment/AppointmentWorkflowService.java`
   - builds queue from appointments in `CHECKED_IN` or `IN_PROGRESS`
   - sorts by check-in time and slot start time
3. `backend/api/src/main/java/com/hospital/api/appointment/AppointmentController.java`
   - `checkInAppointment(...)` accepts timestamp payload.
4. `AppointmentWorkflowService.checkInAppointment(...)`
   - loads detailed appointment
   - allows check-in only from `CONFIRMED`
   - stamps `checkedInAt` and updates status to `CHECKED_IN`

### Side effects
- queue reads only
- check-in mutates appointment status and timestamp

### Failure modes
- unauthenticated or wrong role
- appointment not found
- appointment already in a non-check-in state

## 5. Doctor Schedule -> In Progress -> Medical Record -> Prescription PDF -> Patient History

### Entry
- `GET /api/v1/me/schedule`
- `PUT /api/v1/appointments/{id}/status`
- `POST /api/v1/medical-records`
- `POST /api/v1/medical-records/preview.pdf`
- `GET /api/v1/medical-records/{recordId}/prescription.pdf`
- `GET /api/v1/patients/{cccd}/history`

### Auth rule
- `ROLE_DOCTOR`

### Step trace
1. `backend/api/src/main/java/com/hospital/api/schedule/ScheduleController.java`
   - resolves doctor ID from JWT
   - accepts either a single date or ISO week
   - delegates to `AppointmentWorkflowService.listScheduleForDoctor(...)`
2. `backend/api/src/main/java/com/hospital/api/appointment/AppointmentController.java`
   - `updateAppointmentStatus(...)` delegates doctor-owned status transitions
3. `AppointmentWorkflowService.updateAppointmentStatus(...)`
   - only allows a doctor to manage their own appointment
   - currently only allows `CHECKED_IN -> IN_PROGRESS`
4. `backend/api/src/main/java/com/hospital/api/medicalrecord/MedicalRecordController.java`
   - `createMedicalRecord(...)` sends `MedicalRecordCreateRequest`
5. `backend/core/src/main/java/com/hospital/core/medicalrecord/MedicalRecordService.java`
   - validates doctor ownership
   - rejects duplicate record creation
   - requires the appointment to be at least `CHECKED_IN`
   - copies diagnosis, notes, vital signs, follow-up date, and prescription items into the record
   - changes appointment status to `DONE`
   - plans reminders
   - generates the prescription PDF
   - sends visit result email
6. `PrescriptionPdfService.generate(...)` supports preview and persisted download.
7. `backend/api/src/main/java/com/hospital/api/patient/PatientController.java`
   - `getPatientHistory(...)` calls `MedicalRecordService.getPatientHistory(...)`
   - returns ordered appointment history plus embedded medical-record payload

### Side effects
- appointment transitions
- record creation
- reminder planning
- email delivery
- PDF generation

### Failure modes
- doctor tries to manage another doctor's appointment
- invalid status transition
- duplicate medical record
- appointment not ready for record creation
- doctor tries to access another doctor's prescription PDF

## 6. Inventory Lot and Movement Update

### Entry
- `POST /api/v1/inventory/lots`
- `POST /api/v1/inventory/movements`

### Auth rule
- `ROLE_ACCOUNTANT` or `ROLE_ADMIN`

### Step trace
1. `backend/api/src/main/java/com/hospital/api/inventory/InventoryController.java`
   - exposes lot create/update and movement record endpoints
2. `backend/core/src/main/java/com/hospital/core/inventory/InventoryWriteService.java`
   - `createLot(...)` validates item existence and creates a lot with received and remaining quantity
   - `recordMovement(...)` validates item existence, inserts a movement row, then updates quantity-on-hand and item status

### Side effects
- inserts `inventory_lots`
- inserts `inventory_movements`
- mutates `inventory_items.quantity_on_hand`, `last_restocked_at`, and `status`

### Failure modes
- item not found
- department not found for item create/update

## 7. Invoice Creation, Payment, and Revenue Reporting

### Entry
- `POST /api/v1/invoices`
- `POST /api/v1/invoices/{invoiceId}/payments`
- `GET /api/v1/reports/revenue/daily`
- `GET /api/v1/reports/revenue/monthly`

### Auth rule
- `ROLE_ACCOUNTANT` or `ROLE_ADMIN`

### Step trace
1. `backend/api/src/main/java/com/hospital/api/invoice/InvoiceController.java`
   - creates invoices from appointment IDs and captures payments
2. `backend/core/src/main/java/com/hospital/core/invoice/InvoiceService.java`
   - blocks duplicate invoices
   - requires appointment status `DONE`
   - resolves amount from department pricing or a default consultation amount
   - writes audit records for create, pay, void, and pricing changes
3. `backend/api/src/main/java/com/hospital/api/invoice/RevenueReportController.java`
   - delegates to the same service for daily and monthly summaries

### Side effects
- creates invoice rows
- mutates invoice status and payment metadata
- records audit logs

### Failure modes
- duplicate invoice
- invoice created before appointment completion
- payment attempted on a non-unpaid invoice
- void attempted on a paid invoice

## 8. Internal Assistant Docs Mode, Patient Mode, Feedback, and Knowledge Activate/Revoke

### Entry
- `GET /api/v1/internal-assistant/sessions/current`
- `POST /api/v1/internal-assistant/messages`
- `POST /api/v1/internal-assistant/messages/{messageId}/feedback`
- `POST /api/v1/admin/knowledge-documents`
- `POST /api/v1/admin/knowledge-documents/{documentId}/activate`
- `POST /api/v1/admin/knowledge-documents/{documentId}/revoke`

### Auth rule
- assistant routes: doctor, nurse, admin
- knowledge document admin: admin only
- admin is intentionally restricted to docs mode in the assistant

### Step trace
1. `backend/api/src/main/java/com/hospital/api/internalassistant/InternalAssistantController.java`
   - resolves actor ID and role from JWT
2. `backend/core/src/main/java/com/hospital/core/internalassistant/InternalAssistantService.java`
   - validates role-mode access
   - resolves patient scope for doctor or nurse when patient mode is used
   - creates or resumes a session via `InternalAssistantConversationService`
   - records the user message
   - builds patient answer and/or knowledge answer
   - records assistant response, audit log, and metrics
3. `backend/core/src/main/java/com/hospital/core/internalassistant/knowledge/KnowledgeAdminService.java`
   - uploads documents
   - triggers ingestion
   - activates, revokes, and reindexes documents
4. `backend/api/src/main/java/com/hospital/api/admin/AdminKnowledgeDocumentController.java`
   - guards file upload types and size
5. Feedback loop:
   - `InternalAssistantConversationService.submitFeedback(...)`
   - `InternalAssistantMetricsService.recordFeedback(...)`

### Side effects
- session and message persistence
- feedback persistence
- audit logging
- query and feedback metrics
- knowledge document lifecycle changes

### Failure modes
- admin attempts patient mode
- patient mode without patient or appointment context
- doctor attempts another doctor's patient context
- no approved evidence found, resulting in `scope=refused`
- invalid document file type or size

## Runtime Verification Status
- Static trace completed for all eight flows.
- Integration coverage exists for several of them in:
  - `ClinicalWorkflowIntegrationTest`
  - `InternalAssistantIntegrationTest`
  - `SecurityHardeningIntegrationTest`
- Live Docker-backed execution still needs to be repeated on a machine with a working Docker daemon.
