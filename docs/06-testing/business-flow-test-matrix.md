# HMS A-to-Z Business Flow Test Document

**Status:** canonical BA/QA end-to-end business-flow testing document for the current HMS repository.
**Generated:** 2026-05-21.
**Repository status refresh:** 2026-05-27.
**Evidence level:** source code, existing tests, and the 2026-06-01 release-readiness verification artifacts.
**GitNexus source:** `hospital-management-system`, indexed commit `c255231`, status up to date on 2026-05-27.

Use this document to test the system from public discovery through booking, queue, clinical care, patient portal, operations, finance, and administration. It expands the previous flow matrix into a full business-flow, exception, module, and button/action inspection reference.

## 1. System Overview

### Runtime Surfaces

| Surface | Source | Purpose | Status |
| --- | --- | --- | --- |
| Public website and patient/staff UI | `web/` | Canonical Next.js app for public discovery, staff operations, admin, and patient portal | Working, with selected static/reference-only screens |
| Reference prototype | `frontend/` | Historical/design reference only | Not active runtime |
| Backend API | `backend/controller`, `backend/application`, `backend/domain`, `backend/infrastructure`, `backend/start` | Spring Boot modular monolith with controllers, services, DTOs, repositories, migrations, and security filters | Working |
| Database | `backend/start/src/main/resources/db/migration` | Flyway-managed PostgreSQL schema | Working |
| Automated tests | `backend/application/src/test`, `backend/start/src/test`, `web/src/**/__tests__`, `web/e2e` | Unit, integration, component, route, visual, and workflow coverage | Working; latest recorded final pass is in `full-hms-production-readiness-report-2026-06-01.md` |

### Business Modules

| Module | Business purpose |
| --- | --- |
| Public discovery | Let guests browse hospital content, departments, doctors, news, and start booking. |
| Public booking | Create a confirmed appointment from doctor, date, slot, patient identity, and symptoms. |
| Staff authentication and RBAC | Authenticate staff, enforce role-based navigation, and protect APIs. |
| Admin operations | Manage users, departments, rooms, public content, news, monitoring, audit logs, and selected operational masters. |
| Scheduling and availability | Manage doctor schedule templates, closures, generated slots, and doctor schedule read models. |
| Queue and intake | Move patients from confirmed appointment to checked-in, called, room-assigned, in-progress, completed, or skipped. |
| Clinical records | Support doctor schedule, patient records, appointment detail, medical record creation, follow-up, vitals, and prescription PDFs. |
| Lab results | Record, list, review, delete, and expose lab results to staff and patient portal users. |
| Patient portal | Let patients claim/login and read appointments, lab results, messages, profile, records, and update profile. |
| Inventory and pharmacy | Manage items, lots, movements, alerts, and prescription PDF access. |
| Finance | Manage invoices, payments, void/cancel behavior, pricing, and revenue reports. |
| Notifications and reminders | Plan and dispatch follow-up reminders and emails as backend side effects. |
| Release-demo UAT data | Seed synthetic, cross-role demo data for UAT and release smoke tests. |

### Main Roles

| Role | Business responsibility | Main modules |
| --- | --- | --- |
| Guest | Browse public site and create appointment request | Public discovery, public booking |
| Patient | Claim/login and read own data | Patient portal |
| Receptionist | Book and manage front-desk patient flow | Staff booking, queue, support |
| Nurse | Check in patients, intake, vitals, lab read support | Queue, nurse intake, vitals, lab results |
| Doctor | Consult, manage clinical records, schedule, prescriptions, lab review | Doctor dashboard, schedule, patients, medical records, lab results |
| Pharmacist | Manage stock and access prescription PDFs | Inventory, prescription preview |
| Accountant | Manage invoices, payments, pricing, revenue, audit logs | Finance, audit logs |
| Admin | Manage system configuration and all admin surfaces | Admin operations, scheduling, monitoring, users, content |

### Role To Module Access

| Module | Guest | Patient | Receptionist | Nurse | Doctor | Pharmacist | Accountant | Admin |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Public discovery | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Public booking | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Staff auth | No | No | Yes | Yes | Yes | Yes | Yes | Yes |
| Admin operations | No | No | No | No | Limited via staff routes | No | Audit logs only | Yes |
| Scheduling admin | No | No | No | No | Read own schedule | No | No | Yes |
| Queue/intake | No | No | Yes | Yes | Limited clinical actions | No | No | Yes |
| Clinical records | No | Own read via portal | No | Read/vitals/lab support | Yes | Prescription read | No | Yes |
| Lab results | No | Own read | No | Read | Read/write | No | No | Yes |
| Patient portal | No | Yes | No | No | No | No | No | No |
| Inventory/pharmacy | No | No | No | No | Prescription read | Yes | No | Yes |
| Finance | No | Read own billing-style views where present | No | No | No | No | Yes | Yes |
| Notifications/reminders | No direct UI | Receives effects | No | No | Creates follow-up trigger | No | No | Operational oversight |
| Release-demo UAT | No | Seeded patient persona | Seeded persona | Seeded persona | Seeded persona | Seeded persona | Seeded persona | Seeded persona |

## 2. Full Module List

Status labels:

- `Working`: source shows route, API, service wiring, and basic state/error handling.
- `Missing API`: UI action exists but no backend contract is visible.
- `Missing UI`: backend contract exists but no active UI action exists.
- `Unclear`: route or button exists but business intent/runtime behavior is not proven by source tests.
- `Potential issue`: implementation exists but has risk, missing confirmation, stale docs, or incomplete handling.

