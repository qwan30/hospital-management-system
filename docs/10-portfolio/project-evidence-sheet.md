# Project Evidence Sheet

Audit date: 2026-06-07
Repository: `D:\projects\hospital-management-system`
Target position: Full-stack engineer
Attribution stance: Primary owner, with claim-by-claim verification

## 1. Executive project summary

HMS is a hospital management system covering public discovery and appointment booking, staff authentication and RBAC, queue/intake, clinical records, lab results, inventory/pharmacy, finance, patient portal reads, reminders, admin operations, and release-demo UAT data. The active backend is a Java 17/Spring Boot 3.3 multi-module Maven application; the active frontend is the `frontend/` Next.js 16/React 19 TypeScript app.

Current implementation status is substantial but not an unconstrained production claim. The repository's latest readiness label is `Release Candidate / Ship with fixes`, with W-01 lab-result creation, W-02 pharmacy dispensing, and W-03 reminder/email evidence closed, but product and safety follow-ups still open. Deployment evidence is local/containerized: Docker Compose covers PostgreSQL, backend, and frontend; a separate uncommitted observability overlay adds Prometheus, Grafana, Loki, Tempo, and OpenTelemetry configuration.

Personal contribution evidence is strong from local Git: all 49 visible commits are authored by `Thanh Quan <tranthanhquan09@gmail.com>`, with commit subjects covering backend/frontend implementation, DDD modularization, CI, tests, security/inventory hardening, release readiness, lab/pharmacy/notification waiver closure, and UI truthfulness. Team size, exact role, live URL, production usage, PR history, and external adoption are not proven by local artifacts.

Strongest evidence: 118 method-level controller mappings, 72 frontend pages, 20 Flyway migrations, 26 JPA entity files, 33 backend test classes, 49 frontend unit/component test files, 25 Playwright specs, 80.48% frontend branch coverage in dated evidence, backend `mvn verify` passing 148 tests, Playwright CI/UI/integrated/visual passes, Docker release-demo smoke, backup/restore smoke, and npm audit with 0 vulnerabilities.

Major evidence gaps: no verified live deployment URL, no real user/adoption metrics, no measured latency or throughput baseline, no production uptime/error-rate data, no independent security/compliance assessment, and no owner-confirmed team context.

## 2. Repository inspection summary

| Area inspected | Files or artifacts examined | Important findings | Evidence status | Limitations |
| --- | --- | --- | --- | --- |
| Repo state | `git status --short --branch`, `git rev-parse HEAD`, `git remote -v` | Branch `master`, HEAD `ff810028c706c9ca9dba35a0809d8f990488b15e`, ahead of origin by 41 commits, dirty tree with 33 modified tracked paths and 12 status-collapsed untracked entries | VERIFIED | Dirty tree means committed evidence and working-tree evidence must be separated |
| Git authorship | `git shortlog -sne --all`, `git log -n 50` | 49 visible commits by `Thanh Quan <tranthanhquan09@gmail.com>` from 2026-04-05 to 2026-06-01 | VERIFIED | Local Git history does not prove team size, PR review, or non-Git work |
| Documentation | `README.md`, `docs/README.md`, `docs/reference/repository-status.md`, `docs/reference/engineering-metrics.md`, `docs/06-testing/*` | Docs identify `frontend/` as canonical frontend, `frontend/` as reference-only, and release label as `Release Candidate / Ship with fixes` | VERIFIED | Docs can drift; source was cross-checked for key counts |
| Backend source | `backend/pom.xml`, backend module sources | 5 Maven modules: `domain`, `infrastructure`, `application`, `controller`, `start`; Java 17/Spring Boot 3.3.5 | VERIFIED | Fresh build not rerun in this audit |
| API surface | `backend/controller/src/main/java` | 42 controller Java files, 32 `@RestController` classes, 118 method-level mappings, 66 `@PreAuthorize` annotations | VERIFIED | Count includes current dirty working tree |
| Database | `backend/start/src/main/resources/db/migration` | 20 Flyway migrations, 35 `CREATE TABLE IF NOT EXISTS`, 26 `CREATE INDEX IF NOT EXISTS` occurrences | VERIFIED | SQL table count differs from JPA entity-file count; both are reported separately |
| Frontend source | `frontend/src/app`, `frontend/package.json`, `frontend/src/lib` | 72 `page.tsx` files, 79 App Router page/layout/API route files, API client wraps backend envelope and request IDs | VERIFIED | Route-file presence alone is not treated as full workflow support |
| Tests | `backend/application/src/test`, `backend/start/src/test`, `frontend/src/**/__tests__`, `frontend/e2e/specs` | 33 backend test classes, 49 frontend unit/component test files, 25 Playwright specs | VERIFIED | Dated pass evidence from 2026-06-01; no fresh full suite run in this audit |
| CI/CD | `.github/workflows/ci.yml` | CI defines Java setup, Maven tests, npm ci, lint, frontend build, Playwright chromium install, non-billing E2E, Docker build | VERIFIED | Local audit did not query remote CI run status |
| Deployment | `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile` | Compose runs PostgreSQL, backend, and Dockerized frontend with healthcheck and release-demo seed env knobs | VERIFIED | No production hosting evidence found locally |
| Observability | `docker-compose.observability.yml`, `infra/observability/*`, `scripts/release-observability-smoke.ps1` | Uncommitted overlay configures Prometheus, Grafana, Loki, Tempo, OTel collector, dashboards, request correlation, JSON logs | VERIFIED | Source presence verified; smoke is only partially verified per `release-observability-gate-2026-06-06.md` |
| Security | `SecurityConfig`, `RateLimitFilter`, `JwtAuthenticationFilter`, `RbacAuthorizationService`, `PatientIdentifierProtector` | JWT, BCrypt, method RBAC, CORS, CSP, rate limiting, audited denials, AES-GCM patient identifier encryption, SHA-256 hash index | VERIFIED | No external penetration test or compliance certification |
| Code intelligence | `.gitnexus/meta.json`, `npx.cmd gitnexus status` | GitNexus indexed at HEAD `ff81002`, 721 files, 5506 nodes, 12627 edges, 300 processes, embeddings 0 | VERIFIED | GKG CLI missing, so GKG plan support unavailable |

