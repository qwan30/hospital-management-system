# Hospital Management System — Documentation Map

**Status:** comprehensive documentation aligned with the repository on 2026-06-14.
**Release:** Release Candidate 1.0 — all 7 clinical workflows implemented and tested.
**Scope:** documentation navigation, ownership, source-of-truth rules, and maintenance checks.

## Quick Access

| Resource | Link |
|----------|------|
| 📄 Consolidated HTML | [`HMS_DOCUMENTATION.html`](HMS_DOCUMENTATION.html) — single-page readable overview |
| 🏥 Project README | [`../README.md`](../README.md) — project overview + quick start |
| 📋 API Contract | [`../API_CONTRACT.md`](../API_CONTRACT.md) — endpoint families + response envelope |
| 🔧 Claude Code Guide | [`../CLAUDE.md`](../CLAUDE.md) — AI-assisted development instructions |

---

## 1. Documentation Structure (12 Categories)

### 00-overview — Foundation & Process
| Document | Status | Purpose |
|----------|--------|---------|
| [`project-foundation.md`](00-overview/project-foundation.md) | ✅ Complete | Master technical foundation — source of truth for all standards |
| [`project-context.md`](00-overview/project-context.md) | ✅ Complete | Project background, problem statement, context |
| [`documentation-index.md`](00-overview/documentation-index.md) | ✅ Complete | Full document inventory with status |
| [`git-workflow.md`](00-overview/git-workflow.md) | ✅ Complete | Branch model, commit conventions, PR rules |
| [`code-review-checklist.md`](00-overview/code-review-checklist.md) | ✅ Complete | Review checklist for backend + frontend |
| `definition-of-ready-done.md` | 📋 Planned | DoR / DoD / Spec-Driven Workflow |
| `ai-usage-rules.md` | 📋 Planned | AI-assisted development boundaries |

### 01-business — Business Requirements
| Document | Status | Purpose |
|----------|--------|---------|
| [`stakeholders.md`](01-business/stakeholders.md) | ✅ Complete | Project stakeholders and roles |
| [`scope.md`](01-business/scope.md) | ✅ Complete | In-scope / out-of-scope boundaries |
| [`glossary.md`](01-business/glossary.md) | ✅ Complete | Ubiquitous language — 34 domain terms |
| [`business-rules.md`](01-business/business-rules.md) | ✅ Complete | 30 business rules (BR-001 through BR-030) |

### 02-product — Product Management
| Document | Status | Purpose |
|----------|--------|---------|
| [`prd.md`](02-product/prd.md) | ✅ Complete | Product Requirements Document (merged from HMS_PRD.md) |
| [`feature-list.md`](02-product/feature-list.md) | ✅ Complete | 50 features cataloged (F-001 through F-050) |
| `product-roadmap.md` | 📋 Planned | Release timeline |
| `release-plan.md` | 📋 Planned | Release history and upcoming milestones |

### 03-requirements — System Requirements
| Document | Status | Purpose |
|----------|--------|---------|
| [`permissions-matrix.md`](03-requirements/permissions-matrix.md) | ✅ Complete | 36 RBAC permissions × 7 roles |
| [`../docs/HMS_SRS.md`](HMS_SRS.md) | 📦 Legacy | System Requirements Specification (to be migrated) |
| `functional-requirements.md` | 📋 Planned | FR catalog with traceability |
| `use-cases.md` | 📋 Planned | Use case index and traceability matrix |

