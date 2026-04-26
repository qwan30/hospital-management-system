# Hospital Management System PRD

Status: aligned with the repository on 2026-04-26 after AI and internal assistant removal.

Documentation map: [README.md](README.md)  
Route inventory: [reference/frontend-route-inventory.md](reference/frontend-route-inventory.md)

## 1. Purpose

This PRD is the current product baseline for the repository in `D:\projects\hospital-management-system`.
It is intended to support UI/UX design and frontend planning from the code that actually exists today.

## 2. Product Summary

The project is a backend-first hospital management platform with:

- public hospital discovery content
- appointment booking with symptom intake
- staff authentication and role-based workflows
- doctor medical record and prescription PDF generation
- nurse check-in, queue, and vital signs workflows
- accountant invoice, payment, pricing, and revenue reporting workflows
- admin operations for users, departments, rooms, schedules, content, and monitoring
- patient portal authentication, overview, appointments, lab results, messages, and profile

## 3. Current Implementation Baseline

### 3.1 Implemented now

- Spring Boot backend with a DDD-oriented Maven layout: `domain`, `infrastructure`, `application`, `controller`, and `start`
- controller route handlers in `backend/controller/src/main/java`
- PostgreSQL schema managed by Flyway migrations `V1` through `V16`
- seed data for departments, staff accounts, pricing, slots, inventory, and patient portal demo data
- deterministic public chatbot based on live database content
- Gmail integration hooks for transactional email, disabled by default unless configured
- frontend API client, route guards, and role-aware navigation helpers for selected staff and portal flows

### 3.2 Not implemented yet

- full production readiness for every frontend workflow
- complete backend API integration across every frontend workflow
- patient self-service cancel/reschedule flows
- patient portal message compose or reply APIs
- external payment gateway integration
- separate real-time room-board operations beyond the audited queue assign-room action

### 3.3 Frontend status

The `web/` folder contains the canonical Next.js frontend route tree for public, staff, admin, and patient portal screens.
The `frontend/` directory is retained as migrated design-reference HTML/PNG prototypes, not as the runnable frontend.
Design work should therefore treat the implemented `web/` app and the backend APIs and contract DTOs in `backend/domain` as the current product baseline.

## 4. Users and Roles

| Role | Current system access | Design implication |
| --- | --- | --- |
| Guest | Public content, doctor directory, department info, booking, chatbot | Needs a polished public website and booking flow |
| Patient | Portal claim, portal login, overview, appointments, lab results, messages, profile | Needs a lightweight portal focused on visibility and trust |
| Doctor | Staff auth, appointment list/detail, status updates, medical records, follow-up, PDFs | Needs an information-dense clinical workspace |
| Nurse | Staff auth, daily appointments, queue, check-in, vital signs | Needs fast list/detail interactions and low-friction intake |
| Accountant | Invoices, payments, pricing, revenue reports | Needs finance tables, filters, and status visibility |
| Admin | Users, departments, rooms, templates, closures, slots, content, news, stats, monitoring, audit logs | Needs a broad operations console with strong navigation |
| Receptionist | RBAC role exists for appointment, queue, and scheduling support; no seeded demo account is currently persisted | Needs future scheduling-oriented screens if the role is productized |
| Pharmacist | RBAC role exists for prescription read and inventory workflows; no seeded demo account is currently persisted | Needs future pharmacy-focused screens if the role is productized |

See [role-screen/API matrix](reference/role-screen-api-matrix.md) for the implementation-aligned role map.

## 4.1 Current-Vs-Planned Feature Status

| Product area | Status | Notes |
| --- | --- | --- |
| Backend modules and REST APIs | Implemented | Current source is the five-module Maven reactor under `backend/` |
| Public discovery and booking APIs | Implemented | Public content, departments, doctors, slots, appointments, and scoped chatbot are active |
| Staff auth and RBAC | Implemented | Staff access tokens, refresh cookies, backend RBAC, and frontend route guards exist |
| Clinical workflows | Implemented | Appointments, queue, vital signs, lab results, medical records, follow-up, and prescription PDF routes exist |
| Finance and inventory APIs | Implemented | Invoice, payment, pricing, revenue, inventory item, lot, movement, and alert routes exist |
| Patient portal read experience | Partially implemented | Auth, overview, appointments, lab results, messages, and profile exist; message send/reply, self-cancel, and reschedule are not implemented |
| Frontend route tree | Partially implemented | `web/src/app` contains public, staff, admin, and portal routes; only selected workflows are backend-integrated |
| Dockerized frontend | Implemented | `web/Dockerfile` and the active Docker Compose `frontend` service build the canonical Next.js app |
| External payment gateway | Planned | No payment-provider integration is present |
| AI/internal assistant workflows | Removed | Historical assistant API and database surfaces are removed from the active product |

