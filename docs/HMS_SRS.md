# Hospital Management System SRS

Status: aligned to the repository on 2026-04-16

## 1. Scope

This SRS defines the functional and non-functional requirements that match the current repository.
It is written to help frontend and UI/UX work stay aligned with the implemented backend.

## 2. Source Of Truth

When this document conflicts with older notes, prefer:

1. controller routes in `backend/api/src/main/java`
2. request and response DTOs in `backend/shared/src/main/java`
3. database migrations in `backend/api/src/main/resources/db/migration`

## 3. Actors

| Actor | Authentication | Notes |
| --- | --- | --- |
| Guest | none | Can browse public content and create appointments |
| Patient | patient auth endpoints | Portal-only access |
| Doctor | staff auth endpoints | Own appointments and doctor workflows |
| Nurse | staff auth endpoints | Queue, check-in, and vital signs workflows |
| Accountant | staff auth endpoints | Finance workflows |
| Admin | staff auth endpoints | Configuration, monitoring, and knowledge management |

## 4. Functional Requirements

### 4.1 Public website

The frontend must support:

- Home content from `/api/v1/content/home`
- News list from `/api/v1/news`
- Department list and department detail from `/api/v1/departments`
- Department doctor list from `/api/v1/departments/{departmentId}/doctors`
- Doctor list and doctor detail from `/api/v1/doctors`
- doctor slot availability by date from `/api/v1/doctors/{doctorId}/slots?date=YYYY-MM-DD`
- chatbot requests to `/api/v1/chatbot/messages`

### 4.2 Appointment booking

The booking UI must support:

- symptom analysis via `POST /api/v1/ai/analyze-symptoms`
- appointment creation via `POST /api/v1/appointments`
- success state using the returned confirmation code and booking payload

The booking form must capture these required fields:

- `doctorId`
- `firstSlotId`
- `aiDurationMinutes`
- `patientFullName`
- `patientCccd` as 12 digits
- `patientEmail`
- `patientPhone`
- `patientDateOfBirth`
- `patientGender`
- `patientAddress`

The booking form may also capture:

- `patientOccupation`
- `patientBloodType`
- `patientMedicalHistory`
- `patientDrugAllergies`
- `patientInsuranceNumber`
- `bookingContact`
- `symptoms`

### 4.3 Staff authentication

Staff login must use:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

Requirements:

- access token is returned in the response body
- refresh token is stored in an HTTP-only cookie
- the frontend must handle refresh and unauthorized states

### 4.4 Doctor workflow

Doctor-facing UI must support:

- list appointments from `GET /api/v1/appointments`
- load appointment detail from `GET /api/v1/appointments/{appointmentId}`
- update appointment metadata from `PUT /api/v1/appointments/{appointmentId}`
- change appointment status from `PUT /api/v1/appointments/{appointmentId}/status`
- read vital signs from `GET /api/v1/appointments/{appointmentId}/vital-signs`
- create follow-up from `POST /api/v1/appointments/{appointmentId}/follow-up`
- read follow-up from `GET /api/v1/appointments/{appointmentId}/follow-up`
- create medical record from `POST /api/v1/medical-records`
- preview prescription PDF from `POST /api/v1/medical-records/preview.pdf`
- download prescription PDF from `GET /api/v1/medical-records/{recordId}/prescription.pdf`
- browse patient record summaries from `GET /api/v1/patient-records`
- open a specific patient record from `GET /api/v1/patient-records/{patientId}`

The medical record form must support:

- `appointmentId`
- `diagnosis`
- `clinicalNotes`
- optional `vitalSigns`
- optional `followUpDate`
- optional `prescriptionItems`

### 4.5 Nurse workflow

Nurse-facing UI must support:

- today appointment list from `GET /api/v1/appointments/today`
- queue list from `GET /api/v1/queue/today`
- check-in from `POST /api/v1/appointments/{appointmentId}/checkin`
- create appointment-linked vital signs from `POST /api/v1/appointments/{appointmentId}/vital-signs`
- read appointment-linked vital signs from `GET /api/v1/appointments/{appointmentId}/vital-signs`
- create independent vital signs from `POST /api/v1/vital-signs`
- read/update/delete vital signs from `/api/v1/vital-signs/*`

Important current limitation:

- there is no nurse-specific room management endpoint in the current repo
- room CRUD exists under admin APIs only

### 4.6 Accountant workflow

Accountant-facing UI must support:

- invoice list from `GET /api/v1/invoices`
- invoice creation from `POST /api/v1/invoices`
- payment recording from `POST /api/v1/invoices/{invoiceId}/payments`
- invoice void from `POST /api/v1/invoices/{invoiceId}/void`
- pricing list/create/update from `/api/v1/pricing`
- daily and monthly revenue reports from `/api/v1/reports/revenue/daily` and `/api/v1/reports/revenue/monthly`

