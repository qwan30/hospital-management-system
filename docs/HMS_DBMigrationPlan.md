# Hospital Management System DB Migration Plan

Status: aligned with the repository on 2026-04-26 after AI and internal assistant removal.

## 1. Purpose

This document describes the Flyway migration strategy that actually exists in the repository today.
It replaces older notes that described only an early subset of the schema.

## 2. Current Flyway Setup

- Flyway is enabled in `backend/start/src/main/resources/application.yml`
- migration location is `classpath:db/migration`
- schema validation is performed by JPA with `ddl-auto: validate`

## 3. Current Migration Inventory

| Version | File | Summary |
| --- | --- | --- |
| `V1` | `Create_initial_schema` | base tables for departments, users, slots, patients, appointments, medical records, prescription items, invoices, pricing |
| `V2` | `Add_clinical_workflow_columns` | clinical workflow expansion |
| `V3` | `Add_patient_email_and_follow_up_schedule` | patient email and follow-up support |
| `V4` | `Expand_patient_identifier_and_security` | patient identifier and security hardening |
| `V5` | `Expand_srs_booking_and_operations_foundation` | public content and wider operational support |
| `V6` | `Add_room_schedule_closure_operational_flags` | room and schedule operational flags |
| `V7` | `Add_inventory_management_tables` | inventory items, lots, movements |
| `V8` | `Add_patient_portal_tables` | patient portal, threads, messages, lab results |
| `V9` | `Add_internal_assistant_knowledge_tables` | historical assistant knowledge tables |
| `V10` | `Implement_internal_assistant_v1_safe_rollout` | historical assistant session, message, feedback, and ingestion tables |
| `V11` | `Remove_ai_assistant_features` | drops historical assistant and knowledge tables and removes the vector extension |
| `V12` | `Add_appointment_follow_ups_table` | creates appointment follow-up scheduling table required by current JPA entities |
| `V13` | `Add_appointment_vital_signs_table` | creates appointment-scoped vital-sign capture table required by current JPA entities |
| `V14` | `Add_appointment_metadata_columns` | adds appointment notes and reason metadata columns required by current appointment entities |
| `V15` | `Add_appointment_lab_result_columns` | aligns lab result columns shared by patient portal and clinical lab result entities |

## 4. Current Schema Domains

### 4.1 Core hospital operations

- departments
- users
- time slots
- patients
- appointments
- medical records
- prescription items

### 4.2 Finance

- invoices
- service pricing

### 4.3 Operational admin

- rooms
- doctor schedule templates
- special closures
- audit data and monitoring-related entities

### 4.4 Inventory

- inventory items
- inventory lots
- inventory movements

### 4.5 Patient portal

- patient accounts
- patient message threads
- patient messages
- lab results

### 4.6 Removed assistant tables

`V11__Remove_ai_assistant_features.sql` drops the historical assistant and knowledge tables created by `V9` and `V10`.

## 5. Migration Authoring Rules

When adding new migrations:

- create a new monotonic `V{n}__Description.sql` file
- never edit a migration that has already been applied in shared environments
- keep migrations forward-only
- prefer additive schema changes
- include indexes for new high-read lookup paths
- preserve existing data during structural changes

## 6. Rollback Strategy

Flyway Community does not provide automatic undo migrations.
Use these rollback rules instead:

- restore from backup for destructive production failures
- ship a forward-fix migration for reversible schema mistakes
- test every new migration against a fresh database and an evolved database

## 7. Design Impact

For frontend design and implementation:

- treat contract DTOs in `backend/domain` as the first UI contract
- treat API response envelope classes in `backend/controller` as the HTTP wrapper contract
- treat Flyway migrations as the persistence contract
- do not rely on older schema notes that predate inventory, patient portal, lab results, or AI/assistant removal
