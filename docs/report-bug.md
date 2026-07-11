# HMS Testing Bug & Issues Report (2026-07-05)

This report logs the issues, configuration bugs, and documentation discrepancies encountered during the E2E verification of the Hospital Management System (HMS) codebase.

---

## Issue 1: Database Container Conflict (Wrong Database Used)

### Summary
Testing connects to the wrong Docker database container (`backend-db-1`), causing password authentication failure for `hospital_user`.

### Environment
* **Product/Service:** Infrastructure / Docker Database
* **Database Image:** `postgres:15-alpine` vs `pgvector/pgvector:pg15`

### Reproduction Steps
1. Start Docker Desktop and run `docker ps`.
2. Observe container `backend-db-1` is active and mapped to port `5432`.
3. Try starting the Spring Boot backend (`mvn spring-boot:run`).
4. Observe Flyway migration and HikariPool fail with `FATAL: password authentication failed for user "hospital_user"`.

### Expected Behavior
The project should connect to its own database container (`infra-postgres-1`) with password `hospital_pass`.

### Actual Behavior
The backend attempts to connect to `localhost:5432`, which was hijacked by `backend-db-1` (from another project).

### Error Details
```
Caused by: org.flywaydb.core.internal.exception.FlywaySqlException: Unable to obtain connection from database: FATAL: password authentication failed for user \"hospital_user\"
SQL State  : 28P01
```

### Impact
**High** — Prevents the backend application from starting.

### Resolution
Stop `backend-db-1` and start the correct container `infra-postgres-1`.

---

## Issue 2: PowerShell Environment Variable Propagation Bug in `run.ps1`

### Summary
The backend launcher script `backend/run.ps1` fails to set environment variables from the `.env` file for background processes, leading to runtime UnsatisfiedDependencyExceptions.

### Environment
* **OS:** Windows / PowerShell
* **Launcher File:** `backend/run.ps1`

### Reproduction Steps
1. Run `.\backend\run.ps1` in a background terminal task.
2. Monitor Spring Boot logs.
3. Observe compilation succeeds but starting Tomcat fails with UnsatisfiedDependencyException because database passwords and JWT secrets are empty/missing.

### Expected Behavior
The script should load all variables from `.env` and set them in the process scope for the Maven execution.

### Actual Behavior
The script skips setting variables if any process variable already exists, and fails to pass them to Maven background tasks.

### Error Details
```
Error creating bean with name 'authorizationDenialAuditFilter' ... Unsatisfied dependency expressed through constructor parameter 0: Error creating bean with name 'auditLogService' ... Cannot resolve reference to bean 'jpaSharedEM_entityManagerFactory'
```

### Impact
**High** — Prevents launching the dev server in the background via the default launcher script.

### Workaround
Explicitly parse the `.env` file and set the environment variables using `$env:KEY = VALUE` in the active shell before calling `mvn spring-boot:run`.

---

## Issue 3: Documentation Discrepancies vs Ground Truth Code

### Summary
Several metrics and counts in the `docs/` folder are out of sync with the actual codebase.

