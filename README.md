# Hospital Management System

A comprehensive hospital management platform with appointment scheduling, clinical workflow automation, administration, finance, inventory, and patient portal workflows.

## Stack

- **Backend**: Java 17 / Spring Boot 3.3, multi-module Maven project (`domain`, `infrastructure`, `application`, `controller`, `start`)
- **Database**: PostgreSQL 15, managed by Flyway (`V1` through `V16`; includes removal of historical assistant tables and current clinical/RBAC schema catch-up)
- **Email**: Gmail API for transactional emails (confirmation, prescriptions, reminders)
- **API Docs**: SpringDoc OpenAPI, with roughly 110 repository controller method mappings plus SpringDoc/Actuator support endpoints
- **Frontend**: Next.js 16 / React 19 / TypeScript in `web/`; static design prototypes remain in `frontend/`

## Current Status

The backend API is fully functional with roughly 110 mapped controller methods covering:
- Authentication (Staff JWT + Patient portal)
- Smart Reservation System (booking and clinical triage intake)
- Clinical Workflow (medical records, prescriptions, PDF generation)
- Administration (users, departments, rooms, schedules, content)
- Finance (invoices, payments, revenue reports)
- Inventory Management (items, lots, movements)
- Patient Portal (profile, appointments, messages, lab results)

The `web/` app contains the canonical Next.js route tree for public, staff, admin, and patient portal screens. The `frontend/` directory is retained as migrated design-reference HTML/PNG prototypes, not as the runnable frontend.

## Local Setup

### Prerequisites
- Java 17+ (tested with Java 21)
- Maven 3.9+
- Docker Desktop (for PostgreSQL and Testcontainers-backed integration tests)
- Node.js 20+

### Quick Start

```bash
# 1. Start PostgreSQL
docker compose up -d postgres

# 2. Build all backend modules
cd backend
mvn install -DskipTests

# 3. Run the backend (from the backend directory)
mvn spring-boot:run -pl start -DskipTests

# 4. Open Swagger UI
# http://localhost:8080/swagger-ui/index.html

# 5. Health check
# http://localhost:8080/actuator/health

# 6. Run frontend checks/build (from the web directory)
cd ../web
npm run lint
npm run build
npm run dev
```

### Demo Users (seeded on first startup)

| Email | Password | Role |
|:------|:---------|:-----|
| `doctor1@hospital.vn` | `Doctor@1234` | DOCTOR |
| `doctor2@hospital.vn` | `Doctor@1234` | DOCTOR |
| `nurse@hospital.vn` | `Nurse@1234` | NURSE |
| `admin@hospital.vn` | `Admin@1234` | ADMIN |
| `accountant@hospital.vn` | `Acc@1234` | ACCOUNTANT |

See [demo accounts and seed data](docs/reference/demo-accounts-and-seed-data.md) for the complete current seed-data reference.

### Environment Variables (optional)

External integrations are disabled by default and degrade gracefully:

| Variable | Default | Purpose |
|:---------|:--------|:--------|
| `GMAIL_ENABLED` | `false` | Enable email notifications |
| `JWT_SECRET` | dev default | JWT signing secret |

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
docker-compose.yml   # PostgreSQL + backend services
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

- 80%+ test coverage target; this is a target, not a current measured coverage claim unless a fresh report is generated
- Backend unit and integration tests include application service tests and Testcontainers-backed Spring Boot tests
- Playwright E2E suites live under `web/e2e`
- Double-booking prevention via transactional slot locking
- RBAC enforcement on all protected endpoints
- Rate limiting on public API routes
- Audit logging for admin operations
