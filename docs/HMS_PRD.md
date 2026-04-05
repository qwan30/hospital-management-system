# Hospital Management System PRD

**Document status:** Draft synthesized from existing project documentation  
**Version:** 1.0  
**Last updated:** 2026-03-18  
**Product stage:** Release-ready demo / pilot scope  

## 1. Purpose

This Product Requirements Document consolidates the project intent scattered across the current documentation set into a single product-facing source. It is meant to explain what the Hospital Management System should do, for whom, why it matters, and how success should be measured.

This PRD is derived from the following documents in `docs/`:

- `HMS_SRS.md`
- `HMS_TDD.md`
- `HMS_ProjectPlan.md`
- `HMS_UIUXSpec.md`
- `HMS_TestPlan.md`
- `HMS_UserManual.md`
- `HMS_DeploymentGuide.md`
- `HMS_IntegrationGuide.md`
- `HMS_DBMigrationPlan.md`

Implementation-level details such as schema design, API contracts, migrations, and deployment steps remain owned by their original technical documents.

## 2. Product Summary

Hospital Management System (HMS) is a hospital operations platform for Vietnamese healthcare providers. It combines:

- A public website for hospital discovery and appointment booking
- AI-assisted symptom analysis to estimate appointment duration
- Automated patient communication through email
- Internal dashboards for doctors, nurses, accountants, and admins
- A read-only chatbot for hospital information and appointment guidance

The product is designed to reduce manual scheduling friction, improve staff coordination, prevent double-booking, and centralize daily operational workflows in one system.

## 3. Problem Statement

Hospitals and clinics often manage patient acquisition, scheduling, clinical records, queue handling, billing, and staff operations across disconnected processes. That creates predictable failures:

- Patients cannot book quickly without phone calls or manual staff intervention
- Appointment lengths are assigned uniformly even when case complexity varies
- Double-booking happens when slots are allocated manually or concurrently
- Doctors and nurses do not share a single operational view of the day
- Post-visit communication, prescriptions, and follow-up reminders are inconsistent
- Billing, reporting, staffing, and department configuration are fragmented

HMS addresses these gaps with a single system that spans patient-facing access, clinical operations, finance, and administration.

## 4. Vision

Deliver a single hospital operating system where a patient can discover a suitable doctor, book a visit without an account, receive timely automated communication, and move through an internal care workflow supported by clear staff dashboards, safe scheduling logic, and centralized administration.

## 5. Goals

### 5.1 Business Goals

- Increase successful self-service appointment booking from public users
- Reduce front-desk scheduling overhead and avoid slot collisions
- Improve operational visibility for doctors, nurses, accountants, and admins
- Standardize patient communication before and after visits
- Support a release-ready demo or pilot that can be extended into production-grade deployment

### 5.2 Product Goals

- Let guests book appointments without authentication
- Use AI to recommend visit duration and reserve the required number of time slots
- Provide clear role-based dashboards for daily hospital workflows
- Automatically send confirmation, prescription, and follow-up reminder emails
- Expose real-time hospital and availability information through a safe chatbot

### 5.3 User Experience Goals

- Keep the booking flow understandable on mobile and desktop
- Show clear validation and error messaging at every critical step
- Preserve entered data when users hit recoverable errors such as slot conflicts
- Keep staff workflows fast enough for live clinic operations

## 6. Non-Goals

The current documented scope does not include:

- Patient accounts, patient login, or a patient portal
- Online payment processing
- Self-service appointment cancellation or rescheduling by patients
- Medical diagnosis or treatment advice by the chatbot
- Telemedicine or video consultation
- Native mobile apps
- Full production infra beyond the documented Docker Compose demo/pilot target

## 7. Target Users

| User | Access model | Primary needs |
| --- | --- | --- |
| Patient / family member | Guest, no login | Discover doctors, book appointments, receive confirmation and visit results |
| Doctor | Authenticated staff | View schedule, review patient details, record diagnosis, prescribe medication, schedule follow-up |
| Nurse | Authenticated staff | Check in patients, manage queue, enter vital signs, monitor room status |
| Accountant | Authenticated staff | Collect payments, manage invoices, review revenue, configure pricing |
| Admin | Authenticated staff | Manage staff, departments, doctor schedules, slots, system monitoring, homepage content |