| Module | Related screens | Front-end route | Related APIs | Related DB tables | Roles allowed | Current status |
| --- | --- | --- | --- | --- | --- | --- |
| Public home/content | Home, news, legal/security | `/`, `/news`, `/privacy`, `/terms`, `/security` | `GET /api/v1/content/home`, `GET /api/v1/news` | `hospital_content_sections`, `news_articles` | Guest, all roles | Working; public news detail/archive actions are disabled honestly until a detail/archive contract exists |
| Departments | Department list/detail | `/departments`, `/departments/[id]` | `GET /api/v1/departments`, `GET /api/v1/departments/{id}`, `GET /api/v1/departments/{id}/doctors` | `departments`, `users` | Guest, all roles | Working |
| Doctors | Doctor list and public slot lookup | `/doctors`, `/booking` | `GET /api/v1/doctors`, `GET /api/v1/doctors/{id}`, `GET /api/v1/doctors/{id}/slots` | `users`, `departments`, `time_slots` | Guest, all roles | Working |
| Public booking | Booking form, slot selection, confirmation | `/booking` | `POST /api/v1/appointments` plus doctor/slot APIs | `patients`, `appointments`, `time_slots`, `audit_logs` | Guest, all roles | Working |
| Staff login/logout | Staff login, logout, forbidden, session expired | `/staff/login`, `/auth/logout`, `/forbidden`, `/session-expired` | `POST /api/v1/auth/login`, `/refresh`, `/logout` | `users`, `audit_logs` | Staff roles | Working; automatic refresh replay remains a separate policy gap |
| Patient auth | Portal login and claim | `/portal/login`, `/portal/claim` | `POST /api/v1/patient-auth/claim`, `/login`, `/refresh`, `/logout` | `patients`, `patient_accounts` | Patient | Working |
| Admin dashboard/stats | Admin landing, metrics | `/admin/dashboard` | `GET /api/v1/admin/stats` | `appointments`, `users`, `invoices`, `inventory_items` | Admin | Working; priority drilldowns route to real monitoring/inventory/audit screens and unsupported settings/chart actions are disabled honestly |
| Admin users | Staff directory, user detail | `/admin/users`, `/admin/users/[id]` | `GET/POST /api/v1/admin/users`, `GET/PUT/DELETE /{id}`, `POST /{id}/activate`, `POST /{id}/deactivate`, `PUT /{id}/role` | `users`, `departments`, `audit_logs` | Admin | Working; local CSV export and activate/deactivate confirmation added |
| Admin departments | Department CRUD, doctor assignment | `/admin/departments` | `GET/POST /api/v1/admin/departments`, `GET/PUT/DELETE /{id}`, `POST /{id}/assign-doctor`, `DELETE /{id}/remove-doctor/{doctorId}` | `departments`, `users`, `audit_logs` | Admin | Working for CRUD/export/deactivation confirmation; doctor assignment UI needs review |
| Admin rooms | Room CRUD/status management | `/admin/rooms` | `GET/POST /api/v1/admin/rooms`, `GET/PUT/DELETE /{id}`, `PUT /{id}/status` | `rooms`, `departments`, `audit_logs` | Admin | Working; local CSV export and deactivate confirmation added |
| Admin public content | Content section management | `/admin/public-content` | `GET/POST /api/v1/admin/content/sections`, `PUT /{id}`; also `/api/v1/admin/public-content` exists | `hospital_content_sections`, `audit_logs` | Admin | Working, but two admin content API families should be kept documented distinctly |
| Admin news | News article management | `/admin/news` | `GET/POST /api/v1/admin/news`, `PUT /{articleId}` | `news_articles`, `audit_logs` | Admin | Working |
| Admin monitoring | Health snapshot, observability targets, and alerts | `/admin/monitoring` | `GET /api/v1/admin/monitoring` | Aggregate read over operations tables, DB health, queue count, metrics/tracing/logging config | Admin | Working; release observability gate added in `release-observability-gate-2026-06-06.md`; "View all" drilldowns need review |
| Admin audit logs | Audit history | `/admin/audit-logs` | `GET /api/v1/admin/audit-logs?limit=` | `audit_logs` | Admin, Accountant | Working read-only; fake pagination links removed, export/filter dropdown buttons still need review |
| Schedule templates | Doctor work schedule masters | `/admin/schedule-templates` | `GET/POST /api/v1/admin/schedule-templates`, `PUT /{templateId}` | `doctor_work_schedules`, `users`, `rooms` | Admin | Working |
| Special closures | Closure calendar | `/admin/special-closures`, `/staff/closures` | `GET/POST /api/v1/admin/special-closures`, `PUT /{closureId}` | `special_closures`, `users`, `rooms` | Admin | Working in admin route; status filter wired and unsupported export/row-more actions disabled; staff route needs review |
| Slot management | Slot list/generation/block/delete | `/admin/slots`, `/staff/slots` | `GET /api/v1/admin/slots`, `POST /generate`, `PUT /{slotId}/block`, `DELETE /{slotId}` | `time_slots`, `doctor_work_schedules`, `special_closures` | Admin | Working in admin route; block/delete now require confirmation; staff slot route appears static/execution-only and needs review |
| Staff booking wizard | Receptionist/nurse booking screens | `/staff/booking`, `/staff/booking/symptoms`, `/staff/booking/slots`, `/staff/booking/review`, `/staff/booking/success` | Public appointment APIs should be reused where wired | `patients`, `appointments`, `time_slots` | Admin, Nurse, Receptionist | Potential issue: route files exist, but several step buttons look static |
| Staff queue | Today queue, check-in, call, skip, room, start, complete | `/staff/queue` | `GET /api/v1/queue/today`, `GET /api/v1/appointments/today`, `POST /api/v1/appointments/{id}/checkin`, `POST /api/v1/queue/{id}/call / skip / assign-room / start-consultation / complete` | `appointments`, `audit_logs`, `rooms` | Admin, Nurse, Receptionist | Working; terminal skip/complete actions now require confirmation |
| Nurse intake/vitals | Intake list and vital signs | `/staff/nurse-intake`, `/staff/vital-signs` | `POST/GET/PUT/DELETE /api/v1/vital-signs`, `POST/GET /api/v1/appointments/{id}/vital-signs` | `appointment_vital_signs`, `appointments`, `patients` | Admin, Nurse, Doctor for read/write where permitted | Potential issue: vital signs route has visible buttons that need handler/API verification |
| Doctor dashboard | Doctor appointment workflow | `/staff/doctor/dashboard`, `/staff/doctor/[id]` | `GET /api/v1/appointments`, `PUT /api/v1/appointments/{id}/status`, doctor APIs | `appointments`, `users`, `departments` | Admin, Doctor | Working for dashboard status actions; doctor detail route needs review |
| Doctor schedule | Doctor's own schedule | `/staff/schedule` | `GET /api/v1/me/schedule?date=... or week=...` | `appointments`, `time_slots`, `users` | Doctor | Working |
| Patient records | Staff patient search/detail | `/staff/patients` | `GET /api/v1/patient-records`, `GET /api/v1/patient-records/{patientId}`, `GET /api/v1/patients/{cccd}/history` | `patients`, `appointments`, `medical_records`, `lab_results` | Admin, Doctor | Working |
| Medical record editor | Consultation documentation | `/staff/medical-records/[id]/edit` | `GET /api/v1/appointments/{id}`, `POST /api/v1/medical-records`, `POST /api/v1/medical-records/preview.pdf` | `medical_records`, `prescription_items`, `appointment_follow_ups`, `appointments` | Admin, Doctor | Working; addendum/locked encounter policy is not fully modeled |
| Prescription preview/PDF | Prescription PDF preview and retrieval | `/staff/prescriptions/preview` | `POST /api/v1/medical-records/preview.pdf`, `GET /api/v1/medical-records/{recordId}/prescription.pdf` | `medical_records`, `prescription_items` | Admin, Doctor, Pharmacist | Working for backend PDF; route needs review for full UX |
| Staff lab results | Staff lab list/detail/create/delete | `/staff/lab-results`, `/staff/lab-results/new`, `/staff/lab-results/[id]` | `GET /api/v1/appointments/{id}/lab-results`, `GET /api/v1/lab-results/{id}`, `POST /api/v1/lab-results`, `DELETE /api/v1/lab-results/{id}` | `lab_results`, `appointments`, `patients` | Read: Admin/Doctor/Nurse; Write: Admin/Doctor | Working; create route added 2026-05-31 with backend DTO alignment and route-level write-role guard |
| Patient portal overview | Portal dashboard | `/portal/overview` | `GET /api/v1/patient-portal/overview`, `GET /api/v1/patient-portal/lab-results` | `patients`, `appointments`, `lab_results`, `patient_messages` | Patient | Working |
| Patient portal appointments | Patient appointment reads | `/portal/appointments`, `/portal/appointments/2` | `GET /api/v1/patient-portal/appointments` | `appointments`, `patients`, `users` | Patient | Working for list; detail route `/portal/appointments/2` is reference/static |
| Patient portal lab results | Patient lab reads | `/portal/lab-results`, `/portal/diagnostics` | `GET /api/v1/patient-portal/lab-results` | `lab_results`, `patients` | Patient | Working for lab list; diagnostics route needs review |
| Patient portal messages | Patient message threads | `/portal/messages` | `GET /api/v1/patient-portal/messages` | `patient_message_threads`, `patient_messages` | Patient | Working read-only; patient reply/send is Missing API |
| Patient portal profile | Read/update patient profile | `/portal/profile` | `GET/PUT /api/v1/patient-portal/profile` | `patients`, `patient_accounts` | Patient | Working |
| Patient portal records/support/other | Records, billing, pharmacy, staff, support, admit, inventory, patients, scheduling | `/portal/records`, `/portal/billing`, `/portal/pharmacy`, `/portal/staff`, `/portal/support`, `/portal/admit`, `/portal/inventory`, `/portal/patients`, `/portal/scheduling` | Mixed or no direct service functions visible | Mostly read models from `patients`, `appointments`, `invoices`, `lab_results` | Patient | Unclear; many are route-file screens with static/reference content |
| Staff inventory | Inventory operations workspace | `/staff/inventory` | `GET/POST/PUT/DELETE /api/v1/inventory/items`, `GET/POST /lots`, `GET/POST /movements`, `POST /dispense`, `GET /alerts` | `inventory_items`, `inventory_lots`, `inventory_movements`, `audit_logs` | Admin, Pharmacist | Working; delete item now requires browser confirmation |
| Admin inventory | Admin inventory variant | `/admin/inventory` | Same inventory APIs where wired | `inventory_items`, `inventory_lots`, `inventory_movements` | Admin | Working for item create/edit; some view/export buttons need review |
| Invoices | Invoice creation/payment/void | `/staff/invoices` | `GET/POST /api/v1/invoices`, `POST /{invoiceId}/payments`, `POST /{invoiceId}/void` | `invoices`, `appointments`, `patients`, `audit_logs` | Admin, Accountant | Working; void action now requires explicit confirmation |
| Pricing | Service pricing management | `/staff/pricing`, `/admin/pricing` | `GET/POST /api/v1/pricing`, `PUT /api/v1/pricing/{pricingId}` | `service_pricing`, `departments`, `audit_logs` | Admin, Accountant | Working for create/update and local export; admin delete is disabled honestly because no delete pricing API exists |
| Revenue | Revenue reports | `/staff/revenue` | `GET /api/v1/reports/revenue/daily`, `GET /api/v1/reports/revenue/monthly` | `invoices`, `service_pricing`, `appointments` | Admin, Accountant | Working |
| Chatbot/internal assistant | Booking guidance or internal assistant remnants | Public chatbot API only | `POST /api/v1/chatbot/messages`; knowledge tables exist | `knowledge_documents`, `knowledge_chunks`, `internal_assistant_*` | Public chatbot; internal assistant no current UI | Missing UI/Unclear; `V11` removed AI assistant features, but safe-rollout tables remain |
| Support pages | Staff/admin/portal support | `/staff/support`, `/admin/support`, `/portal/support` | No dedicated support-ticket API visible | None or future support tables absent | Staff/Admin/Patient by route | Read-only/unsupported states; staff/admin create/export/drilldown actions are disabled until a support-ticket API exists |
| Release-demo seed | Synthetic UAT data | No user route; affects all screens | Seed service in backend startup | All major tables | Demo operator/developer | Working when enabled by environment |

## 3. Main Business Flows

### BF-01 Public Discovery And Appointment Booking

**Business objective:** Allow a guest or staff-assisted user to choose a doctor and available slot, submit patient identity and symptoms, and receive an appointment confirmation.
**Primary actor:** Guest.
**Secondary actors:** Doctor, receptionist, email service.
**Start condition:** Public user opens `/booking`; doctors and slots are available.
**End condition:** Appointment exists in `CONFIRMED` status and selected slot is booked.
**Screens involved:** `/`, `/departments`, `/departments/[id]`, `/doctors`, `/booking`.
**APIs called:** `GET /api/v1/departments`, `GET /api/v1/doctors`, `GET /api/v1/doctors/{doctorId}/slots`, `POST /api/v1/appointments`.
**Data created/updated:** `patients`, `appointments`, `time_slots`, `audit_logs`; possible email dispatch.
**Status changes:** `time_slots.AVAILABLE -> BOOKED`; appointment created as `CONFIRMED`.

**End-to-end steps:**
1. Guest opens public pages and reviews departments/doctors.
2. Guest opens `/booking`, chooses doctor and appointment date.
3. UI loads available doctor slots.
4. Guest selects a slot and enters patient identity, address, and symptoms.
5. UI submits `AppointmentCreateRequest`.
6. Backend validates slot ownership, patient identity, duration, and slot availability.
7. Backend creates or updates patient, books slot, creates appointment, and returns confirmation.
8. UI shows confirmation code and appointment date.

**Expected result:** Patient receives a confirmed appointment and booked slot is no longer available for duplicate booking.

**Exception cases:**
- Missing patient full name, CCCD, phone, date of birth, gender, address, doctor, or slot.
- Selected slot belongs to another doctor.
- Slot is already `BOOKED` or `BLOCKED`.
- Duplicate concurrent booking request.
- Backend returns `400`, `409`, or `500`.
- Network disconnect after submit.

**Suggested test cases:**
- `P0-BF01-01`: book valid appointment from `/booking`.
- `P0-BF01-02`: reject missing required patient fields.
- `P0-BF01-03`: reject duplicate booking of same slot.
- `P1-BF01-04`: verify department detail doctor links route to booking.
- `P2-BF01-05`: verify no-slot empty state.

**Priority:** High.

### BF-02 Staff Login, Session, And RBAC

