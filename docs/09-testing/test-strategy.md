# HMS Test Strategy

**Version:** 1.0
**Last updated:** 2026-06-14
**Applies to:** Hospital Management System (HMS)

---

## 1. Purpose and Scope

This document defines the testing strategy for the Hospital Management System. It describes the test pyramid, coverage targets, test data management, CI integration, flaky test policy, and regression approach. It applies to all code under `backend/` (Java/Spring Boot modular monolith) and `web/` (Next.js/React frontend).

---

## 2. Test Pyramid and Layers

The HMS project follows a three-layer test pyramid: unit tests at the base, integration tests in the middle, and end-to-end (E2E) tests at the top, supplemented by static analysis and security scanning.

### 2.1 Backend Test Layers

```
          /\
         /  \
        / E2E\        -- Playwright E2E (backend-backed scenarios)
       /------\
      / Integ- \      -- SpringBootTest + Testcontainers PostgreSQL
     /  ration  \      (20 test classes, including security/module-boundary)
    /------------\
   /   Unit       \   -- JUnit 5 + Mockito service-layer tests
  /    (14 suites)  \  (appointment, inventory, medical record, RBAC, etc.)
 /____________________\
```

#### 2.1.1 Unit Tests (backend/application/src/test)

| Test class | Service under test |
|---|---|
| `AppointmentWriteServiceTest` | Appointment creation and conflict detection |
| `AppointmentWorkflowServiceTest` | Multi-step appointment workflow orchestration |
| `MedicalRecordServiceTest` | Medical record CRUD |
| `PrescriptionPdfServiceTest` | PDF generation for prescriptions |
| `VitalSignsServiceTest` | Vital signs recording and retrieval |
| `RbacAuthorizationServiceTest` | Role-based access control logic |
| `InventoryServiceTest` | Inventory query logic |
| `InventoryWriteServiceTest` | Inventory write operations and audit events |
| `LabResultServiceTest` | Lab result CRUD |
| `ReminderServiceTest` | Follow-up reminder scheduling |
| `OperationsAdminServiceTest` | Admin monitoring snapshots |
| `NonBillingDemoSeedPropertiesTest` | Non-billing demo seed configuration |
| `ReleaseDemoSeedPropertiesTest` | Release demo seed configuration |
| `ReleaseDemoSeedCatalogTest` | Release demo seed data catalog |

Unit tests mock all dependencies at the service boundary using Mockito. They cover business logic, validation rules, edge cases, and authorization logic in isolation.

#### 2.1.2 Integration Tests (backend/start/src/test)

| Test class | Coverage area |
|---|---|
| `AbstractIntegrationTest` | Base class -- Testcontainers PostgreSQL lifecycle, MockMvc, auth/appointment helpers |
| `ClinicalWorkflowIntegrationTest` | Full clinical consultation flow |
| `SecurityHardeningIntegrationTest` | Security headers, rate limiting, CORS, CSRF |
| `ModuleBoundaryTest` | Maven dependency graph + source-level import enforcement |
| `SecurityConfigurationDefaultsTest` | Default security configuration assertions |
| `AuthenticationIntegrationTest` | Staff login, refresh, logout |
| `PatientAuthIntegrationTest` | Patient login, refresh, claim |
| `QueueWorkflowIntegrationTest` | Queue check-in, call, room, complete |
| `FinanceIntegrationTest` | Invoice, payment, void, pricing, revenue |
| `InventoryIntegrationTest` | Item, lot, movement, alerts, dispense |
| `LabResultIntegrationTest` | Lab result create, list, review, delete |
| `PatientPortalIntegrationTest` | Patient portal endpoints |
| `AdminUserIntegrationTest` | Admin user management |
| `AdminDepartmentRoomIntegrationTest` | Admin department and room management |
| `AdminOperationsIntegrationTest` | Admin monitoring and audit logs |
| `PublicEndpointIntegrationTest` | Public API endpoints |
| `NotificationDeliveryIntegrationTest` | Email delivery attempt recording |
| `EdgeCaseIntegrationTest` | Boundary conditions and error handling |
| `ReleaseDemoSeedIntegrationTest` | Release demo data seeding |
| `AiIntegrationControllerIntegrationTest` | AI integration controller |

