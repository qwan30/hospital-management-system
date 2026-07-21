# Patient Record Treatment-Scope Implementation Plan

> **For agentic workers:** Use subagent-driven development, strict TDD, and independent spec plus code-quality review. This repository uses a normal branch; do not create a Git worktree.

**Goal:** Prevent doctors from searching or reading patient-record PHI unless an appointment establishes a treatment relationship, while preserving documented global admin access and enforcing the same rule on AI patient endpoints.

**Architecture:** Pass the authenticated staff UUID and role from controllers into `PatientRecordService`. Admin requests keep the current global query. Doctor searches use one additive database query restricted by doctor appointment ownership, and doctor detail reads use a status-filtered, pessimistic-read care-relationship query. AI search, snapshot, timeline, and permissions bind authorization to the current JWT actor rather than a request-supplied identity.

**Policy boundary:** A doctor treatment relationship requires an appointment in `CHECKED_IN`, `IN_PROGRESS`, or `DONE`; merely pending, confirmed/future, or cancelled bookings do not unlock PHI. Care-team delegation, break-glass, and any future expiry policy are not modeled and remain explicit release-policy blockers.

## Constraints

- Preserve unrelated dirty/untracked files and all existing repository contracts.
- `PatientRepository` is HIGH blast radius (23 upstream, 15 direct); changes must be additive only.
- `AppointmentRepository` is HIGH blast radius (44 upstream, 24 direct); add only a dedicated status-filtered, locked read query and preserve existing contracts.
- Do not expose whether an unrelated patient exists; return the standard forbidden response after authentication.
- Do not broaden patient, nurse, receptionist, pharmacist, or accountant permissions.

## Task 2: Enforce patient-record and AI treatment scope

**Files:**

- Create: `backend/application/src/test/java/com/hospital/core/patientrecord/PatientRecordServiceTest.java`
- Create: `backend/start/src/test/java/com/hospital/api/PatientRecordAuthorizationIntegrationTest.java`
- Modify: `backend/domain/src/main/java/com/hospital/core/patient/PatientRepository.java`
- Modify: `backend/application/src/main/java/com/hospital/core/patientrecord/PatientRecordService.java`
- Modify: `backend/controller/src/main/java/com/hospital/api/patientrecord/PatientRecordController.java`
- Modify: `backend/controller/src/main/java/com/hospital/api/ai/AiIntegrationController.java`
- Modify tests only as required by signature changes.

- [x] Write service tests proving related doctor allow, unrelated doctor deny, admin allow, and doctor search uses only the scoped repository query.
- [x] Add real PostgreSQL/MockMvc tests proving Doctor A cannot search or detail Doctor B's patient, while Doctor B and Admin can.
- [x] Add AI parity tests for search, snapshot, timeline, and permissions using the authenticated actor.
- [x] Run focused tests and record genuine RED failures against current production code.
- [x] Add one doctor-scoped `PatientRepository` query supporting blank/text/exact-CCCD-hash searches with a 20-row limit.
- [x] Pass actor UUID/role into patient-record service methods and enforce the relationship before PHI assembly.
- [x] Bind AI endpoints to `Authentication`; reject caller-controlled authorization identity mismatches.
- [x] Hold the status-filtered care read lock across AI PHI assembly and audit each returned patient entity.
- [x] Run focused unit, repository, controller, and integration tests; then clean full module verify (`439` tests, `0` failures/errors/skips).
- [x] Run GitNexus `detect-changes`, secret/whitespace checks, and independent spec/security/code-quality review.