### 04-architecture — Architecture & Design
| Document | Status | Purpose |
|----------|--------|---------|
| [`architecture.md`](04-architecture/architecture.md) | ✅ Complete | Architecture overview — DDD modular monolith |
| [`domain-driven-design.md`](04-architecture/domain-driven-design.md) | ✅ Complete | Bounded contexts, aggregates, ubiquitous language |
| [`security-architecture.md`](04-architecture/security-architecture.md) | ✅ Complete | Auth (JWT), RBAC (36 permissions), PHI encryption |
| [`tech-stack.md`](04-architecture/tech-stack.md) | ✅ Complete | Complete technology stack with versions |
| [`coding-standards.md`](04-architecture/coding-standards.md) | ✅ Complete | Java + TypeScript coding standards |
| [`../docs/HMS_TDD.md`](HMS_TDD.md) | 📦 Legacy | Technical Design Document (to be migrated) |
| [`../docs/HMS_ArchitectureDiagrams.html`](HMS_ArchitectureDiagrams.html) | 📦 Reference | Generated architecture diagrams |

### 05-api — API Documentation
| Document | Status | Purpose |
|----------|--------|---------|
| [`api-overview.md`](05-api/api-overview.md) | ✅ Complete | 118 endpoints, 9 families, response envelope |
| [`auth-api.md`](05-api/auth-api.md) | ✅ Complete | Staff + patient authentication flows |
| [`error-codes.md`](05-api/error-codes.md) | ✅ Complete | HTTP status codes, error envelope, validation errors |
| [`../API_CONTRACT.md`](../API_CONTRACT.md) | ✅ Current | Endpoint family contract (root-level) |
| `API_ENDPOINTS_COMPREHENSIVE.md` | 📦 Legacy | Expanded endpoint reference |
| `COMPONENT_API_MAPPING.md` | 📦 Legacy | Component-to-API mapping |
| `DATA_FLOW_SPECIFICATION.md` | 📦 Legacy | Data flow specification |

### 06-database — Database
| Document | Status | Purpose |
|----------|--------|---------|
| [`db-schema.md`](06-database/db-schema.md) | ✅ Complete | 35 tables across 8 domains, 26 indexes |
| [`migration-guide.md`](06-database/migration-guide.md) | ✅ Complete | Flyway setup, migration naming, deployment |
| [`seed-data.md`](06-database/seed-data.md) | ✅ Complete | All demo accounts + release demo seed config |
| [`../docs/HMS_DBMigrationPlan.md`](HMS_DBMigrationPlan.md) | 📦 Legacy | Migration inventory (to be migrated) |

### 07-flows — Business Flows
| Document | Status | Purpose |
|----------|--------|---------|
| [`end-to-end-business-flow.md`](07-flows/end-to-end-business-flow.md) | ✅ Complete | 7 clinical workflows with Mermaid diagrams |
| [`state-machine.md`](07-flows/state-machine.md) | ✅ Complete | Appointment, Invoice, Queue, Inventory state machines |
| [`reference/current-system-flows.md`](reference/current-system-flows.md) | ✅ Current | Cross-role workflow map |
| [`reference/frontend-route-inventory.md`](reference/frontend-route-inventory.md) | ✅ Current | 72 frontend routes cataloged |

### 08-ui-ux — UI/UX Design
| Document | Status | Purpose |
|----------|--------|---------|
| [`design_brief.md`](design_brief.md) | 📦 Legacy | Canonical UX route and workflow brief |
| [`DESIGN.md`](DESIGN.md) | 📦 Reference | Visual design system guidance |

### 09-testing — Quality Assurance
| Document | Status | Purpose |
|----------|--------|---------|
| [`test-strategy.md`](09-testing/test-strategy.md) | ✅ Complete | Test pyramid, coverage targets, CI integration |
| [`test-plan.md`](09-testing/test-plan.md) | ✅ Complete | Backend + frontend test suites, business flow coverage |
| [`../docs/HMS_TestPlan.md`](HMS_TestPlan.md) | 📦 Legacy | Test plan (to be migrated) |
| [`06-testing/business-flow-test-matrix.md`](06-testing/business-flow-test-matrix.md) | 📦 Legacy | Business flow test coverage |
| [`06-testing/full-hms-production-readiness-report-2026-06-01.md`](06-testing/full-hms-production-readiness-report-2026-06-01.md) | 📦 Reference | Last full verification report |

