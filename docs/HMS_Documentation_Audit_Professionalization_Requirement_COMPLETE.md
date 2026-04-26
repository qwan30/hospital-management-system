# Hospital Management System Documentation Audit and Professionalization Requirement

**Document type:** Requirement Specification
**Project:** Hospital Management System (HMS)
**Baseline date:** April 26, 2026
**Scope type:** Documentation-only
**Primary audience:** BA, SA, PM/PO, Tech Lead, Developer, QA, Reviewer
**Status:** Completed
**Completion date:** April 26, 2026

---

## 1. Executive Summary

This requirement defines a documentation-only audit and professionalization pass for the Hospital Management System repository.

The purpose is to make the documentation accurate, consistent, professional, and aligned with the current repository state. This requirement does **not** authorize application code changes, API changes, database schema changes, frontend route changes, Docker Compose behavior changes, CI/CD implementation, or runtime behavior changes.

The documentation should clearly explain:

- what the system currently implements
- what is planned but not implemented
- which folder is the canonical frontend
- which endpoint families are active or removed
- which files are the source of truth
- which test suites and deployment steps are actually available
- how the documentation should be maintained going forward

This requirement also preserves future productionization ideas, but only as an **out-of-scope future backlog**, not as work to be implemented during this documentation pass.

### Completion Summary

| Phase | Status | Completion evidence |
|---|---|---|
| Inventory and guardrails | Completed | `docs/README.md`, `docs/audits/documentation-review-and-improvement-plan.md` |
| P0 correctness fixes | Completed | migration inventory, removed endpoints, setup wording, and coverage target wording updated |
| P1 missing documentation | Completed | `docs/reference/frontend-route-inventory.md`, `docs/reference/role-screen-api-matrix.md`, `docs/reference/demo-accounts-and-seed-data.md`, `docs/reference/removed-endpoints.md` |
| P1 alignment updates | Completed | API, PRD, TDD, TestPlan, Deployment, Integration, UserManual, and design docs updated |
| P2 professionalization | Completed | documentation map, cross-links, maintenance rules, metrics reference, and archive area added |
| Phase 2 long-term navigation | Completed | `docs/00-overview/` through `docs/10-portfolio/` category folders added |
| Agent workflow governance | Completed | `docs/reference/agent-workflow-governance.md` and `docs/09-agent-workflows/README.md` added |
| Verification | Completed | `docs/audits/verification-checklist.md` and checked section 13 below |

Phase completion checklist:

- [x] Inventory and guardrails completed
- [x] P0 correctness fixes completed
- [x] P1 missing documentation completed
- [x] P1 alignment updates completed
- [x] P2 professionalization completed
- [x] Phase 2 long-term navigation completed
- [x] Agent workflow governance completed
- [x] Verification completed

---

## 2. Objective

Review the current HMS documentation set against the real repository structure and implementation. Identify stale, duplicated, misleading, incomplete, or unprofessional documentation, then update the documentation so that it becomes a trustworthy baseline for future development, testing, deployment, and portfolio presentation.

The output of this work should be a clean, consistent, and reviewable documentation set that accurately represents the system as it exists now.

---

## 3. Scope

### 3.1 In Scope

This requirement includes documentation-only work such as:

- auditing existing Markdown documentation
- correcting stale or misleading claims
- clarifying the source of truth for product, requirement, API, architecture, testing, and deployment documentation
- documenting the current repository structure
- documenting the difference between `web/` and `frontend/`
- documenting removed AI/internal-assistant endpoint families as historical or removed only
- aligning API documentation with actual controller mappings
- aligning frontend documentation with actual `web/src/app` routes
- aligning test documentation with actual backend and Playwright test locations
- aligning deployment documentation with actual Docker Compose and local setup behavior
- adding missing documentation maps, matrices, and inventories
- improving cross-links and navigation between documents
- moving obsolete or duplicate documentation into an archive area
- documenting current-vs-planned status clearly
- documenting future productionization work as out of scope

### 3.2 Out of Scope

The following are explicitly out of scope for this documentation pass:

- backend application code changes
- frontend application code changes
- API behavior changes
- API contract changes
- database schema changes
- Flyway migration changes
- frontend route changes
- runtime behavior changes
- Docker Compose behavior changes
- CI/CD implementation
- seed data generation
- performance benchmarking execution
- RBAC implementation
- frontend API integration implementation
- queue workflow implementation
- billing/inventory/audit implementation
- production deployment implementation

These items may be documented as future work, but they must not be implemented as part of this requirement.

---

## 4. Current Implementation Baseline

The documentation must consistently describe the current system baseline as follows.

### 4.1 Backend

- Backend source lives under `backend/`.
- Backend is a Java 17 / Spring Boot 3.3.5 multi-module Maven reactor.
- Backend modules are:
  - `domain`
  - `infrastructure`
  - `application`
  - `controller`
  - `start`
