# Test Truth Map

This file treats tests as executable specs, but separates proven behavior from gaps and current baseline debt.

## Current Baseline

| Check | Status | Meaning |
| --- | --- | --- |
| `mvn test` in `backend/` | Red | test compilation currently fails before the full suite can run |
| `backend/core/src/test/java/com/hospital/core/vitalsigns/VitalSignsServiceTest.java` | Red | this is the immediate blocker for backend test baseline |
| `npm run build` in `frontend/` | Red | frontend workspace does not compile cleanly under current TS config |

## What The Green Tests Are Trying To Prove

| Test file | Main behavior verified | Trust level |
| --- | --- | --- |
| `backend/api/src/test/java/com/hospital/api/ClinicalWorkflowIntegrationTest.java` | public booking, nurse check-in, doctor schedule, medical-record completion, patient history, security edge cases in clinical flow | High for the covered happy-path and role-negative workflow |
| `backend/api/src/test/java/com/hospital/api/InternalAssistantIntegrationTest.java` | patient-scoped assistant, admin docs mode, feedback, knowledge document activate/revoke behavior | High for assistant authorization and lifecycle behavior |
| `backend/api/src/test/java/com/hospital/api/SecurityHardeningIntegrationTest.java` | unauthorized/malformed/expired token handling, wrong-role rejection, validation envelopes, CORS behavior | High for authn/authz and error-envelope expectations |
| `backend/core/src/test/java/com/hospital/core/appointment/AppointmentWriteServiceTest.java` | slot locking and contiguous booking window behavior | Medium-high |
| `backend/core/src/test/java/com/hospital/core/appointment/AppointmentWorkflowServiceTest.java` | list, filter, cancel, check-in, follow-up, and appointment-bound vital signs | Medium-high |
| `backend/core/src/test/java/com/hospital/core/medicalrecord/MedicalRecordServiceTest.java` | duplicate record protection, appointment finalization, history ordering, PDF preview/download auth | High |
| `backend/core/src/test/java/com/hospital/core/inventory/InventoryWriteServiceTest.java` | item, lot, and movement write logic | Medium-high |
| `backend/core/src/test/java/com/hospital/core/internalassistant/InternalAssistantServiceTest.java` | assistant refusal logic and patient-scope authorization | Medium-high |
| `backend/core/src/test/java/com/hospital/core/ai/AiAnalysisServiceTest.java` | AI analysis behavior and fallback expectations | Medium |
| `backend/core/src/test/java/com/hospital/core/lab/LabResultServiceTest.java` | lab create/read/delete service behavior | Medium |
| `backend/core/src/test/java/com/hospital/core/prescription/PrescriptionPdfServiceTest.java` | PDF generation formatting and output assumptions | Medium |
| `backend/core/src/test/java/com/hospital/core/scheduler/ReminderServiceTest.java` | reminder scheduling behavior | Medium |

## What Is Verified By Tests Today
- Public booking can create an appointment when request validation passes.
- Nurse and doctor routes enforce role boundaries.
- Doctors can only access their own appointment detail and prescription surfaces.
- The medical-record completion flow can take a checked-in/in-progress appointment to `DONE`.
- Patient history can be retrieved by doctor using patient CCCD.
- Assistant patient mode is scoped by doctor ownership and nurse queue state.
- Admin assistant docs mode is allowed and audited.
- Knowledge document activate/revoke changes assistant retrieval behavior.
- Security errors use structured envelopes rather than raw framework exceptions.
- Inventory write logic mutates both event tables and current item quantity.

## What Is Described In Docs/Code But Not Strongly Proven By Current Tests
- Public content fallback behavior from `PublicContentService`
- Doctor and department discovery read surfaces
- Patient portal detail surfaces as a standalone integration flow
- Full finance lifecycle end to end, including pricing changes and revenue reports
- Admin operations such as rooms, closures, schedule templates, public content CRUD, and audit-log filters
- Gmail and Gemini behavior against real upstream services
- Runtime existence of the `appointment_vital_signs` table

## What Is Currently Blocked By Baseline Debt
- Full backend test confidence because `mvn test` stops at `VitalSignsServiceTest`
- Frontend build confidence because the TS config still fails
- Runtime confidence on Docker-backed flows because Docker was unavailable in this environment

## Test-Specific Caveats
- `ClinicalWorkflowIntegrationTest` and `InternalAssistantIntegrationTest` rely on Testcontainers and the seeded data model, so they are excellent flow references even before runtime bring-up works locally.
- `VitalSignsServiceTest` no longer matches the entity type definitions, which makes it useful as a starter repair task.
- There is stronger coverage around clinical and assistant logic than around finance, admin ops, and public content.

## Suggested Reading Order For Tests
1. `ClinicalWorkflowIntegrationTest`
2. `SecurityHardeningIntegrationTest`
3. `InternalAssistantIntegrationTest`
4. `AppointmentWriteServiceTest`
5. `AppointmentWorkflowServiceTest`
6. `MedicalRecordServiceTest`
7. `InventoryWriteServiceTest`
8. `InternalAssistantServiceTest`
9. everything else as reinforcing detail

## Working Rule For An Intern
- If a behavior is covered by a passing integration test and matches controller/service code, trust it first.
- If a behavior exists only in docs and thin code coverage, verify it manually or with GitNexus before using it as a design assumption.
- If a behavior sits behind a red baseline, treat it as unresolved until repaired or runtime-verified.
