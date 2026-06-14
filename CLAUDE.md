# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **Enterprise Hospital Management System (HMS)** — a full-stack healthcare ERP supporting clinical workflows, patient self-service, pharmacy dispensing, billing, and administrative operations.

**Tech stack:** Java 17, Spring Boot 3.3, PostgreSQL 15 (with pgvector), Next.js 16 (App Router), React 19, Tailwind CSS 4, Playwright, Docker Compose.

The backend follows **Domain-Driven Design (DDD)** as a modular monolith. The frontend is a canonical Next.js App Router application under `web/`. The `frontend/` directory is design-reference prototype material only — not the active app.

## Architecture

```
backend/
├── domain/          # JPA entities, enums, bounded-context exceptions, contracts
├── infrastructure/  # Spring Data repositories, PostgreSQL adapters, Gmail client
├── application/     # Use cases, auth services, scheduled jobs, seed data
├── controller/      # REST controllers, API envelopes, security filters (40 controllers)
└── start/           # Composition root, Flyway migrations, app config

web/
├── src/app/         # Next.js App Router — staff, admin, portal, public routes
├── src/components/  # Shared UI components (hc-icon, data-panel, sidebar, etc.)
├── src/lib/         # API client, auth helpers, utility modules
└── e2e/             # Playwright specs + page objects (25 spec files, 183+ scenarios)
```

Dependency flow: `domain` ← `infrastructure` ← `application` ← `controller` ← `start`

## Running the System

### Prerequisites
- Java 17+, Node.js 22+, Docker Desktop
- Copy `.env.example` to `.env` and fill in secrets

### Quick Start (Docker Compose)
```bash
docker compose up -d          # postgres + backend + frontend
docker compose down -v        # tear down with volume cleanup
```
Observability stack: `docker compose -f docker-compose.yml -f docker-compose.observability.yml up -d` adds Prometheus, Grafana, Loki, and Tempo.

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
cd web
npm install
npm run dev                    # http://localhost:3000
```

### Demo Accounts (seeded when HMS_RELEASE_DEMO_SEED_ENABLED=true)
| Role | Email | Password |
|------|-------|----------|
| Doctor | `doctor1@hospital.vn` | `Doctor@1234` |
| Pharmacist | `pharmacist@hospital.vn` | `Pharma@1234` |
| Receptionist | `receptionist@hospital.vn` | `Reception@1234` |
| Admin | `admin@hospital.vn` | `Admin@1234` |

## Running Tests

### Backend
```bash
cd backend
mvn verify                     # 148 integration tests (Spring Boot + Testcontainers)
```

### Frontend
```bash
cd web
npm run test:unit              # Vitest unit tests (80.48% branch coverage)
npm run test:e2e:ui            # Playwright UI route smoke & accessibility (323+ scenarios)
npm run test:e2e:integrated    # Backend-backed auth, claim, booking, queue checks
npm run test:e2e:ci            # Full CI suite — RBAC, API client, operations, security
npm run test:e2e:visual        # Visual baseline snapshots
npm run lint                   # ESLint
npm run build                  # Next.js production build
```

### ECC Agent Infrastructure
```bash
node .agents/tests/run-all.js  # ECC framework unit tests (hooks, lib, scripts)
```

## Key Project Metrics

- **118 REST API mappings** across 40 controllers
- **72 Next.js page files** covering staff, admin, patient portal, and public routes
- **20 Flyway migrations** building 35 database tables with 26 indexes
- **148 backend integration tests** + **80.48% frontend branch coverage**
- **183+ Playwright E2E scenarios** covering RBAC, clinical workflows, and click-path safety

## CI/CD

GitHub Actions workflows in `.github/workflows/`:
- `ci.yml` — Build, test (Java + frontend), lint, Docker image build/push to GHCR
- `cd.yml` — Deploy to VPS via Docker Compose
- `rollback.yml` — Automated rollback
- `security-scan.yml` — Secret scanning and dependency audit

## Development Notes

- **Frontend canonical source**: `web/` is the active app. `frontend/` is archived design-reference material only.
- **Backend security**: Spring Security + JWT with 36 granular RBAC permissions via `@PreAuthorize`.
- **PHI protection**: Patient identifiers (CCCD/CMND) encrypted with AES-GCM, indexed by SHA-256 hash.
- **API envelope**: All responses use `{ success, data, message, error, pagination, timestamp }`.
- **Rate limiting**: Public endpoints limited via `HMS_PUBLIC_RATE_LIMIT_PER_MINUTE` (default 30/min).
- **Observability**: Structured logging, Prometheus metrics, OpenTelemetry tracing (configurable).
- **Package manager**: npm (frontend). Maven (backend).

## ECC Agent Infrastructure

The `.agents/` directory contains ECC (Enterprise Claude Code) development tooling — skills, hooks, commands, and rules used for AI-assisted development of this HMS project. These are development utilities, not product features.

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
| `web/src/**` (frontend) | `/react-review`, `/e2e` |
| `backend/**` (Java) | `/java-review`, `/springboot-tdd` |
| `docs/**` | `/update-docs` |

When spawning subagents, always pass conventions from the respective skill into the agent's prompt.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **hospital-management-system** (3251 symbols, 7433 relationships, 252 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/hospital-management-system/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/hospital-management-system/context` | Codebase overview, check index freshness |
| `gitnexus://repo/hospital-management-system/clusters` | All functional areas |
| `gitnexus://repo/hospital-management-system/processes` | All execution flows |
| `gitnexus://repo/hospital-management-system/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

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