- Active API base path is `/api/v1`.
- Backend runtime starts from the `backend/start` module.
- Database schema is managed by Flyway migrations.
- JPA schema validation is used to validate migration alignment.
- Historical AI/internal-assistant features have been removed from the active product.

### 4.2 Frontend

- The runnable frontend is the Next.js / React / TypeScript app under `web/`.
- The `frontend/` directory is retained as design-reference prototype material only.
- Documentation must not describe `frontend/` as the canonical runnable frontend.
- Any Docker or setup notes must direct local frontend startup to `web/`, unless a future implementation explicitly changes that.

### 4.3 API

- Active API documentation must be verified against `backend/controller/src/main/java`.
- Removed AI/internal-assistant endpoint families must not be documented as active.
- API documentation must use `/api/v1` consistently.

### 4.4 Testing

- Backend test documentation must describe actual test locations and actual scope.
- Frontend test documentation must describe actual Playwright suites under `web/e2e`.
- Documentation must distinguish:
  - implemented tests
  - coverage targets
  - future planned tests
  - measured coverage reports, if available

### 4.5 Deployment

- Current Docker Compose behavior must be documented as it exists now.
- If Docker Compose does not provide a runnable production frontend service, documentation must state that clearly.
- Setup commands must use the correct working directories.

---

## 5. Source Documents To Review

The documentation pass should review at least the following files.

| File | Review Purpose |
|---|---|
| `README.md` | Repository overview, setup, stack, source-of-truth links, quality gates |
| `API_CONTRACT.md` | High-level API contract and removed endpoint families |
| `docs/API_ENDPOINTS_COMPREHENSIVE.md` | Expanded endpoint family and authorization reference |
| `docs/HMS_PRD.md` | Product requirements and screen inventory |
| `docs/HMS_ProjectPlan.md` | Delivery phases, frontend status, known risks |
| `docs/HMS_TDD.md` | Technical design, module topology, integration notes |
| `docs/HMS_TestPlan.md` | Backend and frontend test plan |
| `docs/HMS_DeploymentGuide.md` | Local deployment and operations setup |
| `docs/HMS_DBMigrationPlan.md` | Flyway migration inventory and database strategy |
| `docs/HMS_IntegrationGuide.md` | External integration and removed integration notes |
| `docs/design_brief.md` | Canonical frontend design brief |
| `docs/DESIGN.md` | Visual design system guidance |
| `docs/HMS_UserManual.md` | User-facing guide, if retained |
| `docs/HMS_UseCaseDiagram.md` | Use case documentation, if retained |
| `docs/HMS_UseCaseDiagram.puml` | Use case diagram source, if retained |

If additional Markdown files are found during the documentation inventory, they should be classified as current, duplicate, draft, generated, or obsolete.

---

## 6. Repository Sources Of Truth

When documentation conflicts with the repository, the repository source wins.

| Area | Repository Source Of Truth | What To Verify |
|---|---|---|
| Backend modules | `backend/pom.xml`, `backend/*/pom.xml` | Maven module names, dependency direction, Java/Spring versions |
| Backend endpoints | `backend/controller/src/main/java` | Controller base paths, HTTP methods, removed endpoint absence |
| API envelopes and errors | `backend/controller/src/main/java/com/hospital/shared/api` | Success and error response format |
| Security behavior | `backend/controller/src/main/java/com/hospital/api/config` and security tests | RBAC, public route rate limiting, JWT/cookie behavior |
| Database migrations | `backend/start/src/main/resources/db/migration` | Migration count, migration names, removed assistant cleanup |
| Backend tests | `backend/application/src/test`, `backend/start/src/test` | Covered workflows, integration tests, module boundary tests |
| Frontend routes | `web/src/app` | Public, staff, admin, and patient portal route inventory |
| Frontend scripts | `web/package.json`, `web/playwright.config.ts` | Lint, build, and Playwright commands |
| E2E suites | `web/e2e` | Route audit, auth, RBAC, responsive, visual, workflow coverage |
| Local services | `docker-compose.yml`, `.env.example` | PostgreSQL/backend services, absent or inactive frontend Docker service |

---

## 7. Documentation Governance Rules

### Rule 1: One Source Of Truth Per Topic

There must be one authoritative documentation location for each major topic.

