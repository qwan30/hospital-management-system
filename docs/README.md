# Hospital Management System Documentation Map

**Status:** current documentation map for the April 26, 2026 repository baseline.
**Scope:** documentation navigation, ownership, source-of-truth rules, and maintenance checks.

## 1. How To Read This Documentation Set

The repository is a backend-first Hospital Management System with a canonical Next.js frontend under `web/`.

Use repository source reality as the tie-breaker when documents disagree:

1. backend controller mappings under `backend/controller/src/main/java`
2. request/response contracts and enums under `backend/domain/src/main/java`
3. backend services under `backend/application/src/main/java`
4. Flyway migrations under `backend/start/src/main/resources/db/migration`
5. frontend route files under `web/src/app`
6. Playwright suites under `web/e2e`
7. local setup files such as `docker-compose.yml`, `.env.example`, and `web/package.json`

## 2. Source-Of-Truth Map

| Topic | Primary document | Supporting documents |
| --- | --- | --- |
| Repository overview | [`../README.md`](../README.md) | this map |
| Product scope | [`HMS_PRD.md`](HMS_PRD.md) | [`HMS_ProjectPlan.md`](HMS_ProjectPlan.md), [`HMS_UserManual.md`](HMS_UserManual.md) |
| System requirements | [`HMS_SRS.md`](HMS_SRS.md) | [`reference/role-screen-api-matrix.md`](reference/role-screen-api-matrix.md) |
| Technical design | [`HMS_TDD.md`](HMS_TDD.md) | [`HMS_ArchitectureDiagrams.html`](HMS_ArchitectureDiagrams.html) |
| API contract | [`../API_CONTRACT.md`](../API_CONTRACT.md) | [`API_ENDPOINTS_COMPREHENSIVE.md`](API_ENDPOINTS_COMPREHENSIVE.md), [`reference/removed-endpoints.md`](reference/removed-endpoints.md) |
| Database migrations | [`HMS_DBMigrationPlan.md`](HMS_DBMigrationPlan.md) | migration files under `../backend/start/src/main/resources/db/migration` |
| Deployment and setup | [`HMS_DeploymentGuide.md`](HMS_DeploymentGuide.md) | [`../README.md`](../README.md), [`reference/demo-accounts-and-seed-data.md`](reference/demo-accounts-and-seed-data.md) |
| Testing | [`HMS_TestPlan.md`](HMS_TestPlan.md) | `../backend/application/src/test`, `../backend/start/src/test`, `../web/e2e` |
| Frontend routes | [`reference/frontend-route-inventory.md`](reference/frontend-route-inventory.md) | [`design_brief.md`](design_brief.md), `../web/e2e/helpers/routes.ts` |
| Design direction | [`design_brief.md`](design_brief.md) | [`DESIGN.md`](DESIGN.md) |
| Documentation audit | [`audits/documentation-review-and-improvement-plan.md`](audits/documentation-review-and-improvement-plan.md) | [`audits/verification-checklist.md`](audits/verification-checklist.md), [`audits/final-documentation-review-notes.md`](audits/final-documentation-review-notes.md) |
| Agent workflow governance | [`09-agent-workflows/README.md`](09-agent-workflows/README.md) | [`reference/agent-workflow-governance.md`](reference/agent-workflow-governance.md) |

## 2.1 Professional Category Navigation

The long-term documentation category structure is present as a navigation layer:

| Category | Purpose |
| --- | --- |
| [`00-overview/`](00-overview/) | repository and documentation overview |
| [`01-product/`](01-product/) | product, project, user, and use case docs |
| [`02-requirements/`](02-requirements/) | SRS and requirement traceability |
| [`03-architecture/`](03-architecture/) | architecture, technical design, database, metrics |
| [`04-api/`](04-api/) | API contract and endpoint references |
| [`05-ux-ui/`](05-ux-ui/) | design brief, visual system, route inventory |
| [`06-testing/`](06-testing/) | test plan and verification records |
| [`07-devops/`](07-devops/) | deployment, environment, and migration setup |
| [`08-operations/`](08-operations/) | integration, seed data, archive, removed surfaces |
| [`09-agent-workflows/`](09-agent-workflows/) | agent and workflow governance |
| [`10-portfolio/`](10-portfolio/) | verified metrics and presentation references |

