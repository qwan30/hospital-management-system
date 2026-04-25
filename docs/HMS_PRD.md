# Hospital Management System PRD

Status: aligned to the repository on 2026-04-16

## 1. Purpose

This PRD is the current product baseline for the repository in `D:\projects\hospital-management-system`.
It is intended to support UI/UX design and frontend planning from the code that actually exists today.

## 2. Product Summary

The project is a backend-first hospital management platform with:

- public hospital discovery content
- appointment booking with symptom-based duration suggestion
- staff authentication and role-based workflows
- doctor medical record and prescription PDF generation
- nurse check-in, queue, and vital signs workflows
- accountant invoice, payment, pricing, and revenue reporting workflows
- admin operations for users, departments, rooms, schedules, content, and monitoring
- patient portal authentication, overview, appointments, lab results, messages, and profile
- an internal clinical assistant with document mode, patient mode, and hybrid mode

## 3. Current Implementation Baseline

### 3.1 Implemented now

- Spring Boot backend with roughly 122 controller route handlers in `backend/api/src/main/java`
- PostgreSQL schema managed by Flyway migrations `V1` through `V10`
- seed data for departments, staff accounts, pricing, slots, inventory, and patient portal demo data
- deterministic public chatbot based on live database content
- Gemini-backed symptom analysis with heuristic fallback when Gemini is disabled or unavailable
- Gmail integration hooks for transactional email, disabled by default unless configured

### 3.2 Not implemented yet

- a production frontend application
- a role-based React app connected to the backend APIs
- patient self-service cancel/reschedule flows
- patient portal message compose or reply APIs
- external payment gateway integration
- richer queue actions such as call, skip, or room board operations

### 3.3 Frontend status

The `frontend/` folder is only a starter Vite TypeScript scaffold.
It does not contain hospital screens yet.
Design work should therefore treat the backend APIs and shared DTOs as the contract for the future UI.

## 4. Users and Roles

| Role | Current system access | Design implication |
| --- | --- | --- |
| Guest | Public content, doctor directory, department info, booking, chatbot | Needs a polished public website and booking flow |
| Patient | Portal claim, portal login, overview, appointments, lab results, messages, profile | Needs a lightweight portal focused on visibility and trust |
| Doctor | Staff auth, appointment list/detail, status updates, medical records, follow-up, PDFs, internal assistant | Needs an information-dense clinical workspace |
| Nurse | Staff auth, daily appointments, queue, check-in, vital signs, internal assistant with queue-bound patient context | Needs fast list/detail interactions and low-friction intake |
| Accountant | Invoices, payments, pricing, revenue reports | Needs finance tables, filters, and status visibility |
| Admin | Users, departments, rooms, templates, closures, slots, content, news, stats, monitoring, audit logs, knowledge docs, docs-only internal assistant | Needs a broad operations console with strong navigation |

## 5. Product Scope For Frontend Design

### 5.1 Public experience

- Home page driven by `/api/v1/content/home`
- Department list and department detail
- Doctor list, doctor detail, and doctor slot availability by date
- News and announcement listing
- Booking entry points
- Public chatbot entry point

### 5.2 Booking experience

- Symptom analysis step via `/api/v1/ai/analyze-symptoms`
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

### 5.5 Internal assistant

- Session-aware assistant panel for doctor and nurse workflows
- Docs mode, Patient mode, and Hybrid mode
- citation list and deep links in every non-refused answer
- feedback action on assistant answers
- admin knowledge document management screens

## 6. Screen Inventory

The future frontend should at minimum include the screens below.

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
- Knowledge document manager

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
- file upload states for knowledge docs

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
6. Doctor optionally opens the internal assistant with patient context.

### 7.3 Nurse intake journey

1. Nurse logs in.
2. Nurse opens today appointments or queue.
3. Nurse checks in the patient.
4. Nurse records vital signs.
5. Nurse optionally uses the internal assistant with the currently queued patient context.

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
5. Admin uploads, activates, revokes, or reindexes internal assistant knowledge documents.

## 8. UX Requirements

- Public and patient experiences must work well on mobile and desktop.
- Staff experiences are desktop-first but should remain tablet-friendly.
- UI must reflect role boundaries exactly; unavailable actions should not be shown.
- Assistant responses must always surface citations, suggested follow-up actions, and refusal states clearly.
- Booking and medical forms must show validation inline and preserve entered data where safe.
- Sensitive data views must feel clinical, reliable, and low-noise rather than marketing-driven.
- Accessibility target for the future frontend is WCAG 2.1 AA.

## 9. Product Constraints From Current Code

- The chatbot is rule-based and grounded in departments, doctors, and slots. It is not a general LLM chat experience.
- Symptom analysis is the only user-facing AI feature that calls an external model today.
- Internal assistant responses are deterministic and citation-first; the UI should not imply free-form generative behavior.
- Patient portal messaging is currently read-only from the patient side.
- Room management exists for admin APIs only; a nurse room workflow is not implemented yet.
- Refresh tokens are returned via HTTP-only cookies for both staff and patient authentication.

## 10. Design Acceptance Criteria

Frontend design artifacts produced from this PRD should:

- cover all implemented roles and modules listed above
- distinguish implemented backend capability from future enhancements
- include clear responsive behavior for public and portal views
- include dense desktop layouts for doctor, nurse, accountant, and admin workspaces
- show where citations, PDFs, monitoring data, and status chips appear
- avoid designing flows that need APIs the current repository does not provide
