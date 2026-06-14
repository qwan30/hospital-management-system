# Database Schema

**Status:** aligned with the repository on 2026-06-14.
**Database:** PostgreSQL 15 (pgvector image)
**Migrations:** 20 Flyway migrations (V1-V20)
**Active Tables:** 30 across 8 domains
**Total Tables Created:** 39 (9 removed in V11)
**Indexes:** 26 (20 active, 6 removed)

---

## Migration Inventory

| Version | File | Summary |
|---------|------|---------|
| V1 | `Create_initial_schema` | Core tables: departments, users, time_slots, patients, family_members, appointments, medical_records, prescription_items, invoices, service_pricing, audit_logs + 3 indexes |
| V2 | `Add_clinical_workflow_columns` | checked_in_at on appointments; clinical_notes, vitals fields on medical_records; frequency, duration_days on prescription_items |
| V3 | `Add_patient_email_and_follow_up_schedule` | email on patients (backfilled, NOT NULL); reminder_scheduled_at, reminder_sent_at on medical_records + 1 index |
| V4 | `Expand_patient_identifier_and_security` | cccd changed to TEXT, UNIQUE dropped; cccd_hash (SHA-256) added with unique index |
| V5 | `Expand_srs_booking_and_operations_foundation` | Patient demographics (gender, address, blood_type, etc.), booking contact columns, hospital_content_sections, news_articles, rooms, doctor_work_schedules, special_closures + 3 indexes |
| V6 | `Add_room_schedule_closure_operational_flags` | is_active on rooms, doctor_work_schedules, special_closures; title on special_closures |
| V7 | `Add_inventory_management_tables` | inventory_items, inventory_lots, inventory_movements + 3 indexes |
| V8 | `Add_patient_portal_tables` | patient_accounts, lab_results, patient_message_threads, patient_messages + 3 indexes |
| V9 | `Add_internal_assistant_knowledge_tables` | knowledge_documents, knowledge_chunks (vector(8) embedding), knowledge_nodes, knowledge_edges; vector extension |
| V10 | `Implement_internal_assistant_v1_safe_rollout` | knowledge_document_ingestions, internal_assistant_sessions, internal_assistant_messages + 4 indexes |
| V11 | `Remove_ai_assistant_features` | **Drops** all 9 V9/V10 tables and the vector extension |
| V12 | `Add_appointment_follow_ups_table` | appointment_follow_ups + 1 index |
| V13 | `Add_appointment_vital_signs_table` | appointment_vital_signs + 1 index |
| V14 | `Add_appointment_metadata_columns` | notes, reason on appointments |
| V15 | `Add_appointment_lab_result_columns` | result_value, reference_range, notes, deleted on lab_results |
| V16 | `Expand_user_role_constraint_for_rbac` | Role CHECK expanded: ADMIN, DOCTOR, NURSE, RECEPTIONIST, PHARMACIST, ACCOUNTANT, PATIENT |
| V17 | `Add_inventory_quantity_constraints` | CHECK >= 0 on inventory_items and inventory_lots quantity fields |
| V18 | `Align_invoice_status_constraint` | PENDING->UNPAID, VOID->CANCELLED |
| V19 | `Add_pharmacy_dispense_traceability` | lot_id, medical_record_id, prescription_item_name, dispensed_to_patient on inventory_movements + 2 indexes |
| V20 | `Add_email_delivery_attempts` | email_delivery_attempts + 2 indexes |

---

## Domain: Core Operations (7 tables)

### departments
Base hospital departments. Soft-deletable via `is_active`.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| name | VARCHAR(150) | NOT NULL, UNIQUE |
| description | TEXT | |
| image_url | VARCHAR(500) | |
| phone | VARCHAR(20) | |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE |
| created_at / updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |

### users
Staff accounts for all hospital roles.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| department_id | UUID | FK -> departments(id) ON DELETE SET NULL |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| password_hash | VARCHAR(255) | NOT NULL |
| full_name | VARCHAR(200) | NOT NULL |
| phone | VARCHAR(20) | |
| role | VARCHAR(20) | NOT NULL, CHECK (ADMIN, DOCTOR, NURSE, RECEPTIONIST, PHARMACIST, ACCOUNTANT, PATIENT) |
| specialty | VARCHAR(200) | |
| qualification | VARCHAR(200) | |
| avatar_url | VARCHAR(500) | |
| experience_years | INTEGER | |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE |

