# Domain Cards

This file groups the codebase by bounded context. For each domain, read the API controller first, then the core service, then the repositories/entities, then the shared DTOs, then the tests and docs.

## 1. Auth and Patient Auth

### Business purpose
- Authenticate staff and patients with JWT access tokens plus refresh cookies.
- Enforce role-aware access across the rest of the platform.

### Primary actors
- Staff: `ADMIN`, `DOCTOR`, `NURSE`, `ACCOUNTANT`
- Patient: `PATIENT`

### Entry APIs
- `backend/api/src/main/java/com/hospital/api/auth/AuthController.java`
- `backend/api/src/main/java/com/hospital/api/patientauth/PatientAuthController.java`

### Main code path
- Staff login and refresh:
  - `backend/api/src/main/java/com/hospital/api/auth/AuthService.java`
  - `backend/api/src/main/java/com/hospital/api/auth/JwtTokenService.java`
  - `backend/core/src/main/java/com/hospital/core/user/UserRepository.java`
- Patient claim, login, and refresh:
  - `backend/api/src/main/java/com/hospital/api/patientauth/PatientAuthService.java`
  - `backend/core/src/main/java/com/hospital/core/patientauth/PatientAccountRepository.java`
  - `backend/core/src/main/java/com/hospital/core/patient/PatientRepository.java`
  - `backend/core/src/main/java/com/hospital/core/patient/PatientIdentifierProtector.java`

### Shared contracts
- `backend/shared/src/main/java/com/hospital/shared/auth/LoginRequest.java`
- `backend/shared/src/main/java/com/hospital/shared/auth/LoginResponse.java`
- `backend/shared/src/main/java/com/hospital/shared/auth/RefreshRequest.java`
- `backend/shared/src/main/java/com/hospital/shared/patientauth/PatientClaimRequest.java`
- `backend/shared/src/main/java/com/hospital/shared/patientauth/PatientAuthLoginResponse.java`

### Persistence model
- Staff identity lives in `users`.
- Patient portal identity lives in `patient_accounts`.
- Patient lookup during claim uses email + date of birth + hashed CCCD verification.

### Cross-domain dependencies
- Security filters and method-level RBAC in `backend/api/config`.
- All protected controllers depend on the authentication context created here.

### Tests and docs
- `backend/api/src/test/java/com/hospital/api/SecurityHardeningIntegrationTest.java`
- `API_CONTRACT.md`
- `docs/API_ENDPOINTS_COMPREHENSIVE.md`
- `docs/HMS_SRS.md`

### Caveats
- Staff and patient refresh cookies use different names and different cookie paths.
- Admin users are authenticated normally, but internal assistant access is later restricted to docs mode only.

## 2. Public Discovery and Booking Intake

### Business purpose
- Expose the public surface of the hospital: departments, doctors, content, news, chatbot help, symptom analysis, and appointment creation.

### Primary actors
- Guest
- Future public-facing frontend

### Entry APIs
- `backend/api/src/main/java/com/hospital/api/doctor/DoctorController.java`
- `backend/api/src/main/java/com/hospital/api/department/DepartmentController.java`
- `backend/api/src/main/java/com/hospital/api/content/PublicContentController.java`
- `backend/api/src/main/java/com/hospital/api/chatbot/ChatbotController.java`
- `backend/api/src/main/java/com/hospital/api/ai/AiController.java`
- `backend/api/src/main/java/com/hospital/api/appointment/AppointmentController.java` for `POST /api/v1/appointments`

### Main code path
- Doctor discovery:
  - `backend/core/src/main/java/com/hospital/core/doctor/DoctorReadService.java`
- Department discovery:
  - `backend/core/src/main/java/com/hospital/core/department/DepartmentReadService.java`
- Public content and news:
  - `backend/core/src/main/java/com/hospital/core/content/PublicContentService.java`
- Chatbot:
  - `backend/core/src/main/java/com/hospital/core/chatbot/ChatbotService.java`
- Symptom analysis:
  - `backend/core/src/main/java/com/hospital/core/ai/AiAnalysisService.java`
  - `backend/core/src/main/java/com/hospital/core/ai/GeminiSymptomAnalyzerClient.java`