## 3. Technology verification matrix

| Technology | How it is used | Evidence reference | Depth of usage | Resume relevance | Status |
| --- | --- | --- | --- | --- | --- |
| Java 17 | Backend language and Maven compiler release | `backend/pom.xml` | Core | High for backend/full-stack | VERIFIED |
| Spring Boot 3.3.5 | REST API, security, scheduling, actuator, JPA runtime | `backend/pom.xml`, `backend/start/src/main/resources/application.yml` | Core | High | VERIFIED |
| Multi-module Maven | DDD-style module separation across domain, infra, application, controller, start | `backend/pom.xml` | Core | High | VERIFIED |
| PostgreSQL 15 / pgvector image | Primary database in Compose and Testcontainers | `docker-compose.yml`, `AbstractIntegrationTest` | Core | High | VERIFIED |
| Flyway | Versioned DB migrations, schema validation | `application.yml`, `backend/start/src/main/resources/db/migration` | Core | High | VERIFIED |
| Spring Data JPA | Repository/entity persistence | `backend/domain/src/main/java`, repository packages | Core | High | VERIFIED |
| Spring Security / JWT / BCrypt | Staff and patient auth, stateless API security, password hashing | `SecurityConfig`, `JwtAuthenticationFilter`, `AuthService`, `PatientAuthService` | Core | High | VERIFIED |
| Method-level RBAC | 36 permission map entries and 66 controller `@PreAuthorize` annotations | `RbacAuthorizationService`, controller files | Core | High | VERIFIED |
| Next.js 16 / React 19 / TypeScript | Canonical frontend app under `frontend/` | `frontend/package.json`, `frontend/src/app` | Core | High | VERIFIED |
| Playwright | E2E, integrated, UI, visual, route, RBAC, accessibility, SEO, performance spec files | `frontend/e2e/specs`, dated logs | Substantial | High | VERIFIED |
| Vitest / Testing Library | Frontend unit/component coverage | `frontend/package.json`, `frontend/src/**/__tests__` | Substantial | High | VERIFIED |
| Testcontainers | DB-backed backend integration test harness | `backend/start/src/test/java/com/hospital/api/AbstractIntegrationTest.java` | Substantial | High | VERIFIED |
| Docker Compose | Local runtime for PostgreSQL, backend, frontend; release-demo smoke | `docker-compose.yml`, `docker-release-demo-smoke-2026-06-01.json` | Substantial | High | VERIFIED |
| GitHub Actions | Automated backend, frontend, Playwright, Docker build checks | `.github/workflows/ci.yml` | Substantial | Medium | VERIFIED |
| Gmail API | Optional transactional email transport with local-record fallback and attempt persistence | `EmailService`, `GmailApiClient`, `V20__Add_email_delivery_attempts.sql` | Supporting | Medium | VERIFIED |
| Micrometer / Actuator / Prometheus | Metrics, actuator endpoints, request/queue/inventory/email counters | `application.yml`, `RateLimitFilter`, `RequestCorrelationFilter` | Supporting | Medium | VERIFIED |
| OpenTelemetry / Tempo / Loki / Grafana | Uncommitted observability overlay and dashboards; full smoke still needs measurement | `docker-compose.observability.yml`, `infra/observability/*` | Configured but minimally used | Medium | VERIFIED |
| GitNexus | Local code graph/index status | `.gitnexus/meta.json`, `npx.cmd gitnexus status` | Supporting | Low to Medium | VERIFIED |
| `@google/generative-ai` | Listed in `frontend/package.json`, but no active source usage found | `frontend/package.json`, `rg @google/generative-ai` | Listed but not verified | Low | MISSING |

## 4. Problem, users, and workflows

| Item | Finding | Evidence reference | Status | Confidence |
| --- | --- | --- | --- | --- |
| Problem | HMS coordinates hospital appointment booking, clinical workflow, operations, finance, inventory, and patient portal access | `README.md`, `business-flow-test-matrix.md` | VERIFIED | High |
| Intended users | Guests, patients, receptionist, nurse, doctor, pharmacist, accountant, admin | `business-flow-test-matrix.md`, `frontend/src/lib/rbac.ts`, `UserRole.java` | VERIFIED | High |
| Public booking | Guest selects doctor/slot and submits appointment; backend creates patient/appointment and books slot | `AppointmentController`, `AppointmentWriteService`, `frontend/src/app/(public)/booking/page.tsx` | VERIFIED | High |
| Staff auth/RBAC | Staff roles use JWT login and protected route/API access | `AuthController`, `JwtAuthenticationFilter`, `RbacAuthorizationService`, `frontend/src/lib/rbac.ts` | VERIFIED | High |
| Queue lifecycle | Check-in, call, assign room, start consultation, complete, skip | `QueueController`, `AppointmentWorkflowService`, `staff-queue.spec.ts` | VERIFIED | High |
| Clinical record | Doctor creates medical record, prescriptions, follow-up, prescription PDF | `MedicalRecordController`, `MedicalRecordService`, `medical-records-api.ts` | VERIFIED | High |
| Lab results | Staff create/read/delete lab results; patient portal reads own lab results | `LabResultController`, `/staff/lab-results/new`, `PatientPortalController` | VERIFIED | High |
| Inventory/pharmacy | Items, lots, movements, alerts, prescription-backed dispense | `InventoryController`, `InventoryWriteService`, `V19__Add_pharmacy_dispense_traceability.sql` | VERIFIED | High |
| Finance | Invoices, payments, void, pricing, revenue reports | `InvoiceController`, `PricingController`, `RevenueReportController`, `frontend/src/lib/operations-api.ts` | VERIFIED | High |
| Patient portal | Login/claim, overview, appointments, lab results, messages read, profile update; production adoption and full lifecycle remain unproven | `PatientAuthController`, `PatientPortalController`, `frontend/src/app/portal` | VERIFIED | Medium |
| Reminders | Scheduled follow-up reminder dispatch and delivery-attempt tracking | `ReminderService`, `EmailService`, `email_delivery_attempts` migration | VERIFIED | High |
| Support tickets | Support pages exist, but no dedicated support-ticket API is visible | `business-flow-test-matrix.md`, route files | MISSING | High |
| Adoption | No real user, traffic, or production usage evidence found locally | Local repo inspection | MISSING | High |

