# Seed Data

**Source code:**
- `backend/application/src/main/java/com/hospital/core/seed/SeedDataService.java` (baseline seed)
- `backend/application/src/main/java/com/hospital/core/seed/NonBillingDemoSeedProperties.java` (non-billing performance seed)
- `backend/application/src/main/java/com/hospital/core/seed/ReleaseDemoSeedService.java` (release demo seed)
- `backend/application/src/main/java/com/hospital/core/seed/ReleaseDemoSeedCatalog.java` (predefined seed scenarios)
- `backend/application/src/main/java/com/hospital/core/seed/ReleaseDemoSeedProperties.java` (release demo configuration)
- `backend/start/src/main/java/com/hospital/api/seed/SeedDataConfiguration.java` (runner wiring)

The backend has three seed layers:

1. **Baseline Seed** (`SeedDataService`): Always runs on first startup if core tables are empty.
2. **Non-Billing Demo Seed** (inside `SeedDataService`): Optional large-scale data for performance validation, gated by a separate flag.
3. **Release Demo Seed** (`ReleaseDemoSeedService`): Optional synthetic UAT data with complete clinical workflows.

All seed data is synthetic. No production or real patient data is used.

---

## 1. Baseline Seed

### Trigger Condition

`SeedDataService.seedIfEmpty()` checks `departmentRepository.count() > 0 || userRepository.count() > 0`. If either table has records, the entire baseline seed is skipped.

### Departments (3)

| Department | Description | Phone |
|------------|-------------|-------|
| Internal Medicine | General consultation and chronic care | 028 1000 0001 |
| Pediatrics | Children and adolescent care | 028 1000 0002 |
| Cardiology | Heart and vascular specialty | 028 1000 0003 |

All use Unsplash image: `https://images.unsplash.com/photo-1576091160550-2173dba999ef`

### Service Pricing

| Department | Service | Amount (VND) |
|------------|---------|--------------|
| Internal Medicine | CONSULTATION | 220,000 |
| Pediatrics | CONSULTATION | 180,000 |
| Cardiology | CONSULTATION | 300,000 |

### Staff Accounts (7)

| Email | Password | Full Name | Role | Department |
|-------|----------|-----------|------|------------|
| `doctor1@hospital.vn` | `Doctor@1234` | Dr. Nguyen Van An | DOCTOR | Internal Medicine |
| `doctor2@hospital.vn` | `Doctor@1234` | Dr. Tran Thi Binh | DOCTOR | Cardiology |
| `nurse@hospital.vn` | `Nurse@1234` | Le Thi Cuc | NURSE | Internal Medicine |
| `receptionist@hospital.vn` | `Reception@1234` | Vo Thi Reception | RECEPTIONIST | -- |
| `pharmacist@hospital.vn` | `Pharma@1234` | Hoang Van Pharmacist | PHARMACIST | -- |
| `accountant@hospital.vn` | `Acc@1234` | Pham Van Dung | ACCOUNTANT | -- |
| `admin@hospital.vn` | `Admin@1234` | System Admin | ADMIN | -- |

All staff phone: `0900000000`. Doctors have qualification `MD` and 10 years experience.

### Time Slots

Each baseline doctor gets slots for 14 future days (day offset 1-14), 08:00-17:00 in 30-minute increments, all `AVAILABLE`.

### Inventory Items (3)

| SKU | Item Name | Category | Unit | Qty | Status | Department |
|-----|-----------|----------|------|-----|--------|------------|
| MED-CET-010 | Cetirizine 10mg | Medication | box | 72 | IN_STOCK | Internal Medicine |
| SUP-SAL-500 | Normal Saline 500ml | Consumable | bag | 22 | LOW_STOCK | Internal Medicine |
| EQP-ECG-001 | ECG Electrode Pads | Equipment | pack | 58 | IN_STOCK | Cardiology |

Each item has one lot and one movement record.

### Patient Portal Account (1)

| Field | Value |
|-------|-------|
| Full Name | Nguyen Thi Hoa |
| Email | `patient@example.com` |
| Password | `Patient@1234` |
| CCCD | 012345678901 |
| Blood Type | A+ |

Portal data includes: upcoming appointment (CONFIRMED, +2 days), completed appointment (DONE, -14 days), medical record, lab result (Complete Blood Count), and message thread with 2 messages.

---

## 2. Non-Billing Demo Seed

### Activation

**Environment variable:** `HMS_NON_BILLING_DEMO_SEED_ENABLED` (default `false`)

### Configuration Parameters