- Booking:
  - `backend/core/src/main/java/com/hospital/core/appointment/AppointmentWriteService.java`
  - `backend/core/src/main/java/com/hospital/core/timeslot/TimeSlotRepository.java`
  - `backend/core/src/main/java/com/hospital/core/email/EmailService.java`

### Shared contracts
- `backend/shared/src/main/java/com/hospital/shared/booking/AppointmentCreateRequest.java`
- `backend/shared/src/main/java/com/hospital/shared/booking/PatientAddressRequest.java`
- `backend/shared/src/main/java/com/hospital/shared/booking/BookingContactRequest.java`
- `backend/shared/src/main/java/com/hospital/shared/ai/AiAnalyzeRequest.java`
- `backend/shared/src/main/java/com/hospital/shared/chatbot/ChatbotMessageRequest.java`
- `backend/shared/src/main/java/com/hospital/shared/publicsite/*`

### Persistence model
- Public content pulls from `hospital_content_sections` and `news_articles`, but falls back to built-in defaults if no active records exist.
- Booking loads doctors from `users`, locks `time_slots`, upserts `patients`, creates `appointments`, and may email confirmation.

### Cross-domain dependencies
- Booking writes into the patient domain.
- Symptom analysis influences `aiDurationMinutes` in booking, even though the final create endpoint trusts the incoming request.

### Tests and docs
- `backend/api/src/test/java/com/hospital/api/ClinicalWorkflowIntegrationTest.java` covers public booking.
- `docs/HMS_PRD.md`
- `docs/HMS_SRS.md`
- `docs/HMS_FrontendDesignBrief.md`
- `API_CONTRACT.md`

### Caveats
- The chatbot is heuristic and not LLM-backed.
- The AI analysis service falls back to local heuristics if Gemini fails.
- Public booking uses slot-window locking and patient upsert by hashed CCCD rather than a separate registration flow.

## 3. Appointment Workflow, Queue, and Doctor Schedule

### Business purpose
- Run the operational appointment lifecycle after booking: listing, queueing, check-in, doctor schedule, status transitions, follow-up creation.

### Primary actors
- Nurse
- Doctor
- Admin for cancellation and management

### Entry APIs
- `backend/api/src/main/java/com/hospital/api/appointment/AppointmentController.java`
- `backend/api/src/main/java/com/hospital/api/queue/QueueController.java`
- `backend/api/src/main/java/com/hospital/api/schedule/ScheduleController.java`

### Main code path
- Workflow service:
  - `backend/core/src/main/java/com/hospital/core/appointment/AppointmentWorkflowService.java`
- Write service for public booking:
  - `backend/core/src/main/java/com/hospital/core/appointment/AppointmentWriteService.java`
- Main persistence:
  - `backend/core/src/main/java/com/hospital/core/appointment/AppointmentRepository.java`
  - `backend/core/src/main/java/com/hospital/core/appointment/FollowUpRepository.java`
  - `backend/core/src/main/java/com/hospital/core/timeslot/TimeSlotRepository.java`

### Shared contracts
- `backend/shared/src/main/java/com/hospital/shared/appointment/*`
- `backend/shared/src/main/java/com/hospital/shared/enums/AppointmentStatus.java`

### Persistence model
- `appointments` is the central workflow table.
- `time_slots` represent supply and booking windows.
- follow-up data is stored separately from medical records.

### Cross-domain dependencies
- Nurses check patients in before doctors can move the visit to `IN_PROGRESS`.
- Doctors can view only their own schedule and appointment details.
- Clinical completion later depends on appointment status here.

### Tests and docs
- `backend/core/src/test/java/com/hospital/core/appointment/AppointmentWriteServiceTest.java`
- `backend/core/src/test/java/com/hospital/core/appointment/AppointmentWorkflowServiceTest.java`
- `backend/api/src/test/java/com/hospital/api/ClinicalWorkflowIntegrationTest.java`
- `API_CONTRACT.md`

### Caveats
- `AppointmentWorkflowService.updateAppointmentStatus(...)` currently allows only `CHECKED_IN -> IN_PROGRESS` through the doctor dashboard flow.
- Appointment metadata update and cancellation behavior are separated from record finalization.

## 4. Medical Records, Vital Signs, Labs, and Patient History

### Business purpose
- Capture clinical output, vitals, lab data, prescriptions, and longitudinal patient history.

### Primary actors
- Doctor
- Nurse
- Admin for some lab/vital operations