## 5. Verified feature and scope inventory

| Feature or capability | Implementation summary | Relevant files | Verified scope | Engineering significance | Status |
| --- | --- | --- | --- | --- | --- |
| Modular backend | Maven reactor separates domain, infrastructure, application, controller, start | `backend/pom.xml` | 5 modules | Maintains boundaries and composition root | VERIFIED |
| REST API | Controllers expose domain workflows with consistent API envelope | `backend/controller/src/main/java`, `ApiResponse.java` | 118 method-level mappings | Broad backend contract surface | VERIFIED |
| Database schema | Flyway migrations define clinical, RBAC, inventory, patient portal, email attempts | `backend/start/src/main/resources/db/migration` | 20 migrations, 35 create-table statements | Real persistence model, not mock-only | VERIFIED |
| Public booking | Appointment creation with slot validation and patient identifier protection | `AppointmentController`, `AppointmentWriteService` | Booking endpoint and UI route | Core business workflow | VERIFIED |
| RBAC | Backend permission map and frontend route policies | `RbacAuthorizationService`, `frontend/src/lib/rbac.ts` | 7 app roles plus guest public routes | Prevents role leakage across clinical/admin areas | VERIFIED |
| Queue operations | Transactional state transitions and audit events | `AppointmentWorkflowService`, `QueueController` | check-in, call, room, start, complete, skip | Stateful operational workflow | VERIFIED |
| Clinical records and prescriptions | Record creation, appointment completion, PDF preview/retrieval, reminders | `MedicalRecordService`, `MedicalRecordController` | Medical record write and prescription read APIs | Core clinical value | VERIFIED |
| Inventory and pharmacy | Item/lot/movement management and dispense traceability | `InventoryWriteService`, `InventoryController` | Items, lots, movements, alerts, dispense | Complex stock consistency and audit trail | VERIFIED |
| Finance | Invoice create/pay/void, pricing, revenue reports | finance controllers and `operations-api.ts` | Invoices, payments, pricing, daily/monthly reports | Revenue workflow coverage | VERIFIED |
| Patient portal | Patient account claim/login and read/update portal APIs | `PatientAuthController`, `PatientPortalController` | Overview, appointments, labs, messages read, profile update; production adoption not evidenced | Patient self-service base | VERIFIED |
| Transactional email/reminders | Gmail transport when configured; local recorded attempts otherwise | `EmailService`, `GmailApiClient`, `ReminderService` | Appointment confirmation, visit result, follow-up reminder | Integration reliability and auditability | VERIFIED |
| UI truthfulness controls | Action manifest reports no fake/hash-link bugs after P1 pass | `frontend/test-results/actionable-control-manifest/summary.md` | 1599 controls, 0 bugs, 74 disabled honestly in dated artifact | Honest UX state handling | VERIFIED |
| Observability overlay | Request IDs, JSON logs, metrics, OTel/Grafana stack | uncommitted observability files | Source-level overlay plus smoke script; full Docker smoke still pending | Useful for release operations | VERIFIED |

## 6. Architecture and design decisions

| Technical problem | Implemented solution | Evidence reference | Trade-off | Engineering significance | Status |
| --- | --- | --- | --- | --- | --- |
| Keep backend maintainable as scope grows | DDD-style Maven modules with explicit dependencies | `backend/pom.xml`, README architecture section | More module wiring overhead | Clear ownership boundaries | VERIFIED |
| Keep API responses consistent | `ApiResponse<T>` envelope with success, data, message, error, pagination, timestamp | `ApiResponse.java`, controller signatures | Requires all controllers to wrap responses | Predictable frontend integration | VERIFIED |
| Protect role-specific hospital workflows | Backend method RBAC plus frontend route guard | `RbacAuthorizationService`, `SecurityConfig`, `frontend/src/lib/rbac.ts` | Dual policy surfaces can drift | Stronger defense-in-depth than frontend-only checks | VERIFIED |
| Prevent duplicate or invalid state transitions | Transactional services validate appointment, queue, invoice, inventory states | `AppointmentWorkflowService`, `InventoryWriteService`, finance services | More domain branching | Protects business consistency | VERIFIED |
| Protect patient identifiers | Store encrypted CCCD plus hash for lookup | `PatientIdentifierProtector`, `V4__Expand_patient_identifier_and_security.sql` | Requires secret management and backfill | Balances searchability and sensitive-data protection | VERIFIED |
| Track pharmacy dispense accountability | Movement rows include lot and medical-record references | `InventoryWriteService`, `V19__Add_pharmacy_dispense_traceability.sql` | Requires prescription item match | Supports audit trail and stock control | VERIFIED |
| Avoid email side-effect ambiguity | Record delivery attempts; fall back to `LOCAL_RECORD` when Gmail is not configured | `EmailService`, `GmailApiClient`, `V20__Add_email_delivery_attempts.sql` | Local record is not real delivery | Makes notification state auditable | VERIFIED |
| Release-demo repeatability | Optional synthetic seed data controlled by environment | `SeedDataService`, `ReleaseDemoSeedService`, `application.yml` | Demo data must not be treated as adoption | Enables repeatable UAT without real PHI | VERIFIED |
| Release operations visibility | Metrics, request IDs, structured logs, dashboard configs | `RequestCorrelationFilter`, `logback-spring.xml`, `docker-compose.observability.yml` | Uncommitted and not fully smoked | Adds observability foundation | VERIFIED |

## 7. Personal contribution analysis

