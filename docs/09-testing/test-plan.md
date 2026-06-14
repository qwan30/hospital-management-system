# Test Plan

**Version:** 1.0
**Date:** 2026-06-14
**Basis:** HMS_TestPlan.md, business-flow-test-matrix.md, source code

---

## 1. Scope

This test plan covers the complete testing scope for the Hospital Management System (HMS), including backend (Java Spring Boot), frontend (Next.js), and end-to-end testing across all 11 business modules and 7 user roles.

### In Scope
- All 7 clinical workflows (Public Booking, Staff Auth, Queue, Doctor Clinical, Pharmacy, Billing, Patient Portal)
- All 6 staff roles + patient role
- Backend API contracts (REST endpoints)
- Frontend routes and UI components
- State machine transitions for all entities
- RBAC enforcement at both frontend and backend
- Audit logging for all state-changing operations

### Out of Scope
- Third-party integrations (email provider, external lab systems)
- Load/stress testing
- Penetration testing (beyond basic security hardening)
- Mobile native applications

---

## 2. Backend Test Suites

### 2.1 Integration Test Suites (backend/start)

All backend integration tests share a Testcontainers PostgreSQL instance and seed data via Flyway migrations.

#### ClinicalWorkflowIntegrationTest

**Purpose:** Verify the complete clinical appointment lifecycle from public booking through to patient history with all intermediate transitions.

**Test cases:**

| Test Method | Scenario | Expected Outcome |
|------------|----------|-----------------|
| `rejectsUnauthenticatedAndWrongRoleAccessOnNurseEndpoints` | Unauthenticated user and doctor attempt to access nurse queue endpoints | 401 for unauthenticated, 403 for wrong role |
| `rejectsDoctorStatusUpdateForAnotherDoctorsAppointment` | Doctor 2 tries to update Doctor 1's appointment status | 403 forbidden |
| `returnsDoctorOwnedAppointmentDetail` | Doctor 1 reads own appointment detail | 200 with full detail including symptoms, duration, patient email |
| `rejectsDoctorAppointmentDetailForAnotherDoctorsAppointment` | Doctor 2 reads Doctor 1's appointment | 403 forbidden |
| `rejectsMissingDoctorAppointmentDetail` | Doctor tries to read non-existent appointment | 404 not_found |
| `rejectsBookingWithoutPatientEmail` | Booking request missing required patientEmail field | 400 validation_error |
| `rejectsDoctorStatusUpdateToDoneFromDashboardWorkflow` | Doctor sets status to DONE via status API (bypassing medical record) | 409 conflict |
| `completesClinicalWorkflowFromPublicBookingToPatientHistory` | Full end-to-end: book -> check-in -> doctor schedule -> IN_PROGRESS -> medical record -> DONE -> patient history -> prescription PDF | All steps succeed with correct state transitions |

---

#### SecurityHardeningIntegrationTest

**Purpose:** Verify security controls: authentication, authorization, CORS, audit logging, and configuration safety.

**Test cases:**

| Test Method | Scenario | Expected Outcome |
|------------|----------|-----------------|
| `rejectsMissingTokenWithUnauthorizedEnvelope` | Access protected endpoint without token | 401 with standard error envelope + audit log |
| `rejectsExpiredJwtToken` | Use expired JWT | 401 unauthorized |
| `rejectsMalformedJwtToken` | Use malformed JWT string | 401 unauthorized |
| `rejectsInvalidSignatureToken` | Use JWT signed with wrong key | 401 unauthorized |
| `auditLogEntryWrittenForSecurityDenial` | Trigger security denial | Audit log contains actor, action, resource, timestamp |
| `corsHeadersPresentOnOptionsRequest` | Send OPTIONS request | CORS headers returned (Access-Control-Allow-Origin, etc.) |
| `corsHeadersPresentOnGetRequest` | Send GET with Origin header | CORS headers returned |
| `rateLimitingAppliedToAuthEndpoint` | Rapid requests to auth endpoint | 429 Too Many Requests after threshold |
| `rateLimitingNotAppliedToBusinessEndpoints` | Normal requests to business endpoint | 200 OK |
| `httpsRedirectionEnabled` | HTTP request | Redirect to HTTPS (301/302) |
| `noDefaultPasswordInConfig` | Scan application.yml | POSTGRES_PASSWORD has no default value |
| `noDefaultPasswordInDockerCompose` | Scan docker-compose.yml | POSTGRES_PASSWORD has no default value |