**Business objective:** Ensure staff users authenticate, receive role-aware access, and are blocked from unauthorized screens and APIs.
**Primary actor:** Staff user.
**Secondary actors:** Admin, backend security filters.
**Start condition:** Staff account exists and is active.
**End condition:** Staff can access allowed modules and cannot access forbidden modules.
**Screens involved:** `/staff/login`, `/auth/logout`, `/forbidden`, role-protected `/staff/*` and `/admin/*`.
**APIs called:** `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`, all protected APIs through JWT filters.
**Data created/updated:** `audit_logs` for denial/security events; tokens in browser session storage for staff access token.
**Status changes:** None to business entities; user session state changes from unauthenticated to authenticated.

**End-to-end steps:**
1. Staff opens `/staff/login`.
2. Staff submits email and password.
3. Backend validates active user and password.
4. Backend returns access token and refresh cookie.
5. UI stores access token and role in session storage.
6. Route guard allows role-matched screens and redirects unauthorized routes to `/forbidden`.
7. Protected API calls include bearer token.
8. Logout clears session and calls backend logout.

**Expected result:** Role access matches `web/src/lib/rbac.ts` and backend `RbacAuthorizationService`.

**Exception cases:**
- Missing/invalid credentials.
- Inactive user.
- Expired/malformed token.
- Missing token on protected API.
- Role tries forbidden module.
- Refresh cookie exists but frontend does not automatically replay failed request after `401`.

**Suggested test cases:**
- `P0-BF02-01`: staff login succeeds for seeded admin.
- `P0-BF02-02`: nurse blocked from `/admin/users`.
- `P0-BF02-03`: accountant can access `/admin/audit-logs` but not `/admin/users`.
- `P0-BF02-04`: missing token returns standard unauthorized envelope.
- `P1-BF02-05`: logout clears session and redirects.

**Priority:** High.

### BF-03 Admin Operations

**Business objective:** Let admin manage users, departments, rooms, content, news, monitoring, and audit history.
**Primary actor:** Admin.
**Secondary actors:** Accountant for audit logs.
**Start condition:** Admin is authenticated.
**End condition:** Master data changes are persisted and visible in lists; audit/monitoring data is readable.
**Screens involved:** `/admin/dashboard`, `/admin/users`, `/admin/users/[id]`, `/admin/departments`, `/admin/rooms`, `/admin/news`, `/admin/public-content`, `/admin/monitoring`, `/admin/audit-logs`.
**APIs called:** `/api/v1/admin/users`, `/departments`, `/rooms`, `/news`, `/content/sections`, `/public-content`, `/monitoring`, `/audit-logs`, `/stats`.
**Data created/updated:** `users`, `departments`, `rooms`, `news_articles`, `hospital_content_sections`, `audit_logs`.
**Status changes:** User `active` toggles; room status changes among `READY`, `IN_USE`, `BREAK`, `MAINTENANCE`; content/news active/published state changes.

**End-to-end steps:**
1. Admin logs in and opens admin dashboard.
2. Admin opens target admin module.
3. UI loads list data from admin API.
4. Admin creates or edits entity through modal/form.
5. Backend validates role, request body, uniqueness, and references.
6. UI shows success message and reloads list.
7. Admin can deactivate/toggle entity where supported.
8. Audit log/monitoring pages show operational history and status.

**Expected result:** Admin CRUD actions persist with role protection and user-friendly success/error states.

**Exception cases:**
- Duplicate user email or department name.
- Invalid role, invalid email, short password, negative experience years.
- Room status update on nonexistent room.
- Unauthorized non-admin access.
- Export/filter/dashboard buttons that have no handler.

**Suggested test cases:**
- `P0-BF03-01`: admin creates and edits staff user.
- `P0-BF03-02`: admin activates/deactivates user.
- `P1-BF03-03`: admin creates department and room.
- `P1-BF03-04`: admin updates public content/news.
- `P1-BF03-05`: accountant reads audit logs but cannot open user admin.

**Priority:** High.

### BF-04 Scheduling And Availability

**Business objective:** Let admin define doctor templates, closures, and generated slots; let doctors view their own schedules.
**Primary actor:** Admin.
**Secondary actors:** Doctor, guest booking user.
**Start condition:** Doctor exists and admin has schedule permission.
**End condition:** Slots are generated, blocked/deleted where required, and public booking/doctor schedule reflect availability.
**Screens involved:** `/admin/schedule-templates`, `/admin/special-closures`, `/admin/slots`, `/staff/schedule`.
**APIs called:** `GET/POST/PUT /api/v1/admin/schedule-templates`, `GET/POST/PUT /api/v1/admin/special-closures`, `GET /api/v1/admin/slots`, `POST /api/v1/admin/slots/generate`, `PUT /api/v1/admin/slots/{slotId}/block`, `DELETE /api/v1/admin/slots/{slotId}`, `GET /api/v1/me/schedule`.
**Data created/updated:** `doctor_work_schedules`, `special_closures`, `time_slots`, `appointments`.
**Status changes:** Slot `AVAILABLE -> BLOCKED`; `AVAILABLE -> BOOKED` through booking; slot removed through delete.

**End-to-end steps:**
1. Admin creates or updates doctor schedule template.
2. Admin adds closure for a doctor or room when needed.
3. Admin generates slots for a date range.
4. Admin blocks or deletes individual slots.
5. Guest booking reads available slots.
6. Doctor opens `/staff/schedule` and reads own day/week appointments.

**Expected result:** Scheduling data is consistent across admin slots, public booking, and doctor schedule.

**Exception cases:**
- Missing doctor/date range/template fields.
- Generate slots for invalid date range.
- Duplicate overlapping slot generation.
- Blocking booked slot.
- Doctor tries to read another doctor's schedule by parameter manipulation.
- Staff `/staff/slots` route exists but needs review against admin slot API.

**Suggested test cases:**
- `P0-BF04-01`: admin creates template and generates slots.
- `P0-BF04-02`: blocked slot is not bookable.
- `P1-BF04-03`: doctor schedule loads by date and week.
- `P1-BF04-04`: invalid range returns validation error.

**Priority:** High.

### BF-05 Queue, Check-In, Intake, And Vitals

**Business objective:** Move confirmed appointments through operational queue and collect intake/vital information.
**Primary actor:** Nurse or receptionist.
**Secondary actors:** Doctor, admin.
**Start condition:** Appointment exists for today in `CONFIRMED` status.
**End condition:** Appointment is checked in, optionally called/room-assigned/skipped, then started and completed.
**Screens involved:** `/staff/queue`, `/staff/nurse-intake`, `/staff/vital-signs`.
**APIs called:** `GET /api/v1/queue/today`, `GET /api/v1/appointments/today`, `POST /api/v1/appointments/{id}/checkin`, `POST /api/v1/queue/{id}/call`, `/skip`, `/assign-room`, `/start-consultation`, `/complete`, vital-sign endpoints.
**Data created/updated:** `appointments`, `appointment_vital_signs`, `audit_logs`.
**Status changes:** Appointment `CONFIRMED -> CHECKED_IN -> IN_PROGRESS -> DONE`; skip leaves operational audit state without completing visit.

**End-to-end steps:**
1. Nurse/receptionist opens queue.
2. UI loads queue and today's appointments.
3. Staff checks in confirmed patient.
4. Staff calls patient.
5. Staff assigns room.
6. Staff starts consultation.
7. Staff records vitals/intake where applicable.
8. Staff completes or skips patient according to workflow.

**Expected result:** Queue state updates in UI, invalid transitions are rejected, and audit logs are written for queue actions.

**Exception cases:**
- Check-in on already completed/cancelled appointment.
- Assign room without room name.
- Start consultation before check-in.
- Complete visit before start.
- Network failure mid-action.
- Row-level action error not shown.

**Suggested test cases:**
- `P0-BF05-01`: full queue lifecycle to completion.
- `P0-BF05-02`: reject invalid state transition.
- `P1-BF05-03`: assign room writes audit log.
- `P1-BF05-04`: vital signs required numeric fields and bounds.

**Priority:** High.

### BF-06 Doctor Consultation, Medical Record, And Prescription

**Business objective:** Let doctors consult checked-in patients, record diagnosis/notes/vitals/follow-up/prescriptions, complete appointment, and generate prescription PDFs.
**Primary actor:** Doctor.
**Secondary actors:** Nurse, patient, email/reminder services.
**Start condition:** Appointment exists in `CHECKED_IN`, `IN_PROGRESS`, or allowed clinical state.
**End condition:** Medical record exists, appointment is `DONE`, prescription PDF is available, follow-up reminder may be planned.
**Screens involved:** `/staff/doctor/dashboard`, `/staff/patients`, `/staff/medical-records/[id]/edit`, `/staff/prescriptions/preview`.
**APIs called:** `GET /api/v1/appointments`, `GET /api/v1/appointments/{id}`, `PUT /api/v1/appointments/{id}/status`, `POST /api/v1/medical-records`, `POST /api/v1/medical-records/preview.pdf`, `GET /api/v1/medical-records/{recordId}/prescription.pdf`, `GET /api/v1/patient-records`.
**Data created/updated:** `medical_records`, `prescription_items`, `appointments`, `appointment_follow_ups`, `audit_logs`.
**Status changes:** Appointment may move `CHECKED_IN -> IN_PROGRESS -> DONE`; follow-up/reminder state created if follow-up date exists.

**End-to-end steps:**
1. Doctor opens dashboard or schedule.
2. Doctor starts consultation for own appointment.
3. Doctor opens medical record editor.
4. UI loads appointment detail and patient context.
5. Doctor enters diagnosis, notes, vitals, follow-up date, and prescriptions.
6. UI submits medical record.
7. Backend rejects duplicates, persists record/items, completes appointment, plans reminders, and prepares prescription PDF.
8. Doctor previews/downloads prescription.

**Expected result:** Clinical record is saved once, appointment leaves active queue, and prescription PDF contains correct patient/doctor/drug details.

**Exception cases:**
- Doctor attempts another doctor's appointment.
- Missing diagnosis or required fields.
- Duplicate medical record for appointment.
- Invalid numeric vitals.
- Prescription PDF generation error.
- Clinical safety issue: no drug interaction/allergy checker is visible in current code.
- Signed/locked encounter addendum policy is not fully modeled.

