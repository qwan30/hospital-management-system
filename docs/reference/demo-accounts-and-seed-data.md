# Demo Accounts And Seed Data

**Status:** current seed-data reference for the April 26, 2026 repository baseline.  
**Verification source:** `backend/application/src/main/java/com/hospital/core/seed/SeedDataService.java`

On first startup with an empty database, the backend seeds demo data if both department and user data are empty.

## 1. Persisted Staff Demo Accounts

| Email | Password | Role | Display name | Notes |
| --- | --- | --- | --- | --- |
| `doctor1@hospital.vn` | `Doctor@1234` | `DOCTOR` | Dr. Nguyen Van An | Internal Medicine |
| `doctor2@hospital.vn` | `Doctor@1234` | `DOCTOR` | Dr. Tran Thi Binh | Cardiology |
| `nurse@hospital.vn` | `Nurse@1234` | `NURSE` | Le Thi Cuc | Internal Medicine |
| `accountant@hospital.vn` | `Acc@1234` | `ACCOUNTANT` | Pham Van Dung | finance workflows |
| `admin@hospital.vn` | `Admin@1234` | `ADMIN` | System Admin | admin workflows |

## 2. Patient Portal Demo Account

| Email | Password | Patient | CCCD source value | Notes |
| --- | --- | --- | --- | --- |
| `patient@example.com` | `Patient@1234` | Nguyen Thi Hoa | `012345678901` | seeded with appointments, medical record, lab result, and message thread |

## 3. Role Notes

`RECEPTIONIST` and `PHARMACIST` are current enum/RBAC roles, but the current seed routine does not persist demo accounts for those roles. If those accounts are needed for manual QA, they must be created through admin user management or a future seed-data change.

## 4. Seeded Departments

| Department | Description | Phone |
| --- | --- | --- |
| Internal Medicine | General consultation and chronic care | `028 1000 0001` |
| Pediatrics | Children and adolescent care | `028 1000 0002` |
| Cardiology | Heart and vascular specialty | `028 1000 0003` |

## 5. Seeded Pricing

| Department | Service | Amount |
| --- | --- | --- |
| Internal Medicine | `CONSULTATION` | `220000` |
| Pediatrics | `CONSULTATION` | `180000` |
| Cardiology | `CONSULTATION` | `300000` |

## 6. Seeded Scheduling

- `doctor1@hospital.vn` receives generated 30-minute slots for the next 14 days from 08:00 through 16:30.
- `doctor2@hospital.vn` receives generated 30-minute slots for the next 14 days from 08:00 through 16:30.
- The patient portal demo account also receives one upcoming booked slot and one completed historical slot.

## 7. Seeded Inventory

| SKU | Item | Category | Unit | Quantity | Status |
| --- | --- | --- | --- | --- | --- |
| `MED-CET-010` | Cetirizine 10mg | Medication | box | 72 | `IN_STOCK` |
| `SUP-SAL-500` | Normal Saline 500ml | Consumable | bag | 22 | `LOW_STOCK` |
| `EQP-ECG-001` | ECG Electrode Pads | Equipment | pack | 58 | `IN_STOCK` |

The seed data also creates one lot per item and starter movement history for restock or dispense events.

## 8. Seeded Patient Portal Data

The demo patient has:

- one upcoming confirmed appointment
- one completed appointment
- one medical record for the completed appointment
- one lab result with a sample attachment URL
- one portal message thread
- one staff message and one patient reply in that thread

## 9. Maintenance

When seed data changes, update:

- this file
- `README.md`
- `docs/HMS_DeploymentGuide.md`
- `docs/HMS_TestPlan.md` if test personas or assumptions change
