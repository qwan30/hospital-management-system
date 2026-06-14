# End-to-End Business Flows

**Version:** 1.0
**Date:** 2026-06-14
**Scope:** All 7 clinical workflows in the Hospital Management System

---

## Flow 1: Public Booking (Guest)

**Business Objective:** Allow a guest (unauthenticated user) to browse hospital information, select a doctor and available slot, submit patient identity and symptoms, and receive a confirmed appointment with encrypted PHI.

**Actors:** Guest, Backend API, Database

**APIs Involved:**
- `GET /api/v1/departments` — list departments
- `GET /api/v1/departments/{id}/doctors` — doctors by department
- `GET /api/v1/doctors/{id}/slots?date=` — available slots
- `POST /api/v1/appointments` — create appointment

**Data Created/Updated:** `patients`, `appointments`, `time_slots` (AVAILABLE -> BOOKED), `audit_logs`

**State Transitions:** Appointment created as `CONFIRMED`; slot moves `AVAILABLE -> BOOKED`

```mermaid
sequenceDiagram
    participant Guest
    participant Browser as Next.js Frontend
    participant API as Spring Boot Backend
    participant DB as PostgreSQL

    Guest->>Browser: Open /booking
    Browser->>API: GET /api/v1/departments
    API->>DB: SELECT active departments
    DB-->>API: Department list
    API-->>Browser: Departments JSON
    Browser->>Guest: Render department cards

    Guest->>Browser: Select department
    Browser->>API: GET /api/v1/departments/{id}/doctors
    API->>DB: SELECT doctors in department
    DB-->>API: Doctor list
    API-->>Browser: Doctor JSON

    Guest->>Browser: Select doctor + date
    Browser->>API: GET /api/v1/doctors/{id}/slots?date=
    API->>DB: SELECT AVAILABLE slots
    DB-->>API: Available time slots
    API-->>Browser: Slots JSON
    Browser->>Guest: Render slot picker

    Guest->>Browser: Fill patient form (name, CCCD, phone, DOB, gender, address, email, symptoms)
    Guest->>Browser: Submit booking
    Browser->>API: POST /api/v1/appointments

    Note over API,DB: Validate slot ownership, duration, double-booking

    API->>DB: UPSERT patient (CCCD-unique)
    API->>DB: UPDATE slot status -> BOOKED
    API->>DB: INSERT appointment (status: CONFIRMED)
    API->>DB: INSERT audit_log (action: BOOKING_CREATED)
    API-->>Browser: 201 Created (confirmation code, appointment ID)

    Note over Browser,API: PHI encrypted in transit via HTTPS
    Note over DB: Patient PII stored with encryption at rest

    Browser->>Guest: Show confirmation with booking details
```

**Exception Flows:**
- Missing required fields -> backend returns 400 `validation_error`
- Slot already BOOKED or BLOCKED -> backend returns 409 `conflict`
- Duplicate concurrent booking -> database constraint or optimistic lock
- Network disconnect -> loading state with retry

---

## Flow 2: Staff Authentication (Login -> JWT + Refresh Cookie -> RBAC)

**Business Objective:** Authenticate staff users via email/password, issue short-lived JWT and HTTP-only refresh cookie, enforce role-based access control (RBAC) across all protected routes and APIs.

**Actors:** Staff (Admin, Doctor, Nurse, Receptionist, Pharmacist, Accountant), JWT Filter, RbacAuthorizationService

**APIs Involved:**
- `POST /api/v1/auth/login` — authenticate, return tokens
- `POST /api/v1/auth/refresh` — refresh access token
- `POST /api/v1/auth/logout` — invalidate session
- All protected APIs through JWT filter + RBAC

**Data:** `users` (active check), `audit_logs` (denial/security events)

**Security Model:**
- Access token: short-lived JWT stored in sessionStorage
- Refresh token: HTTP-only cookie, not accessible to JavaScript
- Backend: JwtAuthenticationFilter validates token on every request
- Backend: RbacAuthorizationService enforces method-level @PreAuthorize
- Frontend: Route guard in `frontend/src/lib/rbac.ts` enforces screen-level access