## 5. Product Scope For Frontend Design

### 5.1 Public experience

- Home page driven by `/api/v1/content/home`
- Department list and department detail
- Doctor list, doctor detail, and doctor slot availability by date
- News and announcement listing
- Booking entry points
- Public chatbot entry point

### 5.2 Booking experience

- symptom intake and clinical triage copy
- doctor and slot selection
- patient identity and contact capture
- booking confirmation with generated confirmation code

### 5.3 Staff experience

- Staff login and token refresh flow
- doctor dashboard and appointment list
- doctor appointment detail page
- medical record editor with diagnosis, notes, follow-up, prescription items, and PDF preview/download
- nurse intake board with today list, queue list, check-in, and vital signs capture
- accountant workspace for invoices, payments, pricing, and revenue reports
- admin workspace for data setup, content management, and system monitoring

### 5.4 Patient portal

- Portal claim flow
- Portal login and refresh flow
- Overview dashboard
- Appointment history and next appointment visibility
- Lab result list with summary, doctor comment, and attachment link
- Message thread list with nested messages returned by the API
- Profile editing

## 6. Screen Inventory

The frontend product should at minimum include the screens below.

### 6.1 Public screens

- Home
- Departments
- Department detail
- Doctors
- Doctor detail with slot picker
- Booking wizard
- Booking success state
- News list
- Chatbot drawer or widget

### 6.2 Staff screens

- Staff login
- Doctor dashboard
- Doctor appointment detail
- Medical record editor
- Prescription PDF preview state
- Nurse daily intake board
- Queue board
- Vital signs editor
- Invoice list and detail
- Pricing management
- Revenue dashboard
- Admin users
- Admin departments
- Admin rooms
- Admin schedule templates
- Admin special closures
- Admin slot generation
- Admin content and news
- Admin stats and monitoring
- Audit log viewer

### 6.3 Patient portal screens

- Claim access
- Login
- Overview
- Appointments
- Lab results
- Messages
- Profile

### 6.4 Shared overlay patterns

- authentication expired modal or silent refresh flow
- permission denied states
- empty states
- optimistic loading and skeleton states
- form validation states

## 7. Key Journeys

### 7.1 Public booking journey

1. Guest lands on Home or Departments.
2. Guest explores doctors and slot availability.
3. Guest enters symptoms and receives duration guidance.
4. Guest selects doctor and first slot.
5. Guest completes patient details and booking contact details.
6. System returns confirmation code and booking summary.

### 7.2 Doctor care completion journey

1. Doctor logs in.
2. Doctor reviews own appointment list or opens a direct appointment detail page.
3. Doctor updates appointment status.
4. Doctor creates a medical record with diagnosis, notes, optional vital signs, optional follow-up date, and prescription items.
5. Doctor previews or downloads prescription PDF.

### 7.3 Nurse intake journey

1. Nurse logs in.
2. Nurse opens today appointments or queue.
3. Nurse checks in the patient.
4. Nurse records vital signs.

### 7.4 Accountant billing journey

1. Accountant logs in.
2. Accountant reviews invoices by status.
3. Accountant creates an invoice from an appointment.
4. Accountant records payment or voids an invoice.
5. Accountant reviews daily or monthly revenue and department breakdown.
6. Accountant maintains pricing rules.

### 7.5 Admin governance journey

1. Admin logs in.
2. Admin manages staff, departments, rooms, and scheduling structures.
3. Admin manages public content and news.
4. Admin reviews monitoring, stats, and audit logs.

## 8. UX Requirements

- Public and patient experiences must work well on mobile and desktop.
- Staff experiences are desktop-first but should remain tablet-friendly.
- UI must reflect role boundaries exactly; unavailable actions should not be shown.
- Booking and medical forms must show validation inline and preserve entered data where safe.
- Sensitive data views must feel clinical, reliable, and low-noise rather than marketing-driven.
- Accessibility target for the frontend is WCAG 2.1 AA.

## 9. Product Constraints From Current Code

- The chatbot is rule-based and grounded in departments, doctors, and slots. It is not a general AI or LLM chat experience.
- There is no external AI provider integration in the current product.
- Patient portal messaging is currently read-only from the patient side.
- Room management exists for admin APIs only; a nurse room workflow is not implemented yet.
- Refresh tokens are returned via HTTP-only cookies for both staff and patient authentication.

## 10. Design Acceptance Criteria

Frontend design artifacts produced from this PRD should:

- cover all implemented roles and modules listed above
- distinguish implemented backend capability from future enhancements
- include clear responsive behavior for public and portal views
- include dense desktop layouts for doctor, nurse, accountant, and admin workspaces
- show where PDFs, monitoring data, and status chips appear
- avoid designing flows that need APIs the current repository does not provide