---

#### ModuleBoundaryTest

**Purpose:** Enforce DDD modular monolith architecture by verifying Maven module dependency rules.

**Test cases:**

| Test Method | Scenario | Expected Outcome |
|------------|----------|-----------------|
| `controllerModuleDoesNotImportDomainInternal` | Scan controller module imports | No imports from domain internal packages |
| `applicationModuleDoesNotImportInfrastructureInternal` | Scan application module imports | No imports from infrastructure internal packages |
| `startModuleDoesNotImportDomainInternalDirectly` | Scan start module imports | No direct domain internal imports (must go through application/controller) |
| `declaredDependenciesMatchUsedDependencies` | Compare POM with actual imports | All used dependencies are declared; no hidden transitive deps |

---

#### Additional Backend Integration Test Suites

| Test Suite | Location | Purpose |
|-----------|----------|---------|
| `AuthenticationIntegrationTest` | `backend/start/src/test/java/com/hospital/api/` | Login, refresh, logout flows, role-based access |
| `LabResultIntegrationTest` | `backend/start/src/test/java/com/hospital/api/` | Lab result CRUD with authorization |
| `AdminOperationsIntegrationTest` | `backend/start/src/test/java/com/hospital/api/` | Admin monitoring and operations endpoints |
| `ReleaseDemoSeedIntegrationTest` | `backend/start/src/test/java/com/hospital/api/` | Seed data generation and idempotency |
| `SecurityConfigurationDefaultsTest` | `backend/start/src/test/java/com/hospital/api/` | No default passwords in any config file |

### 2.2 Application Unit Test Suites (backend/application)

| Service Test | Test File | Key Coverage |
|-------------|-----------|--------------|
| Appointment Write | `AppointmentWriteServiceTest.java` | Slot validation, booking creation, conflict detection |
| Appointment Workflow | `AppointmentWorkflowTest.java` | Status transition rules, guard conditions |
| Medical Record | `MedicalRecordServiceTest.java` | Record creation, duplicate detection, PDF preview |
| Prescription PDF | `PrescriptionPdfServiceTest.java` | PDF generation, template rendering, content accuracy |
| Reminder | `ReminderServiceTest.java` | Follow-up scheduling, delivery attempts |
| Inventory Write | `InventoryWriteServiceTest.java` | Item/lot/movement CRUD, stock validation |
| Inventory Alert | `InventoryAlertServiceTest.java` | Low-stock threshold, expiry detection |
| Monitoring Snapshot | `OperationsMonitoringSnapshotServiceTest.java` | System health check aggregation |
| Lab Result | `LabResultServiceTest.java` | Result CRUD, appointment linkage |
| RBAC Authorization | `RbacAuthorizationServiceTest.java` | Permission enforcement, role hierarchy |
| Vital Signs | `VitalSignsServiceTest.java` | Numeric validation, appointment linkage |

---

## 3. Frontend Test Suites

### 3.1 Vitest Unit Test Suites

| Test Area | Location | Coverage |
|-----------|----------|----------|
| API Client | `web/src/lib/__tests__/` | Bearer token, public passthrough, error handling |
| RBAC Utilities | `web/src/lib/__tests__/` | Permission checks, role hierarchy |
| Route Guards | `web/src/components/auth/__tests__/` | Authorization redirect, forbidden handling |
| Navigation Shell | `web/src/components/shells/__tests__/` | Role-filtered menus, hidden links |
| UI Components | `web/src/components/ui/__tests__/` | Form fields, status badges, buttons |
| Queue Page | `web/src/app/staff/(app)/queue/__tests__/` | Loading, error, filtering, check-in, terminal actions |
| Staff Login | `web/src/app/staff/(auth)/login/__tests__/` | Form validation, fail-closed behavior |
| Booking Flow | `web/src/app/(public)/booking/__tests__/` | Slot selection, form validation, confirmation |
| Admin Pages | `web/src/app/admin/(app)/*/__tests__/` | Users, departments, rooms, news, inventory CRUD |
| Portal Pages | `web/src/app/portal/(app)/*/__tests__/` | Overview, appointments, lab results, profile |
| Doctor Dashboard | `web/src/app/staff/(app)/doctor/dashboard/__tests__/` | Appointment list, status actions |

### 3.2 Playwright E2E Test Suites

#### 3.2.1 UI Smoke Suite

**Command:** `npm run test:e2e:ui`