```mermaid
sequenceDiagram
    participant Staff
    participant Browser
    participant RouteGuard as Frontend Route Guard
    participant API
    participant JWTFilter as JWT Filter
    participant RBAC as RbacAuthorizationService
    participant DB

    Staff->>Browser: Open /staff/login
    Browser->>Staff: Render login form
    Staff->>Browser: Enter email + password
    Browser->>API: POST /api/v1/auth/login

    API->>DB: SELECT user by email (active = true)
    DB-->>API: User entity with role + hashed password
    API->>API: Verify password hash (BCrypt)

    alt Invalid credentials
        API-->>Browser: 401 unauthorized
        Browser->>Staff: Show error message
    else Valid credentials
        API->>API: Generate JWT access token (15 min expiry)
        API->>API: Generate refresh token (7 day expiry, HTTP-only cookie)
        API-->>Browser: 200 OK + Set-Cookie (refresh) + JSON (accessToken, role)
        Browser->>Browser: Store accessToken + role in sessionStorage

        Staff->>Browser: Navigate to protected screen
        Browser->>RouteGuard: Check role against route permissions
        alt Role not allowed
            Browser->>Staff: Redirect to /forbidden
        else Role allowed
            Browser->>API: GET /api/v1/protected/resource (Authorization: Bearer <accessToken>)
            JWTFilter->>JWTFilter: Validate token signature + expiry
            alt Invalid/expired token
                JWTFilter-->>Browser: 401 unauthorized
                Browser->>API: POST /api/v1/auth/refresh (includes cookie)
                API->>API: Validate refresh cookie
                alt Refresh valid
                    API-->>Browser: New access token
                    Browser->>API: Retry original request
                else Refresh invalid
                    API-->>Browser: 401, redirect to login
                end
            else Valid token
                JWTFilter->>JWTFilter: Extract role from claims
                JWTFilter->>RBAC: Check @PreAuthorize("hasRole('...')")
                RBAC-->>JWTFilter: Granted
                JWTFilter-->>API: Authenticated request
                API->>DB: Business operation
                DB-->>API: Result
                API-->>Browser: 200 OK with data
                Browser->>Staff: Render protected screen
            end
        end
    end

    Staff->>Browser: Click Logout
    Browser->>API: POST /api/v1/auth/logout
    API->>API: Clear refresh cookie + invalidate token
    API-->>Browser: 200 OK
    Browser->>Browser: Clear sessionStorage
    Browser->>Staff: Redirect to /staff/login
```

---

## Flow 3: Queue Operations (Check-In -> Vitals -> Room -> Consultation -> Complete/Skip)

**Business Objective:** Move confirmed appointments through the operational queue: nurse/receptionist checks in the patient, records vitals, assigns a room, and either completes or skips the visit. Doctors start and complete consultations.

**Actors:** Nurse, Receptionist, Doctor, Admin

**APIs Involved:**
- `GET /api/v1/queue/today` — today's queue state
- `GET /api/v1/appointments/today` — today's appointments
- `POST /api/v1/appointments/{id}/checkin` — check in patient
- `POST /api/v1/queue/{id}/call` — call patient
- `POST /api/v1/queue/{id}/assign-room` — assign room
- `POST /api/v1/queue/{id}/start-consultation` — start consultation
- `POST /api/v1/queue/{id}/complete` — complete visit
- `POST /api/v1/queue/{id}/skip` — skip patient
- Vital sign endpoints

**Data:** `appointments`, `appointment_vital_signs`, `audit_logs`, `rooms`

**State Transitions:**
- Appointment: `CONFIRMED -> CHECKED_IN -> IN_PROGRESS -> DONE` (or `CANCELLED`/`SKIPPED`)