Integration tests use `@SpringBootTest` with a real PostgreSQL instance via Testcontainers (`pgvector/pgvector:pg15`). All tests are `@Transactional` and roll back after each test method. MockMvc is used for HTTP-layer assertions. Rate limiting is disabled in the test profile.

#### 2.1.3 Module Boundary Enforcement

The `ModuleBoundaryTest` enforces the dependency graph for the five Maven modules:

```
domain  <-  infrastructure  <-  application  <-  controller  <-  start
```

It verifies both `pom.xml` declared dependencies and Java source-level imports, preventing hidden transitive dependency violations (e.g., controller importing infrastructure directly). Each module's `pom.xml` also uses `maven-enforcer-plugin` to ban disallowed dependencies at compile time.

### 2.2 Frontend Test Layers

```
          /\
         /  \
        / E2E\        -- Playwright (Chromium/Firefox/Safari/Mobile)
       /------\
      / Comp-  \      -- Vitest + @testing-library/react
     / onent    \      (page-level render/interaction tests)
    /------------\
   /   Unit       \   -- Vitest utility/API-client/lib tests
  /    (50+ files)  \  (RBAC, API clients, helpers, formatting)
 /____________________\
```

#### 2.2.1 Frontend Unit Tests (Vitest)

Location: `web/src/**/__tests__/`

Configuration (`web/vitest.config.ts`):
- Environment: jsdom
- Setup: `@testing-library/jest-dom` matchers
- Coverage provider: v8
- Test timeout: 10 seconds
- Path alias: `@` maps to `./src`

Coverage areas:
- **Lib tests:** `api-client.test.ts`, `rbac.test.ts`, `rbac-route-matrix.test.ts`, `staff-queue.test.ts`, `public-api.test.ts`, `clinical-api.test.ts`, `operations-api.test.ts`, `operations-api-fallbacks.test.ts`, `medical-records-api.test.ts`, `patient-records-api.test.ts`, `client-events.test.ts`, `use-stored-role.test.ts`
- **Component tests:** `route-guard.test.tsx`, `side-nav.test.tsx`, `top-nav.test.tsx`, `public-top-nav.test.tsx`, `portal-side-nav.test.tsx`, `footer.test.tsx`, `data-panel.test.tsx`
- **Page tests:** 30+ page-level tests across public, staff, admin, and portal route groups

#### 2.2.2 Frontend E2E Tests (Playwright)

Location: `web/e2e/specs/`

Configuration (`web/playwright.config.ts`):
- Test directory: `./e2e`
- Fully parallel execution
- CI retries: 2; local retries: 0
- CI workers: 1; local workers: 2
- Browsers: Chromium, Firefox, WebKit, Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12)
- Built-in web server: `npm run dev` on configurable port

**E2E test suites:**

| Suite spec file | Tag | Tests | Purpose |
|---|---|---|---|
| `all-routes-exhaustive.spec.ts` | @ui | Part of 323 | Every frontend route returns 200 |
| `admin-pages.spec.ts` | @ui | Part of 323 | Admin page rendering and navigation |
| `portal-pages.spec.ts` | @ui | Part of 323 | Patient portal page rendering |
| `ui-smoke.spec.ts` | @ui | Part of 323 | Core UI smoke checks |
| `responsive.spec.ts` | @ui | Part of 323 | Responsive layout tests |
| `a11y-integrated.spec.ts` | @ui + @integrated | Multiple | axe-core accessibility audits |
| `seo-audit.spec.ts` | @ui | SEO meta tag validation |
| `visual.spec.ts` | @visual | 14 baselines | Visual regression snapshots |
| `auth-integrated.spec.ts` | @integrated | 92 total | Staff and patient auth flows |
| `api-client.spec.ts` | @ci | 183 total | API client contract behavior |
| `rbac.spec.ts` | @ci | 183 total | Role-based access control |
| `rbac-enforcement.spec.ts` | @ci | 183 total | Route guard enforcement |
| `operations-api.spec.ts` | @ci | 183 total | Operations API smoke checks |
| `staff-queue.spec.ts` | @ci | 183 total | Queue workflow |
| `staff-operations.spec.ts` | @ci | 183 total | Staff operations pages |
| `staff-clinical.spec.ts` | @ci | 183 total | Clinical workflows |
| `booking-wizard.spec.ts` | @ui | Booking flow validation |
| `security.spec.ts` | @ci | 183 total | Security edge cases |
| `workflows.spec.ts` | @ui | Multi-step workflow validation |
| `release-demo-data.spec.ts` | -- | Release demo data verification |
| `route-audit.spec.ts` | -- | Route inventory audit |
| `live-all-routes-audit.spec.ts` | -- | Live route verification |
| `live-route-contracts.spec.ts` | -- | Live route contract tests |
| `ui-truthfulness.spec.ts` | -- | UI truthfulness (no fake/hash-link bugs) |
| `performance.spec.ts` | -- | Exploratory, skipped until stable |

