# Product Model and Glossary

## Product Summary
The HMS repo models a hospital platform with public discovery and booking, staff clinical workflows, patient self-service, finance and operations management, and an internal clinical assistant that combines patient context with approved internal documents.

## Actors

| Actor | Repo Role | Main Responsibilities | Main Surfaces |
| --- | --- | --- | --- |
| Guest | none | Browse public content, doctors, departments, use chatbot, start booking | `/content/home`, `/news`, `/doctors`, `/departments`, `/chatbot/messages`, `/appointments`, `/ai/analyze-symptoms` |
| Patient | `PATIENT` | Claim/login, read portal overview, appointments, lab results, messages, profile | `/patient-auth/*`, `/patient-portal/*` |
| Doctor | `DOCTOR` | Review schedule, manage appointment status, create records, view history, use assistant in patient/docs/hybrid modes | `/me/schedule`, `/appointments/*`, `/medical-records/*`, `/patients/{cccd}/history`, `/internal-assistant/*` |
| Nurse | `NURSE` | Queue view, check-in, vital signs, lab support, patient-scoped assistant access | `/appointments/today`, `/appointments/{id}/checkin`, `/queue/today`, `/vital-signs`, `/lab-results`, `/internal-assistant/*` |
| Accountant | `ACCOUNTANT` | Inventory, invoices, pricing, revenue, audit logs | `/inventory/*`, `/invoices/*`, `/pricing/*`, `/reports/revenue/*`, `/admin/audit-logs` |
| Admin | `ADMIN` | Users, departments, rooms, templates, closures, monitoring, content, knowledge docs | `/admin/*`, finance/inventory endpoints, internal assistant docs mode only |

## Bounded Contexts

| Context | Purpose | Main Packages |
| --- | --- | --- |
| Auth | Staff JWT login, refresh, logout | `backend/api/auth`, `backend/shared/auth` |
| Patient Auth | Patient claim, patient login, patient refresh | `backend/api/patientauth`, `backend/core/patientauth`, `backend/shared/patientauth` |
| Public Discovery | Public content, doctors, departments, news | `backend/api/content`, `backend/api/doctor`, `backend/api/department`, `backend/core/content`, `backend/core/doctor`, `backend/core/department` |
| Booking Intake | Slot discovery, symptom triage, appointment creation | `backend/api/ai`, `backend/api/appointment`, `backend/core/ai`, `backend/core/appointment`, `backend/shared/booking` |
| Clinical Workflow | Queue, check-in, schedule, records, prescriptions, labs, patient history | `backend/api/{appointment,queue,schedule,medicalrecord,lab,patient,vitalsigns}`, `backend/core/{appointment,medicalrecord,prescription,lab,vitalsigns}` |
| Patient Portal | Portal overview, messages, lab results, profile | `backend/api/patientportal`, `backend/core/patientportal`, `backend/shared/patientportal` |
| Inventory | Items, lots, movements, stock status | `backend/api/inventory`, `backend/core/inventory`, `backend/shared/inventory` |
| Finance | Invoices, payments, pricing, daily and monthly revenue | `backend/api/invoice`, `backend/core/invoice`, `backend/shared/finance` |
| Admin Operations | Users, departments, rooms, schedule templates, closures, monitoring, audit | `backend/api/admin`, `backend/core/admin`, `backend/core/audit`, `backend/shared/admin` |
| Public Assistant | Heuristic chatbot and symptom analysis | `backend/api/{chatbot,ai}`, `backend/core/{chatbot,ai}` |
| Internal Assistant | Sessioned staff assistant using patient evidence and approved knowledge docs | `backend/api/internalassistant`, `backend/core/internalassistant`, `backend/core/internalassistant/knowledge`, `backend/shared/internalassistant` |

## Source-of-Truth Rules
- Runtime and authorization truth:
  - controllers under `backend/api`
  - services and repositories under `backend/core`
  - DTOs and enums under `backend/shared`
- API standards truth:
  - `API_CONTRACT.md`
- Endpoint inventory truth:
  - `docs/API_ENDPOINTS_COMPREHENSIVE.md`
- Product and UX intent:
  - `docs/HMS_PRD.md`
  - `docs/HMS_SRS.md`
  - `docs/HMS_FrontendDesignBrief.md`
- Migration truth:
  - `backend/api/src/main/resources/db/migration/V1...V10`
- Executable spec truth:
  - integration and unit tests that still compile

## Important Terms
- `CCCD`: Vietnamese national ID field used to identify patients. In the current code path it is encrypted for storage and hashed for equality lookup.
- `First slot`: the first booked `time_slots` row that anchors an appointment. Multi-slot bookings are expanded by `AppointmentWriteService.lockWindow(...)`.
- `Refresh cookie`: HttpOnly cookie written by auth controllers. Staff and patient cookies use different names and different paths.
- `Public rate limit`: minute-based POST limiter for login, refresh, AI triage, booking, chatbot, and internal assistant traffic.
- `Patient context`: the subset of patient data a doctor or nurse is allowed to see in the internal assistant based on role, assignment, and queue state.
- `Knowledge document`: admin-managed internal document that can be uploaded, ingested, activated, revoked, and used by the internal assistant in docs mode.
- `Follow-up`: stored separately from appointments as a `FollowUpEntity`, and reminder planning is triggered when a medical record is created.

## Repo-Level Defaults
- Backend-first learning order.
- GitNexus-first navigation, source code last-mile verification.
- Personal notes go under `history/` rather than new top-level docs.
- Frontend is not a runtime anchor yet; treat it as an integration plan.