## 8. Core Product Principles

- Guest-first booking: patients should not need an account to secure an appointment
- Safe scheduling over speed: concurrency and slot integrity are more important than optimistic UX shortcuts
- Role clarity: each staff role sees the tools needed for its workflow and no more
- Automation where it matters: confirmations, prescription delivery, and reminders should not depend on manual follow-up
- Read-only AI assistance: AI can support scheduling and information access, but must not make medical decisions or modify operational data autonomously

## 9. Scope Overview

### 9.1 Public Experience

- Hospital home page
- Department listing and department detail pages
- Doctor directory and doctor profile pages
- Four-step booking flow
- Booking success confirmation page
- News and announcement area
- Floating chatbot on public pages

### 9.2 Clinical Operations

- Doctor dashboard and appointment calendar
- Appointment detail and status management
- Medical records entry
- Prescription authoring and PDF generation
- Follow-up appointment creation
- Patient history search
- Nurse check-in, queue, vital signs, and room status workflows

### 9.3 Financial Operations

- Invoice generation and management
- Payment recording
- Revenue dashboards and filtered reports
- Service pricing configuration

### 9.4 Administration

- Staff management with role assignment and activation status
- Department management
- Doctor working schedule configuration
- Automatic slot generation
- System stats and audit log visibility
- Homepage content management

## 10. Key User Journeys

### 10.1 Patient Booking Journey

1. User lands on the public site and discovers a department or doctor.
2. User opens the booking flow and selects a department and doctor.
3. User enters symptoms and requests AI analysis.
4. System returns estimated visit duration: 30, 45, 60, or 90 minutes.
5. User selects a date and an eligible starting slot.
6. User enters patient information, optionally adds family-member details, and reviews a confirmation summary.
7. System creates the appointment, blocks the required slots transactionally, and sends a confirmation email.
8. User lands on a success page with a confirmation code and email reminder prompt.

### 10.2 Doctor Care Completion Journey

1. Doctor logs in and opens the schedule dashboard.
2. Doctor reviews today's appointments and appointment detail.
3. Doctor starts the consultation and updates appointment status.
4. Doctor enters diagnosis, notes, vital signs, and prescription items.
5. Doctor previews the prescription PDF and confirms completion.
6. System stores the medical record, generates the PDF, marks the appointment complete, and emails the patient.
7. If needed, doctor schedules a follow-up slot and triggers reminder automation.

### 10.3 Nurse Operations Journey

1. Nurse opens the day's appointment list.
2. Nurse searches for the patient and confirms arrival.
3. System changes the status to checked in and places the patient into the live queue.
4. Nurse records vital signs and updates room status as needed.
5. Nurse calls the patient into the exam room when the doctor is ready.

### 10.4 Accountant Billing Journey

1. Accountant opens invoice management.
2. Accountant filters invoices by date, department, and status.
3. Accountant records payment method and payment completion.
4. Accountant reviews revenue trends and exports detailed reports.

### 10.5 Admin Configuration Journey

1. Admin manages staff accounts and department assignments.
2. Admin configures doctor working schedules and special closures.
3. Admin generates appointment slots.
4. Admin monitors system stats and audit logs.
5. Admin updates homepage content blocks such as banners or announcements.

### 10.6 Chatbot Assistance Journey

1. Public user opens the floating chatbot.
2. User asks about hospital hours, departments, doctors, or availability.
3. System queries approved read-only data and combines it with a constrained AI prompt.
4. Chatbot responds in Vietnamese and can guide the user into booking.
5. Chatbot politely refuses medical diagnosis and appointment modification requests.

## 11. Functional Requirements

### 11.1 Public Website

- The system must present hospital overview information including address, hotline, working hours, and map.
- The system must display departments with images, short descriptions, and links to detail pages.
- The system must display featured doctors and individual doctor profiles with specialty, qualifications, experience, and weekly schedule.
- The system must expose clear calls to action that route users into booking with optional department or doctor preselection.
- The public site should support hospital news and announcements.

### 11.2 Appointment Booking

- Booking must be available to unauthenticated users.
- The booking flow must be structured into four steps: provider selection, symptom entry, slot selection, patient details and confirmation.
- The system must require patient full name, CCCD, phone number, email, date of birth, gender, and address.
- The system must support optional collection of occupation, blood type, medical history, allergies, and insurance number.
- The system must support booking for a family member with relationship metadata.
- The system must preserve entered information when the user encounters a recoverable error.

