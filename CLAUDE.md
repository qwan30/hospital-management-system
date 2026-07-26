# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **Enterprise Hospital Management System (HMS)** — a full-stack healthcare ERP supporting clinical workflows, patient self-service, pharmacy dispensing, billing, and administrative operations.

**Tech stack:** Java 17, Spring Boot 3.3, PostgreSQL 15 (with pgvector), Next.js 16 (App Router), React 19, Tailwind CSS 4, Playwright, Docker Compose.

The backend follows **Domain-Driven Design (DDD)** as a modular monolith. The frontend is a canonical Next.js App Router application under `frontend/`.

## Architecture

```
backend/
├── domain/          # JPA entities, enums, bounded-context exceptions, contracts
├── infrastructure/  # Spring Data repositories, PostgreSQL adapters, Gmail client
├── application/     # Use cases, auth services, scheduled jobs, seed data
├── controller/      # REST controllers, API envelopes, security filters (32 controllers)
└── start/           # Composition root, Flyway migrations, app config

frontend/
├── src/app/         # Next.js App Router — staff, admin, portal, public routes
├── src/components/  # Shared UI components — 19 UI components tested (140 tests)
├── src/lib/         # API client, auth helpers, utility modules
└── e2e/             # Playwright specs + page objects (31 spec files, 2,045 tests; 12 specs in the CI gate)
```

Dependency flow: `domain` ← `infrastructure` ← `application` ← `controller` ← `start`

## Running the System

### Prerequisites
- Java 17+, Node.js 22+, Docker Desktop
- Copy `.env.demo.example` to `.env` for the seeded demo, or `.env.example` for a clean install, then
  fill in `POSTGRES_PASSWORD`, `JWT_SECRET`, and `PATIENT_IDENTIFIER_SECRET` (no fallbacks — the app
  refuses to start without them)

### Quick Start (Docker Compose)
```bash
docker compose -f infra/docker-compose.yml up -d          # postgres + backend + frontend
docker compose -f infra/docker-compose.yml down -v        # tear down with volume cleanup
```
Observability stack: `docker compose -f infra/docker-compose.yml -f infra/docker-compose.observability.yml up -d` adds Prometheus, Grafana, Loki, and Tempo.

### Backend (Development)
```powershell
.\backend\run.ps1              # PowerShell script — auto-loads .env, starts Spring Boot
```
Or manual:
```bash
cd backend
mvn install -DskipTests
mvn spring-boot:run -f start/pom.xml
```
Backend listens on `http://localhost:8081`. Actuator health: `http://localhost:8081/actuator/health`.

### Frontend (Development)
```bash
cd frontend
npm install
npm run dev                    # http://localhost:3000
```

### Demo Accounts (seeded by `.env.demo.example`)

The flag alone is not enough: the seed fails closed, so all seven
`HMS_RELEASE_DEMO_SEED_PASSWORD_*` vars must be set or startup aborts. Passwords are per *role*, so
`doctor1`–`doctor4` all share the DOCTOR value. Full set in `ReleaseDemoSeedCatalog` (9 staff, 6 patients).

| Role | Email | Password |
|------|-------|----------|
| Doctor | `doctor1@hospital.vn` (also `doctor2`–`doctor4`) | `Doctor@1234` |
| Nurse | `nurse@hospital.vn` | `Nurse@1234` |
| Pharmacist | `pharmacist@hospital.vn` | `Pharma@1234` |
| Receptionist | `receptionist@hospital.vn` | `Reception@1234` |
| Accountant | `accountant@hospital.vn` | `Acc@1234` |
| Admin | `admin@hospital.vn` | `Admin@1234` |
| Patient (portal) | `patient@example.com` | `Patient@1234` |

## Running Tests

### Backend
```bash
cd backend
mvn test -pl application        # 122 service-layer tests (unit + edge case)
mvn test -pl infrastructure     # 30 repository @DataJpaTest tests
mvn test -pl controller         # 58 controller @WebMvcTest / standalone tests
mvn verify                       # ~183 full-stack integration tests (Testcontainers)
```
JaCoCo coverage thresholds enforced: instruction ≥ 40%, branch ≥ 30%.

### Frontend
```bash
cd frontend
npm run test:unit              # Vitest unit tests — 70 test files, 641 tests
npm run test:unit:coverage     # Coverage report (thresholds enforced: 40% stmts, 35% branch)
npm run test:e2e:ui            # @ui-tagged specs (21 specs) — local only, not run by CI
npm run test:e2e:integrated    # Backend-backed auth, claim, booking, queue checks
npm run test:e2e:ci            # CI gate — 12 of 31 specs: frontend route guards, API client
                               # contracts, security headers. Mock-driven; server-enforced
                               # authorization is covered by `mvn verify`, not by this suite.
npm run test:e2e:visual        # Visual baseline snapshots
npm run lint                   # ESLint
npm run build                  # Next.js production build
```