| Topic | Source Of Truth |
|---|---|
| Repository overview | `README.md` |
| Documentation map | `docs/README.md` |
| Product scope | `docs/HMS_PRD.md`, indexed by `docs/01-product/README.md` |
| System requirements | `docs/HMS_SRS.md`, indexed by `docs/02-requirements/README.md` |
| Technical design | `docs/HMS_TDD.md`, indexed by `docs/03-architecture/README.md` |
| API contract | `API_CONTRACT.md` and/or `docs/API_ENDPOINTS_COMPREHENSIVE.md`, with one clearly marked as primary |
| Database migration plan | `docs/HMS_DBMigrationPlan.md` |
| Deployment | `docs/HMS_DeploymentGuide.md` |
| Testing | `docs/HMS_TestPlan.md` |
| Design guidance | `docs/design_brief.md` and/or `docs/DESIGN.md`, with role separation clarified |
| Engineering metrics | `docs/reference/engineering-metrics.md`, indexed by `docs/10-portfolio/README.md` |

If two documents overlap, one must be marked as primary and the other must link to it.

### Rule 2: Current, Planned, Removed, and Reference-Only Must Be Explicit

Every feature or route family should be labeled using a consistent status model:

| Status | Meaning |
|---|---|
| `Implemented` | Exists in the current repository and can be verified from code/routes/tests/docs |
| `Partially implemented` | Exists but is incomplete, limited, or not fully integrated |
| `Planned` | Future work, not active implementation |
| `Reference-only` | Design/prototype/reference material, not active runtime source |
| `Removed` | Historical behavior that must not be documented as active |
| `Deprecated` | Still present but should not be used as the current baseline |

### Rule 3: Removed Features Must Not Appear As Active

The following endpoint families must appear only in removed, historical, or deprecated sections:

- `/api/v1/ai/analyze-symptoms`
- `/api/v1/internal-assistant/**`
- `/api/v1/admin/knowledge-documents/**`
- `/api/v1/admin/monitoring/internal-assistant`

They must not appear in active API summaries, active UI requirements, active design requirements, or active deployment instructions.

### Rule 4: The Canonical Frontend Must Be Clear

Documentation must consistently state:

```text
web/ is the canonical runnable Next.js frontend.
frontend/ is retained as design-reference prototype material only.
```

If the `frontend/` folder remains in the repository, the root `README.md` and relevant docs must explain why it exists.

### Rule 5: Generated And Temporary Artifacts Must Be Documented Or Ignored

The documentation pass should classify folders such as:

- `node_modules/`
- `test-results/`
- `.codex-run/`
- `_bmad-output/`
- `history/`

as either:

- ignored/generated
- intentionally retained
- historical/reference
- requiring cleanup in a future repository maintenance task

No deletion is required under this documentation-only pass unless separately approved.

### Rule 6: Future Implementation Items Must Stay Out Of Documentation Scope

Items such as Docker frontend implementation, CI/CD implementation, frontend API integration, seed generation, and RBAC enforcement may be documented as future backlog items, but must not be treated as part of this documentation pass.

---

## 8. Review Workflow

The documentation review should follow this process.

1. Build a complete inventory of current documentation files.
2. Classify each document as:
   - current
   - duplicate
   - stale
   - reference-only
   - obsolete
   - generated
   - archive candidate
3. Extract explicit claims from each document:
   - stack versions
   - backend module layout
   - endpoint families
   - removed endpoint families
   - frontend route families
   - deployment commands
   - environment variables
   - test commands
   - test coverage statements
   - feature status
   - roadmap status
4. Compare every claim against repository sources of truth.
5. Classify each issue as:
   - correctness issue
   - missing coverage
   - duplication
   - stale roadmap text
   - test documentation gap
   - setup clarity issue
   - design clarity issue
   - source-of-truth conflict
6. Prioritize each issue as P0, P1, or P2.
7. Update affected documentation only after the mismatch is confirmed.
8. Re-run the verification checklist before closing the documentation pass.
9. Record final review notes listing updated, verified, deferred, and accepted-risk items.

---

## 9. Audit Matrix