**Suggested test cases:**
- `P0-BF06-01`: create medical record for checked-in appointment.
- `P0-BF06-02`: duplicate record returns conflict.
- `P0-BF06-03`: doctor ownership is enforced.
- `P1-BF06-04`: prescription PDF preview/download.
- `P1-BF06-05`: follow-up date creates reminder side effect.

**Priority:** High.

### BF-07 Lab Results

**Business objective:** Staff records and reviews lab results; patients can read released lab results in the portal.
**Primary actor:** Doctor or admin for write; nurse/doctor/admin for read.
**Secondary actors:** Patient.
**Start condition:** Appointment exists.
**End condition:** Lab result is created/read/deleted where permitted and appears in patient portal read model.
**Screens involved:** `/staff/lab-results`, `/staff/lab-results/new`, `/staff/lab-results/[id]`, `/portal/lab-results`, `/portal/diagnostics`.
**APIs called:** `POST /api/v1/lab-results`, `GET /api/v1/lab-results/{id}`, `GET /api/v1/appointments/{id}/lab-results`, `DELETE /api/v1/lab-results/{id}`, `GET /api/v1/patient-portal/lab-results`.
**Data created/updated:** `lab_results`, `appointments`, `patients`.
**Status changes:** Lab result status is stored as text in `lab_results.status`; UI classifies critical/pending/verified-like statuses.

**End-to-end steps:**
1. Staff opens lab results dashboard.
2. UI lists appointments and loads each appointment's lab results.
3. Staff opens result detail.
4. Doctor/admin can delete result after confirmation.
5. Patient logs into portal.
6. Patient reads own lab results.

**Expected result:** Staff and patient lab views are scoped and role-protected; critical statuses are visibly highlighted.

**Exception cases:**
- Result belongs to another patient.
- Missing appointment, test name, or result value.
- `/staff/lab-results/new` requires a real appointment and posts the backend `LabResultCreateRequest` DTO.
- Delete confirmation uses browser `confirm`; verify UX and audit policy.
- Attachment URL fails or leaks unsafe URL.

**Suggested test cases:**
- `P0-BF07-01`: staff list loads lab results by appointment.
- `P1-BF07-02`: staff detail loads result by ID.
- `P1-BF07-03`: delete result confirms and calls API.
- `P1-BF07-04`: patient A cannot read patient B lab result.
- `P1-BF07-05`: create lab result from `/staff/lab-results/new` and navigate to the created detail route.

**Priority:** High.

### BF-08 Patient Portal

**Business objective:** Let patients claim/login and read their own appointments, lab results, messages, profile, and records.
**Primary actor:** Patient.
**Secondary actors:** Doctor, receptionist, admin.
**Start condition:** Patient account exists or claim identity can be verified.
**End condition:** Patient sees only own portal data and can update profile.
**Screens involved:** `/portal/login`, `/portal/claim`, `/portal/overview`, `/portal/appointments`, `/portal/lab-results`, `/portal/messages`, `/portal/profile`, `/portal/records`, related portal routes.
**APIs called:** `/api/v1/patient-auth/*`, `GET /api/v1/patient-portal/overview`, `/appointments`, `/lab-results`, `/messages`, `/profile`, `PUT /api/v1/patient-portal/profile`.
**Data created/updated:** `patient_accounts`, `patients`, read views from `appointments`, `lab_results`, `patient_message_threads`, `patient_messages`.
**Status changes:** Patient auth session changes; profile fields update.

**End-to-end steps:**
1. Patient claims account or logs in.
2. UI stores patient token and role.
3. Patient opens overview.
4. Patient reads appointments, lab results, messages, records, and profile.
5. Patient edits profile fields and saves.
6. Backend scopes all portal data to authenticated patient.

**Expected result:** Patient sees only own records; patient write operations are limited to profile update.

**Exception cases:**
- Claim identity mismatch.
- Staff token used on patient portal endpoint.
- Patient token used on staff endpoint.
- Patient tries to cancel/reschedule appointment; no patient write API exists.
- Patient tries to send/reply to message; no patient write API exists.
- Static portal routes imply modules not backed by portal APIs.

**Suggested test cases:**
- `P0-BF08-01`: patient login and overview read.
- `P0-BF08-02`: cross-patient data isolation.
- `P1-BF08-03`: claim account happy path.
- `P1-BF08-04`: profile update.
- `P2-BF08-05`: disabled cancel/reschedule and message reply behavior.

**Priority:** High.

### BF-09 Inventory And Pharmacy

**Business objective:** Manage inventory items, lots, movements, low-stock/expiry alerts, prescription access, and medication dispensing for pharmacy operations.
**Primary actor:** Pharmacist.
**Secondary actors:** Admin, doctor.
**Start condition:** Staff user has inventory permission.
**End condition:** Inventory state is created/updated/deleted, dispense actions reduce the selected item/lot, and alerts/movements reflect stock state.
**Screens involved:** `/staff/inventory`, `/admin/inventory`, `/staff/prescriptions/preview`.
**APIs called:** `GET/POST/PUT/DELETE /api/v1/inventory/items`, `GET/POST /api/v1/inventory/lots`, `GET/POST /api/v1/inventory/movements`, `POST /api/v1/inventory/dispense`, `GET /api/v1/inventory/alerts`, prescription PDF APIs.
**Data created/updated:** `inventory_items`, `inventory_lots`, `inventory_movements`, `medical_records`, `prescription_items`, `audit_logs`.
**Status changes:** Inventory item status such as `IN_STOCK`/`LOW_STOCK`; lot quantity remaining changes; movement quantity delta mutates item stock; dispense records link item, lot, patient, and medical record.

**End-to-end steps:**
1. Pharmacist opens inventory workspace.
2. UI loads items, lots, movements, and alerts.
3. Pharmacist creates or edits item.
4. Pharmacist creates lot for real item.
5. Pharmacist records stock movement.
6. Pharmacist selects a prescription-backed medical record, lot, and quantity, then dispenses medication.
7. UI reloads inventory and shows success.
8. Pharmacist opens prescription preview/PDF where permitted.

**Expected result:** Item, lot, movement, dispense, and alert state remains consistent; negative stock constraints and prescription/lot mismatch rules are enforced by backend/database.

**Exception cases:**
- Missing SKU/item/category/unit.
- Lot without existing item.
- Movement without existing item or movement type.
- Negative quantity violating DB constraints.
- Dispense from a lot belonging to another item.
- Dispense medication not present on the selected prescription.
- Dispense quantity exceeding lot or item stock.
- Delete item requires explicit browser confirmation.
- Role without inventory permission.

**Suggested test cases:**
- `P0-BF09-01`: create item, lot, and movement.
- `P0-BF09-02`: stock-out movement updates quantity and movement history.
- `P0-BF09-03`: dispense medication against a matching prescription item and stocked lot.
- `P0-BF09-04`: reject dispense when prescription item, lot ownership, or stock quantity is invalid.
- `P1-BF09-05`: low stock alert renders.
- `P1-BF09-06`: delete item conflict if lots/movements exist.
- `P1-BF09-07`: pharmacist can access prescription PDF, receptionist cannot.

**Priority:** High.

### BF-10 Finance

**Business objective:** Create invoices for completed appointments, record payment, void/cancel unpaid invoices, manage pricing, and report revenue.
**Primary actor:** Accountant.
**Secondary actors:** Admin, patient.
**Start condition:** Appointment exists and business rule permits invoicing.
**End condition:** Invoice/payment state is persisted and revenue reports reflect paid invoices.
**Screens involved:** `/staff/invoices`, `/staff/pricing`, `/staff/revenue`, `/admin/pricing`, `/portal/billing`.
**APIs called:** `GET/POST /api/v1/invoices`, `POST /api/v1/invoices/{invoiceId}/payments`, `POST /api/v1/invoices/{invoiceId}/void`, `GET/POST/PUT /api/v1/pricing`, `GET /api/v1/reports/revenue/daily`, `GET /monthly`.
**Data created/updated:** `invoices`, `service_pricing`, `appointments`, `patients`, `audit_logs`.
**Status changes:** Invoice `UNPAID -> PAID`; `UNPAID -> CANCELLED`; old migration aligned `PENDING/VOID` to `UNPAID/CANCELLED`.

**End-to-end steps:**
1. Accountant opens invoice ledger.
2. UI lists invoices with optional status filter.
3. Accountant creates invoice from appointment ID.
4. Accountant records payment method for unpaid invoice.
5. Accountant voids unpaid invoice when appropriate.
6. Accountant manages service pricing.
7. Accountant reads daily/monthly revenue reports.

**Expected result:** Only valid invoice transitions occur; paid invoices are reflected in revenue.

**Exception cases:**
- Invoice for nonexistent appointment.
- Duplicate invoice.
- Invoice for appointment not completed if backend enforces completion.
- Payment method missing.
- Pay already paid invoice.
- Void paid invoice.
- Void action lacks confirmation dialog.
- Pricing delete button in admin route has no backend API.

**Suggested test cases:**
- `P0-BF10-01`: create invoice and record payment.
- `P0-BF10-02`: duplicate invoice conflict.
- `P1-BF10-03`: void unpaid invoice.
- `P1-BF10-04`: paid invoice appears in daily/monthly revenue.
- `P1-BF10-05`: pricing create/update.

**Priority:** High.

### BF-11 Notification And Reminder Side Effects

**Business objective:** Plan follow-up reminders and send patient-facing emails without corrupting clinical transactions if delivery fails.
**Primary actor:** System scheduler.
**Secondary actors:** Doctor, patient.
**Start condition:** Medical record with follow-up date exists or due reminders exist.
**End condition:** Reminder status/delivery attempt is recorded; patient notification is attempted or safely recorded by the local provider.
**Screens involved:** No active reminder management UI.
**APIs called:** No current public reminder API; service invoked through medical record/follow-up workflows.
**Data created/updated:** `appointment_follow_ups`, `email_delivery_attempts`, email side effects.
**Status changes:** Follow-up/reminder planned; successful local-record or external-provider attempt marks the reminder sent; failed external delivery leaves it pending for retry.

**End-to-end steps:**
1. Doctor creates record with follow-up date.
2. Backend records follow-up and plans reminder.
3. Scheduler finds due reminder.
4. Email service attempts delivery through Gmail when configured or the safe `LOCAL_RECORD` provider when not configured.
5. Delivery attempt is recorded.
6. Failure is logged without rolling back clinical record and leaves the reminder pending for retry.