```mermaid
sequenceDiagram
    participant Staff as Nurse/Receptionist
    participant Browser
    participant QueueAPI as Queue Controller
    participant AppointmentSvc as Appointment Service
    participant DB

    Staff->>Browser: Open /staff/queue
    Browser->>QueueAPI: GET /api/v1/queue/today
    QueueAPI->>DB: SELECT today's appointments + queue state
    DB-->>QueueAPI: Queue data
    QueueAPI-->>Browser: Queue list (CONFIRMED, CHECKED_IN, IN_PROGRESS)

    Browser->>Staff: Render queue with action buttons

    Staff->>Browser: Click "Check In" on confirmed appointment
    Browser->>AppointmentSvc: POST /api/v1/appointments/{id}/checkin
    AppointmentSvc->>DB: UPDATE appointment status -> CHECKED_IN
    AppointmentSvc->>DB: INSERT audit_log
    DB-->>AppointmentSvc: Updated appointment
    AppointmentSvc-->>Browser: 200 OK (status: CHECKED_IN)
    Browser->>Staff: Row updates in queue

    Staff->>Browser: Record vital signs
    Browser->>AppointmentSvc: POST /api/v1/vital-signs (bloodPressure, temperature, etc.)
    AppointmentSvc->>DB: INSERT appointment_vital_signs
    DB-->>AppointmentSvc: Vital signs saved
    AppointmentSvc-->>Browser: 200 OK

    Staff->>Browser: Click "Call"
    Browser->>QueueAPI: POST /api/v1/queue/{id}/call
    QueueAPI->>DB: UPDATE queue state -> CALLED
    QueueAPI-->>Browser: 200 OK

    Staff->>Browser: Click "Assign Room"
    Browser->>QueueAPI: POST /api/v1/queue/{id}/assign-room (roomName)
    QueueAPI->>DB: UPDATE appointment room assignment
    QueueAPI-->>Browser: 200 OK

    Staff->>Browser: Click "Start Consultation"
    Browser->>QueueAPI: POST /api/v1/queue/{id}/start-consultation
    QueueAPI->>DB: UPDATE appointment status -> IN_PROGRESS
    QueueAPI-->>Browser: 200 OK

    alt Clinical visit completed
        Staff->>Browser: Click "Complete"
        Browser->>QueueAPI: POST /api/v1/queue/{id}/complete
        QueueAPI->>DB: UPDATE appointment status -> DONE
        QueueAPI->>DB: INSERT audit_log (action: QUEUE_COMPLETED)
        QueueAPI-->>Browser: 200 OK
        Browser->>Staff: Appointment moves to completed section
    else Skip
        Staff->>Browser: Click "Skip" (with confirmation)
        Browser->>QueueAPI: POST /api/v1/queue/{id}/skip
        QueueAPI->>DB: Mark skipped
        QueueAPI->>DB: INSERT audit_log
        QueueAPI-->>Browser: 200 OK
    end
```

**Guards and Business Rules:**
- Check-in requires appointment in `CONFIRMED` status
- Start consultation requires appointment in `CHECKED_IN` or after room assignment
- Complete requires appointment in `IN_PROGRESS`
- Skip and Complete are terminal actions requiring confirmation
- Doctor cannot complete directly via status API when queue workflow is active (returns 409)

---

## Flow 4: Doctor Clinical (Dashboard -> Patient -> Record -> Prescription PDF -> Follow-Up)

**Business Objective:** Enable doctors to see their schedule, open a patient appointment, record diagnosis/notes/vitals/prescriptions, generate a prescription PDF, set follow-up reminders, and mark the appointment complete.

**Actors:** Doctor, Admin

**APIs Involved:**
- `GET /api/v1/appointments` — doctor's appointments
- `GET /api/v1/appointments/{id}` — appointment detail
- `GET /api/v1/me/schedule?date=` — doctor's schedule
- `PUT /api/v1/appointments/{id}/status` — update appointment status
- `POST /api/v1/medical-records` — create medical record
- `POST /api/v1/medical-records/preview.pdf` — preview prescription PDF
- `GET /api/v1/medical-records/{recordId}/prescription.pdf` — download PDF

**Data:** `medical_records`, `prescription_items`, `appointments`, `appointment_follow_ups`, `audit_logs`

**Guard:** Doctor can only access own appointments (enforced by `RbacAuthorizationService`)

