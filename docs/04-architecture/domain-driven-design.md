# Domain-Driven Design — Bounded Context Analysis

**Status:** Code-verified against repository — 2026-06-14
**Architecture:** DDD Modular Monolith (evolving toward Hexagonal)
**Source of Truth:** `backend/domain/src/main/java/com/hospital/core/`

Every claim in this document is traceable to source files. This UPDATE replaces the previous version with code-verified bounded context analysis.

---

## 1. Architecture Overview

```
 ┌──────────────────────────────────────────────────────────────┐
 │  start/           Composition Root (Flyway, Config, Bootstrap)│
 ├──────────────────────────────────────────────────────────────┤
 │  controller/      32 REST Controllers (118 endpoints)        │
 │                   Depends on: application services            │
 ├──────────────────────────────────────────────────────────────┤
 │  application/     26 Application Services (Use Cases)        │
 │                   Depends on: domain repositories + entities  │
 ├──────────────────────────────────────────────────────────────┤
 │  infrastructure/  Adapters (Email, PDF, Encryption, Gmail)   │
 │                   Depends on: domain repositories + entities  │
 ├──────────────────────────────────────────────────────────────┤
 │  domain/          17 Bounded Contexts                        │
 │                   25 Repository Interfaces + 60+ Entities    │
 │                   ZERO dependencies on outer layers           │
 └──────────────────────────────────────────────────────────────┘

 Dependency Flow: domain ← infrastructure ← application ← controller ← start
```

**DDD Compliance:**
- ✅ Repository interfaces in domain layer (25 repos moved 2026-06-14)
- ✅ Domain has ZERO module dependencies on outer layers (Maven enforcer)
- ✅ Bounded contexts separated by package: `com.hospital.core.{context}`
- ⬜ Use case interfaces (ports) in application layer — planned
- ⬜ Domain events for cross-context communication — planned

---

## 2. Bounded Context Registry (17 Contexts)

### 2.1 Appointment
**Package:** `com.hospital.core.appointment`
**Controller:** `AppointmentController` (11 endpoints)
**Services:** `AppointmentWriteService`, `AppointmentWorkflowService`

| Entity | Role |
|--------|------|
| `AppointmentEntity` | Aggregate Root — appointment lifecycle |
| `AppointmentVitalSignsEntity` | Vital signs at visit |
| `FollowUpEntity` | Follow-up appointment link |

| Repository |
|------------|
| `AppointmentRepository` |
| `AppointmentVitalSignsRepository` |
| `FollowUpRepository` |

**State Machine:** `CHECKED_IN → VITAL_SIGNS → ASSIGNED → IN_CONSULTATION → COMPLETED`

### 2.2 Queue
**Package:** `com.hospital.shared.queue`
**Controller:** `QueueController` (6 endpoints)
**Operations:** `call`, `skip`, `assign-room`, `start-consultation`, `complete`

### 2.3 Medical Record
**Package:** `com.hospital.core.medicalrecord`
**Controller:** `MedicalRecordController` (3 endpoints)
**Service:** `MedicalRecordService`
**Aggregate Root:** `MedicalRecordEntity`
**Repository:** `MedicalRecordRepository`

### 2.4 Patient
**Package:** `com.hospital.core.patient`
**Service:** `PatientRecordService`
**Aggregate Root:** `PatientEntity` (AES-GCM encrypted CCCD/CMND)
**Repository:** `PatientRepository`

### 2.5 Patient Auth
**Package:** `com.hospital.core.patientauth`
**Controller:** `PatientAuthController` (4 endpoints)
**Service:** `PatientAuthService`
**Entity:** `PatientAccountEntity`
**Repository:** `PatientAccountRepository`

### 2.6 Patient Portal
**Package:** `com.hospital.core.patientportal`
**Controller:** `PatientPortalController` (6 endpoints)
**Service:** `PatientPortalService`
**Entities:** `PatientMessageThreadEntity`, `PatientMessageEntity`, `PatientPortalLabResultEntity`
**Repositories:** 3 repository interfaces

### 2.7 Inventory
**Package:** `com.hospital.core.inventory`
**Controller:** `InventoryController` (11 endpoints)
**Services:** `InventoryService`, `InventoryWriteService`
**Aggregate Root:** `InventoryItemEntity`
**Child Entities:** `InventoryLotEntity`, `InventoryMovementEntity`
**Repositories:** `InventoryItemRepository`, `InventoryLotRepository`, `InventoryMovementRepository`
**Key Features:** FIFO lot tracking, low-stock alerts, dispense with medical record ID cross-reference

### 2.8 Invoice
**Package:** `com.hospital.core.invoice`
**Controllers:** `InvoiceController` (4), `PricingController` (3), `RevenueReportController` (2)
**Service:** `InvoiceService`
**Aggregate Root:** `InvoiceEntity`
**Entity:** `ServicePricingEntity`
**Repositories:** `InvoiceRepository`, `ServicePricingRepository`
**State Machine:** `DRAFT → ISSUED → PAID → VOIDED`

### 2.9 Lab
**Package:** `com.hospital.core.lab`
**Controller:** `LabResultController` (4 endpoints)
**Service:** `LabResultService`
**Entity:** `LabResultEntity`
**Repository:** `LabResultRepository`