### Environment
* **Files Affected:** 
  * [api-contract.md](file:///d:/projects/hospital-management-system/docs/05-api/api-contract.md)
  * [engineering-metrics.md](file:///d:/projects/hospital-management-system/docs/reference/engineering-metrics.md)
  * [prd.md](file:///d:/projects/hospital-management-system/docs/02-product/prd.md)
  * [final-documentation-review-notes.md](file:///d:/projects/hospital-management-system/docs/audits/final-documentation-review-notes.md)

### Discrepancy Breakdown

#### 1. REST API Endpoints Count
* **Documented:** **118** endpoints across **32** controllers.
* **Actual Code:** **124** mapped endpoints.
* **Impact:** **Low** — The detailed inventory lists all 124 correctly, but the statistics table has outdated totals.

#### 2. Backend Test Files Count
* **Documented:** **34** test files (under `application` and `start` modules).
* **Actual Code:** **59** test files (including `controller` and `infrastructure` modules).
* **Impact:** **Low** — Documented metrics underestimate test coverage assets.

#### 3. Playwright E2E Specs
* **Documented:** **25** specs.
* **Actual Code:** **31** specs in `frontend/e2e/specs/`.
* **Impact:** **Low** — Missing newly added specs in document references.

#### 4. Flyway Migrations Version
* **Documented:** PRD and final review notes state migrations go from **V1 to V16**.
* **Actual Code:** Migration folder has **20** files (**V1 to V20**).
* **Impact:** **Medium** — Critical audit trail discrepancies. Migrations V17 to V20 (which add quantity constraints, status alignments, and email logs) are omitted from the PRD context.

---

## Issue 4: Doctor Outpatient Consultation Queue Access Forbidden (403)

### Summary
Users logged in with the Doctor role are denied access to the consultation queue system (returning HTTP 403 / Forbidden on `/staff/queue`), preventing them from managing or picking patients dynamically in the UI.

### Environment
* **Product/Service:** Frontend (Staff Portal) / Role-Based Access Control (RBAC)
* **Access Route:** `/staff/queue`
* **Actor:** Doctor (`doctor1@hospital.vn`)

### Reproduction Steps
1. Log in as a Doctor (`doctor1@hospital.vn`).
2. Attempt to navigate to the outpatient consultation queue page `/staff/queue`.
3. Observe an "Access Denied / Forbidden" error page.

### Expected Behavior
Doctors should have visibility into their own or their department's consultation queue to select, triage, and call waiting patients.

### Actual Behavior
Doctors are completely blocked from viewing the queue. They must know the appointment UUID beforehand and type/access the direct editing URL: `/staff/medical-records/[appointmentId]/edit`.

### Impact
**Medium/High** — Significantly degrades Doctor UX, breaking the intended queue dashboard workflow in clinical operations.

---

## Issue 5: Critical Clinical Safety Bug — Medication Mismatch Dispensation Allowed

### Summary
The backend service and frontend interface allow pharmacists to successfully dispense a stock item that does not match the medication prescribed in the patient's medical record.

### Environment
* **Product/Service:** Backend (`InventoryWriteService`) & Frontend (Inventory Dashboard)
* **API Endpoint:** `POST /api/v1/inventory/dispense`
* **Actor:** Pharmacist (`pharmacist@hospital.vn`)

### Reproduction Steps
1. Log in as a Doctor. Create a medical record containing a prescription for `Paracetamol 500mg`.
2. Log in as a Pharmacist. Go to the Inventory Dispensation interface.
3. Select an inventory item of **Amlodipine 5mg** (`itemId: 2d6d56d1-fd10-4c72-932e-dc6627f20ae2`).
4. Enter the patient's `medicalRecordId` and type `Paracetamol 500mg` as the `prescriptionItemName`.
5. Submit the dispensation form.

### Expected Behavior
The system should validate that the physical stock item being dispensed (`itemId` / name) matches the name or identifier of the prescribed medicine (`prescriptionItemName`). If there is a mismatch, the transaction must fail with a `ConflictException` (409) or warning.

### Actual Behavior
The backend `InventoryWriteService.dispenseMedication()` only checks if the prescription name string exists on the record and if the lot belongs to the item. It **fails** to verify if the physical stock item (Amlodipine) matches the prescribed item (Paracetamol). The transaction completes successfully, deducting Amlodipine stock from the inventory lot while marking the Paracetamol prescription as fulfilled.

### Error Details
No error is thrown. The API returns:
```json
{
  "success": true,
  "message": "Dispensed 5 Amlodipine 5mg from UAT-MED-AML-005-LOT."
}
```

### Impact
**Critical** — Severe clinical safety risk. Could result in patient receiving the wrong medication, and causes data/stock inventory inaccuracy.

---

## Issue 6: Client-Side Session & State Management Glitches

### Summary
Minor issues in Next.js client routing and token management lead to broken logouts and initial API failures.

### Environment
* **Product/Service:** Frontend Next.js Client & Route Guards

### Details

#### 1. Logout Redirection
* **Description:** Clicking the "Logout" button on the UI does not trigger redirection in a timely manner. The user is left on the dashboard with dead/unauthorized layout states.
* **Workaround:** Navigating directly to `/auth/logout` forces token invalidation and redirection to the login page.

#### 2. Initial 401 Unauthorized API Requests
* **Description:** Accessing search or dashboard pages triggers immediate `GET /patient-records 401` errors in the console. Although the client-side axios/fetch interceptors recover and refresh the token immediately, this introduces page loading jank and console noise.

### Impact
**Low/Medium** — Performance and user experience degradation.

---

## Issue 7: Frontend Accessibility (A11y) Warnings

### Summary
Multiple form elements (input, select) across the staff portal lack explicit `<label>` or `aria-label` tags, triggering accessibility warning flags in browser audits.

### Environment
* **Product/Service:** Frontend HTML Structure

### Impact
**Low** — Cosmetic and standard compliance issue.