**Expected result:** Clinical data remains correct and reminder side effects are auditable.

**Exception cases:**
- Email provider unavailable.
- Retry sends duplicate notification.
- Reminder contains sensitive data in error response.
- No UI exists for operational reminder visibility.

**Suggested test cases:**
- `P1-BF11-01`: medical record follow-up plans reminder.
- `P1-BF11-02`: local-record provider records safe delivery attempt.
- `P1-BF11-03`: email failure does not fail record creation.
- `P2-BF11-04`: scheduler retry behavior.

**Priority:** Medium.

### BF-12 Release-Demo UAT Readiness

**Business objective:** Seed coherent synthetic data for cross-role demo and user acceptance testing.
**Primary actor:** UAT reviewer or demo operator.
**Secondary actors:** All seeded personas.
**Start condition:** Release-demo seed is enabled in environment.
**End condition:** All key screens show realistic synthetic data for seeded personas.
**Screens involved:** Public, staff, admin, patient portal, inventory, queue, invoice, and clinical screens.
**APIs called:** Startup seed services; normal UI APIs after seeding.
**Data created/updated:** Departments, users, rooms, pricing, inventory, patients, appointments, invoices, portal data, records.
**Status changes:** Seeded business objects cover confirmed/checked-in/done/cancelled appointment and invoice states.

**End-to-end steps:**
1. Enable seed environment.
2. Start backend and database.
3. Seed service creates or updates synthetic UAT data.
4. Demo operator logs in as each role.
5. Operator verifies one role-specific object on each critical screen.

**Expected result:** Demo data is synthetic, repeatable enough for local UAT, and visible across frontend/backend.

**Exception cases:**
- Seed disabled.
- Duplicate seed corrupts data.
- Seeded persona credentials drift from docs.
- Docker/Testcontainers unavailable.

**Suggested test cases:**
- `P0-BF12-01`: seed service idempotency.
- `P0-BF12-02`: login smoke for every persona.
- `P1-BF12-03`: seeded queue/inventory/invoice/portal objects visible.

**Priority:** High for demo/release validation.

## 4. Secondary Business Flows

| Secondary flow | Module | What to test | Current status |
| --- | --- | --- | --- |
| Search | Departments, doctors, staff users, invoices, lab results, schedule, support | Search input filters expected rows, handles empty state, has accessible label | Working on many pages; static pages need review |
| Filter data | Users, invoices, lab results, schedule, audit logs, appointments | Role/status/date filters call API where applicable or filter local data accurately | Working/Need review depending page |
| Sort data | Admin users, pricing, inventory tables | Header clicks actually sort and do not only show icon | Need review on several static table headers |
| View details | Department detail, doctor detail, user detail, lab detail, portal appointment detail | Link routes exist and load real API detail | Mixed; `/portal/appointments/2` is reference/static |
| Create | Booking, users, departments, rooms, news, content, schedule templates, closures, slots, inventory, invoice, pricing | Required fields, validation, POST endpoint, success message | Working for many admin/ops pages |
| Update | Users, departments, rooms, content, news, schedule templates, closures, inventory item, pricing, portal profile | PUT endpoint, optimistic/reload behavior, validation | Working for wired pages |
| Delete/deactivate | Users, departments, rooms, slots, inventory item, lab result | Confirmation for dangerous actions, backend constraint handling, success/error state | Potential issue: some destructive actions lack confirmation |
| Import/export | Admin users, audit logs, lab results, appointments, inventory | Button behavior, generated file, failure handling | Mostly Need review/Missing handler |
| Print documents | Prescriptions, portal records, lab attachments, appointment details | PDF/open/download behavior and role access | Working for backend prescription PDF; many UI print buttons need review |
| Send notifications | Follow-up reminder/email | Service side effect, retry, no data leak | Backend-only |
| Change password | Staff/patient auth | Dedicated UI/API not visible | Missing UI/API |
| Forgot password | Staff/patient auth | Dedicated UI/API not visible | Missing UI/API |
| Role and permission management | Admin users and RBAC | Create/update role, backend permission matrix, route guard matrix | Working |
| Pagination | Users, lab results, schedule, invoices, support, inventory/admin tables | Buttons update page, disabled states, no layout shift | Working in many local-state pages |
| Retry/reload | Public doctors/departments, schedule, inventory, invoices, queue | Loading, error, retry reload behavior | Working where wired |
| Audit review | Admin audit logs | Limit, filters, actor/action/entity rendering | Working read-only; filters need review |

## 5. Negative And Exception Flows

| Error scenario | Modules affected | Required test behavior |
| --- | --- | --- |
| Missing required fields | Booking, users, inventory, invoices, pricing, medical records, lab results | UI blocks submit or backend returns `400`; message is visible near form or as alert. |
| Duplicate data | User email, department name, room name, invoice per appointment, medical record per appointment, slot generation | Backend returns conflict; UI shows conflict without duplicate row. |
| Unauthorized access | All protected modules | Missing token returns `401`; wrong role returns `403`; UI redirects or shows forbidden state. |
| Expired token | Staff and patient sessions | Request fails closed and routes to login/session-expired; automatic refresh replay is not currently generic. |
| API `400` | All write flows | Validation details shown without data mutation. |
| API `401` | Protected APIs | Session-expired/login handling and no protected data rendered. |
| API `403` | RBAC-protected APIs | Forbidden state and no sensitive data leak. |
| API `404` | Detail pages | Detail not found state, no crash. |
| API `409` | Booking, invoice, record, slot, inventory constraints | Business conflict message visible. |
| API `500` | All modules | Generic safe error, no stack traces or secrets in UI. |
| Network disconnection | All API-backed screens | Loading ends, retry available where critical. |
| Button click does not respond | Static dashboard/support/export/read/print buttons | Mark `Missing handler` or `Need review`; add handler or remove action. |
| Button exists but no API | Export CSV, public news read, portal reply/send, patient cancel/reschedule, admin pricing delete | Mark `Missing API` or `Missing handler`; do not fake success. |
| API exists but UI missing | Patient cancel/update if future self-service wanted, reminder management, some admin assignment APIs | Mark `Missing UI`; decide product scope. |
| Invalid data status | Appointment, slot, invoice, room, inventory item, lab result | Backend rejects invalid transition/status; UI disables invalid action where possible. |
| Wrong business order | Queue start before check-in, complete before start, invoice before completed appointment, record before consultation | Backend rejects and UI shows business-rule error. |
| Dangerous action without confirmation | Invoice void, user deactivate, room/dept deactivate, slot delete/block | Confirmation required for destructive actions; inventory delete and lab delete have confirmation, remaining actions need review. |
| Data isolation failure | Patient portal, doctor schedule, doctor appointment detail | User must not read another patient's or doctor's data. |
| Accessibility selector failure | Dialogs/search/selects/buttons | Fields have labels and buttons have unique names; prior critical pattern says duplicate labels and hidden dialogs need careful tests. |

## 6. Test Matrix

