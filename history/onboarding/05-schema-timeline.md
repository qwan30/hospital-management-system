# Schema Timeline

## Migration Timeline

| Migration | Observed schema changes | Enabled capabilities | Main code surfaces |
| --- | --- | --- | --- |
| `V1__Create_initial_schema.sql` | core departments, users, time slots, patients, family members, appointments, medical records, prescription items, invoices, service pricing, audit logs | initial booking, clinical record, billing, and audit foundation | `appointment`, `medicalrecord`, `invoice`, `admin`, `audit` |
| `V2__Add_clinical_workflow_columns.sql` | `appointments.checked_in_at`; medical-record clinical notes and vital fields; richer prescription items | queue/check-in flow, richer clinical notes, ordered prescriptions | `AppointmentWorkflowService`, `MedicalRecordService`, PDF generation |
| `V3__Add_patient_email_and_follow_up_schedule.sql` | patient email becomes required; reminder scheduling timestamps added to medical records | email confirmations and follow-up reminder scheduling | `AppointmentWriteService`, `EmailService`, `ReminderService` |
| `V4__Expand_patient_identifier_and_security.sql` | patient `cccd` widened to text, unique constraint removed, `cccd_hash` added with unique index | encrypted identifier storage plus hashed lookup | `PatientIdentifierProtector`, `PatientAuthService`, `MedicalRecordService` |
| `V5__Expand_srs_booking_and_operations_foundation.sql` | patient demographics and address fields; booking-contact fields on appointments; content/news; rooms; doctor work schedules | richer booking intake, public content management, room and schedule foundations | `AppointmentCreateRequest`, `AppointmentWriteService`, `PublicContentService`, `OperationsAdminService` |
| `V6__Add_room_schedule_closure_operational_flags.sql` | active flags for rooms and schedules; titles and active flags for closures | operational toggles for rooms, schedules, and closures | `OperationsAdminService`, admin monitoring and closures |
| `V7__Add_inventory_management_tables.sql` | inventory items, lots, movements with indexes | inventory module | `InventoryService`, `InventoryWriteService` |
| `V8__Add_patient_portal_tables.sql` | patient accounts, portal-style lab results, message threads, messages | patient portal and patient login | `PatientAuthService`, `PatientPortalService`, `InternalAssistantService` |
| `V9__Add_internal_assistant_knowledge_tables.sql` | vector extension; knowledge documents/chunks/nodes/edges; ingestion states | internal assistant knowledge corpus and retrieval foundation | `KnowledgeAdminService`, `InternalAssistantService`, ingestion services |
| `V10__Implement_internal_assistant_v1_safe_rollout.sql` | document lifecycle metadata, document ingestions, assistant sessions, assistant messages, assistant feedback | productionized assistant with sessions, feedback, document lifecycle, admin ops | `InternalAssistantConversationService`, `InternalAssistantMetricsService`, `AdminKnowledgeDocumentController` |

## Domain-to-Table Map

| Domain | Key tables |
| --- | --- |
| Auth | `users` |
| Patient auth | `patient_accounts`, `patients` |
| Booking | `appointments`, `time_slots`, `patients` |
| Clinical record | `medical_records`, `prescription_items` |
| Finance | `invoices`, `service_pricing` |
| Admin ops | `departments`, `rooms`, `doctor_work_schedules`, `special_closures`, `audit_logs` |
| Public content | `hospital_content_sections`, `news_articles` |
| Inventory | `inventory_items`, `inventory_lots`, `inventory_movements` |
| Patient portal | `patient_accounts`, `lab_results`, `patient_message_threads`, `patient_messages` |
| Internal assistant | `knowledge_documents`, `knowledge_chunks`, `knowledge_nodes`, `knowledge_edges`, `knowledge_document_ingestions`, `internal_assistant_sessions`, `internal_assistant_messages`, `internal_assistant_feedback` |

## Cross-Checks Against Code
- `patients`
  - current code no longer treats `cccd` as plain unique business key
  - `PatientIdentifierProtector` encrypts the stored value and hashes the lookup value
- `appointments`
  - still central to public booking, nurse queue, doctor schedule, finance, and assistant patient scoping
  - booking-contact fields added in `V5` align with `AppointmentCreateRequest`
- `medical_records`
  - still stores diagnosis, notes, follow-up scheduling, and some vital-sign fields
  - `MedicalRecordService` also builds prescription items and reminder/email side effects
- `lab_results`
  - patient portal and assistant both depend on this table
- `knowledge_documents` and related tables
  - knowledge lifecycle starts in `V9` but becomes operational only after `V10`

## Important Schema Caveats
- `AppointmentVitalSignsEntity` is mapped to `appointment_vital_signs`, but a direct text scan of `V1...V10` did not find that table definition.
- The code therefore expects more than what the visible migration text currently proves.
- Treat vital-signs persistence as a verify-first area before relying on local runtime assumptions.

## Suggested Verification Queries
- Confirm Flyway history after bring-up:
  - check that `V1` through `V10` all applied
- Confirm table existence before trusting clinical vitals flow:
  - `appointment_vital_signs`
  - `lab_results`
  - `patient_accounts`
  - `knowledge_documents`
  - `internal_assistant_sessions`
- Compare entity/table expectations for:
  - `AppointmentVitalSignsEntity`
  - `LabResultEntity`
  - `KnowledgeDocumentEntity`
  - `InternalAssistantSessionEntity`

## Why This Timeline Matters For An Intern
- It explains why some code paths feel layered instead of uniformly designed.
- The platform grew in waves:
  - initial hospital operations
  - clinical hardening
  - richer booking and ops
  - inventory and portal
  - internal assistant rollout
- Understanding the migration order helps explain duplicated concepts and uneven test maturity across modules.