| Variable | Default | Description |
|----------|---------|-------------|
| `HMS_NON_BILLING_DEMO_SEED_ENABLED` | `false` | Enable non-billing seed |
| `HMS_NON_BILLING_DEMO_TARGET_DEPARTMENTS` | `20` | Minimum departments |
| `HMS_NON_BILLING_DEMO_TARGET_DOCTORS` | `50` | Minimum doctors |
| `HMS_NON_BILLING_DEMO_TARGET_PATIENTS` | `500` | Minimum patients |
| `HMS_NON_BILLING_DEMO_TARGET_APPOINTMENTS` | `1000` | Minimum appointments |
| `HMS_NON_BILLING_DEMO_TARGET_INVENTORY_ITEMS` | `200` | Minimum inventory items |
| `HMS_NON_BILLING_DEMO_TARGET_AUDIT_LOGS` | `1000` | Minimum audit logs |

### Data Generated

- **Departments:** 17 names cycled (Emergency Medicine, Radiology, Laboratory, Pharmacy, Orthopedics, Dermatology, etc.)
- **Doctors:** `doctor.demo001@hospital.vn` through `doctor.demo{NNN}@hospital.vn`, password `Doctor@1234`
- **Patients:** `patient.demo001@example.com` through `patient.demo{NNN}@example.com`, CCCD pattern `880{NNNNNNNNN}`, blood types A+/B+/O+/AB+
- **Appointments:** Distributed across 21 future days, statuses rotated every 5 (CONFIRMED, CHECKED_IN, IN_PROGRESS, DONE, PENDING)
- **Inventory:** SKU pattern `DEMO-INV-{NNNN}`, every 6th item is LOW_STOCK
- **Audit logs:** Actions: QUEUE_FILTER_VALIDATED, APPOINTMENT_SEARCH_VALIDATED, DOCTOR_SLOT_LOOKUP_VALIDATED, etc.

---

## 3. Release Demo Seed

### Activation

**Environment variable:** `HMS_RELEASE_DEMO_SEED_ENABLED` (default `false`)

```powershell
$env:HMS_RELEASE_DEMO_SEED_ENABLED = "true"
```

Keep disabled for production imports. Enable only for synthetic UAT or release demos.

### Configuration Parameters

| Variable | Default | Description |
|----------|---------|-------------|
| `HMS_RELEASE_DEMO_SEED_ENABLED` | `false` | Enable release demo seed |
| `HMS_RELEASE_DEMO_FUTURE_SLOT_DAYS` | `14` | Available slot generation window |
| `HMS_RELEASE_DEMO_TARGET_PATIENTS` | `8` | Minimum patients |
| `HMS_RELEASE_DEMO_TARGET_APPOINTMENTS` | `12` | Minimum appointments |
| `HMS_RELEASE_DEMO_TARGET_INVENTORY_ITEMS` | `8` | Minimum inventory items |
| `HMS_RELEASE_DEMO_TARGET_AUDIT_LOGS` | `16` | Minimum audit logs |

### Departments (8)

Internal Medicine, Pediatrics, Cardiology (from baseline), plus Emergency Medicine, Radiology, Laboratory, Pharmacy, Orthopedics.

### Staff Accounts (9)

Baseline 7 plus:
- `doctor3@hospital.vn` / `Doctor@1234` / Dr. Le Minh Khoa / DOCTOR / Radiology
- `doctor4@hospital.vn` / `Doctor@1234` / Dr. Pham Nhu Quynh / DOCTOR / Pediatrics

### Rooms (6)

| Name | Department | Status |
|------|------------|--------|
| IM-101 | Internal Medicine | READY |
| IM-102 | Internal Medicine | IN_USE |
| CARD-201 | Cardiology | READY |
| ER-OBS-01 | Emergency Medicine | READY |
| RAD-01 | Radiology | MAINTENANCE |
| LAB-01 | Laboratory | READY |

### Schedule Templates (6)

doctor1: Mon IM-101 08:00-12:00, Wed IM-101 13:30-17:00
doctor2: Tue CARD-201 08:00-12:00, Thu CARD-201 13:30-17:00
doctor3: Mon RAD-01 09:00-12:00
doctor4: Fri IM-102 08:00-11:30

### Patients (7 base + auto-generated)

| # | Full Name | Email | Portal | Blood Type |
|---|-----------|-------|--------|------------|
| 1 | Nguyen Thi Hoa | patient@example.com | Yes | A+ |
| 2 | Nguyen Van Clinical | nguyen.van.clinical@example.com | Yes | O+ |
| 3 | Tran Thi Queue | release.patient002@example.com | Yes | B+ |
| 4 | Le Van Imaging | release.patient003@example.com | No | AB+ |
| 5 | Pham Nhu Portal | release.patient004@example.com | Yes | A- |
| 6 | Vo Minh Finance | release.patient005@example.com | No | O- |
| 7 | Dang Thi Imaging | release.patient006@example.com | No | B- |