| Spec | Scenarios |
|------|-----------|
| `ui-smoke.spec.ts` | All public, staff, admin, and portal routes render without error |
| `responsive.spec.ts` | Key pages display correctly at mobile (375px), tablet (768px), and desktop (1280px) widths |
| `a11y-integrated.spec.ts` | Accessibility scans (axe-core) on login, booking, queue, and portal pages |
| `seo-audit.spec.ts` | Meta tags, title, description, Open Graph, and structured data on public pages |

#### 3.2.2 CI Smoke Suite

**Command:** `npm run test:e2e:ci`

| Spec | Scenarios |
|------|-----------|
| `all-routes-exhaustive.spec.ts` | Every defined route returns the expected HTTP status code |
| `api-client.spec.ts` | Public API client functions behave correctly |
| `route-audit.spec.ts` | Route contract verification against backend API inventory |

#### 3.2.3 Integrated Suite

**Command:** `npm run test:e2e:integrated` (requires backend at `HMS_API_URL`)

| Spec | Scenarios | Dependencies |
|------|-----------|--------------|
| `auth-integrated.spec.ts` | Staff login/logout, patient login/claim/logout | Backend auth endpoints |
| `rbac.spec.ts` | Route guard enforcement for all roles | Backend RBAC |
| `rbac-enforcement.spec.ts` | API-level forbidden access | Backend RBAC |
| `booking-wizard.spec.ts` | Guest booking flow with slot selection | Backend departments, doctors, slots, appointments |
| `staff-queue.spec.ts` | Check-in, call, room, start, complete, skip | Backend queue + appointments |
| `staff-clinical.spec.ts` | Doctor dashboard, medical record, prescription | Backend appointments + medical records |
| `staff-operations.spec.ts` | Inventory, invoices, pricing, revenue | Backend inventory + finance |
| `portal-pages.spec.ts` | Portal overview, appointments, lab results, profile | Backend patient portal |
| `admin-pages.spec.ts` | Users, departments, rooms, monitoring, audit logs | Backend admin |
| `workflows.spec.ts` | Multi-step cross-module journeys | Full backend |
| `security.spec.ts` | XSS, CSRF, security header checks | Backend |

#### 3.2.4 Visual Suite

**Command:** `npm run test:e2e:visual`

| Spec | Scenarios |
|------|-----------|
| `visual.spec.ts` | Visual regression snapshots for high-risk pages (Chromium baseline) |

### 3.3 Frontend Test Execution Matrix

| Test Suite | Command | Parallel | Required for CI |
|-----------|---------|----------|-----------------|
| Vitest Unit | `npm run test` | Yes | Yes |
| UI Smoke | `npm run test:e2e:ui` | No (Chromium only) | Yes |
| CI Smoke | `npm run test:e2e:ci` | No (Chromium only) | Yes |
| Integrated | `npm run test:e2e:integrated` | No (Chromium only) | Yes |
| Visual | `npm run test:e2e:visual` | No (Chromium only) | Conditional |

---

## 4. Business Flow Test Coverage Matrix

| Flow ID | Business Flow | Backend Test | Frontend Unit | Playwright E2E | Priority |
|---------|--------------|-------------|---------------|----------------|----------|
| BF-01 | Public Booking | ClinicalWorkflowIntegrationTest | Booking form validation | `booking-wizard.spec.ts` | P0 |
| BF-02 | Staff Auth/RBAC | SecurityHardeningIntegrationTest, AuthenticationIntegrationTest | Login form, route guards | `auth-integrated.spec.ts`, `rbac.spec.ts` | P0 |
| BF-03 | Admin Operations | AdminOperationsIntegrationTest | Admin CRUD forms | `admin-pages.spec.ts` | P1 |
| BF-04 | Scheduling | (Integration in admin scope) | Slot generation UI | Covered by admin-pages E2E | P0 |
| BF-05 | Queue/Intake | ClinicalWorkflowIntegrationTest | Queue component actions | `staff-queue.spec.ts` | P0 |
| BF-06 | Clinical Record | ClinicalWorkflowIntegrationTest | Medical record form | `staff-clinical.spec.ts` | P0 |
| BF-07 | Lab Results | LabResultIntegrationTest | Lab result list/detail | Covered by staff-operations E2E | P1 |
| BF-08 | Patient Portal | (Integration in auth scope) | Portal components | `portal-pages.spec.ts` | P0 |
| BF-09 | Inventory/Pharmacy | InventoryWriteServiceTest, InventoryAlertServiceTest | Inventory CRUD forms | `staff-operations.spec.ts` | P0 |
| BF-10 | Finance | (Integration in admin scope) | Invoice/pricing/revenue | `staff-operations.spec.ts` | P0 |
| BF-11 | Reminders | ReminderServiceTest | (No UI) | (Backend-only) | P1 |
| BF-12 | UAT Seed | ReleaseDemoSeedIntegrationTest | (No UI) | Manual verification | P0 |