Index: `idx_users_role` on (role)

### time_slots
Individual appointment slots generated from schedule templates.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| doctor_id | UUID | FK -> users(id) ON DELETE CASCADE |
| slot_date | DATE | NOT NULL |
| start_time / end_time | TIME | NOT NULL |
| status | VARCHAR(20) | NOT NULL, CHECK (AVAILABLE, BOOKED, BLOCKED) |

Index: `idx_time_slots_doctor_date` on (doctor_id, slot_date)

### patients
Patient demographic data. Contains PHI.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| full_name | VARCHAR(200) | NOT NULL |
| phone | VARCHAR(20) | NOT NULL |
| email | VARCHAR(255) | NOT NULL (V3) |
| date_of_birth | DATE | NOT NULL |
| gender | VARCHAR(20) | NOT NULL (V5) |
| cccd | TEXT | NOT NULL (AES-GCM encrypted) |
| cccd_hash | VARCHAR(64) | UNIQUE index (SHA-256) |
| province_or_city, district, street_address | VARCHAR(120)/TEXT | (V5) |
| occupation | VARCHAR(120) | (V5) |
| blood_type | VARCHAR(20) | (V5) |
| medical_history | TEXT | (V5) |
| drug_allergies | TEXT | (V5) |
| insurance_number | VARCHAR(64) | (V5) |

Index: `idx_patients_cccd_hash` UNIQUE on (cccd_hash)

**PHI-sensitive:** `cccd` is encrypted with AES-GCM. `cccd_hash` is SHA-256 for deduplication lookups without exposing the plaintext.

### family_members
Family members for dependent booking.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| patient_id | UUID | FK -> patients(id) ON DELETE CASCADE |
| full_name | VARCHAR(200) | NOT NULL |
| relationship | VARCHAR(100) | NOT NULL |
| phone | VARCHAR(20) | |

### appointments
Core appointment entity. Status lifecycle: PENDING -> CONFIRMED -> CHECKED_IN -> IN_PROGRESS -> DONE (or CANCELLED at any point).

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| patient_id | UUID | FK -> patients(id) ON DELETE RESTRICT |
| doctor_id | UUID | FK -> users(id) ON DELETE RESTRICT |
| first_slot_id | UUID | FK -> time_slots(id) ON DELETE RESTRICT |
| appointment_date | DATE | NOT NULL |
| ai_duration_minutes | INTEGER | NOT NULL |
| symptoms | TEXT | |
| confirmation_code | VARCHAR(32) | NOT NULL, UNIQUE |
| status | VARCHAR(20) | NOT NULL, CHECK |
| checked_in_at | TIMESTAMP | (V2) |
| booking_contact_* | various | (V5): full_name, relationship, phone, email, cccd, date_of_birth, gender |
| notes | TEXT | (V14) |
| reason | VARCHAR(500) | (V14) |

Index: `idx_appointments_doctor_date` on (doctor_id, appointment_date)

### medical_records
Clinical records linked one-to-one with appointments.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| appointment_id | UUID | FK -> appointments(id) ON DELETE CASCADE, UNIQUE |
| diagnosis | TEXT | |
| clinical_notes | TEXT | (V2) |
| blood_pressure, temperature, weight, height | various | (V2) |
| conclusion | TEXT | |
| prescription_pdf_url | VARCHAR(500) | |
| follow_up_date | DATE | |
| reminder_scheduled_at / reminder_sent_at | TIMESTAMP | (V3) |

Index: `idx_medical_records_follow_up_due` on (reminder_sent, reminder_scheduled_at)

### prescription_items
Line items within a medical record's prescription.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| medical_record_id | UUID | FK -> medical_records(id) ON DELETE CASCADE |
| medicine_name | VARCHAR(255) | NOT NULL |
| dosage | VARCHAR(255) | NOT NULL |
| frequency | VARCHAR(255) | (V2) |
| duration_days | INTEGER | (V2) |
| instructions | TEXT | |
| sort_order | INTEGER | NOT NULL, DEFAULT 0 (V2) |

---

## Domain: Appointments / Clinical (3 tables)