### 11.3 AI-Assisted Slot Allocation

- The system must send department and symptom text to an AI service for duration estimation.
- The AI output must map to one of four durations: 30, 45, 60, or 90 minutes.
- The system must block the corresponding number of consecutive 30-minute slots.
- The booking transaction must prevent double-booking under concurrency.
- If AI analysis fails or times out, the system must fall back to a default 30-minute duration and notify the user gracefully.

### 11.4 Email Automation

- The system must send booking confirmation emails immediately after successful appointment creation.
- The system must send visit result emails with prescription PDF attachment after doctor completion.
- The system must send follow-up reminder emails one day before the scheduled follow-up at 08:00.
- Email content must include hospital, doctor, department, and appointment context relevant to the event.

### 11.5 Doctor Workflow

- Doctors must see schedule summary counts for today, waiting, in progress, and completed appointments.
- Doctors must be able to view day and week schedule layouts.
- Doctors must be able to open appointment detail including patient information, symptoms, AI estimate, and history.
- Doctors must be able to transition appointment status through the documented workflow.
- Doctors must be able to create medical records with diagnosis, clinical notes, vital signs, and multiple prescription items.
- Doctors must be able to preview prescription output before confirming.
- Doctors must be able to create follow-up appointments and access patient history by CCCD or name.

### 11.6 Nurse Workflow

- Nurses must be able to view all appointments for the day and search by patient name, CCCD, or confirmation code.
- Nurses must be able to check in a patient and capture actual arrival time.
- Nurses must be able to record vital signs before consultation.
- Nurses must be able to monitor and manage a real-time queue.
- Nurses must be able to update room status and call patients into consultation.

### 11.7 Accountant Workflow

- Accountants must be able to view invoices with filters and pagination.
- The system must support invoice states for pending, paid, and cancelled.
- Accountants must be able to record cash and bank-transfer payments.
- Accountants must be able to review daily and monthly revenue reports.
- Accountants must be able to export detailed financial reports to PDF or Excel.
- Accountants must be able to manage service pricing with effective dates.

### 11.8 Admin Workflow

- Admins must be able to create, edit, disable, and soft-delete staff accounts.
- Admins must be able to manage departments and assign doctors to departments.
- Admins must be able to configure default hospital working hours and doctor-specific schedules.
- Admins must be able to define holidays, leave periods, and slot generation rules.
- Admins must be able to access system overview metrics and audit logs.
- Admins must be able to manage selected homepage content elements.

### 11.9 Chatbot

- The chatbot must answer questions about hospital information, departments, doctor availability, and booking guidance.
- The chatbot must use real-time system data for availability-related answers.
- The chatbot must be read-only and must not mutate appointments, patient records, or schedules.
- The chatbot must refuse diagnosis, treatment advice, or access to private patient data.

## 12. Business Rules and Constraints

- Staff access is restricted to four roles: doctor, nurse, accountant, and admin.
- Staff authentication uses JWT with short-lived access tokens and longer-lived refresh tokens.
- Patient email is mandatory because confirmation and prescription delivery depend on it.
- CCCD is required for patient identity and history lookup and must be validated as a 12-digit field.
- Base slot duration is 30 minutes; longer visits consume multiple contiguous slots.
- Appointment status progression is controlled and role-dependent.
- Follow-up reminders must be sent once only.
- Service pricing changes must preserve pricing history through effective dates.
- Sensitive patient and staff data must not be exposed through public pages or chatbot responses.

## 13. UX Requirements

- The booking flow must be mobile-friendly and usable without training.
- Public navigation must clearly separate hospital information, doctors, departments, and booking.
- The booking experience must provide a visible four-step progress indicator.
- Validation errors must be specific and shown inline.
- Loading, empty, error, and offline states must be handled explicitly.
- Dashboard layouts must adapt across mobile, tablet, and desktop breakpoints.
- Accessibility should align with WCAG 2.1 AA guidance, including contrast, focus states, ARIA labeling, and keyboard support.

## 14. Non-Functional Requirements

### 14.1 Security

