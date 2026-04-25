# Endpoint Role Matrix

This matrix is not a full Swagger dump. It is the onboarding view of the API surface grouped by actor and implementation anchor.

| Surface | Representative endpoints | Allowed roles | Primary source files |
| --- | --- | --- | --- |
| Staff auth | `/api/v1/auth/login`, `/refresh`, `/logout` | public entry, then staff roles | `AuthController`, `AuthService`, `JwtTokenService` |
| Patient auth | `/api/v1/patient-auth/claim`, `/login`, `/refresh`, `/logout` | public entry, then patient role | `PatientAuthController`, `PatientAuthService` |
| Public doctors | `GET /api/v1/doctors`, `/{doctorId}`, `/{doctorId}/slots` | guest | `DoctorController`, `DoctorReadService` |
| Public departments | `GET /api/v1/departments`, `/{departmentId}`, `/{departmentId}/doctors` | guest | `DepartmentController`, `DepartmentReadService` |
| Public content | `GET /api/v1/content/home`, `GET /api/v1/news` | guest | `PublicContentController`, `PublicContentService` |
| Public chatbot | `POST /api/v1/chatbot/messages` | guest | `ChatbotController`, `ChatbotService` |
| Public symptom analysis | `POST /api/v1/ai/analyze-symptoms` | guest | `AiController`, `AiAnalysisService` |
| Public booking | `POST /api/v1/appointments` | guest | `AppointmentController`, `AppointmentWriteService` |
| Staff appointment list | `GET /api/v1/appointments` | doctor, nurse, admin | `AppointmentController`, `AppointmentWorkflowService` |
| Nurse appointment board | `GET /api/v1/appointments/today` | nurse | `AppointmentController`, `AppointmentWorkflowService` |
| Doctor appointment detail | `GET /api/v1/appointments/{appointmentId}` | doctor | `AppointmentController`, `AppointmentWorkflowService` |
| Appointment cancel/update | `DELETE /api/v1/appointments/{id}`, `PUT /api/v1/appointments/{id}` | admin/nurse cancel; doctor/nurse/admin update | `AppointmentController`, `AppointmentWorkflowService` |
| Nurse check-in | `POST /api/v1/appointments/{id}/checkin` | nurse | `AppointmentController`, `AppointmentWorkflowService` |
| Doctor status change | `PUT /api/v1/appointments/{id}/status` | doctor | `AppointmentController`, `AppointmentWorkflowService` |
| Appointment-bound vitals | `POST /api/v1/appointments/{id}/vital-signs`, `GET /api/v1/appointments/{id}/vital-signs` | nurse create; doctor/nurse read | `AppointmentController`, `AppointmentWorkflowService` |
| Follow-up | `POST /api/v1/appointments/{id}/follow-up`, `GET /api/v1/appointments/{id}/follow-up` | doctor create; doctor/nurse/admin read | `AppointmentController`, `AppointmentWorkflowService` |
| Nurse queue | `GET /api/v1/queue/today` | nurse | `QueueController`, `AppointmentWorkflowService` |
| Doctor schedule | `GET /api/v1/me/schedule` | doctor | `ScheduleController`, `AppointmentWorkflowService` |
| Medical records | `POST /api/v1/medical-records`, `POST /preview.pdf`, `GET /{recordId}/prescription.pdf` | doctor | `MedicalRecordController`, `MedicalRecordService`, `PrescriptionPdfService` |
| Patient history | `GET /api/v1/patients/{cccd}/history` | doctor | `PatientController`, `MedicalRecordService` |
| Standalone vital signs | `POST /api/v1/vital-signs`, `GET /api/v1/vital-signs/{appointmentId}`, `PUT`, `DELETE` | doctor, nurse, admin | `VitalSignsController`, `VitalSignsService` |
| Lab results | `POST /api/v1/lab-results`, `GET /api/v1/lab-results/{id}`, `GET /api/v1/appointments/{id}/lab-results`, `DELETE` | doctor, nurse, admin | `LabResultController`, `LabResultService` |
| Patient portal overview | `GET /api/v1/patient-portal/overview` | patient | `PatientPortalController`, `PatientPortalService` |
| Patient portal appointments | `GET /api/v1/patient-portal/appointments` | patient | `PatientPortalController`, `PatientPortalService` |
| Patient portal labs | `GET /api/v1/patient-portal/lab-results` | patient | `PatientPortalController`, `PatientPortalService` |
| Patient portal messages | `GET /api/v1/patient-portal/messages` | patient | `PatientPortalController`, `PatientPortalService` |
| Patient portal profile | `GET/PUT /api/v1/patient-portal/profile` | patient | `PatientPortalController`, `PatientPortalService` |
| Inventory | `/api/v1/inventory/items`, `/lots`, `/movements` | accountant, admin | `InventoryController`, `InventoryService`, `InventoryWriteService` |
| Invoices | `/api/v1/invoices`, `/{invoiceId}/payments`, `/{invoiceId}/void` | accountant, admin | `InvoiceController`, `InvoiceService` |
| Pricing | `/api/v1/pricing`, `/{pricingId}` | accountant, admin | `PricingController`, `InvoiceService` |
| Revenue reports | `/api/v1/reports/revenue/daily`, `/monthly` | accountant, admin | `RevenueReportController`, `InvoiceService` |
| Admin users | `/api/v1/admin/users/*` | admin | `AdminUserController`, `AdminService` |
| Admin departments | `/api/v1/admin/departments/*` | admin | `AdminDepartmentController`, `AdminService` |
| Admin rooms | `/api/v1/admin/rooms/*` | admin | `AdminRoomController`, `OperationsAdminService` |
| Admin time slots | `/api/v1/admin/slots/*` | admin | `AdminTimeSlotController`, `TimeSlotAdminService` |
| Admin schedule templates | `/api/v1/admin/schedule-templates/*` | admin | `AdminScheduleTemplateController`, `OperationsAdminService` |
| Admin closures | `/api/v1/admin/special-closures/*` | admin | `AdminSpecialClosureController`, `OperationsAdminService` |
| Admin stats | `GET /api/v1/admin/stats` | admin | `AdminStatsController`, `AdminService` |
| Admin monitoring | `GET /api/v1/admin/monitoring` | admin | `AdminMonitoringController`, `OperationsAdminService` |
| Audit logs | `GET /api/v1/admin/audit-logs` | accountant, admin | `AdminAuditLogController`, `AuditLogService` |
| Admin content sections | `/api/v1/admin/content/*` | admin | `AdminContentController`, `ContentAdminService` |
| Admin news | `/api/v1/admin/news/*` | admin | `AdminNewsController`, `ContentAdminService` |
| Admin public content wrapper | `/api/v1/admin/public-content/*` | admin | `AdminPublicContentController`, `OperationsAdminService` |
| Admin knowledge docs | `/api/v1/admin/knowledge-documents/*` | admin | `AdminKnowledgeDocumentController`, `KnowledgeAdminService` |
| Assistant conversation | `/api/v1/internal-assistant/sessions/current`, `/messages`, `/messages/{id}/feedback` | doctor, nurse, admin | `InternalAssistantController`, `InternalAssistantService`, `InternalAssistantConversationService` |
| Assistant monitoring | `GET /api/v1/admin/monitoring/internal-assistant` | admin | `AdminInternalAssistantMonitoringController`, `InternalAssistantMetricsService` |

## Fast Reading Rules
- If a route is public in `SecurityConfig`, verify whether the controller also adds more restrictions. Public content and discovery do not; many others do.
- If a route is protected, check both:
  - `SecurityConfig`
  - controller-level or method-level `@PreAuthorize`
- For patient and doctor flows, the JWT subject itself is often reused directly as the business identity.