### Entry APIs
- `backend/api/src/main/java/com/hospital/api/medicalrecord/MedicalRecordController.java`
- `backend/api/src/main/java/com/hospital/api/vitalsigns/VitalSignsController.java`
- `backend/api/src/main/java/com/hospital/api/lab/LabResultController.java`
- `backend/api/src/main/java/com/hospital/api/patient/PatientController.java`

### Main code path
- Record finalization:
  - `backend/core/src/main/java/com/hospital/core/medicalrecord/MedicalRecordService.java`
- PDF generation:
  - `backend/core/src/main/java/com/hospital/core/prescription/PrescriptionPdfService.java`
- Reminder planning:
  - `backend/core/src/main/java/com/hospital/core/scheduler/ReminderService.java`
- Vital signs:
  - `backend/core/src/main/java/com/hospital/core/vitalsigns/VitalSignsService.java`
  - `backend/core/src/main/java/com/hospital/core/appointment/AppointmentVitalSignsRepository.java`
- Lab results:
  - `backend/core/src/main/java/com/hospital/core/lab/LabResultService.java`
- Patient record search/history:
  - `backend/core/src/main/java/com/hospital/core/patientrecord/PatientRecordService.java`

### Shared contracts
- `backend/shared/src/main/java/com/hospital/shared/medicalrecord/*`
- `backend/shared/src/main/java/com/hospital/shared/vitalsigns/*`
- `backend/shared/src/main/java/com/hospital/shared/lab/*`
- `backend/shared/src/main/java/com/hospital/shared/patientrecord/*`

### Persistence model
- `medical_records` is one-to-one with `appointments`.
- prescription rows live in `prescription_items`.
- lab rows live in `lab_results`.
- vitals are represented both as embedded medical-record fields and as a separate `appointment_vital_signs` entity/table expectation.

### Cross-domain dependencies
- Creating a medical record finalizes the appointment, plans reminders, generates a PDF, and sends visit results by email.
- Patient history depends on appointment, medical record, and decrypted CCCD data.

### Tests and docs
- `backend/core/src/test/java/com/hospital/core/medicalrecord/MedicalRecordServiceTest.java`
- `backend/core/src/test/java/com/hospital/core/lab/LabResultServiceTest.java`
- `backend/core/src/test/java/com/hospital/core/vitalsigns/VitalSignsServiceTest.java`
- `backend/api/src/test/java/com/hospital/api/ClinicalWorkflowIntegrationTest.java`

### Caveats
- `VitalSignsController` and the appointment-scoped vital-sign endpoints overlap conceptually.
- The repo currently contains a schema-verification gap: `appointment_vital_signs` is used in code, but a direct migration text scan did not find the table definition in `V1...V10`.

## 5. Patient Portal

### Business purpose
- Give patients a secured self-service view over appointments, lab results, messages, and profile data.

### Primary actors
- Patient

### Entry APIs
- `backend/api/src/main/java/com/hospital/api/patientportal/PatientPortalController.java`

### Main code path
- `backend/core/src/main/java/com/hospital/core/patientportal/PatientPortalService.java`
- Persistence:
  - `backend/core/src/main/java/com/hospital/core/patientauth/PatientAccountRepository.java`
  - `backend/core/src/main/java/com/hospital/core/patientportal/LabResultRepository.java`
  - `backend/core/src/main/java/com/hospital/core/patientportal/PatientMessageThreadRepository.java`
  - `backend/core/src/main/java/com/hospital/core/patientportal/PatientMessageRepository.java`

### Shared contracts
- `backend/shared/src/main/java/com/hospital/shared/patientportal/*`

### Persistence model
- Auth identity is in `patient_accounts`.
- Portal read models aggregate data from `appointments`, `lab_results`, `patient_message_threads`, and `patient_messages`.

### Cross-domain dependencies
- Patient auth must succeed first.
- Portal overview depends on seeded or real appointment, lab, and messaging data.

### Tests and docs
- Portal behavior is referenced heavily in:
  - `backend/api/src/test/java/com/hospital/api/InternalAssistantIntegrationTest.java`
  - `docs/HMS_SRS.md`
  - `docs/HMS_UserManual.md`
  - `API_CONTRACT.md`

