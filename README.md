# Hospital Management System

A comprehensive hospital management platform with appointment scheduling, clinical workflow automation, administration, finance, inventory, and patient portal workflows.

## Stack

- **Backend**: Java 17 / Spring Boot 3.3, multi-module Maven project (`domain`, `infrastructure`, `application`, `controller`, `start`)
- **Database**: PostgreSQL 15, managed by Flyway (`V1` through `V20`; includes current clinical, RBAC, inventory, pharmacy dispense traceability, and email-delivery evidence schema)
- **Email**: Gmail API for transactional emails (confirmation, prescriptions, reminders)
- **API Docs**: SpringDoc OpenAPI, with 117 method-level controller mappings plus SpringDoc/Actuator support endpoints
- **Frontend**: Next.js 16 / React 19 / TypeScript in `web/`; static design prototypes remain in `frontend/`

## Current Status

Current repository status is tracked in [docs/reference/repository-status.md](docs/reference/repository-status.md). The 2026-06-01 readiness pass started from `HEAD` `dc7051d3123127ccccc04c38a2a874cf53a26ca2` with GitNexus up to date at the same commit.

Release-readiness status is **Release Candidate / Ship with fixes** after the 2026-06-01 waiver-closure pass. W-01/BF-07 lab-result creation, W-02/BF-09 pharmacy dispensing, and W-03/BF-11 notification delivery evidence are closed with backend, frontend, Docker, and Playwright verification. Production sign-off still requires release-owner acceptance of the remaining P1/P2 product and safety backlog tracked in the readiness report.

The backend API exposes 117 method-level controller mappings covering:
- Authentication (Staff JWT + Patient portal)
- Smart Reservation System (booking and clinical triage intake)
- Clinical Workflow (medical records, prescriptions, PDF generation)
- Administration (users, departments, rooms, schedules, content)
- Finance (invoices, payments, revenue reports)
- Inventory Management (items, lots, movements, medication dispensing)
- Patient Portal (profile, appointments, messages, lab results)

The `web/` app contains the canonical Next.js route tree for public, staff, admin, and patient portal screens. The `frontend/` directory is retained as migrated design-reference HTML/PNG prototypes, not as the runnable frontend.

## Local Setup

### Prerequisites
- Java 17+ (tested with Java 21)
- Maven 3.9+
- Docker Desktop (for PostgreSQL and Testcontainers-backed integration tests)
- Node.js 20+

### Quick Start

#### Step 1 — Start PostgreSQL

```bash
docker compose up -d postgres
```

Wait until the container is healthy (`docker ps` should show `(healthy)`).

#### Step 2 — Set up environment variables

Copy `.env.example` to `.env` at the project root (if not already done):

```bash
cp .env.example .env
```

The `.env` file must contain at minimum:

```dotenv
POSTGRES_PASSWORD=hospital_pass
JWT_SECRET=this-is-a-very-secure-secret-key-123456
PATIENT_IDENTIFIER_SECRET=another-very-secure-secret-key-123456
SPRING_PROFILES_ACTIVE=dev
HMS_RELEASE_DEMO_SEED_ENABLED=false
```

#### Step 3 — Build & Run Backend

**Option A — Use the launcher script (recommended):**

```powershell
# From the project root
.\backend\run.ps1
```

The script automatically loads `.env`, sets required variables, and runs the correct module.

**Option B — Manual Maven commands:**

```powershell
# Set environment variables (PowerShell)
$env:POSTGRES_PASSWORD='hospital_pass'
$env:JWT_SECRET='this-is-a-very-secure-secret-key-123456'
$env:PATIENT_IDENTIFIER_SECRET='another-very-secure-secret-key-123456'
$env:SPRING_PROFILES_ACTIVE='dev'
$env:HMS_RELEASE_DEMO_SEED_ENABLED='false'
$env:HMS_ALLOW_CREDENTIALS='true'

# Build all modules
cd backend
mvn install -DskipTests

# Run the backend — MUST target the 'start' module
mvn spring-boot:run -f start/pom.xml
```

> ⚠️ **Common mistake:** Running `mvn spring-boot:run` from `backend/` without `-f start/pom.xml` will fail with
> `Unable to find a suitable main class`. The parent POM is an aggregator (`<packaging>pom</packaging>`)
> and has no main class. The `@SpringBootApplication` class lives in the `start` module.

#### Step 4 — Verify backend is running