### 2.10 User
**Package:** `com.hospital.core.user`
**Controllers:** `AdminUserController` (8), `AuthController` (3)
**Services:** `AuthService`, `JwtTokenService`, `AdminService`
**Entity:** `UserEntity` (roles: ADMIN, DOCTOR, NURSE, RECEPTIONIST, PHARMACIST, ACCOUNTANT, PATIENT)
**Repository:** `UserRepository`

### 2.11 Admin
**Package:** `com.hospital.core.admin`
**7 Controllers:** Department, Room, ScheduleTemplate, SpecialClosure, TimeSlot, Stats, Monitoring
**Services:** `OperationsAdminService`, `TimeSlotAdminService`
**Entities:** `DoctorScheduleTemplateEntity`, `RoomEntity`, `SpecialClosureEntity`
**Repositories:** 3 repository interfaces

### 2.12 Department
**Package:** `com.hospital.core.department`
**Controllers:** `DepartmentController` (public), `AdminDepartmentController` (admin)
**Service:** `DepartmentReadService`
**Entity:** `DepartmentEntity`
**Repository:** `DepartmentRepository`

### 2.13 Content
**Package:** `com.hospital.core.content`
**Controllers:** `PublicContentController`, `AdminContentController`, `AdminNewsController`, `AdminPublicContentController`
**Services:** `PublicContentService`, `ContentAdminService`
**Entities:** `HospitalContentSectionEntity`, `NewsArticleEntity`
**Repositories:** 2 repository interfaces

### 2.14 Audit
**Package:** `com.hospital.core.audit`
**Controller:** `AdminAuditLogController`
**Service:** `AuditLogService`
**Entity:** `AuditLogEntity` (immutable)
**Repository:** `AuditLogRepository`

### 2.15 Time Slot
**Package:** `com.hospital.core.timeslot`
**Controller:** `AdminTimeSlotController` (4 endpoints)
**Entity:** `TimeSlotEntity`
**Repository:** `TimeSlotRepository`

### 2.16 Prescription
**Package:** `com.hospital.core.prescription`
**Infrastructure:** `PrescriptionPdfService`, `PrescriptionPdfDocument`
PDF generation — pure infrastructure adapter, no domain entities.

### 2.17 Common
**Package:** `com.hospital.core.common`
Shared base classes and utilities.

---

## 3. Aggregate Root Design

| Bounded Context | Aggregate Root | Child Entities |
|----------------|---------------|----------------|
| Appointment | `AppointmentEntity` | `AppointmentVitalSignsEntity`, `FollowUpEntity` |
| Medical Record | `MedicalRecordEntity` | Prescriptions (embedded) |
| Patient | `PatientEntity` | — |
| Inventory | `InventoryItemEntity` | `InventoryLotEntity`, `InventoryMovementEntity` |
| Invoice | `InvoiceEntity` | Payments (embedded) |
| Patient Portal | `PatientMessageThreadEntity` | `PatientMessageEntity` |
| User | `UserEntity` | — |
| Content | `HospitalContentSectionEntity` | — |

---

## 4. Ubiquitous Language

| Term | Context | Definition |
|------|---------|------------|
| **Appointment** | Appointment | Scheduled patient visit at a time slot |
| **Slot** | TimeSlot | Discrete doctor availability window |
| **Queue** | Queue | Ordered list of checked-in patients |
| **Check-in** | Appointment | Patient arrival → CHECKED_IN status |
| **Vital Signs** | Appointment | BP, HR, temp recorded by nurse |
| **Medical Record** | MedicalRecord | Doctor diagnosis, notes, prescriptions |
| **Prescription** | Prescription | Medication orders from medical record |
| **Dispense** | Inventory | Release medication from stock |
| **Lot** | Inventory | Medication batch with ID + expiration |
| **Movement** | Inventory | Stock change (receipt, dispense, adjustment) |
| **Invoice** | Invoice | Bill for services rendered |
| **Pricing Rule** | Invoice | Price for a medical service |
| **Special Closure** | Admin | Hospital/department closure date |
| **Schedule Template** | Admin | Recurring doctor availability pattern |

---

## 5. Architecture Decision Records

### ADR-001: Modular Monolith over Microservices
**Decision:** DDD modular monolith. **Why:** 17 contexts are tightly coupled in clinical workflows. Distributed transactions add complexity at current scale. Modular structure enables future extraction.

### ADR-002: Spring Data JPA Repositories in Domain Layer
**Decision:** Repository interfaces (`JpaRepository`) in domain layer. **Why:** Spring Data generates impl at runtime — domain defines contract. Maven enforcer prevents domain from depending on outer modules.

### ADR-003: JWT Stateless Authentication
**Decision:** JWT access tokens (15min) + httpOnly refresh cookies (7 days) with rotation. **Why:** Stateless = no server sessions. Short-lived access minimizes exposure. Cookie refresh prevents XSS token theft.

### ADR-004: AES-GCM Patient Identity Encryption
**Decision:** CCCD/CMND encrypted with AES-GCM, indexed by SHA-256 hash. **Why:** PHI compliance — plaintext IDs never stored. SHA-256 enables deterministic lookup. AES-GCM provides authenticated encryption.

---

*Source-verified against `backend/domain/`, `backend/application/`, `backend/controller/` on 2026-06-14.*