```mermaid
sequenceDiagram
    participant Doctor
    participant Browser
    participant API
    participant RBAC as RBAC Guard
    participant DB

    Doctor->>Browser: Open /staff/doctor/dashboard
    Browser->>API: GET /api/v1/me/schedule?date=
    API->>RBAC: Check DOCTOR role + ownership filter
    RBAC-->>API: Authorized
    API->>DB: SELECT appointments for this doctor
    DB-->>API: Appointment list
    API-->>Browser: Schedule data
    Browser->>Doctor: Render appointment cards

    Doctor->>Browser: Select patient appointment
    Browser->>API: GET /api/v1/appointments/{id}
    API->>RBAC: Verify doctor owns appointment
    API->>DB: Appointment + patient detail
    DB-->>API: Full appointment data
    API-->>Browser: Appointment detail

    Doctor->>Browser: Open medical record editor
    Browser->>API: GET /api/v1/appointments/{id}/vital-signs (if any)
    API-->>Browser: Existing vitals

    Doctor->>Browser: Enter diagnosis, clinical notes, vitals
    Doctor->>Browser: Set follow-up date (optional)
    Doctor->>Browser: Add prescription items (medicine, dosage, frequency, duration)
    Doctor->>Browser: Submit medical record

    Browser->>API: POST /api/v1/medical-records
    API->>DB: Check no duplicate record for this appointment
    alt Duplicate exists
        DB-->>API: Conflict
        API-->>Browser: 409 conflict
        Browser->>Doctor: Show error
    else First record
        API->>DB: INSERT medical_record
        API->>DB: INSERT prescription_items
        API->>DB: INSERT appointment_follow_up (if follow-up date set)
        API->>DB: UPDATE appointment status -> DONE
        API->>DB: INSERT audit_log
        API->>API: Plan reminder (async, if follow-up)
        DB-->>API: Created record with ID
        API-->>Browser: 201 Created (recordId, appointmentStatus: DONE)

        Browser->>Doctor: Show success with record details

        Doctor->>Browser: Click "Preview Prescription"
        Browser->>API: POST /api/v1/medical-records/preview.pdf (recordId)
        API->>DB: SELECT medical_record + prescription_items
        DB-->>API: Record data
        API->>API: Generate PDF with Apache PDFBox
        API-->>Browser: PDF stream (Content-Type: application/pdf)

        Doctor->>Browser: Download prescription PDF
        Browser->>API: GET /api/v1/medical-records/{recordId}/prescription.pdf
        API-->>Browser: Prescription PDF with Content-Disposition header
    end
```

---

## Flow 5: Pharmacy Dispense (View Rx -> Check Inventory -> Dispense -> Record Movement)

**Business Objective:** Let pharmacists view prescription items from medical records, check inventory stock, dispense medication against a valid prescription and stocked lot, and record the inventory movement.

**Actors:** Pharmacist, Admin

**APIs Involved:**
- `GET /api/v1/inventory/items` — list inventory items
- `GET /api/v1/inventory/lots` — list lots
- `POST /api/v1/inventory/dispense` — dispense medication
- `GET /api/v1/inventory/movements` — list movements
- `GET /api/v1/inventory/alerts` — low stock / expiry alerts
- `GET /api/v1/medical-records/{recordId}/prescription.pdf` — prescription PDF

**Data:** `inventory_items`, `inventory_lots`, `inventory_movements`, `medical_records`, `prescription_items`, `audit_logs`

```mermaid
sequenceDiagram
    participant Pharmacist
    participant Browser
    participant API
    participant InventorySvc as Inventory Service
    participant DB

    Pharmacist->>Browser: Open /staff/inventory
    Browser->>API: GET /api/v1/inventory/items
    API->>DB: SELECT items
    DB-->>API: Item list
    API-->>Browser: Items

    Browser->>API: GET /api/v1/inventory/alerts
    API->>DB: SELECT low-stock + expiring items
    DB-->>API: Alert data
    API-->>Browser: Alert counts

    Pharmacist->>Browser: Navigate to prescription preview
    Browser->>API: GET /api/v1/medical-records/{recordId}/prescription.pdf
    API-->>Browser: Prescription PDF

    Pharmacist->>Browser: Return to inventory, open dispense form
    Browser->>API: GET /api/v1/inventory/lots?itemId=
    API->>DB: SELECT lots for selected item with remaining quantity
    DB-->>API: Lot list
    API-->>Browser: Available lots

    Pharmacist->>Browser: Select lot, enter quantity, link to medical record
    Pharmacist->>Browser: Submit dispense

    Browser->>API: POST /api/v1/inventory/dispense
    InventorySvc->>DB: Validate lot belongs to item
    InventorySvc->>DB: Validate prescription item exists on record
    InventorySvc->>DB: Validate sufficient stock

    alt Validation fails
        DB-->>InventorySvc: Constraint violation
        InventorySvc-->>Browser: 400/409 error
        Browser->>Pharmacist: Show error message
    else All valid
        InventorySvc->>DB: INSERT inventory_movement (type: DISPENSED, quantityDelta: -N)
        InventorySvc->>DB: UPDATE lot remaining quantity
        InventorySvc->>DB: INSERT audit_log
        DB-->>InventorySvc: Dispense recorded
        InventorySvc-->>Browser: 200 OK with movement record
        Browser->>Pharmacist: Show success, reload inventory counts
    end
```

