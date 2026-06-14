# Developer Onboarding Guide

Welcome to the Hospital Management System (HMS). This guide gets you from zero to a running development environment and explains the project's architecture, conventions, and workflows.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Java | 17+ | Temurin JDK recommended |
| Node.js | 22+ | Use nvm-windows or fnm to manage versions |
| Docker Desktop | Latest | Required for local PostgreSQL and full-stack testing |
| Git | Any recent | |
| IDE | VS Code or IntelliJ IDEA | IntelliJ Ultimate recommended for Spring Boot support |

Optional but helpful: Maven 3.9+ (the project bundles a wrapper via `start/mvnw`).

---

## Setup Steps

### 1. Clone the repository

```bash
git clone https://github.com/tranhquan099-commits/hospital-management-system.git
cd hospital-management-system
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set at minimum these secrets:

| Variable | Description |
|----------|-------------|
| `POSTGRES_PASSWORD` | Database password (any secure value) |
| `JWT_SECRET` | JWT signing key (32+ random characters) |
| `PATIENT_IDENTIFIER_SECRET` | PHI encryption key (32+ random characters) |

For demo data, set `HMS_RELEASE_DEMO_SEED_ENABLED=true`.

### 3. Start the database

```bash
docker compose up -d postgres
```

This starts PostgreSQL 16 with the pgvector extension on port 5432. Flyway migrations run automatically when the backend starts.

### 4. Start the backend

```bash
cd backend
.\run.ps1
```

Or, without the launcher script:

```bash
mvn spring-boot:run -f start\pom.xml
```

The launcher script loads `.env` variables automatically. The backend starts on **http://localhost:8081** with Spring Boot DevTools active (hot reload on class changes).

### 5. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on **http://localhost:3000** with Next.js Fast Refresh active.

### 6. Verify everything is running

```bash
# Backend health check
curl http://localhost:8081/actuator/health

# Frontend
open http://localhost:3000

# API
curl http://localhost:8081/api/v1/public/health
```

---

## Key Directories

```
hospital-management-system/
├── backend/                          # Spring Boot multi-module Maven project
│   ├── domain/                       #   JPA entities, enums, value objects, DTOs
│   ├── application/                  #   Business services, use cases, orchestration
│   ├── controller/                   #   REST controllers, security config, request validation
│   ├── infrastructure/               #   JPA repositories, external adapters, PHI encryption
│   ├── start/                        #   Composition root, Spring Boot entry, Flyway migrations
│   └── run.ps1                       #   Dev launcher (loads .env, starts Spring Boot)
├── frontend/                              # Next.js 16 frontend (canonical source — not frontend/)
│   ├── src/app/                      #   Next.js App Router pages
│   │   ├── (public)/                 #     Landing, about, departments, doctors, booking
│   │   ├── portal/                   #     Patient dashboard and appointment management
│   │   ├── staff/                    #     Queue management, operations
│   │   ├── admin/                    #     User, room, department, inventory, audit, analytics
│   │   ├── auth/                     #     Login, registration
│   │   └── api/                      #     BFF API route proxies
│   ├── src/components/               #   Shared UI components (shadcn/ui, Tailwind CSS)
│   ├── src/lib/                      #   Utilities, API client, TypeScript types
│   ├── e2e/                          #   Playwright E2E test suites
│   └── vitest.config.ts              #   Vitest unit test configuration
├── docs/                             # Project documentation (architecture, API, guides)
├── infra/                            # Infrastructure config (observability stack)
├── docker-compose.yml                # Core services (postgres, backend, frontend)
├── docker-compose.observability.yml  # Optional: Prometheus, Grafana, Loki, Tempo
└── .github/workflows/                # CI/CD pipelines
```

---

## Development Workflow

### 1. Pick a feature or bug

Work items come from the project backlog. Understand the requirements and check existing documentation in `docs/` before implementing.

### 2. Write or update specifications

Before writing code, update the relevant specifications in `docs/`. This includes API contracts, architecture decisions, and user-facing behavior.

### 3. Test-driven development (TDD)

This project enforces TDD for all changes:

1. **RED** -- Write a failing test that describes the expected behavior
2. **GREEN** -- Write the minimal implementation to make the test pass
3. **REFACTOR** -- Clean up while keeping tests green
4. Verify 80%+ test coverage (JaCoCo for backend, Vitest for frontend)

### 4. Code review

Every change must be reviewed before merging:

- Run the **code-reviewer** agent for automated review, or request a manual review
- Backend reviews focus on: Java/Spring Boot patterns, JPA correctness, security, PHI compliance
- Frontend reviews focus on: React/Next.js conventions, TypeScript types, accessibility
- Security reviews are mandatory for auth, PHI, payment, or user-data changes

### 5. Run the full test suite

```bash
# Backend
cd backend && mvn verify

# Frontend
cd frontend && npm run lint && npm run test:unit && npm run test:e2e:ci

# Full stack
docker compose up -d && docker compose run --rm backend-test
```

All tests must pass before opening a pull request.

### 6. Commit using conventional commits

```
feat: add appointment reminder email
fix: resolve NPE in patient search
refactor: extract payment validation service
test: add coverage for booking wizard
chore: update Flyway migration checksum
```

---

## Key Concepts

### Domain-Driven Design (DDD) Modular Monolith

The backend is a DDD modular monolith with **strict dependency rules** between Maven modules:

```
controller --> application --> domain
     \                        ^
      ----> infrastructure ---/