### ECC Agent Infrastructure
```bash
node .agents/tests/run-all.js  # ECC framework unit tests (local only — see note below)
```

## Key Project Metrics

- **118 REST API mappings** across 32 controllers
- **72 Next.js page files** covering staff, admin, patient portal, and public routes
- **20 Flyway migrations** building 35 database tables with 26 indexes
- **~393 backend tests** (122 service + 58 controller + 30 repository + ~183 integration)
- **641 frontend unit tests** across 70 test files (19 UI components, 12 lib, 6 hooks, 35+ pages)
- **2,045 Playwright E2E tests across 31 specs.** 930 run in the CI gate (12 specs, mock-driven). The other 1,115 — clinical workflows, error paths, network failure, rate limiting, RBAC enforcement — need a live backend and are run manually. Set `HMS_REQUIRE_BACKEND=true` so those specs fail loudly instead of self-skipping.
- **Coverage thresholds enforced**: backend instruction ≥ 40% / branch ≥ 30%; frontend statements ≥ 40% / branches ≥ 35%
- **Edge/bad case coverage**: null params, empty strings, extreme numerics, XSS, SQL injection, session expiry, double-submit, network failures, concurrent sessions

## CI/CD

GitHub Actions workflows in `.github/workflows/`:
- `ci.yml` — Build, test (Java + frontend), lint, Docker image build/push to GHCR
- `cd.yml` — Deploy to VPS via Docker Compose
- `rollback.yml` — Automated rollback
- `security-scan.yml` — Secret scanning and dependency audit

## Development Notes

- **Frontend canonical source**: `frontend/` is the active Next.js application.
- **Backend security**: Spring Security + JWT with 34 granular RBAC permissions via `@PreAuthorize`.
- **PHI protection**: Patient identifiers (CCCD/CMND) encrypted with AES-GCM, indexed by SHA-256 hash.
- **API envelope**: All responses use `{ success, data, message, error, pagination, timestamp }`.
- **Rate limiting**: Public endpoints limited via `HMS_PUBLIC_RATE_LIMIT_PER_MINUTE` (default 30/min).
- **Observability**: Structured logging, Prometheus metrics, OpenTelemetry tracing (configurable).
- **Package manager**: npm (frontend). Maven (backend).

## ECC Agent Infrastructure

The `.agents/` and `.claude/` directories contain ECC (Enterprise Claude Code) development tooling —
skills, hooks, commands, and rules used for AI-assisted development of this HMS project. These are
development utilities, not product features.

> **Not tracked in git.** They are present locally and fully functional, but gitignored: together they
> were 1,124 of 2,206 tracked files (54%), dwarfing `backend/` (356) and `frontend/` (323) combined and
> burying the actual product in any clone or diff. Untracking them left 966 tracked files that are all
> product, docs, or CI. If you need them on a fresh machine, reinstall the ECC tooling rather than
> expecting a clone to carry it.

| Directory | Purpose |
|-----------|---------|
| `.agents/skills/` | Reusable AI workflows (tdd, code-review, e2e-testing, security-review, etc.) |
| `.agents/scripts/` | CLI tools, hooks infrastructure, install automation |
| `.agents/tests/` | ECC framework unit tests |
| `.agents/rules/` | Always-follow development guidelines |

## Skills

Use the following skills when working on related files:

| File(s) | Skill |
|---------|-------|
| `README.md` | `/readme` |
| `.github/workflows/*.yml` | `/ci-workflow` |
| `frontend/src/**` (frontend) | `/react-review`, `/e2e` |
| `backend/**` (Java) | `/java-review`, `/springboot-tdd` |
| `docs/**` | `/update-docs` |

When spawning subagents, always pass conventions from the respective skill into the agent's prompt.

### AI Code Review (Gemini)
Every PR to `main`/`master` is automatically reviewed by a multi-pass Gemini AI bot:
- 5 specialized passes: CLAUDE.md compliance, bug scan, git-blame, PR history, code-comment
- Verification pass with stronger model filters issues to confidence ≥ 80
- Reviews posted in Vietnamese with file links and fix suggestions
- Workflow: `.github/workflows/gemini-review.yml`
- Script: `.github/scripts/review_bot.py`

### SonarCloud
Continuous code quality analysis integrated into CI:
- Dashboard: https://sonarcloud.io/project/overview?id=qwan30_hospital-management-system
- Scans Java (JaCoCo coverage) + TypeScript (lcov coverage)
- Config: `sonar-project.properties`

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **hospital-management-system** (8029 symbols, 16005 relationships, 300 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "main"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/hospital-management-system/context` | Codebase overview, check index freshness |
| `gitnexus://repo/hospital-management-system/clusters` | All functional areas |
| `gitnexus://repo/hospital-management-system/processes` | All execution flows |
| `gitnexus://repo/hospital-management-system/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