### appointment_follow_ups (V12)
One-to-one follow-up scheduling per appointment.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| parent_appointment_id | UUID | FK -> appointments(id) ON DELETE CASCADE, UNIQUE |
| follow_up_date | DATE | NOT NULL |
| reason | TEXT | |

Index: `idx_appointment_follow_ups_parent`

### appointment_vital_signs (V13)
Vital signs captured during an appointment.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| appointment_id | UUID | FK -> appointments(id) ON DELETE CASCADE, UNIQUE |
| blood_pressure | VARCHAR(32) | |
| temperature | NUMERIC(5,2) | |
| weight | NUMERIC(6,2) | |
| height | NUMERIC(5,2) | |
| heart_rate | INTEGER | |
| respiratory_rate | INTEGER | |
| oxygen_saturation | NUMERIC(5,2) | |

Index: `idx_appointment_vital_signs_appointment`

### lab_results (V8, V15)
Laboratory test results for patients.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| patient_id | UUID | FK -> patients(id) ON DELETE CASCADE |
| appointment_id | UUID | FK -> appointments(id) ON DELETE SET NULL |
| test_name | VARCHAR(255) | NOT NULL |
| status | VARCHAR(40) | NOT NULL |
| result_summary, result_value, reference_range | TEXT/VARCHAR | (V15 adds value, range) |
| doctor_comment | TEXT | |
| attachment_url | VARCHAR(500) | |
| collected_at | TIMESTAMP | NOT NULL |
| deleted | BOOLEAN | NOT NULL, DEFAULT FALSE (V15) |

Index: `idx_lab_results_patient` on (patient_id, collected_at DESC)

---

## Domain: Patient Portal (4 tables)

### patient_accounts (V8)
Patient portal login accounts (one-to-one with patients).

| Column | Type | Constraints |
|--------|------|-------------|
| patient_id | UUID | PK, FK -> patients(id) ON DELETE CASCADE |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| password_hash | VARCHAR(255) | NOT NULL |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE |

### patient_message_threads (V8)
Conversation threads between patients and staff.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| patient_id | UUID | FK -> patients(id) ON DELETE CASCADE |
| subject | VARCHAR(255) | NOT NULL |
| channel | VARCHAR(40) | NOT NULL |
| unread_count | INTEGER | NOT NULL, DEFAULT 0 |
| last_message_preview | TEXT | |

Index: `idx_patient_message_threads_patient` on (patient_id, updated_at DESC)

### patient_messages (V8)
Individual messages within a thread.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| thread_id | UUID | FK -> patient_message_threads(id) ON DELETE CASCADE |
| sender_role | VARCHAR(32) | NOT NULL |
| body | TEXT | NOT NULL |

Index: `idx_patient_messages_thread` on (thread_id, created_at ASC)

---

## Domain: Inventory (3 tables)

### inventory_items (V7)
Master inventory items tracked by SKU.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| department_id | UUID | FK -> departments(id) ON DELETE SET NULL |
| sku | VARCHAR(64) | NOT NULL, UNIQUE |
| item_name | VARCHAR(255) | NOT NULL |
| category | VARCHAR(120) | NOT NULL |
| unit | VARCHAR(40) | NOT NULL |
| reorder_level | INTEGER | NOT NULL, DEFAULT 0, CHECK >= 0 (V17) |
| quantity_on_hand | INTEGER | NOT NULL, DEFAULT 0, CHECK >= 0 (V17) |
| status | VARCHAR(32) | NOT NULL, DEFAULT 'IN_STOCK' |

Index: `idx_inventory_items_status`

### inventory_lots (V7)
Batch/lot tracking per inventory item.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| item_id | UUID | FK -> inventory_items(id) ON DELETE CASCADE |
| lot_code | VARCHAR(80) | NOT NULL |
| supplier_name | VARCHAR(200) | |
| quantity_received | INTEGER | NOT NULL, DEFAULT 0, CHECK >= 0 (V17) |
| quantity_remaining | INTEGER | NOT NULL, DEFAULT 0, CHECK >= 0 AND <= quantity_received (V17) |
| expires_on | DATE | |

Index: `idx_inventory_lots_item`