---

## 5. Test Data Requirements

### Pre-conditions for Integration Tests

| Data Entity | Quantity | Notes |
|-------------|----------|-------|
| Users (staff) | 7+ | One per role: admin, doctor(2), nurse, receptionist, pharmacist, accountant |
| Departments | 3+ | At least one with doctors assigned |
| Doctors | 2+ | Linked to a department |
| Patients | 5+ | With varying demographics |
| Rooms | 3+ | Various statuses (READY, IN_USE) |
| Slots | 20+ | Various dates, AVAILABLE/BOOKED/BLOCKED |
| Appointments | 10+ | In various statuses (CONFIRMED through DONE) |
| Inventory Items | 5+ | With lots and movement history |
| Invoices | 5+ | Mix of UNPAID, PAID, CANCELLED |

### Seed Accounts

All seed accounts and passwords are defined in Flyway migrations and the seed service. Tests authenticate using the shared credentials documented in the test strategy.

---

## 6. Test Execution Order

### Recommended Test Run Sequence (Full CI)

```
Phase 1: Fast Feedback
  1. Frontend lint (npm run lint)
  2. Backend compile (mvn compile -pl application)
  3. Frontend Vitest unit tests (npm run test)

Phase 2: Backend Verification
  4. Backend application unit tests (mvn test -pl application)
  5. Backend integration tests (mvn verify -pl start)

Phase 3: Frontend Build + E2E
  6. Frontend build (npm run build)
  7. E2E UI smoke (npm run test:e2e:ui)
  8. E2E CI smoke (npm run test:e2e:ci)
  9. E2E integrated (npm run test:e2e:integrated)

Phase 4: Extended
  10. Visual regression (npm run test:e2e:visual)
  11. Coverage report generation
  12. Module boundary verification (already in mvn verify)
```

---

## 7. Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Docker unavailable for integration tests | Backend integration tests skipped | `disabledWithoutDocker = true`, CI pipeline has Docker |
| Flaky E2E tests | CI failures | Quarantine policy; prefer API-level setup over UI interaction |
| Test data drift | Tests pass against stale seed data | Seed service idempotency; run `ReleaseDemoSeedIntegrationTest` |
| Module boundary violations | Architecture erosion | `ModuleBoundaryTest` runs in every CI build |
| Coverage regression | Quality degradation | JaCoCo + c8 enforcement in CI; coverage reports in every build |
| Cross-patient data leakage | PHI breach | ClinicalWorkflowIntegrationTest enforces doctor ownership; portal tests scope to patient identity |

---

## 8. Test Deliverables

| Artifact | Format | Location |
|----------|--------|----------|
| Test plan | Markdown | `docs/09-testing/test-plan.md` |
| Test strategy | Markdown | `docs/09-testing/test-strategy.md` |
| Business flow matrix | Markdown | `docs/06-testing/business-flow-test-matrix.md` |
| Backend test report | JUnit XML | `backend/*/target/surefire-reports/` |
| Backend coverage report | HTML | `backend/*/target/site/jacoco/` |
| Frontend coverage report | Text/HTML | `coverage/` (Vitest) |
| E2E test report | HTML | `web/playwright-report/` |
| Visual snapshots | PNG | `web/e2e/snapshots/` |

---

## 9. Release Criteria

### Mandatory (All P0 Flows)
- Backend unit tests: 100% pass
- Backend integration tests: 100% pass (with Docker)
- Frontend Vitest: 100% pass with 80%+ coverage
- E2E UI smoke: 0 failures
- E2E CI smoke: 0 failures
- E2E integrated: 0 failures
- Build: Frontend + Backend compile without error
- Module boundary: No violations

### Recommended (P1 Flows)
- Visual regression: No unexpected diffs
- Accessibility: No critical violations
- Responsive: Key pages render at mobile/tablet/desktop

### Demoted (Not Blocking Release)
- WebKit/Firefox E2E tests (maintained but not gated)
- Performance benchmarks (exploratory only)
- Portal auxiliary routes (read-only/static content)