| Contribution | Evidence of ownership | Relevant commits or files | Other contributors involved | Attribution confidence | Status |
| --- | --- | --- | --- | --- | --- |
| Overall repository implementation | `git shortlog -sne --all` shows 49 commits by Thanh Quan only | Whole local Git history | None visible locally | High | VERIFIED |
| Modular backend split | Commit `ee96e3c refactor: split backend into DDD modules`; `backend/pom.xml` module structure | `backend/pom.xml` | None visible locally | High | VERIFIED |
| Release-ready backend and web app baseline | Commit `12a6dc5 feat: add release-ready backend, web app, and ECC assets` | Backend, `frontend/`, docs | None visible locally | High | VERIFIED |
| API integration and frontend regression coverage | Commits `638c0b3`, `9b47639`, `9ae36bf`; test files | API and frontend tests | None visible locally | High | VERIFIED |
| Security and inventory hardening | Commits `0f2f908`, `afc72c4`, `3f5283f`; security/inventory files | Security/inventory source | None visible locally | High | VERIFIED |
| Release-readiness hardening | Commit `c9d5060`, readiness reports and artifacts | `docs/06-testing/*` | None visible locally | High | VERIFIED |
| Lab, pharmacy, notification waiver closure | Commits `dc7051d`, `9810a3b`; W-01/W-02/W-03 report evidence | Lab, inventory, email/reminder files | None visible locally | High | VERIFIED |
| UI truthfulness hardening | Commit `ff81002`; actionable control manifest and browser QA | `ui-truthfulness.spec.ts`, test results | None visible locally | High | VERIFIED |
| Uncommitted observability lane | Dirty tree includes observability files and docs | `docker-compose.observability.yml`, `infra/observability/*`, `RequestCorrelationFilter` | Unknown | Medium | VERIFIED |
| Role, team size, business ownership | User selected primary-owner stance; local Git history supports a single visible author | User response plus Git history | Unknown | Medium | USER-PROVIDED |

## 8. Technical challenges

| Challenge | Why it was difficult | Solution implemented | Evidence | Result | Status |
| --- | --- | --- | --- | --- | --- |
| Appointment and queue state consistency | Hospital flow has status-dependent actions and role restrictions | Transactional service methods validate allowed statuses and record audit events | `AppointmentWorkflowService`, `QueueController` | Queue tests and Playwright passes exist | VERIFIED |
| Patient privacy and role scoping | Staff, patient, and admin data access differs sharply | JWT, RBAC permission map, patient identifier encryption/hash, frontend guards | `SecurityConfig`, `RbacAuthorizationService`, `PatientIdentifierProtector`, `frontend/src/lib/rbac.ts` | SecurityHardeningIntegrationTest passed in dated evidence | VERIFIED |
| Pharmacy dispense traceability | Stock movement must match item, lot, medical record, and prescription item | `dispenseMedication` validates lot ownership, quantity, prescription item, then writes movement/audit | `InventoryWriteService`, `V19` migration | W-02 closed in readiness report | VERIFIED |
| Reminder delivery reliability | External Gmail may be disabled or fail | Delivery attempts persist with `GMAIL` or `LOCAL_RECORD`, scheduler preserves retry behavior | `EmailService`, `GmailApiClient`, `ReminderService`, `V20` migration | W-03 closed as backend-only evidence | VERIFIED |
| Frontend route truthfulness | Large route surface can expose fake links/buttons | Action manifest, disabled unsupported actions, browser QA | `ui-truthfulness.spec.ts`, actionable manifest, real-user browser QA summary | 0 fake/hash-link bugs in dated manifest | VERIFIED |
| Release verification breadth | Full-stack app needs backend, frontend, Docker, E2E, visual, security, backup evidence | Readiness lane collected dated executable artifacts | `full-hms-production-readiness-report-2026-06-01.md` | Release candidate label with remaining product caveats | VERIFIED |
| Observability readiness | Logs/metrics/traces must correlate without leaking PHI | Request correlation, sanitized paths, structured logs, client-event redaction, dashboards | Uncommitted observability files | Smoke not fully completed against Docker in current shell | VERIFIED |

## 9. Existing measurable evidence

| Category | Metric | Baseline | Final value | Change | Measurement method | Evidence | Resume-safe? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Scope | Backend method-level mappings | N/A | 118 | N/A | `Select-String` over controller annotations | Audit command 2026-06-07 | Yes |
| Scope | Frontend pages | N/A | 72 `page.tsx` | N/A | `Get-ChildItem frontend/src/app -Filter page.tsx` | Audit command 2026-06-07 | Yes |
| Scope | Flyway migrations | N/A | 20 | N/A | Count migration SQL files | Audit command 2026-06-07 | Yes |
| Scope | JPA entity files | N/A | 26 | N/A | Count files containing `@Entity` | Audit command 2026-06-07 | Yes |
| Testing | Backend verification | N/A | 148 tests, 0 failures/errors/skips | N/A | `mvn.cmd verify` dated artifact | `backend-mvn-verify-2026-06-01.log` | Yes, with date qualification |
| Testing | Frontend branch coverage | 73.59% in earlier readiness notes | 80.48% | +6.89 percentage points | Vitest coverage dated artifact | `frontend-unit-coverage-2026-06-01.log` | Yes, with date qualification |
| Testing | Playwright CI | N/A | 183 passed, 1 skipped | N/A | Playwright chromium CI dated artifact | `playwright-ci-2026-06-01.log` | Yes, with date qualification |
| Testing | Playwright integrated | N/A | 92 passed, 3 skipped | N/A | Playwright integrated dated artifact | `playwright-integrated-2026-06-01.log` | Yes, with date qualification |
| Testing | Playwright UI | N/A | 323 passed, 1 skipped | N/A | Playwright UI dated artifact | `playwright-ui-2026-06-01.log` | Yes, with date qualification |
| Testing | Playwright visual | N/A | 14 passed | N/A | Visual baseline dated artifact | `playwright-visual-2026-06-01.log` | Yes, with date qualification |
| Security | npm vulnerabilities | N/A | 0 total vulnerabilities | N/A | `npm audit` dated JSON | `npm-audit-2026-06-01.json` | Yes, with date qualification |
| Security | High-confidence secret scan | N/A | 0 findings | N/A | Dated readiness artifact | `high-confidence-secret-scan-2026-06-01.log` | Yes, with qualification |
| Reliability | Docker release smoke | N/A | backend `UP`, frontend `200`, seed departments/doctors true | N/A | Compose smoke script output | `docker-release-demo-smoke-2026-06-01.json` | Yes, with date/environment |
| Reliability | Backup/restore smoke | N/A | PASS | N/A | Postgres dump/restore/drop check | `postgres-backup-restore-check-2026-06-01.json` | Yes, with date/environment |
| UX QA | Actionable-control manifest | N/A | 1599 controls, 0 bugs, 363 needs-review | N/A | Playwright/UI truthfulness manifest | `frontend/test-results/actionable-control-manifest/summary.md` | Yes, with qualification |
| Browser QA | Real-user Chrome pass | N/A | 23 checks, 0 failures, 0 4xx/5xx | N/A | Browser QA summary | `real-user-browser-qa-2026-06-01/summary.md` | Yes, with date qualification |
| Performance | API/page latency | MISSING | MISSING | MISSING | No baseline/final values found | `performance.spec.ts` exists, but no metric report found | Needs measurement |
| Adoption | Users/traffic | MISSING | MISSING | MISSING | No analytics or production metrics found | Local repo | No |