### Caveats
- Portal data is real backend logic, but no real frontend portal has been implemented yet.
- Portal messages are currently read-only from the patient side in the exposed controller set.

## 6. Inventory

### Business purpose
- Track items, lots, and stock movements for operational inventory.

### Primary actors
- Accountant
- Admin

### Entry APIs
- `backend/api/src/main/java/com/hospital/api/inventory/InventoryController.java`

### Main code path
- Read model:
  - `backend/core/src/main/java/com/hospital/core/inventory/InventoryService.java`
- Write model:
  - `backend/core/src/main/java/com/hospital/core/inventory/InventoryWriteService.java`
- Persistence:
  - `InventoryItemRepository`
  - `InventoryLotRepository`
  - `InventoryMovementRepository`

### Shared contracts
- `backend/shared/src/main/java/com/hospital/shared/inventory/*`

### Persistence model
- `inventory_items`
- `inventory_lots`
- `inventory_movements`

### Cross-domain dependencies
- Items can optionally belong to a department.
- Inventory status is computed from movement deltas and reorder level logic.

### Tests and docs
- `backend/core/src/test/java/com/hospital/core/inventory/InventoryWriteServiceTest.java`
- `docs/HMS_SRS.md`
- `API_CONTRACT.md`

### Caveats
- Movement recording mutates item quantity and stock status inside the same service call.
- Read endpoints return recent movement history rather than full event-store style audit trails.

## 7. Invoices, Pricing, and Revenue Reports

### Business purpose
- Convert completed visits into invoices, capture payments, manage pricing rules, and summarize revenue.

### Primary actors
- Accountant
- Admin

### Entry APIs
- `backend/api/src/main/java/com/hospital/api/invoice/InvoiceController.java`
- `backend/api/src/main/java/com/hospital/api/invoice/PricingController.java`
- `backend/api/src/main/java/com/hospital/api/invoice/RevenueReportController.java`

### Main code path
- `backend/core/src/main/java/com/hospital/core/invoice/InvoiceService.java`
- `backend/core/src/main/java/com/hospital/core/audit/AuditLogService.java`
- persistence:
  - `InvoiceRepository`
  - `ServicePricingRepository`
  - `AppointmentRepository`

### Shared contracts
- `backend/shared/src/main/java/com/hospital/shared/finance/*`

### Persistence model
- `invoices`
- `service_pricing`
- paid invoice reporting grouped by appointment date and department

### Cross-domain dependencies
- Invoice creation is blocked until appointment status is `DONE`.
- Pricing depends on doctor department and effective date.
- Audit logging is emitted for create/pay/void/pricing changes.

### Tests and docs
- Finance is documented thoroughly in `API_CONTRACT.md` and `docs/API_ENDPOINTS_COMPREHENSIVE.md`.
- Direct finance-specific test coverage is lighter than appointment or assistant coverage and should be treated as a growth area.

### Caveats
- The code uses status names like `UNPAID`, `PAID`, and `CANCELLED`, while some docs still describe earlier names such as `VOID`.
- Revenue reporting is derived from paid invoices, not from raw appointment counts.

## 8. Admin Users, Operations, Monitoring, Content, and Audit

### Business purpose
- Give admins operational control over staff, departments, rooms, schedules, closures, content, monitoring, and knowledge documents.

### Primary actors
- Admin
- Accountant for audit-log read access

### Entry APIs
- `backend/api/src/main/java/com/hospital/api/admin/*.java`

### Main code path
- User and department admin:
  - `backend/core/src/main/java/com/hospital/core/admin/AdminService.java`
- Room/template/closure/content/monitoring:
  - `backend/core/src/main/java/com/hospital/core/admin/OperationsAdminService.java`
- News and content CRUD:
  - `backend/core/src/main/java/com/hospital/core/content/ContentAdminService.java`
- Audit list and write:
  - `backend/core/src/main/java/com/hospital/core/audit/AuditLogService.java`

### Shared contracts
- `backend/shared/src/main/java/com/hospital/shared/admin/*`
- `backend/shared/src/main/java/com/hospital/shared/publicsite/*`

### Persistence model
- users and departments
- rooms and `doctor_work_schedules`
- `special_closures`
- `hospital_content_sections`, `news_articles`
- `audit_logs`

### Cross-domain dependencies
- Admin services touch almost every operational surface.
- Monitoring depends on assistant metrics, closures, and system health assumptions.
- Public content admin changes feed public content read APIs.