| Audit Area | Docs To Compare | Repository Verification | Expected Outcome |
|---|---|---|---|
| Stack and module topology | `README.md`, `docs/HMS_TDD.md`, `docs/HMS_DeploymentGuide.md` | `backend/pom.xml`, module POMs | All docs name the same five backend modules and Java/Spring/Maven baseline |
| Active endpoint families | `API_CONTRACT.md`, `docs/API_ENDPOINTS_COMPREHENSIVE.md`, `docs/HMS_TDD.md` | Controller mappings under `backend/controller/src/main/java` | Active paths match controllers and use `/api/v1` consistently |
| Removed endpoint families | All API, integration, deployment, and design docs | Controller search under `backend/controller/src/main/java` | Removed AI/internal-assistant routes appear only as removed historical items |
| Product and screen inventory | `docs/HMS_PRD.md`, `docs/HMS_ProjectPlan.md`, `docs/design_brief.md` | `web/src/app` page and layout files | Product docs reflect implemented route families without presenting prototypes as runnable screens |
| Frontend canonical location | `README.md`, `docs/HMS_PRD.md`, `docs/HMS_TDD.md`, `docs/HMS_TestPlan.md`, `docs/HMS_DeploymentGuide.md` | `web/package.json`, `web/src/app`, `frontend/` | `web/` is documented as canonical; `frontend/` is documented as design-reference only |
| Frontend route coverage | `docs/HMS_TestPlan.md`, `docs/design_brief.md` | `web/e2e/specs`, `web/e2e/helpers/routes.ts` | Route-audit and workflow coverage statements match current Playwright suites |
| Backend test coverage | `README.md`, `docs/HMS_TestPlan.md`, `docs/HMS_TDD.md` | Tests under `backend/application/src/test` and `backend/start/src/test` | Docs distinguish coverage target from measured coverage and list real test locations |
| Database migration state | `README.md`, `docs/HMS_TDD.md`, `docs/HMS_DBMigrationPlan.md`, `docs/HMS_DeploymentGuide.md` | `backend/start/src/main/resources/db/migration` | Docs report current migration inventory accurately |
| Deployment setup | `README.md`, `docs/HMS_DeploymentGuide.md`, `.env.example` | `docker-compose.yml`, backend app config, `web/package.json` | Setup commands and Docker notes match runnable local services |
| Design guidance | `docs/design_brief.md`, `docs/DESIGN.md`, `web/src/app` | Implemented screens and shared UI conventions | Design docs distinguish required UX direction from prototype references and obsolete UI ideas |
| Agent workflow governance | `AGENTS.md`, `CLAUDE.md`, `.instructions.md`, agent folders | Root repo structure | Agent-related files are documented as development workflow assets, not product features |

---

## 10. Prioritized Documentation Backlog

### 10.1 P0 — Correct Misleading Or Incorrect Documentation

P0 completion checklist:

- [x] P0-01 Correct Flyway migration inventory
- [x] P0-02 Clarify `web/` vs `frontend/`
- [x] P0-03 Keep removed AI/internal-assistant features out of active docs
- [x] P0-04 Fix quick-start and setup command accuracy
- [x] P0-05 Clarify current coverage versus target coverage

P0 issues must be fixed first because they can mislead a developer, reviewer, or interviewer.

#### P0-01: Correct Flyway Migration Inventory

If documentation says the project has 15 migrations but the repository contains `V1` through `V16`, update all affected docs.

Affected docs may include:

- `README.md`
- `docs/HMS_TDD.md`
- `docs/HMS_DBMigrationPlan.md`
- `docs/HMS_DeploymentGuide.md`

Acceptance criteria:

- all migration-count claims match the repository
- migration names and removed-assistant cleanup notes are accurate
- no stale migration count remains in active docs

#### P0-02: Clarify `web/` vs `frontend/`

Documentation must clearly state:

- `web/` is the canonical runnable frontend
- `frontend/` is design-reference prototype material only
- setup commands for the frontend start from `web/`
- any Docker wording must not direct users to `frontend/` as the active app

Acceptance criteria:

- root `README.md` explains both folders
- deployment docs use `web/` for frontend local startup
- product/design docs do not present `frontend/` prototypes as runnable screens

#### P0-03: Keep Removed AI/Internal-Assistant Features Out Of Active Docs

Search active docs for these route families:

- `/api/v1/ai/analyze-symptoms`
- `/api/v1/internal-assistant/**`
- `/api/v1/admin/knowledge-documents/**`
- `/api/v1/admin/monitoring/internal-assistant`

Acceptance criteria:

- they appear only under removed, historical, deprecated, or cleanup sections
- they do not appear as active API, active UI, active integration, or active deployment requirements

#### P0-04: Fix Quick-Start And Setup Command Accuracy

All commands must be verified against the actual repository structure.

Acceptance criteria:

- backend commands run from the correct directory
- frontend commands run from `web/`
- Docker commands match actual `docker-compose.yml`
- test commands match actual scripts and test locations
- docs do not imply unavailable commands are currently supported

#### P0-05: Clarify Current Coverage Versus Target Coverage

If documentation mentions an 80% coverage target or any other target, it must not be presented as measured current coverage unless a current coverage report exists.

Acceptance criteria:

- targets are labeled as targets
- measured results are labeled as measured
- missing reports are clearly noted

---

### 10.2 P1 — Add Missing Or Under-Specified Documentation

P1 completion checklist:

- [x] P1-01 Add frontend route inventory
- [x] P1-02 Add role-to-screen/API matrix
- [x] P1-03 Align API documentation with controller mappings
- [x] P1-04 Align test documentation with actual test suites
- [x] P1-05 Add demo accounts and seed data reference
- [x] P1-06 Add removed endpoints reference
- [x] P1-07 Add current-vs-planned feature status

P1 issues improve completeness and professionalism.

#### P1-01: Add Frontend Route Inventory

Create or update a document such as:

```text
docs/reference/frontend-route-inventory.md
```

The route inventory should classify:

- public routes
- staff routes
- admin routes
- patient portal routes
- authentication routes
- forbidden/session-expired/logout routes
- classic/prototype/variant routes
- future or reference-only routes

Acceptance criteria:

- route inventory is based on `web/src/app`
- product docs and test docs link to it
- route status is labeled clearly

#### P1-02: Add Role-To-Screen/API Matrix

Create or update:

```text
docs/reference/role-screen-api-matrix.md
```

The matrix should map:

| Role | Screens | API Families | Status / Notes |
|---|---|---|---|
| Guest | public pages, booking | content, departments, doctors, appointments | no auth |
| Patient | portal overview, appointments, lab results, messages, profile | patient-auth, patient-portal | messages read-only if no send/reply API |
| Doctor | appointments, medical records, prescription PDF | appointments, medical-records, patient-records | own clinical workflows |
| Nurse | queue, check-in, vital signs | queue, appointments, vital-signs | no nurse room board unless implemented |
| Accountant | invoices, payments, pricing, revenue | invoices, pricing, reports | finance workflows |
| Admin | users, departments, rooms, schedules, audit, monitoring | admin APIs | operations console |

Acceptance criteria:

- every role is represented
- every active role links to current screen/API families
- limitations are labeled as such

#### P1-03: Align API Documentation With Controller Mappings

Expand or correct API docs for endpoint families such as:

- appointment follow-ups
- appointment vital signs
- independent vital signs
- lab results
- medical record PDF preview
- prescription PDF download
- schedule templates
- slot generation
- queue
- admin monitoring
- audit logs
- inventory items/lots/movements
- patient portal

Acceptance criteria:

- API docs match actual controllers
- endpoints use `/api/v1` consistently
- removed endpoints are not listed as active
- role access is documented where known

#### P1-04: Align Test Documentation With Actual Test Suites

Update `docs/HMS_TestPlan.md` or equivalent to reflect current test suites.

Expected Playwright suites may include:

- `api-client.spec.ts`
- `auth-integrated.spec.ts`
- `rbac.spec.ts`
- `responsive.spec.ts`
- `route-audit.spec.ts`
- `staff-queue.spec.ts`
- `ui-smoke.spec.ts`
- `visual.spec.ts`
- `workflows.spec.ts`

Acceptance criteria:

- implemented suites are described accurately
- planned suites are labeled as planned
- test commands match `web/package.json`
- backend test locations are documented accurately

#### P1-05: Add Demo Accounts And Seed Data Reference

Create or update:

```text
docs/reference/demo-accounts-and-seed-data.md
```

This document should centralize:

- staff demo accounts
- patient portal demo account
- seeded departments
- seeded doctors
- seeded pricing
- seeded slots
- seeded inventory
- seeded patient demo data
- any limitations of demo data

Acceptance criteria:

- setup docs link to the canonical seed/demo account document
- test docs link to it where relevant
- duplicate demo account tables are removed or replaced with links

#### P1-06: Add Removed Endpoints Reference

Create or update:

```text
docs/reference/removed-endpoints.md
```

This document should list historical endpoint families that are intentionally removed.

Acceptance criteria:

- removed endpoints are documented in one canonical place
- active docs link to this reference when necessary
- no removed endpoint appears as an active capability

#### P1-07: Add Current-Vs-Planned Feature Status

Add a feature status section or table to product/project docs.

Recommended statuses:

- Implemented
- Partially implemented
- Planned
- Reference-only
- Removed
- Deprecated

Acceptance criteria:

- major product areas have a status label
- frontend integration limitations are explicit
- patient portal limitations are explicit
- queue enhancement limitations are explicit
- Docker frontend limitations are explicit

---

### 10.3 P2 — Reduce Duplication And Improve Navigation

P2 completion checklist:

- [x] P2-01 Add documentation map
- [x] P2-02 Consolidate repeated stack descriptions through source-of-truth links
- [x] P2-03 Improve heading and naming consistency
- [x] P2-04 Add documentation maintenance notes

P2 items improve readability and maintainability.

#### P2-01: Add Documentation Map

Create or update:

```text
docs/README.md
```

It should explain:

- document categories
- source-of-truth rules
- where to find product docs
- where to find API docs
- where to find architecture docs
- where to find testing docs
- where to find deployment docs
- where to find reference matrices

#### P2-02: Consolidate Repeated Stack Descriptions

Avoid repeating full stack descriptions in many files.

Acceptance criteria:

- one canonical stack summary exists
- other docs link to the canonical summary
- version drift risk is reduced

#### P2-03: Improve Heading And Naming Consistency

Review document headings and filenames.

Acceptance criteria:

- every Markdown file has one clear H1
- titles match filenames
- heading hierarchy is consistent
- temporary names such as `.resolved` are archived or explained