**Notable entry points (from package.json):**

| Command | What it runs |
|---|---|
| `npm run test:e2e:ci` | CI-critical specs on Chromium: api-client, rbac, operations-api, staff-queue, all-routes-exhaustive, admin-pages, portal-pages, booking-wizard, staff-operations, security, seo-audit |
| `npm run test:e2e:ui` | All @ui-tagged tests on Chromium (323+ tests) |
| `npm run test:e2e:integrated` | All @integrated-tagged tests (92 tests, backend-backed) |
| `npm run test:e2e:visual` | @visual-tagged tests on Chromium (14 baseline snapshots) |

### 2.3 Static Analysis and Security Scanning

| Tool | Scope | Trigger |
|---|---|---|
| ESLint | Frontend code quality | `npm run lint` in CI |
| CodeQL (Java/Kotlin) | Backend security analysis | CI on push/PR |
| CodeQL (JS/TS) | Frontend security analysis | CI on push/PR |
| Trivy | Docker image vulnerability scan | CI on push (non-PR) |
| maven-enforcer-plugin | Module dependency boundaries | `mvn verify` |

---

## 3. Coverage Targets

| Layer | Metric | Target | Last Measured |
|---|---|---|---|
| Backend unit | Line coverage | 80%+ | Measured by JaCoCo in `mvn verify` |
| Backend integration | All critical paths covered | 100% of defined workflows | Verified via release-readiness gates |
| Frontend unit | Branch coverage | 80%+ | 80.48% (2026-06-01) |
| Frontend E2E CI | All CI-critical tests pass | 100% | 183 passed, 1 skipped (2026-06-01) |
| Frontend E2E UI | Route smoke + a11y + responsive | 100% route coverage | 323 passed, 1 skipped (2026-06-01) |
| Frontend E2E integrated | Backend-backed scenarios | 100% of defined cases | 92 passed, 3 expected skips (2026-06-01) |
| Visual regression | High-risk page baselines | Maintained set | 14 baselines (2026-06-01) |

Coverage is a quality target, not a hard gate. The 80%+ target applies to automatically calculated line/branch coverage; areas with security or safety implications (auth, RBAC, clinical workflows) are expected to have higher targeted coverage even if aggregate metrics are lower.

---

## 4. Test Data Strategy

### 4.1 Backend

| Data source | Usage | Lifecycle |
|---|---|---|
| Flyway migrations | Schema definition (V1__ through V8__) | Applied at startup, shared across all environments |
| Release demo seed | Cross-role synthetic data for UAT, E2E, and integration tests | Controlled by `ReleaseDemoSeedProperties`, invoked via `ReleaseDemoSeedCommand` |
| Integration test data | Inline JSON payloads in test methods (appointments, users, etc.) | Created per-test, rolled back by `@Transactional` |
| Testcontainers PostgreSQL | Fresh ephemeral database per integration test suite | Container starts via `@Testcontainers`, database is empty except for Flyway migrations |
| Auth token cache | `ConcurrentHashMap` in `AbstractIntegrationTest` caches tokens per email | Per test-suite lifecycle, avoids repeated login calls |