### Tests and docs
- Admin surfaces are mostly documented in `API_CONTRACT.md` and `docs/API_ENDPOINTS_COMPREHENSIVE.md`.
- Security hardening tests verify auth and envelope behavior, but admin-specific service coverage remains thinner than core clinical coverage.

### Caveats
- Soft-delete patterns are common for users, departments, and rooms.
- Monitoring snapshots are lightweight and do not yet represent deep observability.

## 9. AI Symptom Analysis and Public Chatbot

### Business purpose
- Provide public smart assistance without requiring a logged-in user.

### Primary actors
- Guest
- Future public frontend

### Entry APIs
- `backend/api/src/main/java/com/hospital/api/ai/AiController.java`
- `backend/api/src/main/java/com/hospital/api/chatbot/ChatbotController.java`

### Main code path
- `backend/core/src/main/java/com/hospital/core/ai/AiAnalysisService.java`
- `backend/core/src/main/java/com/hospital/core/ai/GeminiSymptomAnalyzerClient.java`
- `backend/core/src/main/java/com/hospital/core/chatbot/ChatbotService.java`

### Shared contracts
- `backend/shared/src/main/java/com/hospital/shared/ai/*`
- `backend/shared/src/main/java/com/hospital/shared/chatbot/*`

### Cross-domain dependencies
- Chatbot answers rely on department, doctor, and slot repositories.
- Symptom analysis is meant to shape booking duration and triage messaging.

### Tests and docs
- `backend/core/src/test/java/com/hospital/core/ai/AiAnalysisServiceTest.java`
- `docs/HMS_IntegrationGuide.md`
- `API_CONTRACT.md`

### Caveats
- AI analysis is resilient by fallback, not guaranteed by upstream API availability.
- Chatbot is deterministic and keyword-based, not conversation-memory based.

## 10. Internal Assistant and Knowledge Administration

### Business purpose
- Provide a staff-only internal assistant that combines role-scoped patient context and active knowledge documents, while logging metrics and audit events.

### Primary actors
- Doctor
- Nurse
- Admin in docs mode only

### Entry APIs
- `backend/api/src/main/java/com/hospital/api/internalassistant/InternalAssistantController.java`
- `backend/api/src/main/java/com/hospital/api/admin/AdminKnowledgeDocumentController.java`
- `backend/api/src/main/java/com/hospital/api/admin/AdminInternalAssistantMonitoringController.java`

### Main code path
- Request orchestration:
  - `backend/core/src/main/java/com/hospital/core/internalassistant/InternalAssistantService.java`
- Session and conversation state:
  - `backend/core/src/main/java/com/hospital/core/internalassistant/InternalAssistantConversationService.java`
- Metrics:
  - `backend/core/src/main/java/com/hospital/core/internalassistant/InternalAssistantMetricsService.java`
- Knowledge admin:
  - `backend/core/src/main/java/com/hospital/core/internalassistant/knowledge/KnowledgeAdminService.java`
  - `backend/core/src/main/java/com/hospital/core/internalassistant/knowledge/KnowledgeDocumentIngestionService.java`

### Shared contracts
- `backend/shared/src/main/java/com/hospital/shared/internalassistant/*`

### Persistence model
- `knowledge_documents`, `knowledge_chunks`, `knowledge_nodes`, `knowledge_edges`
- `knowledge_document_ingestions`
- `internal_assistant_sessions`, `internal_assistant_messages`, `internal_assistant_feedback`

### Cross-domain dependencies
- Patient mode reaches into appointments, medical records, lab results, patient portal threads, and patient records.
- Docs mode depends on active knowledge documents and chunk ranking.
- Audit and metrics are first-class side effects of assistant usage.

### Tests and docs
- `backend/api/src/test/java/com/hospital/api/InternalAssistantIntegrationTest.java`
- `backend/core/src/test/java/com/hospital/core/internalassistant/InternalAssistantServiceTest.java`
- `docs/HMS_InternalClinicalAssistant_SRS.md`
- `docs/HMS_IntegrationGuide.md`

### Caveats
- Admin accounts are intentionally blocked from patient mode.
- Patient mode requires explicit patient or appointment context.
- This is the deepest domain in the repo and should be learned after the clinical data model is already clear.