### inventory_movements (V7, V19)
Audit trail for every inventory quantity change.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| item_id | UUID | FK -> inventory_items(id) ON DELETE CASCADE |
| lot_id | UUID | FK -> inventory_lots(id) ON DELETE SET NULL (V19) |
| movement_type | VARCHAR(32) | NOT NULL |
| quantity_delta | INTEGER | NOT NULL |
| medical_record_id | UUID | FK -> medical_records(id) ON DELETE SET NULL (V19) |
| prescription_item_name | VARCHAR(255) | (V19) |
| dispensed_to_patient | VARCHAR(255) | (V19) |
| note | TEXT | |

Indexes: `idx_inventory_movements_item` on (item_id, created_at DESC), `idx_inventory_movements_lot` (V19), `idx_inventory_movements_medical_record` (V19)

---

## Domain: Finance (2 tables)

### invoices (V1, V18)
Appointment-linked invoices.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| appointment_id | UUID | FK -> appointments(id) ON DELETE CASCADE, UNIQUE |
| total_amount | NUMERIC(10,2) | NOT NULL, DEFAULT 0 |
| status | VARCHAR(20) | NOT NULL, CHECK (UNPAID, PAID, CANCELLED) (V18 realignment) |
| payment_method | VARCHAR(50) | |
| paid_at | TIMESTAMP | |

### service_pricing (V1)
Service price catalog versioned by effective_date.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| department_id | UUID | FK -> departments(id) ON DELETE CASCADE |
| service_name | VARCHAR(255) | NOT NULL |
| amount | NUMERIC(10,2) | NOT NULL |
| effective_date | DATE | NOT NULL |

---

## Domain: Admin / Operations (4 tables)

### rooms (V5, V6)
Hospital rooms and examination spaces.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| department_id | UUID | FK -> departments(id) ON DELETE SET NULL |
| name | VARCHAR(120) | NOT NULL |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'READY' |
| notes | TEXT | |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE (V6) |

UNIQUE: (department_id, name)

### doctor_work_schedules / schedule_templates (V5, V6)
Recurring weekly schedule templates for doctors.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| doctor_id | UUID | FK -> users(id) ON DELETE CASCADE |
| room_id | UUID | FK -> rooms(id) ON DELETE SET NULL |
| day_of_week | INTEGER | NOT NULL |
| start_time / end_time | TIME | NOT NULL |
| slot_duration_minutes | INTEGER | NOT NULL, DEFAULT 30 |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE |

Index: `idx_doctor_work_schedules_doctor_day` on (doctor_id, day_of_week)

### special_closures (V5, V6)
Date-specific schedule overrides.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| doctor_id | UUID | FK -> users(id) ON DELETE CASCADE |
| room_id | UUID | FK -> rooms(id) ON DELETE CASCADE |
| title | VARCHAR(200) | NOT NULL (V6) |
| closure_date | DATE | NOT NULL |
| reason | TEXT | |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE (V6) |

Index: `idx_special_closures_date`

---

## Domain: Audit & Logging (2 tables)

### audit_logs (V1)
Immutable append-only audit trail.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| actor_id | UUID | FK -> users(id) ON DELETE SET NULL |
| action | VARCHAR(120) | NOT NULL |
| entity_type | VARCHAR(120) | NOT NULL |
| entity_id | UUID | |
| metadata | JSONB | |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |

### email_delivery_attempts (V20)
Outbound email delivery tracking.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| message_type | VARCHAR(80) | NOT NULL |
| recipient | VARCHAR(255) | NOT NULL |
| subject | VARCHAR(255) | NOT NULL |
| provider | VARCHAR(40) | NOT NULL |
| status | VARCHAR(40) | NOT NULL |
| attachment_file_name | VARCHAR(255) | |
| failure_reason | VARCHAR(500) | |

Indexes: `idx_email_delivery_attempts_created` on (created_at DESC), `idx_email_delivery_attempts_status` on (status, created_at DESC)

---

## Domain: Public Content (2 tables)

### hospital_content_sections (V5)
CMS-managed homepage content sections.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| slug | VARCHAR(100) | NOT NULL, UNIQUE |
| title | VARCHAR(200) | NOT NULL |
| body | TEXT | |
| cta_label / cta_href | VARCHAR(120/500) | |
| sort_order | INTEGER | NOT NULL, DEFAULT 0 |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE |

### news_articles (V5)
Hospital news and announcements.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| slug | VARCHAR(150) | NOT NULL, UNIQUE |
| title | VARCHAR(250) | NOT NULL |
| summary | TEXT | NOT NULL |
| content | TEXT | |
| published_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE |

Index: `idx_news_articles_published_at` on (published_at DESC)

---

## Domain: Removed (V11)

Migration V11 dropped all 9 tables created in V9 and V10:

| Table | Created | Purpose |
|-------|---------|---------|
| knowledge_documents | V9 | AI knowledge base documents |
| knowledge_chunks | V9 | Document chunks with vector(8) embeddings |
| knowledge_nodes | V9 | Knowledge graph nodes |
| knowledge_edges | V9 | Knowledge graph edges |
| knowledge_ingestion_states | V9 | Ingestion pipeline state |
| knowledge_document_ingestions | V10 | Per-document ingestion stages |
| internal_assistant_sessions | V10 | AI chat sessions |
| internal_assistant_messages | V10 | AI chat messages |
| internal_assistant_feedback | V10 | User feedback |

The `vector` extension was also removed.

---

## Active Indexes

| Index | Table | Columns | Created |
|-------|-------|---------|---------|
| idx_users_role | users | role | V1 |
| idx_time_slots_doctor_date | time_slots | doctor_id, slot_date | V1 |
| idx_appointments_doctor_date | appointments | doctor_id, appointment_date | V1 |
| idx_medical_records_follow_up_due | medical_records | reminder_sent, reminder_scheduled_at | V3 |
| idx_patients_cccd_hash | patients | cccd_hash (UNIQUE) | V4 |
| idx_news_articles_published_at | news_articles | published_at DESC | V5 |
| idx_doctor_work_schedules_doctor_day | doctor_work_schedules | doctor_id, day_of_week | V5 |
| idx_special_closures_date | special_closures | closure_date | V5 |
| idx_inventory_items_status | inventory_items | status | V7 |
| idx_inventory_lots_item | inventory_lots | item_id | V7 |
| idx_inventory_movements_item | inventory_movements | item_id, created_at DESC | V7 |
| idx_lab_results_patient | lab_results | patient_id, collected_at DESC | V8 |
| idx_patient_message_threads_patient | patient_message_threads | patient_id, updated_at DESC | V8 |
| idx_patient_messages_thread | patient_messages | thread_id, created_at ASC | V8 |
| idx_appointment_follow_ups_parent | appointment_follow_ups | parent_appointment_id | V12 |
| idx_appointment_vital_signs_appointment | appointment_vital_signs | appointment_id | V13 |
| idx_inventory_movements_lot | inventory_movements | lot_id | V19 |
| idx_inventory_movements_medical_record | inventory_movements | medical_record_id | V19 |
| idx_email_delivery_attempts_created | email_delivery_attempts | created_at DESC | V20 |
| idx_email_delivery_attempts_status | email_delivery_attempts | status, created_at DESC | V20 |

---

## PHI Protection

### Patient CCCD Encryption

The `patients.cccd` field (Vietnamese national ID card number) is protected at the application layer:

1. **AES-GCM Encryption** via `PatientIdentifierProtector.encrypt()`. The encryption key is configured via the `PATIENT_IDENTIFIER_SECRET` environment variable.
2. **SHA-256 Hashing** via `PatientIdentifierProtector.hash()`. The hash is stored in `cccd_hash` with a unique index, enabling efficient lookups without exposing the plaintext identifier.

### Audit Trail Sanitization

Security denial audit logs sanitize path parameters by replacing UUIDs and numeric IDs with `{id}` placeholders. Tokens, passwords, and secrets are never written to audit log metadata.

---

## Schema Design Principles

1. **UUID primary keys** on all tables for distributed-friendly unique IDs.
2. **Soft deletes** via `is_active` flags on major entities (departments, users, rooms, schedules, content).
3. **Append-only audit trail** via the `audit_logs` table with JSONB metadata.
4. **Referential integrity** with RESTRICT/SET NULL (never CASCADE) on business-critical FKs.
5. **Status normalization** via CHECK constraints matching Java enum values.
6. **Flyway-only schema management**: Hibernate `ddl-auto` set to `validate`.