Key principles:
- Integration tests never share mutable database state -- each test class gets its own Testcontainers container.
- `@Transactional` rollback ensures no test pollution between methods.
- Demo seed data is version-controlled and covers all 8 roles (admin, doctor, nurse, pharmacist, accountant, receptionist, patient, guest).
- JWT and patient identifier secrets are injected via `DynamicPropertyRegistry` with test-only values.

### 4.2 Frontend

| Data source | Usage | Lifecycle |
|---|---|---|
| Mocked API responses | Unit/component tests (Vitest) | Per-test, using manual mocks |
| Live backend | E2E integrated tests | External service, health-checked before suite |
| Static route assertions | @ui smoke tests | No backend dependency -- checks SSR/rendering only |
| Visual baselines | @visual regression tests | Stored as Playwright snapshot files, updated deliberately |

Key principles:
- Unit tests never depend on a running backend -- all API calls are mocked.
- @ui tests validate frontend rendering and navigation without backend.
- @integrated and @ci tests require a running backend (CI spins up the Next.js dev server with `NEXT_PUBLIC_API_BASE_URL`).
- Visual baselines are platform-specific (Chromium only per `playwright.config.ts`).

---

## 5. CI Integration

### 5.1 Pipeline Overview

The CI pipeline (`.github/workflows/ci.yml`) uses path-based job filtering:

```
Changes detected
     |
     +-- backend/ changed ---> backend-test (mvn verify + JaCoCo)
     |
     +-- web/ changed -------> frontend-test (lint + unit coverage + build + E2E CI)
     |
     +-- infra/ changed ----> validate-observability (docker-compose config)
     |                          |
     |                          +-- docker-push (build + Trivy scan + push to GHCR)
     |                                  (non-PR only, depends on backend-test +
     |                                   frontend-test + validate-observability)
     |
     +-- always ------------> codeql (Java + JS/TS, parallel)

Final: ci-summary aggregates all job results
```

### 5.2 Quality Gates (merged outcome)

```
                         +--------------------------+
                         |      CI must PASS         |
                         +--------------------------+
                         | Backend: mvn verify       |
                         | Frontend: npm run lint     |
                         | Frontend: npm run build    |
                         | Frontend: npm run test:unit |
                         | Frontend: npm run test:e2e:ci |
                         | CodeQL: no critical findings |
                         | Observability config valid  |
                         +--------------------------+
```

### 5.3 Path-Based Skipping

Jobs are skipped when no relevant files change:
- `backend-test` runs only when `backend/**` or CI/CD workflow files change.
- `frontend-test` runs only when `web/src/**`, `web/public/**`, `web/e2e/**`, `web/*.{ts,js,json,css}`, or CI/CD workflow files change.
- `validate-observability` runs only when `docker-compose.yml`, `docker-compose.observability.yml`, `infra/observability/**`, or Dockerfiles change.
- On `pull_request` events, path filters are bypassed and all jobs run.

### 5.4 CI Environments

| Job | Runner | Service containers | Timeout |
|---|---|---|---|
| Backend test | ubuntu-latest | PostgreSQL 15 (pgvector) | 25 min |
| Frontend test | ubuntu-latest | None (web server started by Playwright) | 20 min |
| CodeQL | ubuntu-latest | None | 20 min |
| Docker push | ubuntu-latest | None | 20 min |
| Observability validate | ubuntu-latest | None | 5 min |

### 5.5 Concurrency Policy

CI runs are cancellable for pull request events: if a new push arrives on the same PR/branch, the in-progress run is cancelled. This keeps CI responsive and avoids queue buildup.

---

## 6. Flaky Test Policy

### 6.1 Definition

A test is considered flaky when it passes and fails across repeated runs without any code changes. Symptoms include:
- Timed-out tests under load (CI worker contention, slow Testcontainers startup).
- Race conditions in async test assertions.
- Tests dependent on external service availability.
- Browser rendering timing differences in visual regression tests.

### 6.2 Current Mitigations