#### P2-04: Add Documentation Maintenance Notes

Add a section explaining how to update docs when the repository changes.

Acceptance criteria:

- endpoint changes require API doc updates
- route changes require route inventory updates
- migration changes require DB migration doc updates
- test suite changes require test plan updates
- deployment changes require deployment guide updates

---

## 11. Recommended Documentation Structure

This requirement recommends a two-phase documentation organization strategy.

### 11.1 Phase 1 — Moderate Cleanup

Use this structure first to avoid over-restructuring before content accuracy is fixed.

```text
docs/
  README.md
  API_ENDPOINTS_COMPREHENSIVE.md
  HMS_PRD.md
  HMS_ProjectPlan.md
  HMS_SRS.md
  HMS_TDD.md
  HMS_TestPlan.md
  HMS_DeploymentGuide.md
  HMS_DBMigrationPlan.md
  HMS_IntegrationGuide.md
  DESIGN.md
  design_brief.md

  audits/
    documentation-review-and-improvement-plan.md
    verification-checklist.md

  reference/
    frontend-route-inventory.md
    role-screen-api-matrix.md
    demo-accounts-and-seed-data.md
    removed-endpoints.md
    engineering-metrics.md

  archive/
    legacy/
    resolved/
```

### 11.2 Phase 2 — Long-Term Professional Structure

After P0 and P1 issues are fixed, the docs may be organized into:

```text
docs/
  00-overview/
  01-product/
  02-requirements/
  03-architecture/
  04-api/
  05-ux-ui/
  06-testing/
  07-devops/
  08-operations/
  09-agent-workflows/
  10-portfolio/
  archive/
```

Phase 2 is implemented as a compatibility-safe navigation layer. Active source documents remain at their current paths to avoid breaking existing repository links.

Completion note:

- [x] Phase 2 category folders were created from `docs/00-overview/` through `docs/10-portfolio/`.
- [x] Active source documents were kept at their existing paths to preserve compatibility with current links and tooling.
- [x] Each category folder contains a `README.md` that points to the current authoritative documents.

---

## 12. Acceptance Criteria

The documentation audit and professionalization pass is complete when all of the following are true.

### 12.1 Scope Control

- [x] The work remains documentation-only.
- [x] No backend code is changed.
- [x] No frontend code is changed.
- [x] No API behavior is changed.
- [x] No database migration is changed.
- [x] No Docker Compose behavior is changed.
- [x] No runtime behavior is changed.
- [x] Any implementation or productionization work is moved to future backlog.

### 12.2 Correctness

- [x] All referenced paths exist or are explicitly marked as planned/future.
- [x] The migration inventory matches the repository.
- [x] Active endpoint families match controller mappings.
- [x] Removed AI/internal-assistant endpoint families appear only as removed or historical.
- [x] Frontend documentation consistently identifies `web/` as canonical.
- [x] `frontend/` is consistently described as reference-only.
- [x] Setup commands use correct working directories.
- [x] Test commands match actual scripts or are marked planned.

### 12.3 Completeness

- [x] Documentation map exists.
- [x] Frontend route inventory exists.
- [x] Role-to-screen/API matrix exists.
- [x] Seed/demo account reference exists.
- [x] Removed endpoints reference exists.
- [x] Current-vs-planned feature status exists.
- [x] Test plan reflects actual test suite names and locations.
- [x] API documentation covers major implemented endpoint families.

### 12.4 Professional Quality

- [x] Duplicate docs are merged or clearly cross-linked.
- [x] Obsolete docs are archived.
- [x] Generated or temporary artifacts are documented or ignored.
- [x] Each Markdown file has a clear title and purpose.
- [x] Documents use consistent terminology.
- [x] Documentation avoids exaggerated or unsupported claims.
- [x] Future work is separated from implemented behavior.

---

## 13. Verification Checklist

Run this checklist before closing the documentation pass.

### 13.1 File And Link Verification

- [x] Confirm every referenced file path exists.
- [x] Confirm every referenced directory exists or is marked future/planned.
- [x] Confirm Markdown renders without broken tables.
- [x] Confirm Markdown code fences are closed.
- [x] Confirm no duplicate top-level headings exist within a single document.

### 13.2 Removed Endpoint Verification

- [x] Search docs for `/api/v1/ai/analyze-symptoms`.
- [x] Search docs for `/api/v1/internal-assistant`.
- [x] Search docs for `/api/v1/admin/knowledge-documents`.
- [x] Search docs for `/api/v1/admin/monitoring/internal-assistant`.
- [x] Verify all occurrences are in removed/historical/deprecated sections only.

### 13.3 API Verification

