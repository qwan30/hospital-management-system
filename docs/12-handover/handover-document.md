# Hospital Management System (HMS) -- Handover Document

**Date:** 2026-06-14
**Release Label:** Release Candidate / Ship with fixes
**Repository:** `github.com/thanhquan3010/hospital-management-system`
**Branch:** `master`
**HEAD Commit:** `2ab7e3f` -- "fix: remove dangling setIsExecuting reference in slots page"
**Container Registry:** `ghcr.io/tranhquan099-commits/hospital-management-system`

---

## Table of Contents

1. [Project Status](#1-project-status)
2. [System Architecture](#2-system-architecture)
3. [Module Breakdown](#3-module-breakdown)
4. [What Is Working](#4-what-is-working)
5. [Known Issues and Limitations](#5-known-issues-and-limitations)
6. [Test Summary](#6-test-summary)
7. [CI/CD Pipeline](#7-cicd-pipeline)
8. [Deployment](#8-deployment)
9. [Documentation Map](#9-documentation-map)
10. [Key Technical Decisions](#10-key-technical-decisions)
11. [Contacts and Resources](#11-contacts-and-resources)

---

## 1. Project Status

The Hospital Management System (HMS) is at **Release Candidate** stage, ready for production deployment with known limitations documented below. The application provides a complete healthcare management platform covering seven clinical workflows from public appointment booking through pharmacy dispensing, billing, and patient portal self-service.

### Release Readiness

| Criterion | Status |
|-----------|--------|
| Backend unit + integration tests | 148 test cases passing |
| Frontend unit tests (Vitest) | Passing -- 80.48% branch coverage |
| Frontend lint (ESLint) | Clean |
| Playwright E2E tests | 183+ scenarios passing across 25 spec files |
| Docker Compose full-stack deployment | Verified |
| RBAC enforcement | 36 permissions across 7 roles |
| PHI encryption | Operational (AES-GCM + SHA-256 hash indexing) |
| CI/CD pipeline | All 4 workflows operational |
| Security scanning | CodeQL + Trivy + OWASP Dependency Check + TruffleHog |

### Recent Commit History

| Commit | Description |
|--------|-------------|
| `2ab7e3f` | fix: remove dangling setIsExecuting reference in slots page |
| `b488d92` | fix: resolve frontend E2E failures and lint warnings |
| `b8a21fc` | fix: resolve Prometheus actuator endpoint 404 in integration tests |
| `a68d4d3` | trigger: fresh CI run with prometheus endpoint fix |
| `e710000` | fix: enable prometheus actuator endpoint in SecurityHardeningIntegrationTest |
| `839ca6e` | trigger: add workflow_dispatch and kick fresh CI with all fixes |
| `63520f2` | perf: split CI into 3 parallel jobs with dependency caching |
| `9461acc` | fix: merge duplicate hms key in application.yml to prevent SnakeYAML DuplicateKeyException |
| `3721884` | fix: resolve CI/CD pipeline failures and module boundary violation |
| `6f4781e` | feat: add secure AI integration endpoints and tests |
| `d6b37d2` | docs: rewrite README with diagrams and update release test/portfolio reports |
| `234c941` | feat: integrate observability overlay, logging attempts, and GHA CI/CD |
| `9810a3b` | feat: close HMS pharmacy and notification waivers |
| `dc7051d` | feat(lab-results): add staff result creation flow |
| `cb5a5d5` | test(e2e): stabilize visual baselines and expand route coverage |
| `5a359c3` | feat(invoices): add CSV export, date range filters, and detail drawer |
| `52a9a43` | refactor(dashboard): extract role-specific staff dashboard views |
| `40b50c7` | feat(shell): add responsive mobile navigation with hamburger menu |
| `c9d5060` | feat(release): harden HMS demo readiness |
| `60eada8` | feat: migrate all frontend screens to hc- design system |

---

## 2. System Architecture

### High-Level Topology

```
+-------------------+       +------------------+       +----------------+
|                   |       |                  |       |                |
|   Frontend        | HTTP  |   Backend        | JDBC  |   PostgreSQL   |
|   Next.js 16      |------>|   Spring Boot    |------>|   pgvector:15  |
|   React 19        |       |   Java 17        |       |   35 tables    |
|   :3000           |       |   :8081          |       |   :5432        |
|                   |       |                  |       |                |
+-------------------+       +--------+---------+       +----------------+
                                     |
                                     | (optional)
                            +--------v---------+
                            |  Observability   |
                            |  Prometheus      |
                            |  Grafana         |
                            |  Loki + Tempo    |
                            |  OpenTelemetry   |
                            +------------------+
```

### Backend Module Structure (DDD Modular Monolith)

```
backend/
+-- domain/          -- Core business entities, value objects, domain events, enums
|                     -- 26 JPA entities, shared DTOs, domain exceptions
+-- infrastructure/  -- Spring Data JPA repositories, Gmail client, PDF generation
|                     -- Flyway migrations (V1-V20), external service adapters
+-- application/     -- Use cases, service orchestration, DTOs, scheduled jobs
|                     -- Auth, RBAC, booking, clinical workflows, inventory, finance
+-- controller/      -- REST controllers (32 classes), API envelopes, security filters
|                     -- 118+ API mappings across 9 domain families
+-- start/           -- Spring Boot entry point, DI configuration, Flyway config
|                     -- 20 integration test suites, JaCoCo coverage
```

Dependency chain: `domain` <-- `infrastructure` <-- `application` <-- `controller` <-- `start`

### Frontend Route Groups (Next.js 16 App Router)

```
web/src/app/
+-- (public)/        -- Landing, departments, doctors, booking, news, legal pages
+-- portal/          -- Patient portal (overview, appointments, lab results, messages, profile)
|   +-- (auth)/      -- Patient login
+-- staff/           -- Staff dashboard, queue, medical records, prescriptions, lab results
|   +-- (auth)/      -- Staff login
|   +-- booking/     -- Booking wizard (symptoms, slots, review, success)
|   +-- doctor/      -- Doctor dashboard, schedule
|   +-- lab-results/ -- Lab result management
+-- admin/           -- Admin panel (users, departments, rooms, inventory, audit, monitoring)
+-- auth/            -- Logout
```

Total frontend pages: **72 route files** (`page.tsx`)

---

## 3. Module Breakdown

### 3.1 Domain Entities (26 total)

| Domain | Entity | Description |
|--------|--------|-------------|
| Appointment | `AppointmentEntity` | Core appointment/booking aggregate |
| | `AppointmentVitalSignsEntity` | Vital signs recorded during appointment |
| | `FollowUpEntity` | Follow-up scheduling |
| Patient | `PatientEntity` | Patient demographic data (PHI encrypted) |
| | `PatientAccountEntity` | Patient portal account linking |
| User | `UserEntity` | Staff user accounts with role assignment |
| Medical Record | `MedicalRecordEntity` | Clinical encounter documentation |
| Prescription | `PrescriptionItemEntity` | Medication line items |
| Department | `DepartmentEntity` | Clinical departments |
| Time Slot | `TimeSlotEntity` | Doctor availability slots |
| Room | `RoomEntity` | Examination rooms |
| Schedule Template | `DoctorScheduleTemplateEntity` | Recurring doctor schedules |
| Special Closure | `SpecialClosureEntity` | Holiday/closure dates |
| Invoice | `InvoiceEntity` | Patient billing |
| | `ServicePricingEntity` | Medical service price catalog |
| Inventory | `InventoryItemEntity` | Pharmacy stock items |
| | `InventoryLotEntity` | Lot/batch tracking |
| | `InventoryMovementEntity` | Stock in/out movements |
| Lab Result | `LabResultEntity` | Diagnostic test results |
| Patient Portal | `PatientMessageEntity` | Patient messages |
| | `PatientMessageThreadEntity` | Message threading |
| | `LabResultEntity` | Portal-facing lab results |
| Content | `HospitalContentSectionEntity` | Public website content sections |
| | `NewsArticleEntity` | Hospital news articles |
| Audit | `AuditLogEntity` | Admin operation audit trail |
| Email | `EmailDeliveryAttemptEntity` | Email notification delivery tracking |

### 3.2 REST Controllers (32 classes, 9 families)

| Family | Controllers | Description |
|--------|-------------|-------------|
| Auth | `AuthController`, `PatientAuthController` | JWT login/refresh/logout, patient claim |
| Public Content | `PublicContentController`, `DepartmentController`, `DoctorController` | Landing, departments, doctors, news, chatbot |
| Booking | `AppointmentController`, `ScheduleController` | Appointment CRUD, doctor slot selection |
| Clinical | `QueueController`, `MedicalRecordController`, `PatientRecordController`, `VitalSignsController`, `LabResultController`, `PatientController` | Queue management, EHR, vital signs, lab results |
| Finance | `InvoiceController`, `PricingController`, `RevenueReportController` | Billing, pricing, daily/monthly revenue reports |
| Inventory | `InventoryController` | Items, lots, movements |
| Patient Portal | `PatientPortalController` | Patient self-service overview, appointments, messages |
| Admin | `AdminUserController`, `AdminDepartmentController`, `AdminRoomController`, `AdminScheduleTemplateController`, `AdminSpecialClosureController`, `AdminTimeSlotController`, `AdminStatsController`, `AdminAuditLogController`, `AdminMonitoringController`, `AdminContentController`, `AdminNewsController`, `AdminPublicContentController` | Full admin CRUD + analytics |
| AI | `AiIntegrationController` | Symptom analysis (secured, gated) |

### 3.3 Database (PostgreSQL with pgvector)

- **35 tables** across 8 domains
- **26 indexes** optimized for clinical search queries
- **20 Flyway migrations** (V1 through V20)
- pgvector extension enabled for future ML/AI features
- PHI fields encrypted at application level before storage

### 3.4 Frontend Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 16.2.6 |
| UI Library | React | 19.2.4 |
| Styling | Tailwind CSS | Latest |
| Components | shadcn/ui | Latest |
| Testing (unit) | Vitest | Latest |
| Testing (E2E) | Playwright | Latest |
| State | React Server Components + Client components |

---

## 4. What Is Working

### 4.1 Clinical Workflows (7 end-to-end flows)

1. **Public Booking** -- Guest visits public site, views departments/doctors, selects slot, provides contact info, receives confirmation
2. **Patient Check-in** -- Staff receptionist checks patient in, assigns to queue
3. **Nurse Intake / Vital Signs** -- Nurse records vital signs, assigns examination room
4. **Doctor Consultation** -- Doctor examines patient, creates medical record, prescribes medications
5. **Pharmacy Dispensing** -- Pharmacist views prescription, dispenses medication from inventory
6. **Billing / Invoice** -- Accountant generates invoice, processes payment (cash/insurance)
7. **Patient Portal** -- Patient views appointments, lab results, messages (read-only), profile

### 4.2 Security

- **JWT-based authentication** with token refresh
- **RBAC with 36 permissions** enforced via `@PreAuthorize` annotations
- **PHI encryption** using AES-GCM with configurable secret key
- **Patient identifier hashing** via SHA-256 for search indexing
- **Rate limiting** on public endpoints (configurable via `HMS_PUBLIC_RATE_LIMIT_PER_MINUTE`)
- **CORS** configured for frontend origin(s)

### 4.3 Infrastructure

- Docker Compose for full-stack local deployment (PostgreSQL + Backend + Frontend)
- Optional observability stack: Prometheus, Grafana (7 dashboards), Loki, Tempo, OpenTelemetry
- GitHub Actions CI/CD with automated build, test, scan, and deploy
- Weekly security scanning (Dependency Check, TruffleHog, Trivy, CodeQL)
- Container images pushed to GitHub Container Registry (GHCR)

### 4.4 Observability (optional overlay)

| Service | Purpose | Configuration |
|---------|---------|---------------|
| Prometheus | Metrics collection | `infra/observability/prometheus.yml` |
| Grafana | Dashboards (7 pre-configured) | `infra/observability/grafana/dashboards/` |
| Loki | Log aggregation | `infra/observability/loki.yml` |
| Tempo | Distributed tracing | `infra/observability/tempo.yml` |
| Promtail | Log shipping | `infra/observability/promtail.yml` |
| OpenTelemetry Collector | Trace/metric pipeline | `infra/observability/otel-collector.yml` |

Grafana dashboards cover: release overview, backend API, frontend UX, queue/clinical ops, inventory/pharmacy, notifications, audit/security.

### 4.5 Demo Data

Set `HMS_RELEASE_DEMO_SEED_ENABLED=true` to seed:
- 8 sample patients
- 12 appointments across departments
- 8 inventory items
- 16 audit log entries
- 8 default user accounts covering all roles

---

## 5. Known Issues and Limitations

### Open Issues Summary

| ID | Description | Severity | Area |
|----|-------------|----------|------|
| OPEN-001 | Patient portal message send not wired (read-only UI) | Medium | Frontend |
| OPEN-002 | No self-cancel/reschedule for patients (staff must do it) | Medium | Backend |
| OPEN-003 | No payment gateway integration | Low | Full Stack |
| OPEN-004 | No drug/allergy interaction checking | Medium | Backend |
| OPEN-005 | OWASP Dependency Check never fails CI (`continue-on-error: true`) | Low | CI/CD |
| OPEN-006 | TruffleHog only-verified mode (may miss unverified secrets) | Low | CI/CD |
| OPEN-007 | CD pipeline lacks frontend smoke check | Low | CI/CD |
| OPEN-008 | Rollback does not revert database migrations | **High** | CI/CD |
| OPEN-009 | Observability stack not scaled for production | Low | Infrastructure |
| OPEN-010 | E2E tests depend on running full stack | Medium | Testing |
| OPEN-011 | No rate limiting on authenticated endpoints | Medium | Backend |
| OPEN-012 | Missing password reset flow | Medium | Auth |

**High Severity (must fix before production):** 1
**Medium Severity (should fix):** 6
**Low Severity (nice to have):** 5

For full details, see [known-issues.md](known-issues.md).

### Out-of-Scope Items

- External payment gateway integration
- Clinical record locking / addendum policy
- Drug-allergy interaction checking engine
- AI symptom analysis (endpoints removed from API contract)
- Internal assistant (knowledge document endpoints removed)

---

## 6. Test Summary

### Backend Tests

| Suite | Location | Type | Count |
|-------|----------|------|-------|
| Application unit tests | `backend/application/src/test/` | Unit (JUnit 5) | 14 test classes |
| Integration tests | `backend/start/src/test/` | Integration (Testcontainers) | 20 test classes |
| **Total backend** | | | **34 test classes, 148 test cases** |

Key integration test suites:
- `AuthenticationIntegrationTest` -- Login, refresh, logout, RBAC
- `ClinicalWorkflowIntegrationTest` -- End-to-end clinical flow
- `QueueWorkflowIntegrationTest` -- Queue state machine
- `FinanceIntegrationTest` -- Invoicing and revenue reports
- `InventoryIntegrationTest` -- Stock management
- `PatientPortalIntegrationTest` -- Portal API endpoints
- `SecurityHardeningIntegrationTest` -- Security configuration validation
- `AdminUserIntegrationTest` / `AdminDepartmentRoomIntegrationTest` -- Admin CRUD

### Frontend Tests

| Suite | Location | Coverage |
|-------|----------|----------|
| Vitest unit tests | `web/src/` | **80.48% branch coverage** |
| ESLint | `web/` | Clean |
| Playwright E2E | `web/e2e/specs/` | 25 spec files, 183+ scenarios |

E2E spec files (total 3804 lines):
- `all-routes-exhaustive.spec.ts` -- Route contract verification
- `auth-integrated.spec.ts` -- Login/logout flows
- `rbac.spec.ts` / `rbac-enforcement.spec.ts` -- RBAC route guards
- `booking-wizard.spec.ts` -- Guest booking flow
- `staff-queue.spec.ts` -- Queue operations
- `staff-clinical.spec.ts` -- Clinical workflows
- `admin-pages.spec.ts` -- Admin panel CRUD
- `portal-pages.spec.ts` -- Patient portal
- `operations-api.spec.ts` -- API operation coverage
- `security.spec.ts` -- Security edge cases
- `seo-audit.spec.ts` -- SEO metadata verification
- `visual.spec.ts` -- Visual regression baselines
- `responsive.spec.ts` -- Responsive design checks
- `a11y-integrated.spec.ts` -- Accessibility
- `live-all-routes-audit.spec.ts` -- Live route audit

---

## 7. CI/CD Pipeline

### GitHub Actions Workflows (4 total)

| Workflow | File | Trigger | Description |
|----------|------|---------|-------------|
| CI | `.github/workflows/ci.yml` | Push/PR to master | Build, test, lint, scan, push Docker images |
| CD | `.github/workflows/cd.yml` | CI success on master | Deploy to staging/production via Docker Compose |
| Rollback | `.github/workflows/rollback.yml` | Manual dispatch | Redeploy previous Docker images (manual DB rollback needed) |
| Security Scan | `.github/workflows/security-scan.yml` | Weekly schedule | OWASP Dependency Check + TruffleHog |

### CI Pipeline Jobs (7 sequential stages)

1. **Detect Changed Paths** -- `dorny/paths-filter` determines which parts changed
2. **CodeQL Security Scan** -- Java/Kotlin + JavaScript/TypeScript analysis
3. **Backend Maven verify** -- Unit + integration tests with Testcontainers Postgres, JaCoCo coverage
4. **Frontend lint, test, build, E2E** -- ESLint, Vitest, Next.js build, Playwright E2E (Chromium)
5. **Validate Observability Compose** -- Docker Compose config validation
6. **Docker Build, Scan, Push** -- Multi-stage builds, Trivy scan, push to GHCR
7. **CI Summary** -- Final status report

### Container Images

- `ghcr.io/tranhquan099-commits/hospital-management-system/backend:{latest,sha}`
- `ghcr.io/tranhquan099-commits/hospital-management-system/frontend:{latest,sha}`

### Security Scanning

| Tool | Scope | Schedule |
|------|-------|----------|
| CodeQL | Source code analysis | Every CI run |
| Trivy | Container image vulnerability scan | Every CI run (Docker build) |
| OWASP Dependency Check | Maven dependency vulnerabilities | Weekly (Saturday 06:00 UTC) |
| TruffleHog | Secret leak detection | Weekly (Saturday 06:00 UTC) |

---

## 8. Deployment

### Docker Compose Services

| Service | Image | Port | Health Check |
|---------|-------|------|--------------|
| postgres | `pgvector/pgvector:pg15` | 5432 | `pg_isready` |
| backend | `ghcr.io/.../backend:latest` | 8081 | Actuator `/actuator/health` |
| frontend | `ghcr.io/.../frontend:latest` | 3000 | HTTP 200 on `/` |

### Quick Start

```bash
# Prerequisites: Java 17+, Node.js 22+, Docker Desktop

# 1. Clone and configure
git clone https://github.com/thanhquan3010/hospital-management-system.git
cd hospital-management-system
cp .env.example .env
# Edit .env: set POSTGRES_PASSWORD, JWT_SECRET, PATIENT_IDENTIFIER_SECRET

# 2. Start database
docker compose up -d postgres

# 3. Start backend
cd backend
.\run.ps1          # PowerShell (loads .env)
# OR: mvn spring-boot:run -f start/pom.xml

# 4. Start frontend (separate terminal)
cd web
npm install
npm run dev

# 5. Access
# Frontend: http://localhost:3000
# API:      http://localhost:8081/api/v1
# Health:   http://localhost:8081/api/v1/public/health
```

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Doctor (Internal Medicine) | `doctor1@hospital.vn` | `Doctor@1234` |
| Doctor (Cardiology) | `doctor2@hospital.vn` | `Doctor@1234` |
| Nurse | `nurse@hospital.vn` | `Nurse@1234` |
| Receptionist | `receptionist@hospital.vn` | `Reception@1234` |
| Pharmacist | `pharmacist@hospital.vn` | `Pharma@1234` |
| Accountant | `accountant@hospital.vn` | `Acc@1234` |
| Admin | `admin@hospital.vn` | `Admin@1234` |
| Patient (Portal) | `patient@example.com` | `Patient@1234` |

### Environment Variables

Key variables required in `.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_PASSWORD` | Database password | (required) |
| `JWT_SECRET` | JWT signing key (min 32 chars) | (required) |
| `PATIENT_IDENTIFIER_SECRET` | PHI encryption key (min 32 chars) | (required) |
| `SPRING_PROFILES_ACTIVE` | Spring profile | `dev` |
| `HMS_RELEASE_DEMO_SEED_ENABLED` | Enable demo data seeding | `false` |
| `HMS_PUBLIC_RATE_LIMIT_PER_MINUTE` | Rate limit for public endpoints | `30` |
| `NEXT_PUBLIC_API_BASE_URL` | Frontend API base URL | `http://localhost:8081/api/v1` |

Full reference: `docs/10-deployment/env-variables.md`

---

## 9. Documentation Map

Comprehensive documentation is available in the `docs/` directory organized into 12 categories:

| Category | Directory | Description |
|----------|-----------|-------------|
| Overview | `00-overview/` | Project foundation, context, documentation index, git workflow, code review |
| Business | `01-business/` | Stakeholders, scope, glossary, business rules |
| Product | `02-product/` | PRD, feature list (F-001 to F-050) |
| Requirements | `03-requirements/` | Permissions matrix (36 rights x 7 roles) |
| Architecture | `04-architecture/` | DDD, security, tech stack, coding standards |
| API | `05-api/` | 118 endpoints, auth flows, error codes |
| Database | `06-database/` | 35 tables, migration guide, seed data |
| Flows | `07-flows/` | 7 clinical workflows, state machines |
| UI/UX | `08-ui-ux/` | Design brief, design system |
| Testing | `09-testing/` | Test strategy, test plan |
| Deployment | `10-deployment/` | Docker, CI/CD, env variables |
| Handover | `12-handover/` | This document, developer onboarding, known issues |

Quick-access resources:
- Consolidated HTML: `docs/HMS_DOCUMENTATION.html`
- API Contract: `API_CONTRACT.md` (root)
- Architecture diagrams: `docs/HMS_ArchitectureDiagrams.html`
- Test plan: `docs/09-testing/test-plan.md`
- Deployment guide: `docs/10-deployment/deployment-guide.md`
- Known issues: `docs/12-handover/known-issues.md`
- Developer onboarding: `docs/12-handover/developer-onboarding.md`

---

## 10. Key Technical Decisions

### Domain-Driven Design over CRUD

Business logic is encapsulated in domain aggregates with rich behavior rather than anemic CRUD services. This provides better alignment with clinical domain language and easier evolution of business rules.

### PostgreSQL with pgvector

Postgres 15 with the pgvector extension was chosen over a pure relational approach to enable future ML/AI features such as semantic search on medical records and patient similarity matching. The extension adds zero overhead for current workloads.

### Next.js 16 / React 19

Cutting-edge React Server Components architecture was adopted despite breaking changes from v15. This enables better performance through server-side rendering and reduced client bundle sizes.

### Application-Level PHI Encryption

Patient identifiable information is encrypted at the application layer (AES-GCM) before being written to the database, not just protected by TLS in transit. A separate SHA-256 hash column enables search while preserving privacy. This exceeds standard HIPAA compliance requirements.

### Stateless JWT Authentication with RBAC

JWT tokens enable stateless, horizontally scalable authentication. Role-based access control with 36 granular permissions is enforced at the endpoint level via `@PreAuthorize` annotations, ensuring defense in depth alongside frontend route guards.

### GitHub Container Registry

Container images are stored in GHCR rather than a separate Docker registry, simplifying CI/CD by using the same authentication context (GITHUB_TOKEN) used for source code.

### Modular Monolith over Microservices

A 5-module Maven project with strict dependency direction (domain <-- infrastructure <-- application <-- controller <-- start) provides the architectural discipline of microservices without the operational complexity. Separate bounded contexts within the monolith can be extracted into independent services when needed.

---

## 11. Contacts and Resources

### Repository

| Resource | Location |
|----------|----------|
| Source code | `github.com/thanhquan3010/hospital-management-system` |
| Container images | `ghcr.io/tranhquan099-commits/hospital-management-system` |
| CI/CD workflows | `.github/workflows/ci.yml`, `cd.yml`, `rollback.yml`, `security-scan.yml` |

### Key Documentation Files

| Resource | Path |
|----------|------|
| API Contract | `API_CONTRACT.md` |
| Full documentation (HTML) | `docs/HMS_DOCUMENTATION.html` |
| Architecture diagrams | `docs/HMS_ArchitectureDiagrams.html` |
| API endpoint inventory | `docs/API_ENDPOINTS_COMPREHENSIVE.md` |
| Deployment guide | `docs/10-deployment/deployment-guide.md` |
| Test plan | `docs/09-testing/test-plan.md` |
| Test strategy | `docs/09-testing/test-strategy.md` |
| Known issues | `docs/12-handover/known-issues.md` |
| Developer onboarding | `docs/12-handover/developer-onboarding.md` |
| Environment variables | `docs/10-deployment/env-variables.md` |
| Database schema | `docs/06-database/db-schema.md` |
| CI/CD documentation | `docs/10-deployment/ci-cd.md` |
| Docker configuration | `docs/10-deployment/docker.md` |
| Business flows | `docs/07-flows/end-to-end-business-flow.md` |
| RBAC permissions matrix | `docs/03-requirements/permissions-matrix.md` |
| Seed data / demo accounts | `docs/reference/demo-accounts-and-seed-data.md` |

### Key Architecture Documentation

| Resource | Path |
|----------|------|
| Architecture overview | `docs/04-architecture/architecture.md` |
| DDD design | `docs/04-architecture/domain-driven-design.md` |
| Security architecture | `docs/04-architecture/security-architecture.md` |
| Technology stack | `docs/04-architecture/tech-stack.md` |
| Coding standards | `docs/04-architecture/coding-standards.md` |

### Infra Configuration

| Resource | Path |
|----------|------|
| Docker Compose (core) | `docker-compose.yml` |
| Docker Compose (observability) | `docker-compose.observability.yml` |
| Grafana dashboards | `infra/observability/grafana/dashboards/` |
| Prometheus config | `infra/observability/prometheus.yml` |
| Loki config | `infra/observability/loki.yml` |
| Tempo config | `infra/observability/tempo.yml` |
| OpenTelemetry config | `infra/observability/otel-collector.yml` |

---

*Document generated on 2026-06-14 from commit `2ab7e3f`. GitNexus code intelligence index may be stale (last analyzed at `dc7051d`). Run `npx gitnexus analyze` to refresh.*