| Mitigation | Where applied |
|---|---|
| Retries (2) on CI for Playwright | `playwright.config.ts`: `retries: process.env.CI ? 2 : 0` |
| Single worker on CI for Playwright | `playwright.config.ts`: `workers: process.env.CI ? 1 : localWorkers` |
| `@Transactional` rollback | All integration tests -- no state leakage between tests |
| Auth token caching | `AbstractIntegrationTest.TOKEN_CACHE` reduces login calls |
| Rate limiting disabled in tests | `security.http.public-rate-limit-per-minute=0` |
| Increased timeouts | MockMvc: default; Playwright action: 10s, navigation: 30s; Vitest: 10s |
| `forbidOnly` in CI | Prevents `.only` from being committed |
| Screenshots/videos on failure | Playwright captures only-on-failure screenshots and retain-on-failure videos |

### 6.3 Handling Flaky Tests

1. **Investigate immediately** when a test fails on CI but passes locally. Review traces, screenshots, and videos.
2. **Do not silence flaky tests with `.skip`** without a documented reason and a tracking issue.
3. **Isolate the root cause** before applying a fix. Common causes:
   - Missing `await` on async assertions.
   - Non-deterministic test ordering.
   - External service unavailability (backend not ready, database not migrated).
   - Test data collisions.
4. **Apply fix** or adjust the test to the appropriate retry/worker policy.
5. **Tag known-flaky tests** with a comment referencing the tracking issue. The goal is zero flaky tests.

### 6.4 Escalation

If a test is flaky and cannot be immediately fixed:
1. Document the flaky test in a GitHub issue with the `flaky-test` label.
2. Move the test to a separate CI job with increased retries (up to 5) so it does not block the main pipeline.
3. Assign an owner to resolve within the next sprint.

---

## 7. Regression Test Strategy

### 7.1 Scope

Regression testing covers all existing functionality when changes are introduced. The scope is determined by the path-based CI filter:

| Change area | Regression scope |
|---|---|
| Backend service code | All unit + integration tests in `backend/application` and `backend/start` |
| Backend API contract | All integration tests + E2E integrated tests |
| Frontend components | All unit tests + E2E @ui smoke tests |
| Frontend routes/layout | All E2E @ui route smoke tests |
| Frontend API integration | All E2E @ci and @integrated tests |
| Docker/infra configuration | docker-compose config validation |
| Any change | CodeQL analysis |

### 7.2 Regression Cadence

| Trigger | Actions |
|---|---|
| Every push to PR | Full CI pipeline (path-filtered) |
| Every push to main/master | Full CI pipeline + Docker image build + push |
| Release candidate | Full CI + E2E UI + E2E integrated + E2E visual + E2E release-data + Docker release-demo smoke (per release-readiness gate) |
| Scheduled (nightly/weekly) | Not currently configured -- consider adding for longer-running regression suites |

### 7.3 Business Flow Regression

The project maintains a canonical business flow matrix (`docs/06-testing/business-flow-test-matrix.md`) covering 12 business flows (BF-01 through BF-12):

| Flow ID | Business flow | Regression coverage |
|---|---|---|
| BF-01 | Public discovery and booking | Unit (service layer), integration, E2E @ci, E2E @ui |
| BF-02 | Staff authentication and RBAC | Integration (SecurityHardening, Auth), E2E @integrated |
| BF-03 | Admin operations | Integration (Admin*), E2E @ci |
| BF-04 | Scheduling and availability | Integration (Clinical), E2E |
| BF-05 | Queue and intake | Integration (QueueWorkflow), E2E @ci |
| BF-06 | Doctor consultation and medical records | Integration (ClinicalWorkflow), Unit, E2E |
| BF-07 | Lab results | Integration (LabResult), Unit, E2E |
| BF-08 | Patient portal | Integration (PatientPortal, PatientAuth), E2E |
| BF-09 | Inventory and pharmacy | Integration (Inventory), Unit, E2E @ci |
| BF-10 | Finance | Integration (Finance), E2E |
| BF-11 | Notifications and reminders | Integration (NotificationDelivery), Unit |
| BF-12 | Release-demo UAT readiness | Integration (ReleaseDemoSeed), E2E release-data |