- [x] Compare controller mappings in `backend/controller/src/main/java` against API docs.
- [x] Verify `/api/v1` base path is used consistently.
- [x] Verify active endpoint families are not missing from high-level summaries.
- [x] Verify removed endpoint families are not listed as active.

### 13.4 Frontend Verification

- [x] Compare route files in `web/src/app` against product docs.
- [x] Compare route files in `web/src/app` against design docs.
- [x] Compare route files in `web/src/app` against test docs.
- [x] Verify `web/` is documented as canonical.
- [x] Verify `frontend/` is documented as reference-only.

### 13.5 Testing Verification

- [x] Compare Playwright specs in `web/e2e/specs` against `docs/HMS_TestPlan.md`.
- [x] Compare backend tests under `backend/application/src/test` and `backend/start/src/test` against backend test claims.
- [x] Confirm test commands match `web/package.json` and backend Maven commands.
- [x] Confirm coverage targets are not presented as measured coverage unless reports exist.

### 13.6 Migration Verification

- [x] Compare migration files under `backend/start/src/main/resources/db/migration` against migration-count claims.
- [x] Confirm removed-assistant migration notes are accurate.
- [x] Confirm database docs do not describe old schema notes as current.

### 13.7 Deployment Verification

- [x] Verify setup commands in `README.md`.
- [x] Verify setup commands in `docs/HMS_DeploymentGuide.md`.
- [x] Verify Docker Compose documentation matches `docker-compose.yml`.
- [x] Verify frontend startup instructions point to `web/`.

### 13.8 Phase 2 And Agent Workflow Verification

- [x] Verify `docs/00-overview/` through `docs/10-portfolio/` category folders exist.
- [x] Verify each Phase 2 category folder has a `README.md`.
- [x] Verify agent workflow files are documented as development workflow assets, not product features.
- [x] Verify active source documents remain reachable from the category folders.

---

## 14. Future Productionization Backlog

The following items were originally future engineering work and are now promoted into the **next implementation plan**.

This update changes planning intent only. It does not change the completed documentation-only pass above and does not implement application code in this document update.

Billing is explicitly excluded from the next implementation scope.

Excluded billing/finance scope:

- invoice creation, payment capture, invoice voiding, and invoice workflows
- pricing management
- revenue report implementation or performance validation
- billing dashboard work
- payment gateway work
- seeded invoice volume or invoice performance benchmarks

## 14.0 Next Implementation Scope Summary

| Backlog area | Next implementation status | Billing exclusion |
|---|---|---|
| Frontend API integration | In scope | Exclude invoices, pricing, revenue, payment, and billing screens |
| RBAC implementation | In scope | Exclude billing-specific UI/actions from this pass |
| Dockerized frontend | In scope | No billing-specific behavior |
| CI/CD pipeline | In scope | Do not add billing-specific E2E gates |
| Seed data and performance validation | In scope | Exclude invoice/revenue/payment seed and benchmark work |
| Queue workflow enhancement | In scope | No billing-specific behavior |
| Inventory and audit improvements | In scope | Inventory and audit only; billing improvements excluded |

### 14.1 Frontend API Integration

- [x] Promoted to next implementation plan.

Implementation should include:

- authenticated API client in `web/`
- staff token handling
- patient token handling
- refresh handling
- error handling
- live API integration across public, staff, admin, inventory, queue, clinical, and patient portal workflows
- explicit exclusion of invoice, payment, pricing, revenue, and billing screens from this pass

### 14.2 RBAC Implementation

- [x] Promoted to next implementation plan.

Implementation should include:

- frontend route guards
- role-aware navigation
- permission-based action hiding
- unauthorized and forbidden states
- Playwright RBAC regression tests
- explicit exclusion of billing-specific actions and billing-specific E2E coverage from this pass

### 14.3 Dockerized Frontend

- [x] Promoted to next implementation plan.

Implementation should include:

- `web/Dockerfile`
- production Next.js build
- Docker Compose frontend service
- environment-based API URL configuration

### 14.4 CI/CD Pipeline

- [x] Promoted to next implementation plan.

Implementation should include:

- backend Maven tests
- frontend lint/typecheck
- frontend production build
- Playwright E2E tests
- test report artifact upload
- Docker build verification
- no billing-specific E2E gates in this pass

### 14.5 Seed Data And Performance Validation

- [x] Promoted to next implementation plan.

Implementation may include realistic larger non-billing demo data such as:

- 500 patients
- 50 doctors
- 20 departments
- 1,000 appointments
- 200 inventory items
- 1,000 audit logs

Performance validation may cover:

- queue filtering
- appointment search
- doctor slot lookup
- inventory list
- audit log list

### 14.6 Queue Workflow Enhancement

- [x] Promoted to next implementation plan.

Implementation should include:

- call patient
- skip patient
- assign room
- mark in consultation
- complete visit
- queue state audit trail

### 14.7 Inventory And Audit Improvements