- Role-based authorization must block access to unauthorized staff endpoints.
- Input validation must be enforced on all system boundaries.
- Common web risks such as SQL injection and XSS must be mitigated.
- Passwords must be hashed and transport must use HTTPS in production-like environments.
- Sensitive personal data such as CCCD must be protected at rest and excluded from logs where possible.

### 14.2 Performance

- Public pages should reach first contentful paint in under 3 seconds.
- Standard API responses should return in under 500 ms for common operations.
- Slot booking must remain safe under concurrent requests.
- Performance testing must verify race-condition resistance and acceptable p95 latency under load.

### 14.3 Reliability

- Email and AI integrations must fail gracefully.
- AI analysis timeout should not block booking entirely.
- Reminder jobs must avoid duplicate sends.
- The system should support deterministic local setup through Docker Compose and seeded data.

### 14.4 Maintainability

- The system should remain modular enough to add future capabilities such as online payments, mobile apps, or telemedicine.
- Database schema evolution must be versioned through Flyway migrations.
- APIs should remain RESTful and documented.

## 15. Success Metrics

### 15.1 Product Metrics

- Patients can complete a booking end to end without staff intervention.
- Confirmation emails are sent successfully for completed bookings.
- Prescription-result emails are sent successfully after completed consultations.
- Follow-up reminders are sent on schedule without duplication.
- Staff can complete day-of-visit workflows without leaving the system.

### 15.2 Operational Metrics

- Zero successful double-bookings under concurrent booking tests
- Standard API p95 under 500 ms for common flows
- Public page FCP under 3 seconds
- Queue and schedule views refresh reliably during working hours

### 15.3 Quality Gates

- Core unit, integration, E2E, and performance scenarios pass
- Role-based access checks reject missing, invalid, and wrong-role access
- Critical flows work in the documented Docker Compose environment

## 16. Release Scope by Phase

| Phase | Focus | Outcome |
| --- | --- | --- |
| Phase 1 | Foundation | Auth, RBAC, schema, CRUD baseline, dashboard shell |
| Phase 2 | Booking + AI | Public pages, booking flow, AI duration estimate, confirmation email |
| Phase 3 | Staff Dashboards | Doctor schedule, nurse check-in, queue, room workflows |
| Phase 4 | Medical Records + Email | Diagnosis capture, prescription PDF, result email, follow-up reminder job |
| Phase 5 | Accounting + Admin | Invoices, revenue reporting, pricing, admin management and stats |
| Phase 6 | Chatbot + Polish | Public chatbot, UX polish, E2E coverage, documentation completion |

## 17. External Dependencies

- AI provider for symptom-duration estimation and chatbot responses
- Gmail API with OAuth2 for transactional email delivery
- PostgreSQL as the system of record
- PDF generation capability for prescriptions and billing/report exports
- Containerized local runtime for demo and pilot environments

## 18. Risks

| Risk | Why it matters | Mitigation direction |
| --- | --- | --- |
| Concurrent booking conflicts | Double-booking breaks trust and clinic operations | Transactional slot locking and concurrency testing |
| AI timeout or malformed output | Booking duration estimate can fail | Timeout, retry, and default 30-minute fallback |
| Gmail token or auth failure | Critical patient communication may fail | OAuth2 validation, alerting, mock mode for non-prod |
| PDF font/rendering issues for Vietnamese text | Prescription output becomes unreadable | Font embedding and preview verification |
| Sensitive data exposure | High legal and trust impact | Encryption, RBAC, audit logging, no PII in logs |
| Scope creep | Delivery slips across a six-phase plan | Keep release scope explicit and defer backlog items |

## 19. Future Opportunities

- Patient self-service portal
- Appointment cancellation and rescheduling workflows
- Online payments
- Mobile app support
- Telemedicine
- Deeper analytics and operational forecasting
- Broader integrations with LIS, RIS, or insurance systems

## 20. Acceptance Summary

The product is considered ready for the documented release scope when:

- Public users can book appointments successfully with AI-assisted duration handling
- Doctors, nurses, accountants, and admins can complete their core workflows in role-specific dashboards
- Email confirmations, visit-result emails, and follow-up reminders work end to end
- Chatbot answers supported hospital and scheduling questions without exposing private data or giving medical advice
- Concurrency, access control, and core E2E flows pass validation in the target environment

