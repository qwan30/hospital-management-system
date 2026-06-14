# Domain-Driven Design -- Hospital Management System

- **Status:** living document; reflects codebase state as of 2026-06-14
- **Scope:** bounded contexts, aggregates, domain events, ubiquitous language, and cross-context relationships

---

## Table of Contents

1. [Strategic Design Overview](#1-strategic-design-overview)
2. [Bounded Context: Appointment Management](#2-bounded-context-appointment-management)
3. [Bounded Context: Queue Management](#3-bounded-context-queue-management)
4. [Bounded Context: Medical Records (EHR)](#4-bounded-context-medical-records-ehr)
5. [Bounded Context: Patient Management](#5-bounded-context-patient-management)
6. [Bounded Context: Inventory and Pharmacy](#6-bounded-context-inventory-and-pharmacy)
7. [Bounded Context: Billing and Revenue](#7-bounded-context-billing-and-revenue)
8. [Bounded Context: Patient Portal](#8-bounded-context-patient-portal)
9. [Bounded Context: Admin and Operations](#9-bounded-context-admin-and-operations)
10. [Ubiquitous Language Glossary](#10-ubiquitous-language-glossary)
11. [Value Objects](#11-value-objects)
12. [Cross-Context Relationships](#12-cross-context-relationships)
13. [Entities and Relationships Diagram (Textual)](#13-entities-and-relationships-diagram-textual)

---

## 1. Strategic Design Overview

The Hospital Management System (HMS) is decomposed into **eight bounded contexts**, each aligned with a healthcare operations subdomain. All contexts are deployed within a single modular monolith (five-module Maven reactor), but their aggregate boundaries and domain models remain strictly separated to preserve the option of future microservice extraction.

### Context Map

| Bounded Context | Domain Type | Primary Users | Core Data Store |
|---|---|---|---|
| Appointment Management | Core | Patients, Receptionists | appointments, time_slots |
| Queue Management | Core | Nurses, Doctors | appointments (status-driven) |
| Medical Records (EHR) | Core | Doctors | medical_records, prescription_items |
| Patient Management | Supporting | System-wide | patients |
| Inventory & Pharmacy | Core | Pharmacists | inventory_items, inventory_lots, inventory_movements |
| Billing & Revenue | Core | Accountants | invoices, service_pricing |
| Patient Portal | Supporting | Patients | patient_messages, patient_message_threads |
| Admin & Operations | Generic | Administrators | users, departments, rooms, audit_logs, content |

### Dependency Rules

- **Upstream** contexts (Patient Management, Admin) are referenced by ID only from downstream contexts.
- **No circular dependencies** between application services. Cross-context collaboration happens through repository lookups by aggregate ID.
- The **AuditLogService** acts as a cross-cutting concern -- any context can record audit events, but it never drives business logic.

---

## 2. Bounded Context: Appointment Management

### Responsibility

Manages the full lifecycle of patient appointments: creation, rescheduling, slot booking, confirmation, and cancellation. This context is the primary entry point for patient-facing and receptionist-facing workflows.

### Aggregate Root

**AppointmentEntity** (`com.hospital.core.appointment.AppointmentEntity`)

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary identifier |
| patient | PatientEntity (by reference) | The patient for whom the appointment is booked |
| doctor | UserEntity (by reference) | The assigned doctor |
| firstSlot | TimeSlotEntity (by reference) | The first time slot in the contiguous window |
| appointmentDate | LocalDate | Derived from the first slot's date |
| aiDurationMinutes | int | AI-recommended appointment duration |
| symptoms | String (text) | Free-text symptom description |
| confirmationCode | String (unique) | Human-readable code (format: `HMS-XXXXXXXX`) |
| status | AppointmentStatus | Enum: PENDING, CONFIRMED, CHECKED_IN, IN_PROGRESS, DONE, CANCELLED |
| checkedInAt | LocalDateTime | Timestamp of physical arrival |
| bookingContact* | various | Optional third-party booker details |

### Supporting Aggregates

**TimeSlotEntity** (`com.hospital.core.timeslot.TimeSlotEntity`)

Represents a single 30-minute slot in a doctor's schedule.

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| doctor | UserEntity (by reference) | |
| slotDate | LocalDate | |
| startTime | LocalTime | |
| endTime | LocalTime | |
| status | SlotStatus | AVAILABLE, BOOKED, BLOCKED |

**AppointmentVitalSignsEntity** (`com.hospital.core.appointment.AppointmentVitalSignsEntity`)
- One-to-one with AppointmentEntity
- Records pre-consultation vitals: blood pressure, temperature, weight, height, heart rate, respiratory rate, oxygen saturation

**FollowUpEntity** (`com.hospital.core.appointment.FollowUpEntity`)
- Many-to-one with AppointmentEntity (parent appointment)
- Tracks recommended follow-up visits

### Domain Events

Domain events are recorded via the `AuditLogService` with a `REQUIRES_NEW` propagation. Although not published as explicit event objects, these actions represent semantically meaningful domain events:

| Event | Trigger | Payload |
|---|---|---|
| APPOINTMENT_CREATED | Successful booking | appointmentId, patientId, doctorId |
| APPOINTMENT_CHECKED_IN | Patient arrives | appointmentId, checkedInAt |
| APPOINTMENT_CANCELLED | Cancellation request | appointmentId, reason |
| APPOINTMENT_STATUS_CHANGED | Doctor updates status | appointmentId, previousStatus, nextStatus |
| VITAL_SIGNS_RECORDED | Nurse records vitals | appointmentId |
| FOLLOW_UP_CREATED | Doctor schedules follow-up | parentAppointmentId, followUpDate |

### Ubiquitous Language

| Term | Definition |
|---|---|
| Appointment | A scheduled consultation between a patient and a doctor at a specific date and time |
| Slot | A 30-minute atomic unit of a doctor's available time |
| Slot Window | A contiguous sequence of slots booked for one appointment |
| Confirmation Code | A human-readable unique identifier for an appointment (HMS-XXXXXXXX) |
| Booking Contact | A third party who books an appointment on behalf of a patient |
| Check-in | The act of a patient arriving at the hospital and registering their arrival |
| AI Duration | The appointment duration (in minutes) recommended by the AI triage system |

### Invariants

1. An appointment references slots that all belong to the same doctor.
2. All slots in a window must be `AVAILABLE` before booking.
3. Slots in a window must be contiguous (`previous.endTime == next.startTime`).
4. An appointment's status follows the lifecycle: `CONFIRMED -> CHECKED_IN -> IN_PROGRESS -> DONE` (forward), or `* -> CANCELLED` (any state except DONE).
5. Only `CONFIRMED` appointments can be checked in.
6. Vital signs can be recorded exactly once per appointment.

---

## 3. Bounded Context: Queue Management

### Responsibility

Manages the daily patient queue: check-in processing, room assignment, consultation flow (call, skip, start, complete). This context shares the `AppointmentEntity` aggregate with Appointment Management but operates on a distinct subset of the status lifecycle.

### Aggregate Root

**AppointmentEntity** (shared with Appointment Management context)

The queue context interprets the same entity through a different status lens. The relevant statuses are `CHECKED_IN` and `IN_PROGRESS`.

### Domain Events

| Event | Trigger | Payload |
|---|---|---|
| QUEUE_CALL_PATIENT | Staff calls patient from waiting room | appointmentId, status |
| QUEUE_SKIP_PATIENT | Staff skips a checked-in patient | appointmentId, checkedInAt |
| QUEUE_ASSIGN_ROOM | Staff assigns a consultation room | appointmentId, roomName |
| QUEUE_START_CONSULTATION | Doctor begins consultation | appointmentId, previousStatus |
| QUEUE_COMPLETE_VISIT | Doctor completes consultation | appointmentId, previousStatus |

### Ubiquitous Language

| Term | Definition |
|---|---|
| Queue | The ordered list of patients who have checked in and are waiting for consultation |
| Call | Inviting a patient from the waiting area to proceed |
| Skip | Moving a patient down in the queue order |
| Assign Room | Recording which room a patient will be seen in |
| Start Consultation | Transitioning a patient from waiting to active consultation |
| Complete Visit | Marking a consultation as finished |

### Invariants

1. Only `CHECKED_IN` appointments can be called, assigned a room, or moved into consultation.
2. Only `IN_PROGRESS` appointments can be completed.
3. Queue ordering is by `checkedInAt` ascending, then by `startTime`.
4. A scheduled-based background process (`hms.reminders.cron`) dispatches follow-up reminders every 15 minutes.

---

## 4. Bounded Context: Medical Records (EHR)

### Responsibility

Manages clinical documentation for each appointment: diagnosis, clinical notes, vital signs embedded in the record, prescription items, and PDF generation. This is the core Electronic Health Record (EHR) context.

### Aggregate Root

**MedicalRecordEntity** (`com.hospital.core.medicalrecord.MedicalRecordEntity`)

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| appointment | AppointmentEntity (1:1) | Each appointment yields at most one record |
| diagnosis | String (text) | Medical diagnosis |
| clinicalNotes | String (text) | Free-text clinical observations |
| bloodPressure | String | e.g., "120/80" |
| temperature | BigDecimal | |
| weight | BigDecimal | |
| height | BigDecimal | |
| prescriptionPdfUrl | String | URL to generated PDF |
| followUpDate | LocalDate | Recommended follow-up date |
| reminderSent | boolean | Whether the follow-up reminder email was sent |
| reminderScheduledAt | Instant | When to send the reminder |
| prescriptionItems | List\<PrescriptionItemEntity\> | Embedded collection |

### Supporting Aggregate

**PrescriptionItemEntity** (`com.hospital.core.prescription.PrescriptionItemEntity`)

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| medicalRecord | MedicalRecordEntity (parent) | |
| medicineName | String | Name of the prescribed medicine |
| dosage | String | Dosage instruction |
| frequency | String | How often to take |
| durationDays | Integer | Duration of treatment |
| instructions | String | Additional instructions |
| sortOrder | Integer | Display ordering |

### Domain Events

| Event | Trigger | Payload |
|---|---|---|
| MEDICAL_RECORD_CREATED | Doctor saves clinical record | recordId, appointmentId |
| PRESCRIPTION_GENERATED | PDF prescription is generated | recordId, pdfUrl |
| FOLLOW_UP_REMINDER_SENT | Automated reminder dispatched | recordId, patientEmail |
| REMINDER_SKIPPED | Reminder skipped (undeliverable email) | recordId, reason |

### Ubiquitous Language

| Term | Definition |
|---|---|
| Medical Record | The complete clinical documentation for one appointment |
| Diagnosis | The medical condition identified by the doctor |
| Prescription Item | A single medicine prescribed with dosage and frequency instructions |
| Prescription PDF | A printable PDF document containing all prescription items |
| Follow-up | A recommended future appointment for continued care |
| Vital Signs | Clinical measurements recorded during the visit |

### Invariants

1. At most one medical record per appointment (enforced by unique `appointment_id`).
2. A medical record can only be created when the appointment is in `CHECKED_IN`, `IN_PROGRESS`, or `DONE` status.
3. A doctor can only create records for their own appointments.
4. Creating a medical record automatically transitions the appointment to `DONE`.
5. Creating a medical record automatically generates a prescription PDF and sends a visit result email to the patient.
6. Follow-up reminders are sent at 08:00 hospital time (Asia/Saigon) on the follow-up date.

---

## 5. Bounded Context: Patient Management

### Responsibility

Manages patient identity and demographic data. Provides encryption and hashing services for Personally Identifiable Information (PII), specifically the CCCD (Vietnamese national ID) number.

### Aggregate Root

**PatientEntity** (`com.hospital.core.patient.PatientEntity`)

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| fullName | String | Patient's full name |
| phone | String | |
| email | String | |
| dateOfBirth | LocalDate | |
| gender | Gender | MALE, FEMALE, OTHER |
| cccd | String (encrypted) | CCCD stored as AES-GCM ciphertext with "enc:" prefix |
| cccdHash | String (SHA-256) | Used for lookups; unique index |
| address | provinceOrCity, district, streetAddress | Embedded postal address |
| occupation | String | |
| bloodType | String | |
| medicalHistory | String (text) | |
| drugAllergies | String (text) | |
| insuranceNumber | String | |

### Domain Service

**PatientIdentifierProtector** (`com.hospital.infrastructure.core.patient.PatientIdentifierProtector`)

Provides three operations:
- `encrypt(plainValue)` -- AES-256-GCM encryption with random 12-byte IV. Output format: `enc:{Base64Url(iv + ciphertext)}`
- `decrypt(encryptedValue)` -- Decrypts the stored value
- `hash(plainValue)` -- SHA-256 for deterministic lookup (no salt -- CCCD is already a high-entropy government ID)

### Ubiquitous Language

| Term | Definition |
|---|---|
| CCCD | Can Cuoc Cong Dan -- Vietnamese national identity card number. Sensitive PII encrypted at rest |
| CCCD Hash | SHA-256 hash of the CCCD, used for duplicate detection without exposing the plain value |
| PHI | Protected Health Information -- all patient demographic and clinical data |

### Invariants

1. CCCD must be encrypted at rest using AES-256-GCM.
2. CCCD hash must be unique (no duplicate patient registrations).
3. The `PatientIdentifierProtector` is a shared component used by Appointment Management, Medical Records, and Patient Portal contexts.

---

## 6. Bounded Context: Inventory and Pharmacy

### Responsibility

Manages hospital inventory: item cataloging, lot tracking, stock movements, and pharmacy dispensing with prescription traceability.

### Aggregate Roots

**InventoryItemEntity** (`com.hospital.core.inventory.InventoryItemEntity`)

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| department | DepartmentEntity (by reference) | Optional department association |
| sku | String (unique) | Stock Keeping Unit |
| itemName | String | |
| category | String | |
| unit | String | e.g., "tablet", "bottle", "ml" |
| reorderLevel | int | Threshold for low-stock alert |
| quantityOnHand | int | Current stock level |
| status | String (derived) | IN_STOCK, LOW_STOCK, OUT_OF_STOCK (computed from `quantityOnHand` vs `reorderLevel`) |
| lastRestockedAt | Instant | Timestamp of last inbound movement |

**InventoryLotEntity** (`com.hospital.core.inventory.InventoryLotEntity`)

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| item | InventoryItemEntity (parent) | The item this lot belongs to |
| lotCode | String | Supplier lot/batch code |
| supplierName | String | |
| quantityReceived | int | |
| quantityRemaining | int | Decremented on dispense |
| expiresOn | LocalDate | |

**InventoryMovementEntity** (`com.hospital.core.inventory.InventoryMovementEntity`)

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| item | InventoryItemEntity | |
| lot | InventoryLotEntity (nullable) | |
| medicalRecord | MedicalRecordEntity (nullable) | Present only for DISPENSE movements |
| movementType | String | e.g., "DISPENSE", "RESTOCK", "ADJUSTMENT", "TRANSFER" |
| quantityDelta | int | Positive for inbound, negative for outbound |
| prescriptionItemName | String | Link to the prescription item (present only on dispense) |
| dispensedToPatient | String | Patient name for traceability |
| note | String | Free text |

### Domain Events

| Event | Trigger | Payload |
|---|---|---|
| INVENTORY_ITEM_CREATED | New item added | itemId, sku |
| INVENTORY_ITEM_UPDATED | Item details changed | itemId, sku |
| INVENTORY_ITEM_DELETED | Item soft-deleted | itemId |
| INVENTORY_LOT_CREATED | New lot received | lotId, itemId, lotCode |
| INVENTORY_LOT_UPDATED | Lot details changed | lotId |
| INVENTORY_MOVEMENT_RECORDED | Stock moved | movementId, itemId, quantityDelta |
| PHARMACY_MEDICATION_DISPENSED | Medication dispensed to patient | movementId, lotId, medicalRecordId, prescriptionItemName |

### Ubiquitous Language

| Term | Definition |
|---|---|
| Inventory Item | A distinct product or supply item tracked in inventory |
| SKU | Stock Keeping Unit -- a unique identifier for each item |
| Lot | A batch of an item received from a supplier, tracked separately |
| Movement | Any change in inventory quantity (inbound, outbound, adjustment) |
| Dispense | The act of providing medication to a patient against a prescription |
| Reorder Level | The quantity threshold at which an item is considered low stock |
| Low Stock Alert | A warning generated when quantity_on_hand <= reorder_level |
| Expiry Alert | A warning generated when a lot expires within 30 days |

### Invariants

1. Quantity on hand can never be negative.
2. Lot quantity remaining can never exceed quantity received.
3. Lot quantity remaining can never be negative.
4. A dispense must reference a medical record that exists and contains the prescribed item.
5. A dispense must reference a lot that belongs to the dispensed item.
6. Stock status is derived (not stored independently): `quantity <= 0` = OUT_OF_STOCK, `quantity <= reorderLevel` = LOW_STOCK, otherwise IN_STOCK.
7. Expiry alerts are generated when a lot has remaining stock and expires within 30 days.

---

## 7. Bounded Context: Billing and Revenue

### Responsibility

Manages invoicing, payment recording, service pricing, and revenue reporting. Generates invoices for completed appointments and tracks payment status.

### Aggregate Roots

**InvoiceEntity** (`com.hospital.core.invoice.InvoiceEntity`)

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| appointment | AppointmentEntity (1:1) | |
| totalAmount | BigDecimal (precision 10, scale 2) | Monetary amount in VND |
| status | InvoiceStatus | UNPAID, PAID, CANCELLED |
| paymentMethod | String | e.g., "CASH", "TRANSFER", "INSURANCE" |
| paidAt | Instant | |

**ServicePricingEntity** (`com.hospital.core.invoice.ServicePricingEntity`)

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| department | DepartmentEntity (by reference) | |
| serviceName | String | e.g., "CONSULTATION" |
| amount | BigDecimal (10,2) | |
| effectiveDate | LocalDate | Pricing takes effect from this date |

### Domain Events

| Event | Trigger | Payload |
|---|---|---|
| INVOICE_CREATED | Invoice generated for completed appointment | invoiceId, appointmentId |
| INVOICE_PAID | Payment recorded | invoiceId, paymentMethod |
| INVOICE_CANCELLED | Invoice voided | invoiceId |
| PRICING_CREATED | New pricing rule added | pricingId, serviceName, amount |
| PRICING_UPDATED | Pricing rule modified | pricingId, serviceName, amount |

### Ubiquitous Language

| Term | Definition |
|---|---|
| Invoice | A bill for services rendered, linked to a completed appointment |
| Payment | Recording of payment against an invoice |
| Service Pricing | The amount charged for a specific service, optionally per-department |
| CONSULTATION | The default service type used for invoice amount calculation |
| Daily Revenue | Aggregate of all paid invoices for a calendar date, grouped by department |
| Monthly Revenue | Aggregate of all paid invoices for a calendar month |

### Invariants

1. At most one invoice per appointment.
2. Only appointments in `DONE` status can be invoiced.
3. Paid invoices cannot be voided.
4. The default consultation fee is 250,000 VND if no pricing rule matches.
5. Pricing rules are resolved by `departmentId` and `effectiveDate` (latest matching rule wins).

---

## 8. Bounded Context: Patient Portal

### Responsibility

Provides patient self-service capabilities: viewing appointment history, lab results, messaging with staff, and profile management.

### Aggregate Roots

**PatientMessageThreadEntity** (`com.hospital.core.patientportal.PatientMessageThreadEntity`)

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| patient | PatientEntity (by reference) | |
| subject | String | |
| channel | String | e.g., "GENERAL", "LAB_RESULT", "BILLING" |
| unreadCount | int | |
| lastMessagePreview | String | |
| messages | List\<PatientMessageEntity\> | Embedded collection |

**PatientMessageEntity** (`com.hospital.core.patientportal.PatientMessageEntity`)

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| thread | PatientMessageThreadEntity (parent) | |
| senderRole | String | e.g., "PATIENT", "DOCTOR", "STAFF" |
| body | String (text) | Message content |
| createdAt | Instant | |

**LabResultEntity** (`com.hospital.core.lab.LabResultEntity`)

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| patient | PatientEntity (by reference) | |
| appointment | AppointmentEntity (by reference) | |
| testName | String | e.g., "Complete Blood Count" |
| resultValue | String (text) | |
| referenceRange | String | |
| status | String | e.g., "PENDING", "COMPLETED", "REVIEWED" |
| notes | String | |
| collectedAt | Instant | |
| deleted | boolean | Soft-delete flag |

### Ubiquitous Language

| Term | Definition |
|---|---|
| Portal | The patient-facing self-service interface |
| Message Thread | A conversation between a patient and hospital staff |
| Lab Result | The outcome of a diagnostic test or laboratory analysis |
| Portal Overview | Dashboard showing upcoming appointments, unread messages, and recent lab results |

### Invariants

1. A lab result belongs to both a patient and an appointment.
2. Message threads are soft-state (no strict lifecycle constraints).
3. Lab results use soft-delete (`deleted` flag) rather than physical deletion.

---

## 9. Bounded Context: Admin and Operations

### Responsibility

Provides administrative capabilities: user management, department and room management, doctor scheduling, special closures, public content (news/landing pages), system monitoring, and audit logging.

### Aggregate Roots

**UserEntity** (`com.hospital.core.user.UserEntity`)

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| department | DepartmentEntity (by reference) | |
| email | String (unique) | Login identifier |
| passwordHash | String | BCrypt hash |
| fullName | String | |
| phone | String | |
| role | UserRole | ADMIN, DOCTOR, NURSE, RECEPTIONIST, PHARMACIST, ACCOUNTANT, PATIENT |
| specialty | String | Doctor's medical specialty |
| qualification | String | |
| experienceYears | Integer | |
| active | boolean | Soft-delete flag |

**DepartmentEntity** (`com.hospital.core.department.DepartmentEntity`)

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| name | String (unique) | |
| description | String | |
| imageUrl | String | |
| phone | String | |
| active | boolean | Soft-delete flag |

**RoomEntity** (`com.hospital.core.admin.RoomEntity`)

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| department | DepartmentEntity (by reference) | |
| name | String | |
| status | RoomStatus | READY, IN_USE, BREAK, MAINTENANCE |
| active | boolean | Soft-delete flag |

**DoctorScheduleTemplateEntity** (`com.hospital.core.admin.DoctorScheduleTemplateEntity`)

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| doctor | UserEntity (by reference) | |
| room | RoomEntity (by reference, nullable) | |
| dayOfWeek | int | 0=Sunday, 6=Saturday |
| startTime | LocalTime | |
| endTime | LocalTime | |
| slotDurationMinutes | int | Typically 30 |
| active | boolean | |

**SpecialClosureEntity** (`com.hospital.core.admin.SpecialClosureEntity`)

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| title | String | |
| doctor | UserEntity (by reference, nullable) | If doctor-specific |
| room | RoomEntity (by reference, nullable) | If room-specific |
| closureDate | LocalDate | |
| reason | String | |
| active | boolean | |

**HospitalContentSectionEntity** (`com.hospital.core.content.HospitalContentSectionEntity`)

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| slug | String (unique) | URL-friendly identifier |
| title | String | |
| body | String (text) | |
| imageUrl | String | |
| ctaLabel | String | Call-to-action button text |
| ctaHref | String | Call-to-action link URL |
| sortOrder | int | Display ordering |
| active | boolean | |

**NewsArticleEntity** (`com.hospital.core.content.NewsArticleEntity`)

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| slug | String (unique) | |
| title | String | |
| summary | String | |
| content | String (text) | |
| imageUrl | String | |
| publishedAt | Instant | |
| active | boolean | |

**AuditLogEntity** (`com.hospital.core.audit.AuditLogEntity`)

| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| actor | UserEntity (by reference, nullable) | |
| action | String | e.g., "QUEUE_CALL_PATIENT" |
| entityType | String | e.g., "APPOINTMENT" |
| entityId | UUID | |
| metadata | JSONB | Arbitrary key-value context |
| createdAt | Instant | |

### Domain Events

| Event | Trigger | Payload |
|---|---|---|
| USER_CREATED | Admin creates new user | userId, role |
| USER_DEACTIVATED | Admin deactivates user | userId |
| USER_ROLE_CHANGED | Admin changes role | userId, newRole |
| DEPARTMENT_CREATED | Admin creates department | departmentId, name |
| DOCTOR_ASSIGNED_TO_DEPARTMENT | Doctor assigned | doctorId, departmentId |
| DOCTOR_REMOVED_FROM_DEPARTMENT | Doctor removed | doctorId, departmentId |
| ROOM_CREATED/UPDATED/DELETED | Room lifecycle | roomId |
| SCHEDULE_TEMPLATE_CREATED/UPDATED | Template lifecycle | templateId |
| SPECIAL_CLOSURE_CREATED/UPDATED | Closure lifecycle | closureId |
| NEWS_CREATED/UPDATED | News article lifecycle | articleId |

### Ubiquitous Language

| Term | Definition |
|---|---|
| User | A staff member with system access, identified by role |
| Role | Access level: ADMIN, DOCTOR, NURSE, RECEPTIONIST, PHARMACIST, ACCOUNTANT |
| Department | A hospital organizational unit (e.g., Cardiology, Neurology) |
| Room | A physical consultation or examination room |
| Schedule Template | A recurring weekly pattern defining a doctor's available hours |
| Special Closure | A one-off exception to normal scheduling (holiday, training, etc.) |
| Content Section | A named content block on the public hospital website |
| News Article | A published news item visible on the public site |
| Audit Log | An immutable, timestamped record of a domain action |

### Invariants

1. Users are soft-deleted (deactivated) to preserve referential integrity.
2. Departments are soft-deleted for the same reason.
3. Rooms are soft-deleted to preserve historical appointment room references.
4. Email must be unique across all users.
5. Department name must be unique.
6. A user assigned as DOCTOR must have an active status to be assignable to departments.

---

## 10. Ubiquitous Language Glossary

### Core Domain Terms

| Term | Context | Definition |
|---|---|---|
| Appointment | Appointment Management | A scheduled consultation between a patient and a doctor |
| Slot | Appointment Management | A 30-minute atomic unit of a doctor's available time |
| Confirmation Code | Appointment Management | A unique human-readable identifier for an appointment (`HMS-XXXXXXXX`) |
| Check-in | Queue Management | The process of a patient registering their physical arrival |
| Queue | Queue Management | The ordered list of checked-in patients awaiting consultation |
| Medical Record | Medical Records | The complete clinical documentation for one appointment |
| Diagnosis | Medical Records | The medical condition identified during consultation |
| Prescription | Medical Records | A list of medications prescribed to a patient |
| Vital Signs | Medical Records / Appointment | Clinical measurements: blood pressure, temperature, weight, height, heart rate, respiratory rate, oxygen saturation |
| Follow-up | Medical Records | A recommended future appointment for continued care |
| Patient | Patient Management | An individual receiving healthcare services |
| CCCD | Patient Management | Vietnamese national identity card number, encrypted at rest |
| CCCD Hash | Patient Management | SHA-256 hash of CCCD, used for duplicate detection |
| Inventory Item | Inventory & Pharmacy | A distinct product tracked in hospital inventory |
| Lot | Inventory & Pharmacy | A batch of items from a single supplier delivery |
| Movement | Inventory & Pharmacy | Any change in inventory quantity |
| Dispense | Inventory & Pharmacy | Providing medication to a patient against a prescription |
| Invoice | Billing & Revenue | A bill for services rendered |
| Payment | Billing & Revenue | Recording of payment against an invoice |
| Service Pricing | Billing & Revenue | The amount charged for a specific medical service |
| Message Thread | Patient Portal | A conversation between patient and staff |
| Lab Result | Patient Portal | The outcome of a diagnostic test |
| User | Admin & Operations | A staff member with system access |
| Department | Admin & Operations | A hospital organizational unit |
| Room | Admin & Operations | A physical consultation room |
| Schedule Template | Admin & Operations | A recurring weekly pattern for a doctor's availability |
| Special Closure | Admin & Operations | A one-off scheduling exception |
| Audit Log | Admin & Operations | An immutable record of a domain action |

### Enumerations

| Enum | Values | Context |
|---|---|---|
| AppointmentStatus | PENDING, CONFIRMED, CHECKED_IN, IN_PROGRESS, DONE, CANCELLED | Appointment Management |
| SlotStatus | AVAILABLE, BOOKED, BLOCKED | Appointment Management |
| RoomStatus | READY, IN_USE, BREAK, MAINTENANCE | Admin & Operations |
| InvoiceStatus | UNPAID, PAID, CANCELLED | Billing & Revenue |
| UserRole | ADMIN, DOCTOR, NURSE, RECEPTIONIST, PHARMACIST, ACCOUNTANT, PATIENT | Admin & Operations |
| Gender | MALE, FEMALE, OTHER | Patient Management |
| Inventory Stock Status | IN_STOCK, LOW_STOCK, OUT_OF_STOCK (derived) | Inventory & Pharmacy |

---

## 11. Value Objects

The codebase uses primitive types and standard JDK types rather than custom Value Object wrappers. The following logical Value Objects are identified:

| Value Object | Backing Type | Context | Notes |
|---|---|---|---|
| **CCCD** | String (encrypted + SHA-256 hash) | Patient Management | Vietnamese national ID. Stored as AES-GCM ciphertext with `enc:` prefix. Looked up via SHA-256 hash. |
| **ConfirmationCode** | String | Appointment Management | Format `HMS-XXXXXXXX` where X is uppercase hexadecimal. Generated as UUID substring. |
| **Money** | BigDecimal (precision 10, scale 2) | Billing & Revenue | Used for `totalAmount` in invoices and `amount` in service pricing. No explicit wrapper type -- uses raw BigDecimal. |
| **BloodPressure** | String | Medical Records | Stored as a free-text string, e.g., "120/80". No structured parsing. |
| **Temperature** | BigDecimal | Medical Records | Stored as BigDecimal in entities, exposed as Double in API payloads. |
| **Weight** | BigDecimal | Medical Records | |
| **Height** | BigDecimal | Medical Records | |
| **Address** | Three String fields | Patient Management | `provinceOrCity`, `district`, `streetAddress` stored as separate columns on the patient entity. |
| **BookingContact** | Multiple fields on AppointmentEntity | Appointment Management | Contact info for a third party who books on behalf of a patient. Not a separate entity -- embedded as nullable columns. |
| **PasswordHash** | String (BCrypt) | Admin & Operations | BCrypt-encoded password hash on UserEntity. |

---

## 12. Cross-Context Relationships

All bounded contexts communicate through **ID references only**. No context directly accesses another context's repository if it belongs to a different bounded context. The following patterns govern cross-context relationships:

### ID Reference Patterns

| Source Context | References | Via | Purpose |
|---|---|---|---|
| Appointment Management | Patient | `patientId` (UUID FK) | Links appointment to patient record |
| Appointment Management | Doctor (User) | `doctorId` (UUID FK) | Assigns doctor to appointment |
| Appointment Management | TimeSlot | `firstSlotId` (UUID FK) | Ties appointment to its first time slot |
| Queue Management | Appointment | `appointmentId` (UUID FK) | Operates on the AppointmentEntity directly |
| Medical Records | Appointment | `appointmentId` (UUID FK, 1:1) | Links clinical documentation to appointment |
| Medical Records | PrescriptionItem | `medicalRecordId` (UUID FK) | Embedded collection via cascade |
| Inventory & Pharmacy | Medical Record | `medicalRecordId` (UUID FK) | Links dispense movements to clinical context |
| Inventory & Pharmacy | Department | `departmentId` (UUID FK) | Optional department scoping for items |
| Inventory & Pharmacy | Inventory Item | `itemId` (UUID FK) | Links lots and movements to items |
| Inventory & Pharmacy | Inventory Lot | `lotId` (UUID FK, nullable) | Links movements to specific lots |
| Billing & Revenue | Appointment | `appointmentId` (UUID FK, 1:1) | Creates invoice for completed appointment |
| Billing & Revenue | Department | `departmentId` (UUID FK) | Scopes pricing rules by department |
| Patient Portal | Patient | `patientId` (UUID FK) | Links messages and lab results to patient |
| Patient Portal | Appointment | `appointmentId` (UUID FK) | Links lab results to appointments |
| Admin & Operations | Department | `departmentId` (UUID FK) | Scopes users and rooms by department |
| Admin & Operations | Doctor (User) | `doctorId` (UUID FK) | Links schedule templates and closures to doctor |
| Admin & Operations | Room | `roomId` (UUID FK, nullable) | Links schedule templates and closures to rooms |
| Audit Log | User (actor) | `actorId` (UUID FK, nullable) | Optional link to the acting user |

### Shared Kernel

The following artifacts are shared across multiple contexts (defined in the `domain` Maven module):

1. **Enumerations** in `com.hospital.shared.enums`: `AppointmentStatus`, `SlotStatus`, `InvoiceStatus`, `UserRole`, `Gender`, `RoomStatus`
2. **Common exceptions** in `com.hospital.core.common`: `NotFoundException`, `ConflictException`
3. **Request/Response DTOs** in `com.hospital.shared.*`: All API contract objects

### Event-Driven Collaboration (via Audit Log)

Although there is no formal event bus, the `AuditLogService` with `REQUIRES_NEW` propagation serves as a lightweight event store. Downstream contexts could theoretically poll the audit log to react to events without direct coupling. Currently, no downstream subscriber pattern is implemented -- the audit log is consumed only by the Admin monitoring UI.

### Context Ownership Boundaries

| Artifact | Owned By | Accessed By |
|---|---|---|
| PatientEntity | Patient Management | Appointment Management (read/write), Medical Records (read), Patient Portal (read/write) |
| AppointmentEntity | Appointment Management | Queue Management (read/write), Medical Records (read), Billing (read) |
| MedicalRecordEntity | Medical Records | Inventory & Pharmacy (read for dispense validation) |
| InventoryItemEntity | Inventory & Pharmacy | Internal only |
| InvoiceEntity | Billing & Revenue | Internal only |
| UserEntity | Admin & Operations | Appointment Management (read), Queue Management (read), Medical Records (read) |
| DepartmentEntity | Admin & Operations | Billing (read), Inventory (read), Appointment Management (transitive) |

---

## 13. Entities and Relationships Diagram (Textual)

```
┌─────────────────────────────────────────────────────────────────────┐
│                      PATIENT MANAGEMENT                             │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  PatientEntity                                                │   │
│  │  ┌──────┬──────────┬───────────┬───────────┬──────────────┐ │   │
│  │  │  id  │ fullName │  cccd    │ cccdHash │ dateOfBirth  │ │   │
│  │  └──┬───┴──────────┴────┬──────┴───────────┴──────────────┘ │   │
│  │     │                   │(AES-256-GCM)                      │   │
│  │     │                   └── PatientIdentifierProtector       │   │
│  └─────┼────────────────────────────────────────────────────────┘   │
└────────┼────────────────────────────────────────────────────────────┘
         │ patient_id (FK)
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    APPOINTMENT MANAGEMENT                            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  AppointmentEntity                                           │   │
│  │  ┌──────┬──────────┬─────────┬───────────────┬──────────┐  │   │
│  │  │  id  │ status   │ confCode│ appointmentDt │ symptoms │  │   │
│  │  └──┬───┴───┬──────┴──┬──────┴───────┬───────┴──────────┘  │   │
│  │     │       │         │              │                     │   │
│  │     │       │         │              │    ┌────────────────┐│   │
│  │     │       │         │              │    │BookingContact* ││   │
│  │     │       │         │              │    │(embedded,null) ││   │
│  │     │       │         │              │    └────────────────┘│   │
│  │     │       │         │              ▼                      │   │
│  │     │       │         │   ┌─────────────────┐              │   │
│  │     │       │         │   │ Appointment     │              │   │
│  │     │       │         │   │ VitalSignsEntity│ (1:1)        │   │
│  │     │       │         │   └─────────────────┘              │   │
│  │     │       │         │                                    │   │
│  │     │       │         │   ┌─────────────────┐              │   │
│  │     │       │         │   │ FollowUpEntity   │  (M:1)     │   │
│  │     │       │         │   └─────────────────┘              │   │
│  │     │       │         │                                    │   │
│  │     │       │         │   doctor_id (FK → UserEntity)      │   │
│  │     │       │         │   first_slot_id (FK → TimeSlotEntity)│   │
│  └─────┼───────┼─────────┼────────────────────────────────────┘   │
│        │       │         │                                         │
│        │       │         │  ┌──────────────────────────────────┐   │
│        │       │         │  │  TimeSlotEntity                  │   │
│        │       │         │  │  id, doctor_id, slotDate,        │   │
│        │       │         │  │  startTime, endTime, status      │   │
│        │       │         │  └──────────────────────────────────┘   │
└────────┼───────┼─────────┼─────────────────────────────────────────┘
         │       │         │
         │       │         │ appointment_id (FK)
         │       │         ▼
         │       │  ┌─────────────────────────────────────────────────┐
         │       │  │              MEDICAL RECORDS                    │
         │       │  │  ┌─────────────────────────────────────────┐   │
         │       │  │  │  MedicalRecordEntity                    │   │
         │       │  │  │  id, diagnosis, clinicalNotes,          │   │
         │       │  │  │  vitals, followUpDate, reminderSent     │   │
         │       │  │  └──────────────┬──────────────────────────┘   │
         │       │  │                 │ 1:N (cascade)                │
         │       │  │  ┌──────────────▼──────────────────────────┐   │
         │       │  │  │  PrescriptionItemEntity                 │   │
         │       │  │  │  id, medicineName, dosage, frequency,   │   │
         │       │  │  │  durationDays, instructions, sortOrder  │   │
         │       │  │  └─────────────────────────────────────────┘   │
         │       │  └─────────────────────────────────────────────────┘
         │       │
         │       │ medicalRecordId (FK)
         │       ▼
         │  ┌─────────────────────────────────────────────────────────┐
         │  │              INVENTORY & PHARMACY                       │
         │  │  ┌──────────────────┐   ┌────────────────────────┐   │
         │  │  │ InventoryItem    │◄──│ InventoryLot            │   │
         │  │  │ id, sku, qtyOnHd │1:N│ lotCode, qtyRemaining  │   │
         │  │  │ reorderLevel     │   │ expiresOn               │   │
         │  │  └────────┬─────────┘   └────────────────────────┘   │
         │  │           │ 1:N                                      │
         │  │  ┌────────▼──────────────────────────────────────┐   │
         │  │  │ InventoryMovementEntity                       │   │
         │  │  │ movementType, quantityDelta, lot_id (nullable)│   │
         │  │  │ medicalRecordId (nullable), prescriptionItem  │   │
         │  │  │ dispensedToPatient                            │   │
         │  │  └───────────────────────────────────────────────┘   │
         │  └─────────────────────────────────────────────────────────┘
         │
         │ appointment_id (FK, 1:1)
         ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │                    BILLING & REVENUE                             │
  │  ┌─────────────────────────┐  ┌──────────────────────────────┐ │
  │  │ InvoiceEntity           │  │ ServicePricingEntity         │ │
  │  │ id, totalAmount, status |  │ serviceName, amount,         │ │
  │  │ paymentMethod, paidAt   │  │ effectiveDate, department_id │ │
  │  └─────────────────────────┘  └──────────────────────────────┘ │
  └─────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────┐
  │                    PATIENT PORTAL                                │
  │  ┌──────────────────────┐  ┌────────────────────────────┐      │
  │  │ PatientMessageThread │◄─│ PatientMessageEntity       │      │
  │  │ id, subject, channel │  │ senderRole, body           │      │
  │  └──────────────────────┘  └────────────────────────────┘      │
  │  ┌─────────────────────────────────────────────────────────┐   │
  │  │ LabResultEntity (patient_id, appointment_id, testName) │   │
  │  └─────────────────────────────────────────────────────────┘   │
  └─────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────┐
  │                   ADMIN & OPERATIONS                             │
  │  ┌──────────────┐  ┌────────────────┐  ┌─────────────────────┐ │
  │  │ UserEntity   │  │ DepartmentEntity│  │ RoomEntity          │ │
  │  │ id, email,   │◄─│ id, name        │◄─│ id, name, status    │ │
  │  │ role, active │  └────────────────┘  └─────────────────────┘ │
  │  └──────┬───────┘                                              │
  │         │ doctor_id                                             │
  │  ┌──────▼────────────────────┐  ┌──────────────────────────┐  │
  │  │ DoctorScheduleTemplate    │  │ SpecialClosureEntity      │  │
  │  │ dayOfWeek, startTime,     │  │ closureDate, doctor_id,  │  │
  │  │ endTime, slotDuration     │  │ room_id, reason           │  │
  │  └───────────────────────────┘  └──────────────────────────┘  │
  │  ┌────────────────────────────┐ ┌────────────────────────┐    │
  │  │ HospitalContentSection     │ │ NewsArticleEntity      │    │
  │  │ slug, title, body, sortOrd│ │ slug, title, summary   │    │
  │  └────────────────────────────┘ └────────────────────────┘    │
  │  ┌─────────────────────────────────────────────────────────┐  │
  │  │ AuditLogEntity (actor_id, action, entityType, entityId,│  │
  │  │               metadata JSONB)                          │  │
  │  └─────────────────────────────────────────────────────────┘  │
  └─────────────────────────────────────────────────────────────────┘
```

---

## References

- Architecture overview: [architecture.md](./architecture.md)
- API contracts: `backend/domain/src/main/java/com/hospital/shared/*/`
- Service implementations: `backend/application/src/main/java/com/hospital/core/*/`
- Entity definitions: `backend/domain/src/main/java/com/hospital/core/*/`