### 4.7 Admin workflow

Admin-facing UI must support:

- user CRUD and activation from `/api/v1/admin/users`
- department CRUD and doctor assignment from `/api/v1/admin/departments`
- room CRUD and room status updates from `/api/v1/admin/rooms`
- schedule template CRUD from `/api/v1/admin/schedule-templates`
- special closure CRUD from `/api/v1/admin/special-closures`
- slot generation and deletion from `/api/v1/admin/slots`
- stats from `/api/v1/admin/stats`
- system monitoring from `/api/v1/admin/monitoring`
- internal assistant monitoring from `/api/v1/admin/monitoring/internal-assistant`
- audit log list from `/api/v1/admin/audit-logs`
- public content admin from `/api/v1/admin/content/sections` and `/api/v1/admin/public-content`
- news admin from `/api/v1/admin/news`
- internal assistant knowledge document management from `/api/v1/admin/knowledge-documents`

### 4.8 Patient portal

Patient portal UI must support:

- claim access from `POST /api/v1/patient-auth/claim`
- login from `POST /api/v1/patient-auth/login`
- refresh from `POST /api/v1/patient-auth/refresh`
- logout from `POST /api/v1/patient-auth/logout`
- overview from `GET /api/v1/patient-portal/overview`
- appointments from `GET /api/v1/patient-portal/appointments`
- lab results from `GET /api/v1/patient-portal/lab-results`
- messages from `GET /api/v1/patient-portal/messages`
- profile get/update from `/api/v1/patient-portal/profile`

Important current limitation:

- patient portal messages are list-and-read only in the current API
- there is no patient-side send, reply, password change, cancel request, or reschedule endpoint

### 4.9 Inventory and operational data

The current repo supports inventory operations through:

- `GET/POST/PUT/DELETE /api/v1/inventory/items`
- `GET/POST/PUT /api/v1/inventory/lots`
- `GET/POST /api/v1/inventory/movements`

The design should include:

- stock list
- lot detail and edit
- movement history
- low-stock highlighting

### 4.10 Lab results

The current repo supports:

- create lab result
- view one lab result
- list lab results for an appointment
- delete lab result

The lab result form must capture:

- `appointmentId`
- `testName`
- `resultValue`
- optional `referenceRange`
- optional `status`
- optional `notes`

### 4.11 Internal clinical assistant

The assistant UI must support:

- current session retrieval from `GET /api/v1/internal-assistant/sessions/current`
- sending messages from `POST /api/v1/internal-assistant/messages`
- feedback on responses from `POST /api/v1/internal-assistant/messages/{messageId}/feedback`

Mode behavior:

- `DOCS`: internal documents only
- `PATIENT`: patient context only
- `HYBRID`: combines patient and document evidence

Access rules:

- doctor: docs, patient, hybrid
- nurse: docs, patient, hybrid, but only for the current queue context
- admin: docs only

Required UI behavior:

- show citations
- show deep links
- show suggested follow-up prompts
- handle refusal states clearly

## 5. Data And Form Requirements

### 5.1 Patient portal claim form

Required fields:

- `fullName`
- `email`
- `cccd`
- `dateOfBirth`
- `password`

### 5.2 Patient portal profile form

Required fields:

- `fullName`
- `email`
- `phone`

Optional fields:

- `occupation`
- `bloodType`
- `medicalHistory`
- `drugAllergies`
- `insuranceNumber`

### 5.3 Admin user form

Required fields:

- `email`
- `fullName`
- `role`

Optional but supported:

- `password`
- `phone`
- `departmentId`
- `specialty`
- `qualification`
- `experienceYears`
- `active`

## 6. Non-Functional Requirements

- JWT access tokens must expire quickly and refresh through secure HTTP-only cookies.
- CORS must support configured frontend origins only.
- Public routes and assistant message routes are rate-limited.
- Sensitive patient data must not be shown to unauthorized roles.
- UI should render clearly on desktop and mobile for public and portal surfaces.
- Staff workspaces should prioritize speed, scanability, and low interaction cost.
- Error states must not expose secrets or stack traces.

## 7. Design Constraints

- Do not design features that require patient-side message send or cancel APIs unless they are marked as future scope.
- Do not assume a rich real-time room board exists for nurses.
- Do not imply the chatbot is a general AI assistant; it is a scoped helper for departments, doctors, and booking.
- Do not imply the internal assistant is free-form or uncited; every answer is evidence-based and session-aware.