### 7.4 Visual Regression

Visual regression uses Playwright snapshot comparison on Chromium:
- 14 baseline snapshots covering high-risk pages (booking, queue, clinical, admin).
- Snapshots are stored in the Playwright report output and updated deliberately via `--update-snapshots`.
- Cross-browser visual baselines (Firefox, WebKit) are not currently maintained; visual tests are Chromium-only.
- On baseline mismatch, the build does not fail immediately -- a manual review is required to verify whether the change is intentional.

### 7.5 Pre-Release Regression Gate

Before promoting a release candidate:
1. Run full CI pipeline.
2. Run `npm run test:e2e:ui` (323+ tests, Chromium).
3. Run `npm run test:e2e:integrated` (92 tests, backend-backed).
4. Run `npm run test:e2e:visual` (14 baselines).
5. Run `npm run test:e2e:release-data` (release demo data verification).
6. Execute Docker release-demo smoke test (docker-compose up + health checks).
7. Verify no high-confidence secrets are exposed.
8. Verify backup/restore smoke test (PostgreSQL).

These gates are documented with evidence in the production readiness report (`docs/06-testing/full-hms-production-readiness-report-2026-06-01.md`).

---

## 8. Tooling Summary

| Layer | Tool | Version |
|---|---|---|
| Backend test runner | JUnit 5 (Jupiter) | Spring Boot 3.3.5 managed |
| Backend mocking | Mockito | Spring Boot 3.3.5 managed |
| Backend coverage | JaCoCo | 0.8.12 |
| Backend database testing | Testcontainers | 1.20.4 |
| Backend module enforcement | maven-enforcer-plugin | 3.5.0 |
| Frontend test runner | Vitest | ^4.1.5 |
| Frontend component testing | @testing-library/react | ^16.3.2 |
| Frontend DOM testing | @testing-library/jest-dom | ^6.9.1 |
| Frontend coverage | @vitest/coverage-v8 | ^4.1.5 |
| Frontend E2E | Playwright | ^1.59.1 |
| Frontend accessibility | @axe-core/playwright | ^4.11.2 |
| Frontend linting | ESLint | ^9 |
| Static analysis (Java) | CodeQL (java-kotlin) | CI-managed |
| Static analysis (JS/TS) | CodeQL (javascript-typescript) | CI-managed |
| Container scanning | Trivy | CI-managed |

---

## 9. Key File Locations

| Resource | Path |
|---|---|
| Backend unit tests | `D:\projects\hospital-management-system\backend\application\src\test` |
| Backend integration tests | `D:\projects\hospital-management-system\backend\start\src\test` |
| Integration test base class | `D:\projects\hospital-management-system\backend\start\src\test\java\com\hospital\api\AbstractIntegrationTest.java` |
| Module boundary test | `D:\projects\hospital-management-system\backend\start\src\test\java\com\hospital\api\ModuleBoundaryTest.java` |
| Backend POM (parent) | `D:\projects\hospital-management-system\backend\pom.xml` |
| Frontend unit tests | `D:\projects\hospital-management-system\web\src\**\__tests__` |
| Frontend E2E tests | `D:\projects\hospital-management-system\web\e2e\specs` |
| Vitest config | `D:\projects\hospital-management-system\web\vitest.config.ts` |
| Vitest setup | `D:\projects\hospital-management-system\web\vitest.setup.ts` |
| Playwright config | `D:\projects\hospital-management-system\web\playwright.config.ts` |
| CI workflow | `D:\projects\hospital-management-system\.github\workflows\ci.yml` |
| CD workflow | `D:\projects\hospital-management-system\.github\workflows\cd.yml` |
| Business flow test matrix | `D:\projects\hospital-management-system\docs\06-testing\business-flow-test-matrix.md` |
| Production readiness report | `D:\projects\hospital-management-system\docs\06-testing\full-hms-production-readiness-report-2026-06-01.md` |
| Test plan | `D:\projects\hospital-management-system\docs\HMS_TestPlan.md` |
| Package.json (scripts) | `D:\projects\hospital-management-system\web\package.json` |
