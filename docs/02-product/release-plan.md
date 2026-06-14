# Hospital Management System Project Plan

Status: updated to reflect the current repository on 2026-04-26 after AI and internal assistant removal.

Architecture diagrams: [HMS_ArchitectureDiagrams.html](HMS_ArchitectureDiagrams.html)
Documentation map: [README.md](README.md)

## 1. Objective

The project already contains a substantial backend platform.
The next major milestone is to turn that backend into a coherent frontend product without designing flows that the current APIs do not support.

## 2. Current Delivery Snapshot

| Area | Status | Notes |
| --- | --- | --- |
| Backend architecture | Done | Spring Boot DDD-oriented multi-module backend is in place: `domain`, `infrastructure`, `application`, `controller`, `start` |
| Core clinical APIs | Done | appointments, medical records, follow-up, PDFs, queue, vital signs |
| Finance APIs | Done | invoices, payments, pricing, revenue reports |
| Inventory APIs | Done | items, lots, movements, alerts |
| Patient portal APIs | Partially done | auth, overview, appointments, lab results, messages list, profile |
| Public chatbot | Done | deterministic helper for departments, doctors, and slots |
| Frontend application | In progress | canonical Next.js app exists in `frontend/`; selected auth, RBAC, API-client, queue, inventory, monitoring, audit, and portal flows are backend-integrated |
| Frontend tests | In progress | Playwright covers route smoke, auth/API flows, RBAC, responsive, visual, operations API screens, and staff queue behavior |
| Dockerized frontend | Done | `frontend/Dockerfile` and the active Compose `frontend` service build the canonical Next.js app |

## 2.1 Current-Vs-Planned Status Legend

| Status | Meaning |
| --- | --- |
| Done | Implemented in the current repository |
| In progress | Partially implemented or implemented for selected flows only |
| Planned | Future work, not part of the current documentation-only pass |
| Removed | Historical behavior that must not be treated as active |

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

### Phase 5: Patient portal completion

Screens:

- Claim access
- Patient login
- Patient overview
- Patient appointments
- Patient lab results
- Patient messages
- Patient profile

API dependencies:

- patient-auth
- patient-portal

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

## 5. Known Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Designing beyond current APIs | Rework during implementation | Keep design anchored to DTOs and controllers |
| Treating patient messages as two-way chat | Missing backend capability | Mark compose/reply as future scope only |
| Assuming a separate nurse room board exists | Workflow mismatch | Keep nurse workflow centered on queue, check-in, and audited queue room assignment |
| Reintroducing removed AI/assistant concepts in UI copy | Confusing UX | Keep chatbot framed as a scoped hospital helper only |
| Treating static frontend screens as production-ready | Planning errors | Explicitly plan backend data integration before production use |

## 6. Definition Of Done For Frontend Delivery

- all implemented backend modules have designed screens
- route map covers guest, patient, doctor, nurse, accountant, and admin
- every designed action is backed by a current API or clearly marked future scope
- auth refresh behavior is designed for both staff and patient sessions
- responsive rules are defined for public and patient experiences