## 3. Document Classification

| Document | Classification | Notes |
| --- | --- | --- |
| `API_ENDPOINTS_COMPREHENSIVE.md` | current | expanded endpoint reference verified against controllers |
| `DESIGN.md` | current/reference | visual design system guidance |
| `design_brief.md` | current | canonical UX route and workflow brief |
| `HMS_ArchitectureDiagrams.html` | current/reference | generated architecture diagram artifact |
| `HMS_DBMigrationPlan.md` | current | migration strategy and inventory |
| `HMS_DeploymentGuide.md` | current | local deployment and operational setup |
| `HMS_Documentation_Audit_Professionalization_Requirement_COMPLETE.md` | current/audit requirement | requirement and completion tracker for this documentation pass |
| `HMS_IntegrationGuide.md` | current | Gmail and removed integration notes |
| `HMS_PRD.md` | current | product baseline |
| `HMS_ProjectPlan.md` | current | frontend/product delivery phases and status |
| `HMS_SRS.md` | current | requirements mapped to implemented APIs |
| `HMS_TDD.md` | current | technical design baseline |
| `HMS_TestPlan.md` | current | backend and Playwright test plan |
| `HMS_UseCaseDiagram.md` | current/reference | use case summary |
| `HMS_UseCaseDiagram.puml` | current/reference | PlantUML source |
| `HMS_UserManual.md` | current/reference | role workflow guide, not proof of complete frontend production readiness |
| `archive/resolved/implementation_plan.md.resolved` | archived | superseded implementation status note retained for history |
| `reference/agent-workflow-governance.md` | current/reference | classifies agent assets as workflow tooling, not product features |

## 4. Status Labels

Use these labels consistently:

| Status | Meaning |
| --- | --- |
| `Implemented` | Exists in the current repository and is verifiable from code, routes, tests, or docs |
| `Partially implemented` | Exists but is incomplete, limited, or not fully integrated |
| `Planned` | Future work, not active implementation |
| `Reference-only` | Design/prototype/reference material, not active runtime source |
| `Removed` | Historical behavior that must not be documented as active |
| `Deprecated` | Still present but should not be used as the current baseline |

## 5. Canonical Frontend Rule

`web/` is the canonical runnable Next.js frontend.

`frontend/` is retained as design-reference prototype material only. Do not document `frontend/` as the active app unless a future implementation explicitly changes the repo.

## 6. Generated And Temporary Artifacts

| Path | Classification | Documentation action |
| --- | --- | --- |
| `node_modules/` | generated | ignore in documentation inventories except dependency/setup notes |
| `web/node_modules/` | generated | ignore in documentation inventories except dependency/setup notes |
| `test-results/` | generated | do not treat as source documentation |
| `.codex-run/` | temporary agent output | do not treat as product documentation |
| `_bmad-output/` | generated/reference output | keep out of source-of-truth docs unless explicitly curated |
| `history/` | historical/reference | do not treat as current product documentation |

## 7. Maintenance Rules

- Endpoint changes require updates to `../API_CONTRACT.md`, `API_ENDPOINTS_COMPREHENSIVE.md`, and affected requirements/design docs.
- Frontend route changes require updates to `reference/frontend-route-inventory.md`, `design_brief.md`, and test documentation.
- Migration changes require updates to `HMS_DBMigrationPlan.md`, `HMS_TDD.md`, and overview docs if counts are mentioned.
- Test suite changes require updates to `HMS_TestPlan.md`.
- Deployment or environment changes require updates to `HMS_DeploymentGuide.md`, `.env.example`, and root setup notes.
- Removed functionality must be documented only in removed, historical, deprecated, or archive sections.
