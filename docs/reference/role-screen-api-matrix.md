# Role To Screen And API Matrix

**Status:** current role map for the May 13, 2026 repository baseline.
**Verification sources:** `backend/domain/src/main/java/com/hospital/shared/enums/UserRole.java`, `backend/application/src/main/java/com/hospital/core/security/RbacAuthorizationService.java`, `backend/controller/src/main/java`, and `web/src/lib/rbac.ts`.

## 1. Role Summary

| Role | Screens | API families | Status / notes |
| --- | --- | --- | --- |
| Guest | `/`, `/departments`, `/departments/[id]`, `/doctors`, `/news`, `/booking`, legal/security pages | public content, departments, doctors, public appointment create, chatbot | No authentication |
| Patient | `/portal/login`, `/portal/claim`, `/portal/overview`, `/portal/appointments`, `/portal/lab-results`, `/portal/messages`, `/portal/profile`, related portal pages | `/patient-auth`, `/patient-portal` | Portal messages are read-only from the patient side |
| Doctor | `/staff/dashboard`, `/staff/doctor/dashboard`, `/staff/doctor/[id]`, `/staff/schedule`, `/staff/patients`, `/staff/medical-records/[id]/edit`, `/staff/prescriptions/preview`, clinical read pages | `/appointments`, `/me/schedule`, `/patient-records`, `/patients`, `/medical-records`, `/lab-results`, `/vital-signs` | Own clinical workflow emphasis |
| Nurse | `/staff/dashboard`, `/staff/queue`, `/staff/nurse-intake`, `/staff/vital-signs`, `/staff/lab-results`, selected booking/support pages | `/queue`, `/appointments/today`, `/appointments/{id}/checkin`, queue manage actions, `/vital-signs`, lab-result read | Queue assign-room is implemented; no separate live room-board API |
| Receptionist | `/staff/dashboard`, `/staff/booking`, `/staff/queue`, `/staff/support` | appointment read/write/cancel, queue read/check-in/manage | Seeded demo account exists |
| Pharmacist | `/staff/dashboard`, `/staff/inventory`, `/staff/prescriptions/preview`, `/staff/support` | inventory read/manage including alerts, prescription PDF read | Seeded demo account exists |
| Accountant | `/staff/dashboard`, `/staff/invoices`, `/staff/pricing`, `/staff/revenue`, `/admin/audit-logs`, support pages | `/invoices`, `/pricing`, `/reports/revenue`, `/admin/audit-logs` | Seeded demo account exists |
| Admin | `/admin/*`, `/staff/*` where policy permits, `/forbidden` for denial states | all admin families, audit, finance, inventory, protected clinical support | Seeded demo account exists |

## 2. Backend Permission Families

| Permission family | Allowed roles |
| --- | --- |
| Admin user, department, room, schedule, content, monitoring, and stats management | `ADMIN` |
| Audit log read | `ADMIN`, `ACCOUNTANT` |
| Queue read/check-in/manage | `ADMIN`, `NURSE`, `RECEPTIONIST` |
| Appointment read/write/cancel | `ADMIN`, `DOCTOR`, `NURSE`, `RECEPTIONIST` depending on action |
| Appointment status write and follow-up write | `DOCTOR` |
| Schedule read | `DOCTOR` |
| Patient record/history read | `ADMIN`, `DOCTOR` depending on endpoint |
| Medical record write | `ADMIN`, `DOCTOR` |
| Prescription read | `ADMIN`, `DOCTOR`, `PHARMACIST` |
| Lab result read/write | read: `ADMIN`, `DOCTOR`, `NURSE`; write: `ADMIN`, `DOCTOR` |
| Vital signs read/write | `ADMIN`, `DOCTOR`, `NURSE` |
| Invoice, pricing, and revenue | `ADMIN`, `ACCOUNTANT` |
| Inventory | `ADMIN`, `PHARMACIST` |
| Patient portal | `PATIENT` |

## 3. Frontend Route Guard Families

| Route family | Allowed roles |
| --- | --- |
| `/admin` except audit-log exception | `ADMIN` |
| `/admin/audit-logs` | `ADMIN`, `ACCOUNTANT` |
| `/staff/booking`, `/staff/queue` | `ADMIN`, `NURSE`, `RECEPTIONIST` |
| `/staff/nurse-intake` | `ADMIN`, `NURSE` |
| `/staff/vital-signs`, `/staff/lab-results` | `ADMIN`, `DOCTOR`, `NURSE` |
| `/staff/patients`, `/staff/medical-records`, `/staff/doctor` | `ADMIN`, `DOCTOR` |
| `/staff/prescriptions` | `ADMIN`, `DOCTOR`, `PHARMACIST` |
| `/staff/schedule` | `DOCTOR` |
| `/staff/inventory` | `ADMIN`, `PHARMACIST` |
| `/staff/invoices`, `/staff/pricing`, `/staff/revenue` | `ADMIN`, `ACCOUNTANT` |
| `/staff/closures`, `/staff/slots` | `ADMIN` |
| `/staff/support`, `/staff/dashboard` | all staff roles |
| `/portal` | `PATIENT` except public login/claim routes |

Staff shell navigation uses this same route policy for visible links. The primary staff CTA is hidden when the current role cannot access the CTA target.

## 4. Current Limitations

- Patient portal message send/reply is not implemented.
- Patient self-cancel and reschedule APIs are not implemented.
- A separate live nurse room-board system is not implemented; queue assign-room exists as an audited queue workflow action.
- Receptionist and pharmacist seeded demo accounts exist; release-demo data adds cross-role UAT records when enabled.
- Frontend route files exist for many surfaces, but only selected workflows are backend-integrated today.
- Frontend route guards are UX/navigation protection only; backend authorization and 401/403 responses remain the source of truth.