## 10. Engineering scope counts

| Scope item | Verified count | Counting method | Exclusions | Evidence | Resume relevance |
| --- | ---: | --- | --- | --- | --- |
| Backend Maven modules | 5 | `backend/pom.xml` modules | Parent POM not counted as module | `backend/pom.xml` | High |
| Controller Java files | 42 | Recursive count under controller source | Non-Java files excluded | Audit command | Medium |
| REST controllers | 32 | Count `@RestController` | `@RestControllerAdvice` not counted as controller | Audit command | High |
| Method-level API mappings | 118 | Count `Get/Post/Put/Patch/DeleteMapping` | Class-level `@RequestMapping` excluded | Audit command | High |
| `@PreAuthorize` annotations | 66 | Count in controller Java files | Frontend route guard excluded | Audit command | High |
| RBAC permission entries | 36 | Count `entry(` in `RbacAuthorizationService` | Helper method included in raw count; 34 business permissions plus helper pattern should be described carefully | Audit command/source | Medium |
| JPA entity files | 26 | Unique files containing `@Entity` | SQL-only tables and generated classes excluded | Audit command | High |
| Flyway migrations | 20 | SQL file count | Non-SQL config excluded | Audit command | High |
| SQL create-table statements | 35 | Count `CREATE TABLE IF NOT EXISTS` | Alter-only migrations excluded | Audit command | Medium |
| SQL create-index statements | 26 | Count `CREATE INDEX IF NOT EXISTS` | Unique constraints not counted | Audit command | Medium |
| Frontend pages | 72 | Count `frontend/src/app/**/page.tsx` | Layout and API routes excluded | Audit command | High |
| App Router page/layout/API route files | 79 | Count `page.tsx`, `layout.tsx`, `route.ts` | Components outside app excluded | Audit command | Medium |
| Frontend unit/component test files | 49 | Count `frontend/src/**/__tests__/*.(test|spec).(ts|tsx)` | Playwright tests excluded | Audit command | High |
| Playwright specs | 25 | Count `frontend/e2e/specs/*.ts` | Snapshots excluded | Audit command | High |
| Backend test classes | 33 | Count Java files under backend test roots | Generated reports excluded | Audit command | High |
| Visible Git commits | 49 | `git shortlog -sne --all` | Uncommitted work excluded | Git command | High for attribution |
| Grafana dashboard JSON files | 7 | Count dashboard files | Datasource/provisioning files excluded | `infra/observability/grafana/dashboards` | Medium, uncommitted |

## 11. Quality, reliability, and security evidence

| Area | Control or practice | Evidence reference | Validation performed | Limitation | Status |
| --- | --- | --- | --- | --- | --- |
| API envelope | `ApiResponse<T>` with success/data/message/error/pagination/timestamp | `backend/controller/src/main/java/com/hospital/shared/api/ApiResponse.java` | Source inspected | Not every endpoint semantically audited | VERIFIED |
| Error handling | Global exception handler for validation, auth, conflict, media type, generic errors | `RestExceptionHandler.java` | Source inspected | Generic handler hides internals but no Sentry/log review | VERIFIED |
| Authentication | Staff and patient JWT login/refresh/logout | `AuthController`, `PatientAuthController`, `JwtAuthenticationFilter` | Dated E2E/integration evidence | Token rotation policy not fully audited here | VERIFIED |
| Password hashing | BCrypt password encoder and password hash fields | `SecurityConfig`, `AuthService`, `PatientAuthService` | Source inspected | No password policy audit beyond validation | VERIFIED |
| Patient identifier protection | AES-GCM encryption plus SHA-256 lookup hash | `PatientIdentifierProtector`, `V4` migration | Source inspected | Secret strength must be configured externally | VERIFIED |
| Authorization | Backend method RBAC and frontend route guard | `RbacAuthorizationService`, `frontend/src/lib/rbac.ts` | RBAC Playwright and backend security tests in dated logs | Policy drift still possible | VERIFIED |
| Rate limiting | Public POST rate limit for auth, appointment, chatbot | `RateLimitFilter`, `application.yml` | Source inspected | In-memory per-instance; not distributed | VERIFIED |
| CORS/CSP/security headers | CORS origins, CSP, no-referrer, same-origin frame options | `SecurityConfig` | Source inspected | CSP allows unsafe-inline | VERIFIED |
| Audit logging | Queue/inventory/admin/security denial audit paths | `AuditLogService`, `AuthorizationDenialAuditFilter`, services | Dated tests and source inspected | Audit export/filter still needs review | VERIFIED |
| Dependency scanning | npm audit 0 vulnerabilities | `npm-audit-2026-06-01.json` | Dated artifact | Backend dependency audit not separately evidenced here | VERIFIED |
| Test coverage | Frontend coverage 80.48% branch | `frontend-unit-coverage-2026-06-01.log` | Dated artifact | Backend aggregate coverage not summarized | VERIFIED |
| E2E coverage | CI/UI/integrated/visual Playwright passes | Playwright dated logs | Dated artifacts | Current dirty tree not freshly rerun | VERIFIED |
| Backup/restore | Postgres dump/restore/drop smoke | `postgres-backup-restore-check-2026-06-01.json` | Dated artifact | Limited dataset counts | VERIFIED |
| Observability | Metrics, traces, request IDs, JSON logs, dashboards | Uncommitted observability files | Source and doc inspected | Full smoke not yet passed in Docker env | VERIFIED |