---

## Flow 6: Billing (Auto-Invoice -> Payment -> Void -> Revenue Reports)

**Business Objective:** Allow accountants and admins to create invoices for completed appointments, record payments, void unpaid invoices, manage service pricing, and view daily/monthly revenue reports.

**Actors:** Accountant, Admin

**APIs Involved:**
- `GET /api/v1/invoices` — list invoices
- `POST /api/v1/invoices` — create invoice
- `POST /api/v1/invoices/{id}/payments` — record payment
- `POST /api/v1/invoices/{id}/void` — void invoice
- `GET /api/v1/pricing` — list pricing
- `POST /api/v1/pricing` — create pricing
- `PUT /api/v1/pricing/{id}` — update pricing
- `GET /api/v1/reports/revenue/daily` — daily revenue
- `GET /api/v1/reports/revenue/monthly` — monthly revenue

**Data:** `invoices`, `service_pricing`, `appointments`, `patients`, `audit_logs`

**State Transitions:** Invoice `UNPAID -> PAID`; `UNPAID -> CANCELLED` (void)

```mermaid
sequenceDiagram
    participant Accountant
    participant Browser
    participant API
    participant InvoiceSvc as Invoice Service
    participant DB

    Accountant->>Browser: Open /staff/invoices
    Browser->>API: GET /api/v1/invoices
    API->>DB: SELECT invoices
    DB-->>API: Invoice list
    API-->>Browser: Invoices (filterable by status)

    Accountant->>Browser: Click "Create Invoice"
    Browser->>API: GET /api/v1/appointments (completed, unbilled)
    API-->>Browser: Available appointments
    Accountant->>Browser: Select appointment, submit
    Browser->>API: POST /api/v1/invoices (appointmentId)

    API->>DB: Check no duplicate invoice for this appointment
    alt Duplicate
        DB-->>API: Conflict
        API-->>Browser: 409 error
    else Valid
        API->>DB: INSERT invoice (status: UNPAID)
        API->>DB: INSERT audit_log
        API-->>Browser: 201 Created
        Browser->>Accountant: Invoice appears in list (UNPAID)
    end

    Accountant->>Browser: Click "Pay" on unpaid invoice
    Browser->>API: POST /api/v1/invoices/{id}/payments (paymentMethod)
    API->>InvoiceSvc: Validate invoice is UNPAID
    InvoiceSvc->>DB: UPDATE invoice status -> PAID
    InvoiceSvc->>DB: INSERT payment record
    InvoiceSvc->>DB: INSERT audit_log
    DB-->>InvoiceSvc: Updated
    InvoiceSvc-->>Browser: 200 OK
    Browser->>Accountant: Invoice shows PAID

    alt Void (unpaid only)
        Accountant->>Browser: Click "Void" (with confirmation)
        Browser->>API: POST /api/v1/invoices/{id}/void
        InvoiceSvc->>DB: Validate invoice is UNPAID
        alt Already paid
            DB-->>InvoiceSvc: Invalid transition
            InvoiceSvc-->>Browser: 400 error
        else Valid
            InvoiceSvc->>DB: UPDATE invoice status -> CANCELLED
            InvoiceSvc->>DB: INSERT audit_log
            DB-->>InvoiceSvc: Updated
            InvoiceSvc-->>Browser: 200 OK
            Browser->>Accountant: Invoice shows CANCELLED
        end
    end

    Accountant->>Browser: Open /staff/revenue
    Browser->>API: GET /api/v1/reports/revenue/daily?date=
    API->>DB: Aggregate PAID invoices by date
    DB-->>API: Daily totals
    API-->>Browser: Daily revenue report

    Browser->>API: GET /api/v1/reports/revenue/monthly?month=
    API->>DB: Aggregate PAID invoices by month
    DB-->>API: Monthly totals
    API-->>Browser: Monthly revenue report
    Browser->>Accountant: Revenue charts and tables
```

---

## Flow 7: Patient Portal (Claim -> Login -> Overview -> Appointments -> Lab Results)

**Business Objective:** Let patients claim their portal account (or log in), view a personalized overview, read their own appointments, lab results, messages, and profile, with strict data isolation.

**Actors:** Patient

