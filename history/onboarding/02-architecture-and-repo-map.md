# Architecture and Repo Map

## Module Graph

```text
backend/shared
  -> DTOs, enums, API envelopes, request/response contracts

backend/core
  -> entities, repositories, business services, integrations, audit, seed data
  -> depends on: backend/shared

backend/api
  -> Spring Boot app, controllers, security filters/config, Flyway migrations
  -> depends on: backend/core and backend/shared
```

## Bootstrap Entry Points
- Application bootstrap:
  - `backend/api/src/main/java/com/hospital/api/HmsApiApplication.java`
- Security chain:
  - `backend/api/src/main/java/com/hospital/api/config/SecurityConfig.java`
  - `backend/api/src/main/java/com/hospital/api/auth/JwtAuthenticationFilter.java`
  - `backend/api/src/main/java/com/hospital/api/config/RateLimitFilter.java`
- Configuration:
  - `backend/api/src/main/resources/application.yml`
  - `.env.example`
  - `docker-compose.yml`
  - `backend/Dockerfile`

## Package Footprint

### API module (`backend/api`)
- `admin`: 14 files
- `auth`: 4 files
- `config`: 6 files
- `patientauth`: 2 files
- `invoice`: 3 files
- single-controller packages for appointment, doctor, department, patient, patientportal, patientrecord, inventory, lab, medicalrecord, queue, schedule, content, chatbot, ai, internalassistant, vitalsigns

### Core module (`backend/core`)
- `internalassistant`: 25 files
- `appointment`: 8 files
- `inventory`: 8 files
- `patientportal`: 7 files
- `admin`: 9 files
- `content`: 6 files
- `invoice`: 5 files
- `patient`: 5 files
- plus supporting packages for auth, audit, email, lab, medicalrecord, prescription, scheduler, timeslot, user, seed

### Shared module (`backend/shared`)
- contracts are concentrated in:
  - `admin`, `appointment`, `auth`, `booking`, `finance`, `internalassistant`, `inventory`, `medicalrecord`, `patientauth`, `patientportal`, `patientrecord`, `publicsite`, `vitalsigns`

## Controller Inventory

| Area | Controllers |
| --- | --- |
| Public discovery | `DoctorController`, `DepartmentController`, `PublicContentController`, `ChatbotController`, `AiController` |
| Booking and workflow | `AppointmentController`, `QueueController`, `ScheduleController`, `MedicalRecordController`, `VitalSignsController`, `LabResultController`, `PatientController` |
| Patient secured | `PatientAuthController`, `PatientPortalController`, `PatientRecordController` |
| Finance and ops | `InventoryController`, `InvoiceController`, `PricingController`, `RevenueReportController` |
| Admin | `AdminUserController`, `AdminDepartmentController`, `AdminRoomController`, `AdminTimeSlotController`, `AdminScheduleTemplateController`, `AdminSpecialClosureController`, `AdminStatsController`, `AdminMonitoringController`, `AdminAuditLogController`, `AdminContentController`, `AdminNewsController`, `AdminKnowledgeDocumentController`, `AdminInternalAssistantMonitoringController`, `AdminPublicContentController` |
| Assistant | `InternalAssistantController` |

## Request Lifecycle Pattern
1. HTTP request enters a controller under `backend/api`.
2. `SecurityConfig` decides whether the route is public or protected.
3. For protected requests:
   - `RateLimitFilter` may reject selected POST routes.
   - `JwtAuthenticationFilter` parses the bearer token and sets Spring Security authentication.
   - method-level `@PreAuthorize` checks the role.
4. Controller validates the shared DTO and delegates to a core service.
5. Core service loads entities through repositories, applies business rules, and may trigger side effects:
   - audit logging
   - email delivery
   - reminder planning
   - internal assistant metrics
6. Controller wraps the result with `ApiResponse.ok(...)`.

## Persistence and Integration Surfaces
- Relational persistence:
  - JPA entities and repositories in `backend/core`
  - Flyway migrations in `backend/api/src/main/resources/db/migration`
- Security and identity:
  - BCrypt passwords for staff and patient accounts
  - JWT access/refresh tokens
  - encrypted and hashed patient identifiers
- External integration seams:
  - Gemini via `backend/core/src/main/java/com/hospital/core/ai/GeminiSymptomAnalyzerClient.java`
  - Gmail via `backend/core/src/main/java/com/hospital/core/email/GmailApiClient.java`
  - PDF generation via `backend/core/src/main/java/com/hospital/core/prescription/PrescriptionPdfService.java`
- Seed and demo environment:
  - `backend/core/src/main/java/com/hospital/core/seed/SeedDataService.java`

## GitNexus Playbook For This Repo
- Freshness:
  - `npx gitnexus status`
- Architecture concept search:
  - `npx gitnexus query -r hospital-management-system "authentication login refresh jwt security"`
  - `npx gitnexus query -r hospital-management-system "appointment booking schedule slot reservation"`
  - `npx gitnexus query -r hospital-management-system "internal assistant knowledge rag feedback"`
- Method deep dives:
  - `npx gitnexus context -r hospital-management-system -f "backend/api/src/main/java/com/hospital/api/auth/AuthController.java" "login"`
  - `npx gitnexus context -r hospital-management-system -f "backend/core/src/main/java/com/hospital/core/appointment/AppointmentWriteService.java" "createAppointment"`
  - `npx gitnexus context -r hospital-management-system -f "backend/core/src/main/java/com/hospital/core/medicalrecord/MedicalRecordService.java" "createMedicalRecord"`
  - `npx gitnexus context -r hospital-management-system -f "backend/core/src/main/java/com/hospital/core/internalassistant/InternalAssistantService.java" "reply"`

## Architectural Takeaways
- The repo is not a generic CRUD app. The main complexity sits in:
  - appointment slot locking and workflow transitions
  - record finalization side effects
  - patient identity protection
  - internal assistant authorization and evidence assembly
- `backend/shared` is a contract boundary worth learning early because it reveals the intended API surface without diving into every controller.
- `backend/core/internalassistant` is the deepest subsystem and should be approached after the clinical and patient data flows are understood.