All portal patients share password `Patient@1234`.

### Appointment Scenarios (7 base + auto-generated)

| Confirmation Code | Status | Day Offset | Vitals | Med Rec | Lab | Invoice |
|-------------------|--------|------------|--------|---------|-----|---------|
| HMS-UAT-QUEUE-001 | CHECKED_IN | Today | Yes | No | No | No |
| HMS-UAT-QUEUE-002 | IN_PROGRESS | Today | Yes | No | No | No |
| HMS-UAT-QUEUE-003 | CONFIRMED | Today | No | No | No | No |
| HMS-UAT-DONE-001 | DONE | -14 days | Yes | Yes | Yes | PAID |
| HMS-UAT-DONE-002 | DONE | -3 days | Yes | Yes | Yes | UNPAID |
| HMS-UAT-CONFIRM-001 | CONFIRMED | +2 days | No | No | No | No |
| HMS-UAT-PENDING-001 | PENDING | +3 days | No | No | No | No |

### Inventory Items (6 base + auto-generated)

| SKU | Item Name | Qty | Status | Department |
|-----|-----------|-----|--------|------------|
| UAT-MED-AML-005 | Amlodipine 5mg | 92 | IN_STOCK | Internal Medicine |
| UAT-MED-ATR-020 | Atorvastatin 20mg | 12 | LOW_STOCK | Cardiology |
| UAT-LAB-CBC-001 | CBC Reagent Kit | 34 | IN_STOCK | Laboratory |
| UAT-SUP-GLO-001 | Nitrile Gloves | 48 | LOW_STOCK | Emergency Medicine |
| UAT-EQP-ECG-002 | Portable ECG Cable | 7 | IN_STOCK | Cardiology |
| UAT-MED-ORS-001 | Oral Rehydration Salts | 75 | IN_STOCK | Pediatrics |

---

## Workflow Coverage Matrix

| Functional Area | Baseline | Non-Billing | Release Demo |
|-----------------|----------|-------------|--------------|
| Public discovery | Departments, doctors, pricing | Bulk departments | Departments, content, news |
| Public booking | Future slots (2 doctors) | Bulk appointments | Future slots (4 doctors) |
| Staff queue | Portal appt | Bulk across statuses | Today QUEUE scenarios |
| Clinical | Completed visit with record | -- | Vitals, records, prescriptions, follow-ups, lab results |
| Patient portal | 1 patient with thread | -- | 6 patients with messages, appointments, lab results |
| Admin operations | -- | -- | Rooms, schedule templates, closures, content, audit logs |
| Inventory | 3 items with lots | Bulk items | 6+ items with low-stock, lots, movements |
| Finance | -- | -- | Paid and unpaid invoices |

---

## Verification

| Table | Baseline | + Non-Billing (defaults) | + Release Demo (defaults) |
|-------|----------|-------------------------|---------------------------|
| departments | 3 | 20 | 8 |
| users | 7 | 50 | 9 |
| patients | 1 | 500 | 8 |
| appointments | 2 | 1000 | 12 |
| inventory_items | 3 | 200 | 8 |
| audit_logs | 0 | 1000 | 16 |

### Seed Configuration (application.yml)

```yaml
hms:
  seed:
    non-billing-demo:
      enabled: ${HMS_NON_BILLING_DEMO_SEED_ENABLED:false}
      target-departments: ${HMS_NON_BILLING_DEMO_TARGET_DEPARTMENTS:20}
      target-doctors: ${HMS_NON_BILLING_DEMO_TARGET_DOCTORS:50}
      target-patients: ${HMS_NON_BILLING_DEMO_TARGET_PATIENTS:500}
      target-appointments: ${HMS_NON_BILLING_DEMO_TARGET_APPOINTMENTS:1000}
      target-inventory-items: ${HMS_NON_BILLING_DEMO_TARGET_INVENTORY_ITEMS:200}
      target-audit-logs: ${HMS_NON_BILLING_DEMO_TARGET_AUDIT_LOGS:1000}
    release-demo:
      enabled: ${HMS_RELEASE_DEMO_SEED_ENABLED:false}
      future-slot-days: ${HMS_RELEASE_DEMO_FUTURE_SLOT_DAYS:14}
      target-patients: ${HMS_RELEASE_DEMO_TARGET_PATIENTS:8}
      target-appointments: ${HMS_RELEASE_DEMO_TARGET_APPOINTMENTS:12}
      target-inventory-items: ${HMS_RELEASE_DEMO_TARGET_INVENTORY_ITEMS:8}
      target-audit-logs: ${HMS_RELEASE_DEMO_TARGET_AUDIT_LOGS:16}
```