**APIs Involved:**
- `POST /api/v1/patient-auth/claim` — claim account
- `POST /api/v1/patient-auth/login` — patient login
- `POST /api/v1/patient-auth/refresh` — refresh token
- `POST /api/v1/patient-auth/logout` — logout
- `GET /api/v1/patient-portal/overview` — portal overview
- `GET /api/v1/patient-portal/appointments` — patient appointments
- `GET /api/v1/patient-portal/lab-results` — patient lab results
- `GET /api/v1/patient-portal/messages` — patient messages
- `GET /api/v1/patient-portal/profile` — patient profile
- `PUT /api/v1/patient-portal/profile` — update profile

**Data:** `patient_accounts`, `patients`, read models from `appointments`, `lab_results`, `patient_message_threads`, `patient_messages`

**Guard:** All portal endpoints are scoped to the authenticated patient only. Cross-patient data leakage is prevented by backend patient identity extraction from the JWT.

```mermaid
sequenceDiagram
    participant Patient
    participant Browser
    participant API
    participant PortalSvc as Portal Service
    participant DB

    alt New patient
        Patient->>Browser: Open /portal/claim
        Patient->>Browser: Enter CCCD, date of birth, phone
        Browser->>API: POST /api/v1/patient-auth/claim
        API->>DB: Verify identity matches patient record
        alt Identity match
            API->>DB: CREATE patient_account + patient token
            API-->>Browser: 200 OK (token, patient info)
        else No match
            API-->>Browser: 400/401 error
            Browser->>Patient: Show claim error
        end
    else Returning patient
        Patient->>Browser: Open /portal/login
        Patient->>Browser: Enter credentials
        Browser->>API: POST /api/v1/patient-auth/login
        API->>DB: Verify patient account credentials
        alt Valid
            API->>API: Generate JWT + refresh cookie
            API-->>Browser: 200 OK (token, role: PATIENT)
        else Invalid
            API-->>Browser: 401 error
        end
    end

    Browser->>Browser: Store patient token in sessionStorage

    Patient->>Browser: Open portal overview
    Browser->>API: GET /api/v1/patient-portal/overview
    API->>PortalSvc: Extract patientId from JWT
    PortalSvc->>DB: SELECT patient data, recent appointments, unread messages
    DB-->>PortalSvc: Scoped patient data
    PortalSvc-->>Browser: Overview (name, upcoming appointments, lab count, message count)
    Browser->>Patient: Render dashboard

    Patient->>Browser: View appointments
    Browser->>API: GET /api/v1/patient-portal/appointments
    API->>PortalSvc: Scoped to patientId
    PortalSvc->>DB: SELECT appointments for this patient
    DB-->>PortalSvc: Appointment list
    PortalSvc-->>Browser: Appointments with statuses
    Browser->>Patient: Appointment cards/timeline

    Patient->>Browser: View lab results
    Browser->>API: GET /api/v1/patient-portal/lab-results
    API->>PortalSvc: Scoped to patientId
    PortalSvc->>DB: SELECT lab_results for this patient
    DB-->>PortalSvc: Lab results (status, test name, result, date)
    PortalSvc-->>Browser: Lab results list
    Browser->>Patient: Lab results with status badges

    Patient->>Browser: Open profile
    Browser->>API: GET /api/v1/patient-portal/profile
    API-->>Browser: Patient profile data
    Browser->>Patient: Editable profile form

    Patient->>Browser: Update profile fields
    Browser->>API: PUT /api/v1/patient-portal/profile
    API->>PortalSvc: Validate + persist
    PortalSvc->>DB: UPDATE patient profile
    DB-->>PortalSvc: Updated
    PortalSvc-->>Browser: 200 OK
    Browser->>Patient: Profile updated confirmation
```

---

## Cross-Cutting Concerns

### PHI Encryption
- Patient Personally Identifiable Information (PII) / Protected Health Information (PHI) is encrypted at rest in the database
- All API communication occurs over HTTPS (TLS)
- Patient identity fields are handled through the `security.patient-identifier.secret` configuration

### Audit Logging
- All state-changing operations (booking, check-in, payment, void, dispense, etc.) write to the `audit_logs` table
- Security denials (401, 403) are logged with actor, action, resource, and timestamp

### RBAC Enforcement
- Frontend: route guard in `frontend/src/lib/rbac.ts` blocks unauthorized screen access
- Backend: `RbacAuthorizationService` with `@PreAuthorize` annotations on every controller method
- 6 staff roles + PATIENT role, each with distinct permission sets across 11 business modules