```bash
# Health check
curl http://localhost:8081/actuator/health
# → {"status":"UP"}

# Swagger UI
# Open in browser: http://localhost:8081/swagger-ui/index.html
```

#### Step 5 — Run frontend (optional)

```bash
cd web
npm install
npm run dev
# → http://localhost:3000
```

### Demo Users (seeded on first startup)

| Email | Password | Role |
|:------|:---------|:-----|
| `doctor1@hospital.vn` | `Doctor@1234` | DOCTOR |
| `doctor2@hospital.vn` | `Doctor@1234` | DOCTOR |
| `nurse@hospital.vn` | `Nurse@1234` | NURSE |
| `receptionist@hospital.vn` | `Reception@1234` | RECEPTIONIST |
| `pharmacist@hospital.vn` | `Pharma@1234` | PHARMACIST |
| `admin@hospital.vn` | `Admin@1234` | ADMIN |
| `accountant@hospital.vn` | `Acc@1234` | ACCOUNTANT |

See [demo accounts and seed data](docs/reference/demo-accounts-and-seed-data.md) for the complete current seed-data reference.

For a Docker/VPS UAT release demo, set `HMS_RELEASE_DEMO_SEED_ENABLED=true` before backend startup. This adds synthetic data across public booking, queue, portal, admin, inventory, finance, and audit flows without using real patient data.

### Environment Variables

Secrets are required. External integrations are disabled by default and degrade gracefully:

| Variable | Default | Purpose |
|:---------|:--------|:--------|
| `POSTGRES_PASSWORD` | required | PostgreSQL password for the backend datasource |
| `JWT_SECRET` | required | JWT signing secret; use a long random value |
| `PATIENT_IDENTIFIER_SECRET` | required | Separate patient identifier hashing secret; do not reuse `JWT_SECRET` |
| `GMAIL_ENABLED` | `false` | Enable email notifications |
| `HMS_RELEASE_DEMO_SEED_ENABLED` | `false` | Enable synthetic UAT/release-demo data only for demos and verification |

## Project Structure

```
backend/
|-- domain/          # JPA entities, enums, request/response contracts, domain exceptions
|-- infrastructure/  # Spring Data repositories and external integration adapters
|-- application/     # Use-case services, auth services, orchestration, seed/backfill jobs
|-- controller/      # REST controllers, API envelope, security filters, web error handling
`-- start/           # Spring Boot app, runtime config, Flyway migrations, integration tests
docs/                # Documentation map, product, architecture, API, test, deployment, and reference docs
web/                 # Canonical Next.js frontend
frontend/            # Static design-reference prototypes
docker-compose.yml   # PostgreSQL + backend + frontend services
```

## Backend Architecture

The backend is a DDD-oriented Maven reactor:

```text
domain <- infrastructure <- application
domain + application <- controller
domain + infrastructure + application + controller <- start
```

`controller` depends directly on `domain` for request/response contracts and domain exceptions. `start` is the composition root, so it declares the backend modules it boots and scans instead of relying on transitive Maven dependencies. Java package names still use the existing `com.hospital.core`, `com.hospital.api`, and `com.hospital.shared` namespaces; the Maven module folders above are the current architectural boundaries.

## Source of Truth

1. [`docs/README.md`](docs/README.md) - documentation map and source-of-truth rules
2. [`docs/HMS_PRD.md`](docs/HMS_PRD.md) - Product Requirements Document
3. [`docs/HMS_SRS.md`](docs/HMS_SRS.md) - system requirements mapped to current APIs
4. [`API_CONTRACT.md`](API_CONTRACT.md) - primary high-level API contract
5. [`docs/API_ENDPOINTS_COMPREHENSIVE.md`](docs/API_ENDPOINTS_COMPREHENSIVE.md) - expanded endpoint reference
6. [`docs/HMS_ProjectPlan.md`](docs/HMS_ProjectPlan.md) - phase-based development plan
7. [`docs/design_brief.md`](docs/design_brief.md) - canonical frontend design brief

## Quality Gates

- 80%+ frontend coverage gate; the latest recorded release-readiness evidence is 80.08% branch coverage in `docs/06-testing/full-hms-production-readiness-report-2026-05-22.md`
- Backend unit and integration tests include application service tests and Testcontainers-backed Spring Boot tests
- Playwright E2E suites live under `web/e2e`
- Double-booking prevention via transactional slot locking
- RBAC enforcement on all protected endpoints
- Rate limiting on public API routes
- Audit logging for admin operations