| Flow ID | Module | Flow name | Actor | Pre-condition | Test steps | Expected result | API involved | Database involved | UI screen involved | Priority | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BF-01-T01 | Booking | Public appointment booking | Guest | Doctor has available slot | Open `/booking`, choose doctor/date/slot, submit valid patient form | Confirmation code shown, appointment `CONFIRMED` | `GET /doctors`, `GET /doctors/{id}/slots`, `POST /appointments` | `patients`, `appointments`, `time_slots` | `/booking` | P0 | Ready | Existing public booking tests exist |
| BF-01-T02 | Booking | Duplicate slot prevention | Guest | Slot already booked by first request | Submit second booking for same slot | Conflict/error; no duplicate appointment | `POST /appointments` | `appointments`, `time_slots` | `/booking` | P0 | Needed | Best as backend integration/concurrency test |
| BF-02-T01 | Auth/RBAC | Staff login | Admin | Active admin user exists | Submit valid staff credentials | Token/role stored, admin dashboard available | `POST /auth/login` | `users` | `/staff/login` | P0 | Ready | Existing auth integration and page tests |
| BF-02-T02 | Auth/RBAC | Forbidden route | Nurse | Nurse is logged in | Navigate `/admin/users` | Redirect/forbidden and API denies | Protected admin APIs | `audit_logs` | `/forbidden` | P0 | Ready | Route matrix test exists |
| BF-03-T01 | Admin users | Create staff user | Admin | Admin logged in | Open Add User, submit valid form | User row appears and success shown | `POST /admin/users` | `users`, `audit_logs` | `/admin/users` | P0 | Ready | Component tests cover create/update |
| BF-03-T02 | Admin users | Activate/deactivate user | Admin | User exists | Click status action | Status toggles, success shown | `POST /admin/users/{id}/activate or deactivate` | `users`, `audit_logs` | `/admin/users` | P1 | Ready | Needs dangerous-action confirmation review |
| BF-03-T03 | Admin content | Publish content/news | Admin | Admin logged in | Create/edit content/news | Public pages reflect content | `/admin/content/sections`, `/admin/news`, public content APIs | `hospital_content_sections`, `news_articles` | `/admin/public-content`, `/admin/news`, public pages | P1 | Ready | Cross-screen verification useful |
| BF-04-T01 | Scheduling | Generate slots | Admin | Doctor/template exists | Generate date range | Slots created/skipped summary shown | `POST /admin/slots/generate` | `time_slots`, `doctor_work_schedules` | `/admin/slots` | P0 | Ready | Component tests exist |
| BF-04-T02 | Scheduling | Block slot | Admin | Available slot exists | Block slot | Slot becomes `BLOCKED`, not bookable | `PUT /admin/slots/{id}/block`, `GET /doctors/{id}/slots` | `time_slots` | `/admin/slots`, `/booking` | P0 | Needed | Cross-module E2E candidate |
| BF-04-T03 | Schedule read | Doctor own schedule | Doctor | Doctor has appointments | Open day/week schedule | Appointments load, statuses visible | `GET /me/schedule` | `appointments`, `time_slots` | `/staff/schedule` | P1 | Ready | Current page imports `getMySchedule` |
| BF-05-T01 | Queue | Check-in patient | Nurse/Receptionist | Appointment `CONFIRMED` | Click check-in | Status becomes `CHECKED_IN` | `POST /appointments/{id}/checkin` | `appointments`, `audit_logs` | `/staff/queue` | P0 | Ready | Existing queue tests |
| BF-05-T02 | Queue | Full queue lifecycle | Nurse/Receptionist | Checked-in patient | Call, assign room, start, complete | Status becomes `DONE`, audit written | Queue action APIs | `appointments`, `audit_logs` | `/staff/queue` | P0 | Ready | Add audit assertions if absent |
| BF-05-T03 | Vitals | Record vital signs | Nurse/Doctor | Appointment exists | Submit vitals | Vitals saved and readable | `/vital-signs`, `/appointments/{id}/vital-signs` | `appointment_vital_signs` | `/staff/vital-signs` | P1 | Need review | Page button wiring requires deeper check |
| BF-06-T01 | Clinical record | Save medical record | Doctor | Appointment checked in | Open editor, submit diagnosis/prescription | Record saved, appointment done | `GET /appointments/{id}`, `POST /medical-records` | `medical_records`, `prescription_items`, `appointments` | `/staff/medical-records/[id]/edit` | P0 | Ready | Existing medical-record tests |
| BF-06-T02 | Prescription | Preview/download PDF | Doctor/Pharmacist | Record/prescription exists | Generate preview or open PDF | PDF response returned | `POST /medical-records/preview.pdf`, `GET /medical-records/{id}/prescription.pdf` | `medical_records`, `prescription_items` | `/staff/prescriptions/preview` | P1 | Need review | Backend tests exist; UI path should be verified |
| BF-07-T01 | Lab results | Staff lab list | Doctor/Nurse/Admin | Appointments have lab results | Open list | Results load by appointment | `GET /appointments/{id}/lab-results` | `lab_results`, `appointments` | `/staff/lab-results` | P1 | Ready | Current page wired |
| BF-07-T02 | Lab results | Staff lab detail/delete | Doctor/Admin | Result exists | Open result, confirm delete | Delete API called, route returns list | `GET/DELETE /lab-results/{id}` | `lab_results` | `/staff/lab-results/[id]` | P1 | Ready | Delete has confirmation |
| BF-07-T03 | Lab results | Record new result route | Doctor/Admin | Appointment exists | Click Record New Result | Route exists, validates required fields, posts `LabResultCreateRequest`, and opens created detail | `POST /lab-results` | `lab_results` | `/staff/lab-results/new` | P1 | Ready | Added 2026-05-31; frontend unit, UI Playwright, route contract, and backend integration coverage exist |
| BF-08-T01 | Patient portal | Patient login and overview | Patient | Account exists | Login and open overview | Own overview data visible | `/patient-auth/login`, `/patient-portal/overview` | `patient_accounts`, `patients`, related read tables | `/portal/login`, `/portal/overview` | P0 | Ready | Existing portal tests |
| BF-08-T02 | Patient portal | Profile update | Patient | Patient logged in | Edit profile and save | Profile persists | `PUT /patient-portal/profile` | `patients` | `/portal/profile` | P1 | Ready | Component tests exist |
| BF-08-T03 | Patient portal | Message reply | Patient | Thread exists | Try reply/send | No unsupported write should happen | No patient message write API | `patient_messages` read only | `/portal/messages` | P2 | Missing API | Keep read-only until contract exists |
| BF-08-T04 | Patient portal | Cancel/reschedule | Patient | Appointment exists | Try cancel/reschedule | Disabled/informational only | No patient cancel/reschedule API | `appointments` | `/portal/appointments` | P1 | Missing API | Product decision needed |
| BF-09-T01 | Inventory | Create item/lot/movement | Pharmacist/Admin | Authenticated inventory role | Add item, add lot, record movement | Lists reload, success shown | Inventory item/lot/movement APIs | `inventory_*` | `/staff/inventory` | P0 | Ready | Component tests exist |
| BF-09-T02 | Inventory | Delete item | Pharmacist/Admin | Item exists | Click Delete | Confirmation shown; item deleted or conflict shown | `DELETE /inventory/items/{id}` | `inventory_items` | `/staff/inventory` | P1 | Ready | Browser confirmation added |
| BF-09-T03 | Inventory | Dispense medication | Pharmacist/Admin | Medical record has matching prescription and lot has stock | Submit dispense form | Item/lot stock decrements and dispense movement is audited | `POST /inventory/dispense` | `inventory_items`, `inventory_lots`, `inventory_movements`, `medical_records`, `prescription_items` | `/staff/inventory` | P0 | Ready | Backend, component, API, and Playwright coverage added |
| BF-10-T01 | Finance | Invoice and payment | Accountant/Admin | Completed appointment exists | Create invoice, record payment | Invoice `PAID`, revenue updated | `/invoices`, `/payments`, `/reports/revenue/*` | `invoices`, `appointments` | `/staff/invoices`, `/staff/revenue` | P0 | Ready | Component/backend tests exist |
| BF-10-T02 | Finance | Void invoice | Accountant/Admin | Unpaid invoice exists | Click Void | Invoice `CANCELLED` | `POST /invoices/{id}/void` | `invoices` | `/staff/invoices` | P1 | Potential issue | Needs confirmation dialog |
| BF-10-T03 | Pricing | Create/update pricing | Accountant/Admin | Authenticated finance role | Create and edit pricing | Pricing persists | `/pricing`, `/pricing/{id}` | `service_pricing` | `/staff/pricing`, `/admin/pricing` | P1 | Ready | Delete button in admin pricing not backed |
| BF-11-T01 | Reminders | Follow-up reminder planning and delivery evidence | Doctor/System | Record includes follow-up date | Save record, run reminder service | Reminder/email attempt recorded; failed external delivery remains retryable | Service-level only | `appointment_follow_ups`, `email_delivery_attempts` | No UI | P1 | Ready backend-only | ReminderService and delivery integration tests |
| BF-12-T01 | UAT seed | Synthetic UAT readiness | Demo operator | Seed enabled | Start app, login each role | Representative objects visible | Normal APIs after seed | All major tables | Key public/staff/admin/portal screens | P0 | Ready | Final release-demo verification evidence exists; rerun before a new production sign-off |

## 7. Button And Action Inspection Checklist

Button statuses:

- `OK`: handler and API exist, with loading/success/error handling visible from source.
- `Missing API`: visible action needs backend contract that is not present.
- `Missing handler`: visible button/link has no meaningful action in source.
- `Need review`: handler exists or route exists, but source-only pass cannot prove full runtime behavior.