```

- **domain/** -- Core business logic (entities, value objects, enums, domain events). Zero external dependencies.
- **application/** -- Use cases and service orchestration. Depends on domain and infrastructure interfaces.
- **controller/** -- REST endpoints, security configuration, request/response mapping.
- **infrastructure/** -- JPA persistence, external API clients, email integration, PHI encryption.
- **start/** -- Spring Boot application class, dependency injection wiring, Flyway migrations.

No module may depend on a module at a higher layer. Infrastructure depends on domain interfaces, not concrete implementations.

### Role-Based Access Control (RBAC)

34 fine-grained permissions defined in `RbacAuthorizationService` across 7 roles:

| Role | Scope |
|------|-------|
| `ADMIN` | Full system access: users, departments, rooms, content, audit logs, stats |
| `DOCTOR` | Appointments, medical records, prescriptions, lab results, follow-ups |
| `NURSE` | Queue management, appointments, vital signs |
| `RECEPTIONIST` | Queue check-in, appointment management |
| `PHARMACIST` | Prescription reads, inventory management |
| `ACCOUNTANT` | Invoicing, pricing, revenue reports, audit log reads |
| `PATIENT` | Own portal access, own appointment booking |

Each REST endpoint checks permissions via `@PreAuthorize("@rbac.hasPermission(authentication, 'PERMISSION_NAME')")`.

### PHI Encryption

Patient Identifiable Information (PHI) -- name, phone, email, address -- is encrypted at the application level **before storage** using `PatientIdentifierProtector`. The encryption uses AES-256-GCM with a configurable secret (`PATIENT_IDENTIFIER_SECRET`). Data is decrypted only when displayed to authorized users.

**Always use `PatientIdentifierProtector`** when handling PHI fields. Never store raw patient identifiers.

### Standard API Response Envelope

All API responses follow a consistent Java record (`ApiResponse<T>`):

```json
{
  "success": true,
  "data": { ... },
  "message": "Request completed successfully",
  "error": null,
  "pagination": { "page": 1, "limit": 20, "total": 100 },
  "timestamp": "2026-06-14T12:00:00Z"
}
```

On error:

```json
{
  "success": false,
  "data": null,
  "message": "Human-readable error description",
  "error": { "code": "VALIDATION_ERROR", "message": "..." },
  "pagination": null,
  "timestamp": "2026-06-14T12:00:00Z"
}
```

### Frontend Canonical Source

The canonical frontend source is **`frontend/`**, not `frontend/`. The `frontend/` directory contains deprecated prototype files and should not be used for development.

---

## Testing Commands

```bash
# ── Backend (Maven) ──
cd backend
mvn test                          # Unit tests only
mvn verify                        # Unit + integration tests with JaCoCo coverage
mvn verify -DskipTests            # Build without tests
mvn test -pl domain               # Test a specific module

# ── Frontend (Vitest + Playwright) ──
cd frontend
npm run lint                      # ESLint
npm run test:unit                 # Vitest unit tests
npm run test:unit:coverage        # Unit tests with coverage report
npm run test:e2e:ci               # Playwright E2E (CI suite)
npm run test:e2e:ui               # UI-focused E2E tests
npm run test:e2e:headed           # E2E with visible browser

# ── Full stack ──
docker compose up -d              # Start all services
docker compose down               # Stop all services
docker compose logs -f backend    # Watch backend logs
docker compose exec postgres psql -U hospital_user -d hospital_db  # Database console
```

---

## Tools

| Tool | Purpose | Usage |
|------|---------|-------|
| **GitNexus** | Code intelligence (call graphs, impact analysis, symbol search) | `gitnexus_query`, `gitnexus_impact`, `gitnexus_context` -- always run impact analysis before editing a symbol |
| **CodeGraph** | Code exploration over an indexed knowledge graph | `codegraph_explore` for architecture questions, `codegraph_search` for symbol lookup |
| **Playwright** | End-to-end browser tests | `npm run test:e2e:*` in `frontend/` |
| **Vitest** | Frontend unit tests | `npm run test:unit:*` in `frontend/` |
| **JaCoCo** | Backend test coverage | Integrated into `mvn verify` |

---

## Useful Tips

- **Backend hot reload**: Spring Boot DevTools is active in the `dev` profile. Changes to compiled classes trigger automatic restart.
- **Frontend hot reload**: Next.js dev server supports Fast Refresh out of the box.
- **Database schema**: Managed by Flyway migrations in `backend/infrastructure/src/main/resources/db/migration/`.
- **Demo data**: Set `HMS_RELEASE_DEMO_SEED_ENABLED=true` in `.env` to seed sample patients, appointments, and inventory items.
- **Observability**: Start `docker compose -f docker-compose.yml -f docker-compose.observability.yml up -d` to enable Prometheus, Grafana, Loki, and Tempo.
- **Debugging**: Backend exposes Actuator endpoints under `/actuator/` for health, metrics, and environment inspection.
- **Database console**: `docker compose exec postgres psql -U hospital_user -d hospital_db`

---

## Getting Help

| Resource | Location |
|----------|----------|
| Project documentation | `docs/` directory |
| API endpoints | `docs/API_ENDPOINTS_COMPREHENSIVE.md` |
| Architecture diagrams | `docs/HMS_ArchitectureDiagrams.html` |
| Deployment guide | `docs/HMS_DeploymentGuide.md` |
| User manual | `docs/HMS_UserManual.md` |
| CI/CD pipelines | `.github/workflows/` |
| Docker configuration | `docker-compose.yml`, `docker-compose.observability.yml` |
| Handover document | `docs/12-handover/handover-document.md` |
| Known issues | `docs/12-handover/known-issues.md` |