- [x] Promoted to next implementation plan.
- [x] Billing improvements explicitly excluded.

Implementation should include:

- inventory low-stock alerts
- expiry warning
- expanded audit log coverage
- monitoring dashboard improvements

Out of scope for this backlog item:

- richer billing dashboard
- invoice/payment/pricing/revenue enhancements

### 14.8 Execution Checklist For Promoted Backlog

Use this checklist for the next implementation phase. Tick items only after implementation and verification are complete.

- [x] Implement frontend API integration, excluding billing/finance workflows.
- [x] Implement frontend RBAC hardening, excluding billing-specific actions and tests.
- [x] Add Dockerized frontend support for `web/`.
- [x] Add CI/CD pipeline checks for backend, frontend, Docker, and non-billing E2E coverage.
- [x] Add larger seed data and performance validation, excluding invoice/revenue/payment data and benchmarks.
- [x] Implement queue workflow enhancements.
- [x] Implement inventory and audit improvements, excluding billing dashboard and finance enhancements.

### 14.9 Acceptance Criteria For Promoted Backlog

- Frontend API integration works for public, staff, admin, inventory, queue, clinical, and patient portal workflows selected for this phase.
- Billing/finance surfaces remain unchanged unless a separate requirement is approved.
- RBAC route guards, role-aware navigation, unauthorized states, and forbidden states are covered by Playwright tests.
- `web/` has a production Docker build path and an active Docker Compose frontend service.
- CI verifies backend tests, frontend lint/build, Docker build, and selected Playwright suites.
- Seed/performance work supports non-billing scenarios only.
- Queue enhancement supports call, skip, assign room, in-consultation, complete visit, and audit trail behavior.
- Inventory improvements cover low-stock and expiry warning behavior.
- Audit improvements expand coverage and monitoring visibility without changing billing workflows.

---

## 15. Engineering Metrics Documentation

Engineering metrics may be documented for portfolio and CV use, but the documentation must separate:

- verified current metrics
- target metrics
- planned metrics
- future implementation metrics

Recommended structure:

| Metric | Type | Source | Status |
|---|---|---|---|
| Backend Maven modules | Current verified | `backend/pom.xml` | Verified during docs pass |
| Frontend route/page count | Current verified | `web/src/app` | Verify before publishing |
| REST route handler count | Current verified | Controllers | Verify before publishing |
| Flyway migration count | Current verified | Migration folder | Verify before publishing |
| UI/E2E test count | Current verified | Playwright output | Verify before publishing |
| 1,000 seeded appointments | Future target | Future seed strategy | Not current unless implemented |
| 3-service Docker Compose stack | Future target | Future Docker work | Not current unless implemented |
| CI pipeline covering backend/frontend/E2E | Future target | Future CI work | Not current unless implemented |

The docs must not claim target metrics as completed work.

Completion note:

- [x] Engineering metrics are documented in `docs/reference/engineering-metrics.md`.
- [x] Verified current metrics are separated from targets and future work.

---

## 16. Done Criteria

The documentation improvement pass is done when:

- [x] P0 findings are fixed or explicitly marked as accepted risk with an owner.
- [x] P1 findings are documented or moved into a tracked follow-up with a concrete target file.
- [x] P2 findings are either completed or deferred.
- [x] API docs do not present removed AI/internal-assistant routes as active.
- [x] Frontend docs consistently identify `web/` as canonical.
- [x] `frontend/` is consistently described as design-reference material.
- [x] Setup, testing, and deployment docs name commands that match the repository structure.
- [x] Future implementation requirements are separated from documentation-only requirements.
- [x] Final review notes list:
  - what changed
  - what was verified
  - what remains deferred
  - what risks were accepted

---

## 17. Final Review Notes Template

Use this template when closing the documentation pass.

```md
Title: Final Documentation Review Notes

## Updated

- ...

## Verified

- ...

## Deferred

- ...

## Accepted Risks

- ...

## Follow-Up Backlog

- ...
```

---

## 18. Final Requirement Statement

Perform a documentation-only audit and professionalization pass for the Hospital Management System repository. Verify all documentation against the current repository sources, including backend modules, controller mappings, API envelopes, security configuration, Flyway migrations, frontend routes, Playwright suites, Docker Compose, and environment files. Correct misleading or stale documentation, especially migration count, removed AI/internal-assistant endpoint families, canonical frontend location, Docker/frontend wording, test coverage claims, and setup commands. Add missing documentation for frontend route inventory, role-to-screen/API mapping, seeded demo accounts, removed endpoint families, current-vs-planned feature status, and documentation maintenance. Reduce duplication through source-of-truth rules, cross-links, and archive handling without changing application code, API behavior, database schema, frontend routes, Docker Compose behavior, CI/CD behavior, or runtime behavior.
