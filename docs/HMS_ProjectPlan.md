# Hospital Management System Project Plan

Status: updated to reflect the current repository on 2026-04-16

## 1. Objective

The project already contains a substantial backend platform.
The next major milestone is to turn that backend into a coherent frontend product without designing flows that the current APIs do not support.

## 2. Current Delivery Snapshot

| Area | Status | Notes |
| --- | --- | --- |
| Backend architecture | Done | Spring Boot multi-module backend is in place |
| Core clinical APIs | Done | appointments, medical records, follow-up, PDFs, queue, vital signs |
| Finance APIs | Done | invoices, payments, pricing, revenue reports |
| Inventory APIs | Done | items, lots, movements |
| Patient portal APIs | Partially done | auth, overview, appointments, lab results, messages list, profile |
| Internal assistant APIs | Done for v1 | sessions/current, messages, feedback, monitoring, knowledge docs |
| Public chatbot | Done | deterministic helper for departments, doctors, and slots |
| Frontend application | Not done | only starter Vite scaffold exists |
| Frontend tests | Not done | no UI test suite yet |

## 3. Recommended Frontend Delivery Phases

### Phase 1: Design system and information architecture

Deliverables:

- visual language for public, portal, and staff surfaces
- route map for all role areas
- component inventory
- form patterns
- status and badge system
- empty, loading, and error states

Dependencies:

- `HMS_PRD.md`
- `HMS_SRS.md`
- `HMS_TDD.md`

### Phase 2: Public site and booking

Screens:

- Home
- Departments
- Department detail
- Doctors
- Doctor detail
- Booking wizard
- Booking success
- Chatbot widget

API dependencies:

- content
- news
- departments
- doctors
- slots
- ai
- appointments

### Phase 3: Staff auth and clinical workflows

Screens:

- Staff login
- Doctor dashboard
- Appointment list and detail
- Medical record editor
- Prescription PDF preview flow
- Nurse intake and queue board
- Vital signs capture

API dependencies:

- auth
- appointments
- queue
- medical records
- patient records
- vital signs
- follow-up

### Phase 4: Finance and admin operations

Screens:

- Invoice list/detail
- Payment action flow
- Pricing management
- Revenue dashboard
- User management
- Department management
- Room management
- Schedule templates
- Closures
- Slot generation
- Content and news admin
- Monitoring and audit

API dependencies:

- invoices
- pricing
- revenue reports
- admin users
- admin departments
- admin rooms
- admin schedule templates
- admin special closures
- admin slots
- admin stats
- admin monitoring
- admin audit logs
- admin content
- admin news

### Phase 5: Patient portal and internal assistant

Screens:

- Claim access
- Patient login
- Patient overview
- Patient appointments
- Patient lab results
- Patient messages
- Patient profile
- Assistant panel
- Knowledge document manager

API dependencies:

- patient-auth
- patient-portal
- internal-assistant
- admin knowledge documents
- admin internal assistant monitoring

## 4. Design Workstreams

### 4.1 Public experience

- trust-building healthcare brand language
- mobile-first layout
- clear booking CTA hierarchy

### 4.2 Clinical operations

- dense desktop layouts
- quick scan tables and side panels
- low-friction editing for forms with medical data

### 4.3 Finance and admin

- configurable tables
- audit-friendly status visibility
- low-risk destructive action patterns

### 4.4 Assistant experience

- citation-first answer presentation
- patient context indicator
- mode selector with strong guardrails
- refusal and insufficent-evidence states

## 5. Known Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Designing beyond current APIs | Rework during implementation | Keep design anchored to DTOs and controllers |
| Treating patient messages as two-way chat | Missing backend capability | Mark compose/reply as future scope only |
| Assuming nurse room board exists | Workflow mismatch | Keep nurse workflow centered on queue and check-in |
| Mixing public chatbot and internal assistant behavior | Confusing UX | Separate lightweight public helper from clinical assistant |
| Treating frontend scaffold as production-ready | Planning errors | Explicitly plan frontend architecture as net-new work |

## 6. Definition Of Done For Frontend Delivery

- all implemented backend modules have designed screens
- route map covers guest, patient, doctor, nurse, accountant, and admin
- every designed action is backed by a current API or clearly marked future scope
- auth refresh behavior is designed for both staff and patient sessions
- assistant UX includes citations, suggestions, refusals, and patient-context guardrails
- responsive rules are defined for public and patient experiences
