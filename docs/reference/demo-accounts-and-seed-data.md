# Demo Accounts And Seed Data

**Status:** current seed-data reference for the May 15, 2026 repository baseline.
**Verification sources:** `SeedDataService`, `ReleaseDemoSeedService`, `ReleaseDemoSeedCatalog`, and `ReleaseDemoSeedProperties`.

The backend has two seed layers:

- Baseline seed: always runs on first startup if the core department/user tables are empty.
- Release demo seed: optional synthetic UAT top-up, controlled by `HMS_RELEASE_DEMO_SEED_ENABLED=false` by default.

No production or real patient data is used by either seed layer.

## 1. Baseline Staff Accounts

| Email | Password | Role | Notes |
| --- | --- | --- | --- |
| `doctor1@hospital.vn` | `Doctor@1234` | `DOCTOR` | Internal Medicine |
| `doctor2@hospital.vn` | `Doctor@1234` | `DOCTOR` | Cardiology |
| `nurse@hospital.vn` | `Nurse@1234` | `NURSE` | Queue and vitals workflows |
| `receptionist@hospital.vn` | `Reception@1234` | `RECEPTIONIST` | Booking and queue workflows |
| `pharmacist@hospital.vn` | `Pharma@1234` | `PHARMACIST` | Inventory and prescription preview workflows |
| `accountant@hospital.vn` | `Acc@1234` | `ACCOUNTANT` | Finance and audit-log workflows |
| `admin@hospital.vn` | `Admin@1234` | `ADMIN` | Full admin workflows |

## 2. Baseline Patient Portal Account

| Email | Password | Patient | CCCD source value | Notes |
| --- | --- | --- | --- | --- |
| `patient@example.com` | `Patient@1234` | Nguyen Thi Hoa | `012345678901` | Appointments, medical record, lab result, and portal message thread |

## 3. Release Demo Seed

Enable with:

```powershell
$env:HMS_RELEASE_DEMO_SEED_ENABLED = "true"
```

Docker Compose forwards the same variable to the backend service. Keep it disabled for production imports and enable it only for synthetic UAT or release demos.

Default release-demo targets:

| Variable | Default | Purpose |
| --- | --- | --- |
| `HMS_RELEASE_DEMO_FUTURE_SLOT_DAYS` | `14` | Available public booking slots per release doctor |
| `HMS_RELEASE_DEMO_TARGET_PATIENTS` | `8` | Synthetic patient records |
| `HMS_RELEASE_DEMO_TARGET_APPOINTMENTS` | `12` | Cross-status appointment and queue records |
| `HMS_RELEASE_DEMO_TARGET_INVENTORY_ITEMS` | `8` | Inventory item, lot, movement, and alert records |
| `HMS_RELEASE_DEMO_TARGET_AUDIT_LOGS` | `16` | Admin/audit-monitoring records |

The release seed is idempotent by natural keys: account email, department name, room name, content/news slug, patient email/CCCD hash, appointment confirmation code, SKU/lot code, and audit metadata key.

## 4. Release Demo Coverage

| Flow area | Seeded records |
| --- | --- |
| Public discovery | Departments, doctors, homepage sections, news articles, available doctor slots |
| Public booking | Real doctors and future available slots |
| Staff queue | Today appointments in `CONFIRMED`, `CHECKED_IN`, and `IN_PROGRESS` states |
| Doctor clinical work | Completed appointments, vitals, medical records, prescriptions, and follow-ups |
| Patient portal | `nguyen.van.clinical@example.com` plus baseline patient account, appointments, labs, profile data, and messages |
| Admin operations | Rooms, schedule templates, special closures, content/news records, audit logs |
| Inventory | Medication, consumable, equipment, and lab supply records with low-stock examples |
| Finance | Paid and unpaid invoices tied to completed synthetic appointments |

Release demo patient account:

| Email | Password | Patient | CCCD source value |
| --- | --- | --- | --- |
| `nguyen.van.clinical@example.com` | `Patient@1234` | Nguyen Van Clinical | `098765432109` |

## 5. Verification

Backend:

```powershell
cd D:\projects\hospital-management-system\backend
mvn.cmd -pl application -Dtest=ReleaseDemoSeedPropertiesTest,ReleaseDemoSeedCatalogTest test
```

Release smoke test against a running seeded backend:

```powershell
cd D:\projects\hospital-management-system\web
$env:HMS_EXPECT_RELEASE_DEMO_SEED = "true"
npm.cmd run test:e2e:release-data
```

## 6. Maintenance

When seed data changes, update:

- this file
- `README.md`
- `docs/HMS_DeploymentGuide.md`
- `web/e2e/helpers/personas.ts`
- release smoke tests under `web/e2e/specs`