### 10-deployment — DevOps & Deployment
| Document | Status | Purpose |
|----------|--------|---------|
| [`deployment-guide.md`](10-deployment/deployment-guide.md) | ✅ Complete | Docker Compose + development setup |
| [`ci-cd.md`](10-deployment/ci-cd.md) | ✅ Complete | 4 GitHub Actions workflows documented |
| [`docker.md`](10-deployment/docker.md) | ✅ Complete | Docker configuration for all services |
| [`env-variables.md`](10-deployment/env-variables.md) | ✅ Complete | Complete environment variable reference |
| [`../docs/HMS_DeploymentGuide.md`](HMS_DeploymentGuide.md) | 📦 Legacy | Deployment guide (to be migrated) |

### 11-operations — Operations
| Document | Status | Purpose |
|----------|--------|---------|
| `operations-guide.md` | 📋 Planned | Day-to-day operations procedures |
| `troubleshooting.md` | 📋 Planned | Common issues and fixes |

### 12-handover — Project Handover
| Document | Status | Purpose |
|----------|--------|---------|
| [`handover-document.md`](12-handover/handover-document.md) | ✅ Complete | Project handover as of 2026-06-14 |
| [`developer-onboarding.md`](12-handover/developer-onboarding.md) | ✅ Complete | New developer setup and workflow guide |
| [`known-issues.md`](12-handover/known-issues.md) | ✅ Complete | 12 tracked issues (OPEN-001 through OPEN-012) |

### reference — Reference Documents
| Document | Status | Purpose |
|----------|--------|---------|
| [`repository-status.md`](reference/repository-status.md) | ✅ Current | Git state, metrics, release-readiness |
| [`engineering-metrics.md`](reference/engineering-metrics.md) | ✅ Current | Verified metric values |
| [`gitnexus-codebase-scan.md`](reference/gitnexus-codebase-scan.md) | ✅ Current | Code intelligence snapshot |
| [`frontend-route-inventory.md`](reference/frontend-route-inventory.md) | ✅ Current | 72 route files cataloged |
| [`role-screen-api-matrix.md`](reference/role-screen-api-matrix.md) | ✅ Current | Role-to-screen-to-API mapping |
| [`current-system-flows.md`](reference/current-system-flows.md) | ✅ Current | Cross-role workflow map |
| [`demo-accounts-and-seed-data.md`](reference/demo-accounts-and-seed-data.md) | ✅ Current | All demo account details |
| [`removed-endpoints.md`](reference/removed-endpoints.md) | ✅ Current | Removed endpoint families |
| [`agent-workflow-governance.md`](reference/agent-workflow-governance.md) | ✅ Current | Agent asset classification |

---

## 2. Status Labels

| Status | Meaning |
|--------|---------|
| ✅ Complete | Generated and verified against current codebase |
| ✅ Current | Existing document, verified current |
| 📦 Legacy | Original standalone doc — content migrated but kept for reference |
| 📋 Planned | Not yet generated, content known |
| 📦 Reference | Design/prototype/reference material |

---

## 3. Canonical Rules

1. `web/` is the canonical runnable Next.js frontend. `frontend/` is archived design-reference only.
2. Repository source reality is the tie-breaker when documents disagree.
3. Endpoint changes require updates to `../API_CONTRACT.md`, `05-api/api-overview.md`, and affected requirements docs.
4. Frontend route changes require updates to `reference/frontend-route-inventory.md` and `reference/current-system-flows.md`.
5. Migration changes require updates to `06-database/migration-guide.md` and `06-database/db-schema.md`.
6. Test suite changes require updates to `09-testing/test-plan.md`.

---

## 4. Maintenance

- Source-of-truth map above should be updated when new documents are added.
- Legacy `HMS_*.md` files are being gradually migrated into the category structure.
- `project-foundation.md` is the master technical document — update it first, then propagate.
- Regenerate `HMS_DOCUMENTATION.html` when significant doc changes occur.