## 12. Delivery and deployment evidence

| Area | Implementation | Evidence | Automation level | Measurable outcome | Status |
| --- | --- | --- | --- | --- | --- |
| Local backend/frontend/database | Docker Compose builds backend and frontend, runs pgvector PostgreSQL | `docker-compose.yml` | Automated local compose | 2026-06-01 smoke: backend `UP`, frontend `200` | VERIFIED |
| Backend packaging | Spring Boot repackage in Maven reactor | `backend-mvn-verify-2026-06-01.log` | Maven automated | Build success, jar created in dated artifact | VERIFIED |
| CI workflow | GitHub Actions verify job | `.github/workflows/ci.yml` | Automated on push/PR | Backend tests, frontend lint/build, Playwright, Docker build defined | VERIFIED |
| Release-demo seed | Synthetic UAT/release seed controlled by env | `application.yml`, `ReleaseDemoSeedService`, release-data tests | Automated via env/startup | Playwright release-data passed 2 tests in dated artifact | VERIFIED |
| Observability overlay | Compose overlay for Prometheus/Grafana/Loki/Tempo/OTel | `docker-compose.observability.yml`, `infra/observability/*` | Automated local compose plus smoke script | Not fully smoked in Docker env | VERIFIED |
| Deployment guide | Local setup and env documentation | `README.md`, `docs/HMS_DeploymentGuide.md` | Manual documented | No deployment time metric | VERIFIED |
| Live deployment | No live app URL proven | Local repo and docs | None | MISSING | MISSING |

## 13. Adoption and external-impact evidence

| Metric | Value | Observation period | Source | Reliability | Resume-safe? |
| --- | --- | --- | --- | --- | --- |
| Live users | MISSING | N/A | No local analytics or production database export found | None | No |
| Registered real accounts | MISSING | N/A | Seed/demo accounts exist, but real accounts not proven | None | No |
| Completed real appointments/transactions | MISSING | N/A | Release-demo data is synthetic | None | No |
| Production usage | MISSING | N/A | No live URL or deployment logs found | None | No |
| GitHub stars/forks/traffic | MISSING | N/A | Not checked with authenticated GitHub/traffic data in this audit | None | No |
| External contributors | 0 visible in local Git | 2026-04-05 to 2026-06-01 | `git shortlog -sne --all` | High for local history only | Yes, as attribution context, not impact |

No adoption or external business-impact metric is resume-safe from the local repository alone.

## 14. Claims that are currently resume-safe

- Claim: Built and maintained a full-stack hospital management system with a Java/Spring Boot backend and Next.js/React TypeScript frontend.
  Supporting evidence: `README.md`, `backend/pom.xml`, `frontend/package.json`, `frontend/src/app`, 49 local commits by Thanh Quan.
  Recommended emphasis: Full-stack architecture and implementation breadth.
  Required qualification: "local repository evidence" unless public repo/role is externally confirmed.

- Claim: Implemented a modular Java/Spring Boot backend with 5 Maven modules and 118 method-level REST mappings.
  Supporting evidence: `backend/pom.xml`, controller annotation count on 2026-06-07.
  Recommended emphasis: Backend architecture and API surface.
  Required qualification: Count is current working-tree count.

- Claim: Designed a Flyway-managed PostgreSQL schema with 20 migrations covering clinical workflows, RBAC, inventory/pharmacy traceability, patient portal, and email delivery attempts.
  Supporting evidence: migration files `V1` through `V20`, migration counts.
  Recommended emphasis: Data modeling and operational persistence.
  Required qualification: Do not claim real production scale.

- Claim: Implemented role-based authorization across backend API permissions and frontend route guards.
  Supporting evidence: `RbacAuthorizationService`, controller `@PreAuthorize`, `frontend/src/lib/rbac.ts`, RBAC Playwright logs.
  Recommended emphasis: Security and privacy controls.
  Required qualification: Do not claim full compliance or independent security certification.

- Claim: Built automated validation across backend tests, frontend unit/component tests, and Playwright E2E/UI/visual suites.
  Supporting evidence: 33 backend test classes, 49 frontend unit/component test files, 25 Playwright specs, dated pass logs.
  Recommended emphasis: Test engineering and release confidence.
  Required qualification: Dated evidence from 2026-06-01 unless rerun.

- Claim: Raised or maintained frontend quality gate above 80% branch coverage, with dated evidence at 80.48%.
  Supporting evidence: `frontend-unit-coverage-2026-06-01.log`.
  Recommended emphasis: Measured quality gate.
  Required qualification: Cite date and command; avoid claiming current coverage without rerun.

- Claim: Implemented pharmacy dispense traceability linking item, lot, prescription item, medical record, stock movement, and audit event.
  Supporting evidence: `InventoryWriteService`, `InventoryController`, `V19__Add_pharmacy_dispense_traceability.sql`, readiness report.
  Recommended emphasis: Complex domain workflow.
  Required qualification: This is release-demo/local evidence, not production dispensing volume.

- Claim: Added transactional email/reminder delivery attempt tracking with safe local fallback when Gmail is disabled.
  Supporting evidence: `EmailService`, `GmailApiClient`, `ReminderService`, `V20__Add_email_delivery_attempts.sql`.
  Recommended emphasis: Integration reliability.
  Required qualification: Do not claim successful real Gmail delivery unless external logs are provided.

- Claim: Dockerized the application and verified a release-demo smoke locally.
  Supporting evidence: `docker-compose.yml`, `docker-release-demo-smoke-2026-06-01.json`.
  Recommended emphasis: Delivery and repeatable UAT.
  Required qualification: Local Docker evidence only.

## 15. Claims that must not be used yet