| Screen | Button / Action | Expected behavior | API that should be called | API exists | Loading state | Success message | Error handling | Confirmation for dangerous action | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/booking` | Select slot | Select available slot before form submit | `GET /doctors/{id}/slots` for slot source | Yes | Yes for slots | N/A | Yes | N/A | OK |
| `/booking` | Submit booking | Create confirmed appointment | `POST /appointments` | Yes | Yes | Confirmation shown | Yes | N/A | OK |
| `/departments`, `/doctors` | Retry load | Reload public data | Department/doctor GET APIs | Yes | Yes | N/A | Yes | N/A | OK |
| `/news` | Read buttons | Show unsupported detail/archive state | Public news detail API or route | Partial/list only | N/A | N/A | N/A | N/A | OK - disabled honestly |
| `/staff/login` | Toggle password | Show/hide password | None | N/A | N/A | N/A | N/A | N/A | OK |
| `/staff/login` | Login | Authenticate staff | `POST /auth/login` | Yes | Yes | Navigates/stores role | Yes | N/A | OK |
| `/auth/logout` | Logout side effect | Logout and clear session | `POST /auth/logout` | Yes | N/A | Redirect | Safe fallback | N/A | OK |
| `/admin/users` | Export CSV | Export filtered user list locally | Client-side CSV from loaded users | N/A | N/A | Download generated | N/A | N/A | OK |
| `/admin/users` | Add User | Open modal and create user | `POST /admin/users` | Yes | Yes | Yes | Yes | N/A | OK |
| `/admin/users` | Edit User | Open modal and update user | `PUT /admin/users/{id}` | Yes | Yes | Yes | Yes | N/A | OK |
| `/admin/users` | Activate/Deactivate | Toggle user active state | `POST /admin/users/{id}/activate or deactivate` | Yes | Yes | Yes | Yes | Yes | OK |
| `/admin/users/[id]` | Save user detail | Update user | `PUT /admin/users/{id}` | Yes | Yes | Yes | Yes | N/A | OK |
| `/admin/departments` | Create/Edit | Manage department | `POST/PUT /admin/departments` | Yes | Yes | Yes | Yes | N/A | OK |
| `/admin/departments` | Deactivate | Deactivate/delete department | `DELETE /admin/departments/{id}` | Yes | Yes | Yes | Yes | Yes | OK |
| `/admin/departments` | Assign/remove doctor | Manage department doctors | `POST /assign-doctor`, `DELETE /remove-doctor/{doctorId}` | Yes | Need review | Need review | Need review | N/A | Need review |
| `/admin/rooms` | Add/Edit Room | Manage room | `POST/PUT /admin/rooms` | Yes | Yes | Yes | Yes | N/A | OK |
| `/admin/rooms` | Change room status | Set room status | `PUT /admin/rooms/{id}/status` | Yes | Yes | Yes | Yes | N/A | OK |
| `/admin/rooms` | Deactivate room | Deactivate/delete room | `DELETE /admin/rooms/{id}` | Yes | Yes | Yes | Yes | Yes | OK |
| `/admin/news` | Add/Edit Article | Manage news | `POST/PUT /admin/news` | Yes | Yes | Yes | Yes | N/A | OK |
| `/admin/public-content` | Add/Edit Section | Manage public content | `POST /admin/content/sections`, `PUT /admin/content/sections/{id}` | Yes | Yes | Yes | Yes | N/A | OK |
| `/admin/audit-logs` | Refresh/export/filter buttons | Reload/export/filter audit logs | `GET /admin/audit-logs` for reload/list | Yes for list | Need review | N/A | Yes for load | N/A | Need review; fake hash pagination removed |
| `/admin/monitoring` | Auto refresh toggle | Toggle polling | `GET /admin/monitoring` | Yes | Yes | N/A | Yes | N/A | OK |
| `/admin/monitoring` | View all/drilldown | Navigate to detailed list | Unknown | No/unclear | No | No | No | N/A | Missing handler |
| `/admin/schedule-templates` | Create/Edit Template | Manage templates | `POST/PUT /admin/schedule-templates` | Yes | Yes | Yes | Yes | N/A | OK |
| `/admin/special-closures` | Create/Edit Closure | Manage closure | `POST/PUT /admin/special-closures` | Yes | Yes | Yes | Yes | N/A | OK |
| `/admin/special-closures` | Export/status/row actions | Filter locally and avoid unsupported export/detail actions | No export/detail endpoint visible | Partial | N/A | N/A | N/A | N/A | OK - unsupported actions disabled |
| `/admin/slots` | Generate slots | Generate availability | `POST /admin/slots/generate` | Yes | Yes | Yes | Yes | N/A | OK |
| `/admin/slots` | Block slot | Block availability | `PUT /admin/slots/{id}/block` | Yes | Yes | Yes | Yes | Yes | OK |
| `/admin/slots` | Delete slot | Delete availability | `DELETE /admin/slots/{id}` | Yes | Yes | Yes | Yes | Yes | OK |
| `/staff/queue` | Check in | Check in patient | `POST /appointments/{id}/checkin` | Yes | Yes | State updates | Row/page error | N/A | OK |
| `/staff/queue` | Call | Call patient | `POST /queue/{id}/call` | Yes | Yes | State updates | Row/page error | N/A | OK |
| `/staff/queue` | Assign room | Assign room name | `POST /queue/{id}/assign-room` | Yes | Yes | State updates | Row/page error | N/A | OK |
| `/staff/queue` | Start consultation | Move to in progress | `POST /queue/{id}/start-consultation` | Yes | Yes | State updates | Row/page error | N/A | OK |
| `/staff/queue` | Complete | Complete visit | `POST /queue/{id}/complete` | Yes | Yes | State updates | Row/page error | Yes | OK |
| `/staff/queue` | Skip | Skip operationally | `POST /queue/{id}/skip` | Yes | Yes | State updates | Row/page error | Yes | OK |
| `/staff/schedule` | Refresh | Reload doctor schedule | `GET /me/schedule` | Yes | Yes | N/A | Yes | N/A | OK |
| `/staff/schedule` | Day/Week toggle | Change query mode and reload | `GET /me/schedule?date or week` | Yes | Yes | N/A | Yes | N/A | OK |
| `/staff/schedule` | Search/status controls | Filter schedule rows | Local state/API not fully applied to source rows | N/A | No | N/A | No | N/A | Need review |
| `/staff/lab-results` | Record New Result | Navigate to create lab result route | `POST /lab-results` through `/staff/lab-results/new` | Yes | Yes | Navigates to created detail | Yes | N/A | OK |
| `/staff/lab-results` | Export | Export lab result list | No export endpoint visible | No | No | No | No | N/A | Missing handler |
| `/staff/lab-results/[id]` | Delete Result | Delete lab result | `DELETE /lab-results/{id}` | Yes | Yes | Redirect/list | Yes | Yes | OK |
| `/staff/lab-results/[id]` | View Attachment | Open attachment URL | External/file URL from result | N/A | No | N/A | Browser handles | N/A | Need review |
| `/staff/inventory` | Add Item | Create item | `POST /inventory/items` | Yes | Yes | Yes | Yes | N/A | OK |
| `/staff/inventory` | Edit Item | Update item | `PUT /inventory/items/{id}` | Yes | Yes | Yes | Yes | N/A | OK |
| `/staff/inventory` | Add Lot | Create lot | `POST /inventory/lots` | Yes | Yes | Yes | Yes | N/A | OK |
| `/staff/inventory` | Movement | Record movement | `POST /inventory/movements` | Yes | Yes | Yes | Yes | N/A | OK |
| `/staff/inventory` | Refresh | Reload inventory | Inventory GET APIs | Yes | Yes | N/A | Yes | N/A | OK |
| `/staff/inventory` | Delete item | Delete item | `DELETE /inventory/items/{id}` | Yes | Yes | Yes | Yes | Yes | OK |
| `/staff/invoices` | Refresh | Reload invoices | `GET /invoices` | Yes | Yes | N/A | Yes | N/A | OK |
| `/staff/invoices` | Create Invoice | Create invoice | `POST /invoices` | Yes | Yes | Yes | Yes | N/A | OK |
| `/staff/invoices` | Pay | Record payment | `POST /invoices/{id}/payments` | Yes | Yes | Yes | Yes | N/A | OK |
| `/staff/invoices` | Void | Cancel invoice | `POST /invoices/{id}/void` | Yes | Yes | Yes | Yes | Yes | OK |
| `/staff/pricing`, `/admin/pricing` | Create/update pricing | Manage service price | `POST/PUT /pricing` | Yes | Yes | Yes | Yes | N/A | OK |
| `/admin/pricing` | Delete pricing | Delete service price | No delete pricing API visible | No | N/A | N/A | N/A | N/A | OK - disabled honestly |
| `/staff/revenue` | Date/month filters | Load revenue report | `GET /reports/revenue/daily or monthly` | Yes | Yes | N/A | Yes | N/A | OK |
| `/staff/medical-records/[id]/edit` | Save record | Create medical record | `POST /medical-records` | Yes | Yes | Yes | Yes | N/A | OK |
| `/staff/prescriptions/preview` | Preview/download prescription | Generate/open PDF | PDF medical-record APIs | Yes | Need review | Need review | Need review | N/A | Need review |
| `/portal/login` | Login | Authenticate patient | `POST /patient-auth/login` | Yes | Yes | Navigates/stores role | Yes | N/A | OK |
| `/portal/claim` | Claim account | Verify identity and create portal account | `POST /patient-auth/claim` | Yes | Need review | Need review | Need review | N/A | Need review |
| `/portal/overview` | Load overview | Read patient overview | `GET /patient-portal/overview` | Yes | Yes | N/A | Yes | N/A | OK |
| `/portal/appointments` | Cancel/reschedule-like actions | Patient appointment self-service | No patient cancel/reschedule API | No | No | No | No | Yes if introduced | Missing API |
| `/portal/lab-results` | View lab result | Read own labs | `GET /patient-portal/lab-results` | Yes | Yes | N/A | Yes | N/A | OK |
| `/portal/messages` | Read messages | Read-only thread list | `GET /patient-portal/messages` | Yes | Yes | N/A | Yes | N/A | OK |
| `/portal/messages` | Send/reply | Send portal message | No write API visible | No | No | No | No | N/A | Missing API |
| `/portal/profile` | Save profile | Update patient profile | `PUT /patient-portal/profile` | Yes | Yes | Yes | Yes | N/A | OK |
| `/portal/records` | Edit/print/update record buttons | Patient record actions | No patient record write/print API visible | No/unclear | No | No | No | Need review | Missing API |
| `/staff/support`, `/admin/support`, `/portal/support` | Ticket actions | Create/resolve support request | No support API visible | No | N/A | N/A | N/A | N/A | OK - read-only/unsupported state |
| `/staff/booking/*` | Step buttons | Staff-assisted booking wizard | Public booking APIs should be used if wired | API yes | Need review | Need review | Need review | N/A | Need review |
| `/staff/vital-signs` | Record/Export buttons | Record/export vital signs | Vital-sign APIs exist | Yes | Need review | Need review | Need review | N/A | Need review |

## 8. Text-Based Flow Diagrams

### BF-01 Public Booking

```text
[Start]
-> [Guest opens booking]
-> [Load doctors and slots]
-> [User enters patient details]
-> [Submit appointment]
-> [Decision: slot available and data valid?]
   -> Yes: [Create patient/appointment and book slot]
   -> No: [Show validation or conflict error]
-> [Show confirmation]
-> [End]
```

### BF-02 Staff Auth/RBAC

```text
[Start]
-> [Staff opens login]
-> [Submit credentials]
-> [Decision: active user and password valid?]
   -> Yes: [Store staff token and role]
   -> No: [Show login error]
-> [Open requested protected route]
-> [Decision: role allowed?]
   -> Yes: [Render module]
   -> No: [Redirect to forbidden]
-> [End]
```

### BF-03 Admin Operations

```text
[Start]
-> [Admin opens admin module]
-> [Load list data]
-> [Create or edit entity]
-> [Decision: request valid and references exist?]
   -> Yes: [Persist entity and reload list]
   -> No: [Show validation/conflict error]
-> [Optional deactivate/status change]
-> [Audit/monitor state available]
-> [End]
```

### BF-04 Scheduling

```text
[Start]
-> [Admin creates schedule template]
-> [Admin adds closure if needed]
-> [Generate slots]
-> [Decision: overlap or invalid date range?]
   -> Yes: [Reject or skip slots with summary]
   -> No: [Persist available slots]
-> [Public booking reads available slots]
-> [Doctor reads own schedule]
-> [End]
```

### BF-05 Queue

```text
[Start]
-> [Staff opens today queue]
-> [Check in confirmed appointment]
-> [Call patient]
-> [Assign room]
-> [Start consultation]
-> [Decision: clinical visit completed?]
   -> Yes: [Complete visit and set DONE]
   -> No: [Skip or keep in active queue]
-> [Audit queue actions]
-> [End]
```

### BF-06 Clinical Record

```text
[Start]
-> [Doctor opens appointment detail]
-> [Decision: doctor owns appointment and status is valid?]
   -> Yes: [Render medical record form]
   -> No: [Show forbidden/conflict error]
-> [Doctor enters diagnosis, notes, vitals, prescriptions, follow-up]
-> [Submit medical record]
-> [Decision: duplicate record?]
   -> Yes: [Reject with conflict]
   -> No: [Save record, complete appointment, plan reminder]
-> [Generate prescription PDF]
-> [End]
```

### BF-07 Lab Results

```text
[Start]
-> [Staff opens lab results]
-> [Load appointments]
-> [Load lab results by appointment]
-> [Open lab result detail]
-> [Decision: user can delete?]
   -> Yes: [Confirm delete and call API]
   -> No: [Hide delete action]
-> [Patient portal reads own released lab results]
-> [End]
```

### BF-08 Patient Portal

```text
[Start]
-> [Patient claims account or logs in]
-> [Store patient token]
-> [Open overview]
-> [Load portal read models]
-> [Decision: patient tries write action?]
   -> Profile update: [Call profile update API]
   -> Cancel/reschedule/message reply: [Show unsupported/disabled state]
-> [End]
```

### BF-09 Inventory

```text
[Start]
-> [Pharmacist opens inventory]
-> [Load items, lots, movements, alerts]
-> [Create or edit item]
-> [Create lot]
-> [Record movement]
-> [Decision: quantity/reference constraints valid?]
   -> Yes: [Persist and reload]
   -> No: [Show validation/conflict error]
-> [Review alerts]
-> [End]
```

### BF-10 Finance

```text
[Start]
-> [Accountant opens invoices]
-> [Create invoice for appointment]
-> [Decision: appointment invoiceable and not duplicate?]
   -> Yes: [Invoice UNPAID]
   -> No: [Show conflict/validation error]
-> [Record payment]
-> [Invoice PAID]
-> [Read revenue report]
-> [End]
```

### BF-11 Reminders

```text
[Start]
-> [Doctor saves medical record with follow-up]
-> [Backend plans reminder]
-> [Scheduler finds due reminder]
-> [Attempt email delivery]
-> [Decision: delivery success?]
   -> Yes: [Record success]
   -> No: [Record failure/retry without corrupting record]
-> [End]
```

### BF-12 Release-Demo UAT

```text
[Start]
-> [Enable release-demo seed]
-> [Start database/backend/frontend]
-> [Seed synthetic data]
-> [Login seeded personas]
-> [Verify one critical object per role]
-> [Decision: all P0 role flows visible?]
   -> Yes: [Demo-ready smoke pass]
   -> No: [Record blocker and missing flow]
-> [End]
```

## 9. Test Prioritization

### P0: Must Work Before Demo / Production

| Flow | Reason |
| --- | --- |
| BF-01 Public booking | Main patient acquisition and appointment creation path. |
| BF-02 Staff auth/RBAC | Protects every staff/admin workflow. |
| BF-04 Admin schedule setup | Booking depends on real availability. |
| BF-05 Queue lifecycle | Core operational patient flow. |
| BF-06 Medical record creation | Core clinical value and patient safety path. |
| BF-08 Patient portal read scoping | Prevents cross-patient privacy leaks. |
| BF-09 Inventory movement | Required for pharmacy/operations readiness. |
| BF-10 Invoice/payment | Required for revenue workflow. |
| BF-12 Demo seed smoke | Required for repeatable UAT/demo proof. |

### P1: Important After P0

| Flow | Reason |
| --- | --- |
| BF-03 Admin CRUD/content/news/rooms | Important for operations but not every demo path. |
| BF-04 Doctor schedule read | Important for doctor workflow clarity. |
| BF-07 Staff lab list/detail/delete and patient lab read | Important clinical support flow. |
| BF-08 Portal claim/profile/messages read | Important patient self-service. |
| BF-10 Pricing/revenue reports | Important finance completeness. |
| BF-11 Reminder side effects | Important follow-up safety, backend-only. |
| Audit log and monitoring | Important for admin operations and security review. |

### P2: Secondary Flows

| Flow | Reason |
| --- | --- |
| Search/filter/sort/pagination | Improves usability; can follow core data correctness. |
| Export CSV/print actions | Useful operational tooling, currently mixed support. |
| Support pages | Static or unclear, not core hospital workflow. |
| Portal auxiliary pages | Several route-file screens need product/API clarification. |

### P3: Nice-To-Have

| Flow | Reason |
| --- | --- |
| Dashboard drilldowns | Useful but many buttons are visual/static. |
| Advanced notification management UI | No active UI/API contract. |
| Patient self-service cancel/reschedule | Product decision needed before testing as supported. |
| Batch billing/automated billing controls | Explicitly not exposed by current backend API. |

## 10. Conclusion

### Flows That Appear Complete

- Public booking through `POST /api/v1/appointments`.
- Staff authentication, logout, RBAC route guards, and backend authorization.
- Queue check-in and queue action lifecycle.
- Admin user, room, content/news, schedule template, slot, monitoring, and audit-log read workflows.
- Doctor schedule read through `GET /api/v1/me/schedule`.
- Medical record creation and prescription PDF backend path.
- Staff inventory item/lot/movement/dispense/alert workflow.
- Invoice create/payment/void, pricing create/update, and revenue reporting.
- Patient portal overview, appointments read, lab results read, messages read, and profile update.
- Staff lab result list/detail/delete/create are wired in source.
- Backend reminder delivery attempts are auditable through `email_delivery_attempts` with local-record staging behavior.

### Flows Likely Missing APIs Or Handlers

- Patient appointment cancel/reschedule from portal: no patient write API.
- Patient message send/reply: no patient write API.
- Change password and forgot password: no backend reset API; staff/patient login now shows disabled reset-unavailable state.
- Support ticket actions: no support API visible; staff/admin actions now show read-only/disabled state.
- Export CSV/export lab/audit/public actions: mixed support; admin users/departments/rooms/pricing have local CSV, lab/audit/public exports remain product decisions.
- Admin pricing delete: no delete pricing API visible; action is disabled honestly.
- Public news `Read` buttons: disabled honestly until a detail route/API exists.

### UI With Unclear Business Logic

- Portal auxiliary routes: `/portal/billing`, `/portal/diagnostics`, `/portal/inventory`, `/portal/patients`, `/portal/pharmacy`, `/portal/scheduling`, `/portal/staff`, `/portal/admit`.
- Staff booking sub-step routes under `/staff/booking/*`.
- `/staff/vital-signs` and `/staff/nurse-intake` need a deeper source pass before marking every action as API-backed.
- Admin audit-log filters/export actions.
- Internal assistant/chatbot tables versus current UI surface.

### Clarifications Needed From Product Owner / BA

- Should patients be allowed to cancel or reschedule appointments, and what are status/slot-release rules?
- Should patients be allowed to send portal messages, or are messages intentionally read-only?
- Should lab result creation also be embedded inside the appointment or medical-record workflow, or is the standalone `/staff/lab-results/new` screen sufficient?
- Should destructive confirmations be upgraded from browser `confirm` to first-class modal components for invoice void, user deactivate, room/dept deactivate, slot delete/block, inventory delete, lab delete, and queue terminal actions?
- Should clinical records become locked after signing, with addendum-only edits?
- Is drug/allergy interaction checking in scope for prescriptions?
- Which export/print actions are required for release versus visual placeholders?
- Are portal auxiliary routes real patient modules or reference/design screens?

### Biggest Risks Before Release

- Route-file presence can overstate readiness; several screens still have static/no-handler buttons.
- Patient privacy risk if portal and doctor schedule scoping are not integration-tested with multiple patients/doctors.
- Clinical safety risk around prescriptions: no visible allergy/drug interaction checks and no full locked-encounter/addendum workflow.
- Business-order risk: queue, medical-record, invoice, and slot actions must reject invalid statuses.
- Dangerous-action risk: several destructive actions still lack explicit confirmation outside inventory and lab delete.
- Environment risk: Docker/Testcontainers availability is required for full backend integration proof.
- Documentation drift risk: older gap docs may say staff lab/schedule are static, but live source now includes API wiring.

### Recommended End-To-End Testing Order

1. Seed or create a minimal synthetic UAT dataset: departments, doctors, room, slots, patients, appointments, inventory, pricing.
2. Run P0 backend integration tests for auth/RBAC, booking, queue, clinical record, portal scoping, inventory, finance.
3. Run P0 frontend component tests for booking, queue, medical record editor, portal overview, inventory, invoices, admin slots/users.
4. Run Playwright smoke through public booking, staff login, queue, doctor record, patient portal, inventory, invoices, and admin schedule setup.
5. Execute P1 admin CRUD/content/news/lab/profile/pricing/revenue tests.
6. Inspect P2/P3 buttons and remove, wire, or label unsupported actions before UAT.
7. Re-run route coverage and visual smoke after every route/API contract change.

## Evidence Commands

These commands were used or should be used to refresh this document:

```powershell
npx.cmd gitnexus status
npx.cmd gitnexus list
npx.cmd gitnexus query "patient appointment booking check in workflow" -r hospital-management-system
npx.cmd gitnexus query "doctor consultation medical record prescription workflow" -r hospital-management-system
npx.cmd gitnexus query "frontend button action API integration loading error state" -r hospital-management-system
rg --files web/src/app
rg --files backend
rg -n "@(RestController|RequestMapping|GetMapping|PostMapping|PutMapping|PatchMapping|DeleteMapping|PreAuthorize)" backend/controller/src/main/java backend/application/src/main/java
rg -n "CREATE TABLE|ALTER TABLE|CHECK \(|status|role" backend/start/src/main/resources/db/migration
rg -n "onClick|type=""submit""|<button|<Button|Button" web/src/app web/src/components web/src/lib
git diff --check -- docs/06-testing/business-flow-test-matrix.md docs/06-testing/README.md
```

## Source Anchors

| Area | Primary anchors |
| --- | --- |
| Frontend route inventory | `web/e2e/helpers/routes.ts`, `web/src/app/**/page.tsx` |
| Frontend route contracts | `web/e2e/helpers/exhaustive-route-contracts.ts` |
| Frontend RBAC | `web/src/lib/rbac.ts`, route guard tests |
| Public API wrapper | `web/src/lib/public-api.ts` |
| Clinical API wrapper | `web/src/lib/clinical-api.ts` |
| Operations API wrapper | `web/src/lib/operations-api.ts` |
| Medical records API wrapper | `web/src/lib/medical-records-api.ts` |
| Patient records API wrapper | `web/src/lib/patient-records-api.ts` |
| Backend controllers | `backend/controller/src/main/java/com/hospital/api` |
| Backend services | `backend/application/src/main/java/com/hospital/core` |
| DTOs and enums | `backend/domain/src/main/java/com/hospital/shared` |
| Database migrations | `backend/start/src/main/resources/db/migration` |
| Backend integration tests | `backend/start/src/test/java/com/hospital/api` |
| Frontend unit/component tests | `web/src/**/__tests__` |
| Playwright suites | `web/e2e/specs` |
