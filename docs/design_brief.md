# Hospital Management System Design Brief

Status: aligned with the repository on 2026-04-26 after AI and internal assistant removal.

## Product Direction

The active product is a hospital operations platform for public discovery, appointment booking, staff clinical workflows, finance, inventory, admin operations, and patient portal access.

Removed product surfaces:

- external model-backed symptom analysis
- staff internal assistant
- admin knowledge document manager
- assistant monitoring dashboards

The public chatbot remains a deterministic helper for departments, doctors, appointment availability, and booking guidance.

## Experience Principles

- Keep clinical screens dense, scannable, and low-noise.
- Keep public and patient portal screens mobile-friendly.
- Do not imply diagnosis, model advice, or free-form clinical automation.
- Preserve strict role boundaries in navigation and action visibility.
- Make operational failures visible with clear recovery actions.

## Route Families

Public:

- `/`
- `/departments`
- `/departments/[id]`
- `/doctors`
- `/news`
- `/booking`
- `/privacy`
- `/terms`
- `/security`

Staff:

- `/staff/login`
- `/staff/dashboard`
- `/staff/patients`
- `/staff/queue`
- `/staff/schedule`
- `/staff/booking`
- `/staff/booking/symptoms`
- `/staff/booking/slots`
- `/staff/booking/review`
- `/staff/booking/success`
- `/staff/inventory`
- `/staff/invoices`
- `/staff/lab-results`
- `/staff/medical-records/[id]/edit`
- `/staff/nurse-intake`
- `/staff/doctor/[id]`
- `/staff/doctor/dashboard`
- `/staff/prescriptions/preview`
- `/staff/pricing`
- `/staff/revenue`
- `/staff/slots`
- `/staff/support`
- `/staff/vital-signs`

Patient portal:

- `/portal/login`
- `/portal/claim`
- `/portal/overview`
- `/portal/records`
- `/portal/appointments`
- `/portal/lab-results`
- `/portal/messages`
- `/portal/profile`
- `/portal/billing`
- `/portal/pharmacy`
- `/portal/scheduling`
- `/portal/support`

Admin:

- `/admin/dashboard`
- `/admin/appointments`
- `/admin/audit-logs`
- `/admin/departments`
- `/admin/monitoring`
- `/admin/news`
- `/admin/public-content`
- `/admin/rooms`
- `/admin/users`

## Key Workflows

- Guest explores departments/doctors, enters symptoms as booking context, selects a slot, and receives a confirmation code.
- Doctor reviews appointments, updates status, creates medical records, manages follow-up, and previews/downloads prescription PDFs.
- Nurse manages queue, checks in patients, and records vital signs.
- Accountant manages invoices, payments, pricing, and revenue reports.
- Admin manages staff, departments, rooms, schedules, content, news, monitoring, and audit logs.
- Patient claims access, signs in, reviews appointments, lab results, messages, and profile.

## Removed UI Requirements

Do not build or display:

- `/staff/assistant`
- `/admin/knowledge`
- assistant panels, answer citations, assistant feedback, assistant mode tabs, or assistant rate-limit states
- Gemini or model configuration screens
- diagnostic automation claims in public marketing copy

## Testing Expectations

- Keep Playwright route inventories aligned with active routes.
- Exercise public booking, staff clinical headings, patient portal destinations, and admin operations headings.
- Verify removed routes are not listed in route smoke tests.