| Potential claim | Why it is unsafe or weak | Missing evidence | How it could be validated |
| --- | --- | --- | --- |
| "Production-ready hospital system" | Repo verdict is `Release Candidate / Ship with fixes`, not unconstrained production ready | Release-owner sign-off and remaining P1/P2 decisions | Rerun full gates and obtain formal waiver/sign-off |
| "Used by real hospitals/patients" | No usage/adoption evidence found | Live deployment, analytics, production records, user feedback | Provide production logs or analytics with observation period |
| "Reduced latency by X%" | No baseline/final performance measurements found | Benchmark method, baseline, final, dataset, runs | Run reproducible API/page benchmarks locally |
| "HIPAA compliant" or "fully secure" | Security controls exist, but no independent compliance/security assessment | Compliance assessment, threat model, audit | External security/compliance review |
| "AI/Gemini-powered assistant" | `@google/generative-ai` is listed, but active source usage was not verified | Actual integration source and test evidence | Remove stale dependency or implement/test real AI integration |
| "Complete patient self-service" | Portal cancel/reschedule and message write APIs are missing or product decisions | API contracts and tests for writes | Implement or explicitly scope out |
| "Support ticket system" | Support pages exist, dedicated support API not visible | Ticket schema/API/workflows | Implement backend contract and UI tests |
| "Fully verified observability stack" | Observability files exist but Docker smoke is partially verified | Passing smoke with Prometheus, Loki, Tempo evidence | Run `scripts/release-observability-smoke.ps1` in Docker-ready env |
| "Live CI passing today" | CI config exists, but remote run status was not queried | GitHub Actions run result | Query GitHub Actions for current branch |
| "High adoption/open-source impact" | No stars/forks/traffic/downloads were collected | GitHub traffic/stars/forks, issue activity | Query GitHub and authenticated traffic metrics |

## 16. Missing evidence and recommended measurements

| Priority | Missing metric or evidence | Why it matters | Recommended tool | Exact procedure or command | Expected output | Risk level |
| --- | --- | --- | --- | --- | --- | --- |
| P0 | Current full quality gate after dirty observability changes | Confirms report is current, not just dated | Maven, npm, Playwright | `cd backend; mvn.cmd verify`; `cd frontend; npm run lint; npm run test:unit:coverage; npm run build` | Pass/fail logs, coverage summary | Low |
| P0 | Observability smoke | Validates uncommitted monitoring stack | Docker Compose, PowerShell smoke | `.\scripts\release-observability-smoke.ps1` | JSON summary with Prometheus backend target, metrics, Loki/Tempo evidence | Low to Medium |
| P1 | API latency baseline | Makes performance claims measurable | k6, wrk, autocannon, or Playwright traces | Run against local Docker release-demo stack; test `GET /departments`, `GET /doctors`, `POST /appointments`, authenticated queue/inventory reads; 5 runs | p50/p95/p99 latency, error rate | Medium; local only |
| P1 | Frontend page performance | Useful full-stack/UX evidence | Lighthouse or Playwright trace | Run Lighthouse on `/`, `/booking`, `/staff/login`, `/portal/login`, authenticated dashboards with synthetic data | LCP/CLS/TBT/performance score | Low |
| P1 | DB query performance | Supports optimization claims | PostgreSQL `EXPLAIN ANALYZE` | Use synthetic release-demo DB and selected appointment/queue/inventory/portal queries | Query plans and durations | Low |
| P1 | Backend coverage | Complements frontend 80% coverage | JaCoCo aggregate | Configure/report JaCoCo aggregate or inspect module reports after `mvn verify` | Branch/line coverage by module | Low |
| P1 | Live deployment status | Confirms deployed availability | Browser/curl/hosting dashboard | Provide URL, run safe GET checks only | HTTP status, health, screenshots | Low if non-production or approved |
| P2 | Adoption/user metrics | Required for impact claims | Analytics/DB/reporting dashboard | Export active users, appointments, transactions with date range | Counts with observation period | Medium; privacy-sensitive |
| P2 | GitHub public metrics | Supports open-source impact | GitHub API/UI | Query stars, forks, issues, PRs; traffic requires auth | Counts and dates | Low |
| P2 | Security assessment | Supports security claims | OWASP ZAP, dependency scans, code review | Run local-only ZAP passive scan and dependency audits | Findings and remediation state | Medium |
| P2 | Production reliability | Supports uptime/error-rate claims | Logs/APM/monitoring | Export uptime, 5xx rate, error budget over a period | Availability/error-rate report | Medium; needs production access |

## 17. Questions for me

### Critical questions

- What was your exact role: solo developer, team member, or team lead? This matters because Git history supports single visible authorship, but resume claims need accurate real-world attribution.
- What live application URL, if any, should be cited? This matters because no deployed URL is proven locally.
- Should uncommitted observability work be included in resume-safe claims, or should it remain a work-in-progress note until committed and fully smoked?
- What development period should be stated? Local Git shows 2026-04-05 to 2026-06-01, but planning/design may have started earlier.

### Valuable questions

- Were any of the 49 commits generated from team requirements, class/project requirements, or external issue tickets? This helps separate personal design from assigned implementation.
- Are there PRs, issues, project boards, or review records that should be included? This would strengthen collaboration and delivery evidence.
- Do you have benchmark, demo, or presentation recordings showing the system running? This would improve confidence for resume bullets.
- Did any real stakeholder, mentor, instructor, or user test the app? This could provide externally supported impact.

### Optional questions

- Do you want resume emphasis on backend, frontend, testing/release readiness, or full-stack architecture?
- Should the resume mention healthcare domain constraints conservatively, or stay purely technical?
- Do you want to exclude agent/workflow assets from resume claims even though they are in the repo?

## 18. Evidence quality score

| Category | Score | Explanation |
| --- | ---: | --- |
| Project context | 4 | Strong docs and source maps explain problem, users, modules, and workflows |
| Personal ownership | 4 | Local Git shows one visible author for 49 commits; real team context still needs confirmation |
| Technical complexity | 4 | Verified RBAC, scheduling/queue, clinical, inventory/pharmacy, reminders, tests, Docker |
| Functional scope | 4 | Broad verified API/UI/database scope, with some portal/support/static-route caveats |
| Performance | 1 | Performance spec exists, but no baseline/final measured latency or throughput found |
| Testing and reliability | 4 | Strong dated backend/frontend/Playwright/Docker/backup evidence; fresh rerun still needed after dirty changes |
| Security | 3 | Real controls and dated scans exist; no independent assessment/compliance proof |
| Deployment and automation | 3 | CI and Docker local deployment are defined; live production deployment absent |
| Adoption or external impact | 0 | No verified users, traffic, revenue, stars/forks, or production usage metrics |
| Overall evidence quality | 3 | Strong technical evidence, weak external impact and current-runtime measurements |

## 19. Handoff package for the Resume Bullet Writer

### Project identity

- Project name: Hospital Management System
- Project type: Full-stack healthcare operations application
- Target role: Full-stack engineer
- My role: Primary owner likely, but owner must confirm exact role
- Team size: MISSING
- Development period: VERIFIED local Git window 2026-04-05 to 2026-06-01; earlier work MISSING
- Live URL: MISSING
- Repository URL: `https://github.com/thanhquan3010/hospital-management-system.git`

### Problem and solution

- Problem: Coordinate hospital booking, staff operations, clinical workflows, inventory/pharmacy, finance, reminders, and patient portal reads in one system.
- Users: Guests, patients, receptionists, nurses, doctors, pharmacists, accountants, admins.
- Solution: Java/Spring Boot modular backend, PostgreSQL/Flyway schema, Next.js frontend, RBAC, Dockerized local runtime, release-demo seed data, and broad automated testing.

### Strongest verified technical contributions

- Contribution 1: Modularized backend into 5 Maven modules with DDD-style boundaries.
- Contribution 2: Implemented 118 method-level REST mappings across public, staff, admin, clinical, patient portal, inventory, finance, and notification workflows.
- Contribution 3: Built RBAC across backend permission checks and frontend route guards.
- Contribution 4: Implemented inventory/pharmacy dispense traceability through lot, medical record, prescription item, movement, and audit links.
- Contribution 5: Built release-readiness evidence with backend, frontend, Docker, Playwright, coverage, audit, secret-scan, and backup/restore artifacts.

### Strongest verified metrics

- Metric 1: 118 method-level backend API mappings.
- Metric 2: 72 frontend `page.tsx` files.
- Metric 3: 20 Flyway migrations.
- Metric 4: 80.48% frontend branch coverage on 2026-06-01.
- Metric 5: 148 backend tests passing in `mvn verify` on 2026-06-01.

### Important technologies with demonstrated usage

- Technology: Spring Boot / Java / Maven
  Evidence of usage: `backend/pom.xml`, backend source, Maven verify log.
  Technical purpose: Modular REST backend and service orchestration.
- Technology: PostgreSQL / Flyway / JPA
  Evidence of usage: migration files, JPA entities, repositories.
  Technical purpose: Versioned relational persistence.
- Technology: Next.js / React / TypeScript
  Evidence of usage: `frontend/package.json`, `frontend/src/app`, frontend tests.
  Technical purpose: Public, staff, admin, and portal UI.
- Technology: Spring Security / JWT / BCrypt / RBAC
  Evidence of usage: security config, JWT filter, RBAC service, route guard.
  Technical purpose: Authentication and authorization.
- Technology: Playwright / Vitest / Testcontainers
  Evidence of usage: test files and dated pass logs.
  Technical purpose: Unit, integration, E2E, visual, and route verification.

### Strongest technical challenges

- Challenge: Hospital workflow state consistency.
  Solution: Transactional services validate appointments, queue, inventory, invoice states.
  Result: Dated backend and Playwright tests pass.
  Evidence: `AppointmentWorkflowService`, `InventoryWriteService`, Playwright logs.
- Challenge: Privacy and access control.
  Solution: JWT, RBAC permission map, frontend route guard, encrypted/hash patient identifiers.
  Result: RBAC/security tests passed in dated evidence.
  Evidence: `SecurityConfig`, `RbacAuthorizationService`, `PatientIdentifierProtector`.
- Challenge: Notification reliability.
  Solution: Delivery-attempt persistence with local-record fallback and scheduler retry behavior.
  Result: W-03 closed in readiness report.
  Evidence: `EmailService`, `ReminderService`, `V20`.

### Resume-safe scope

- Verified scope item: API mappings
  Verified count: 118
  Evidence: 2026-06-07 controller annotation count
- Verified scope item: Frontend pages
  Verified count: 72
  Evidence: 2026-06-07 `frontend/src/app/**/page.tsx` count
- Verified scope item: DB migrations
  Verified count: 20
  Evidence: Flyway migration directory
- Verified scope item: Test inventory
  Verified count: 33 backend test classes, 49 frontend unit/component test files, 25 Playwright specs
  Evidence: 2026-06-07 file counts

### Missing information

- Missing item: Exact personal role/team size.
  Why it matters: Prevents over-attribution.
  Recommended next action: User confirms role and collaborators.
- Missing item: Live URL/production status.
  Why it matters: Determines whether deployment and adoption claims are safe.
  Recommended next action: Provide URL or mark not deployed.
- Missing item: Performance/adoption metrics.
  Why it matters: Strong resume bullets need measured outcomes.
  Recommended next action: Run local benchmarks and collect real usage metrics if available.

### Warnings for the Resume Bullet Writer

- Do not invent user counts, patient counts, revenue, adoption, uptime, latency reductions, or time savings.
- Do not say "Production Ready"; current evidence says `Release Candidate / Ship with fixes`.
- Do not claim HIPAA/compliance/security certification.
- Do not claim AI/Gemini integration unless active source and tests are added.
- Do not present synthetic release-demo seed data as real usage.
- Do not treat `frontend/` prototypes as the runnable frontend; `frontend/` is canonical.
- Do not claim complete support ticket, patient cancel/reschedule, or patient messaging write workflows.
- Qualify all dated test/coverage/audit metrics with the 2026-06-01 evidence date unless rerun.

## Final quality-control checklist

- Every strong claim includes an evidence reference.
- Project-level functionality is not automatically attributed beyond local Git evidence.
- No adoption, revenue, time-saved, latency, or production metrics were invented.
- Baseline/final values are included only where supported.
- Test and benchmark conditions are dated or marked missing.
- Generated, prototype, and third-party dependency evidence is separated from meaningful implementation.
- Technologies are classified by demonstrated usage, not package presence alone.
- Missing evidence is explicitly labeled.
- Measurement recommendations are local, reproducible, and non-destructive.
- No polished resume bullet was written.
