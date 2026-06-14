# Hospital Management System — Documentation Index

**Status:** Documentation aligned with repository — 2026-06-14
**Release:** RC 1.0 — all 7 clinical workflows implemented and tested
**Structure:** 14-category document hierarchy following universal-docs-generator template

Referenced by: root `README.md`, `CLAUDE.md`, and all documentation consumers. This is an UPDATE to the existing docs/README.md reflecting the reorganized folder structure.

## Quick Access

| Resource | Link |
|----------|------|
| 📄 Interactive HTML | [`HMS_DOCUMENTATION.html`](HMS_DOCUMENTATION.html) — navigable documentation portal |
| 🏥 Project README | [`../README.md`](../README.md) — project overview + quick start |
| 📋 API Contract | [`05-api/api-contract.md`](05-api/api-contract.md) — 118-endpoint reference |
| 🏗️ Architecture | [`04-architecture/architecture.md`](04-architecture/architecture.md) — DDD modular monolith |
| 🔧 Claude Code Guide | [`../CLAUDE.md`](../CLAUDE.md) — AI-assisted development instructions |

---

## 1. Documentation Structure

### 00-overview — Foundation & Process
| Document | Description |
|----------|-------------|
| [`project-foundation.md`](00-overview/project-foundation.md) | Master technical foundation — source of truth for all standards |
| [`project-context.md`](00-overview/project-context.md) | Project background, problem statement, stakeholder context |
| [`documentation-index.md`](00-overview/documentation-index.md) | Full document inventory with status tracking |
| [`git-workflow.md`](00-overview/git-workflow.md) | Branch model, commit conventions, PR process |
| [`code-review-checklist.md`](00-overview/code-review-checklist.md) | Review checklist for backend (Java) + frontend (Next.js/React) |
| [`onboarding-guide.html`](00-overview/onboarding-guide.html) | Interactive codebase onboarding walkthrough |

### 01-business — Business Requirements
| Document | Description |
|----------|-------------|
| [`stakeholders.md`](01-business/stakeholders.md) | Project stakeholders and role definitions |
| [`scope.md`](01-business/scope.md) | In-scope / out-of-scope boundaries |
| [`glossary.md`](01-business/glossary.md) | Ubiquitous language — 34 domain terms |
| [`business-rules.md`](01-business/business-rules.md) | 30 business rules (BR-001 through BR-030) |

### 02-product — Product Management
| Document | Description |
|----------|-------------|
| [`prd.md`](02-product/prd.md) | Product Requirements Document |
| [`feature-list.md`](02-product/feature-list.md) | 50 features cataloged (F-001 through F-050) |
| [`release-plan.md`](02-product/release-plan.md) | Release history and milestones |
| [`design-brief.md`](02-product/design-brief.md) | UX route and workflow design brief |

### 03-requirements — System Requirements
| Document | Description |
|----------|-------------|
| [`srs.md`](03-requirements/srs.md) | Software Requirements Specification |
| [`permissions-matrix.md`](03-requirements/permissions-matrix.md) | 36 RBAC permissions × 7 roles |
| [`use-cases.md`](03-requirements/use-cases.md) | Use case diagrams and specifications |

### 04-architecture — Architecture & Design
| Document | Description |
|----------|-------------|
| [`architecture.md`](04-architecture/architecture.md) | Architecture overview — DDD modular monolith |
| [`domain-driven-design.md`](04-architecture/domain-driven-design.md) | 17 bounded contexts, aggregates, ubiquitous language |
| [`security-architecture.md`](04-architecture/security-architecture.md) | JWT auth, RBAC (36 permissions), PHI encryption (AES-GCM+SHA-256) |
| [`tech-stack.md`](04-architecture/tech-stack.md) | Complete technology stack with versions |
| [`coding-standards.md`](04-architecture/coding-standards.md) | Java + TypeScript coding standards |
| [`frontend-architecture.md`](04-architecture/frontend-architecture.md) | Next.js App Router frontend architecture |
| [`service-boundaries.md`](04-architecture/service-boundaries.md) | Service integration and boundary docs |
| [`architecture-diagrams.html`](04-architecture/architecture-diagrams.html) | Interactive architecture diagrams |

### 05-api — API Documentation
| Document | Description |
|----------|-------------|
| [`api-contract.md`](05-api/api-contract.md) | Complete API contract — 118 endpoints, auth, error codes, rate limiting |

### 06-database — Database
| Document | Description |
|----------|-------------|
| [`db-schema.md`](06-database/db-schema.md) | 35 tables across 8 domains, 26 indexes |
| [`migration-guide.md`](06-database/migration-guide.md) | Flyway migration guide with naming conventions |
| [`seed-data.md`](06-database/seed-data.md) | All demo accounts + release demo seed config |

### 07-flows — Business Flows
| Document | Description |
|----------|-------------|
| [`end-to-end-business-flow.md`](07-flows/end-to-end-business-flow.md) | 7 clinical workflows with Mermaid diagrams |
| [`state-machine.md`](07-flows/state-machine.md) | Appointment, Invoice, Queue, Inventory state machines |
| [`business-flow-overview.md`](07-flows/business-flow-overview.md) | Hospital clinical flow overview |

### 08-ui-ux — UI/UX Design
| Document | Description |
|----------|-------------|
| [`02_design-system/design-system.md`](08-ui-ux/02_design-system/design-system.md) | Visual design system |
| [`README.md`](08-ui-ux/README.md) | UI/UX documentation overview |

### 09-testing — Quality Assurance
| Document | Description |
|----------|-------------|
| [`test-strategy.md`](09-testing/test-strategy.md) | Test pyramid, coverage targets (80%+), CI integration |
| [`test-plan-full.md`](09-testing/test-plan-full.md) | Backend + frontend test suites |
| [`test-approach.md`](09-testing/test-approach.md) | TDD approach and conventions |
| [`business-flow-test-matrix.md`](09-testing/business-flow-test-matrix.md) | Business flow test coverage |
| [`release-observability-gate-2026-06-06.md`](09-testing/release-observability-gate-2026-06-06.md) | Latest release observability gate report |

### 10-deployment — DevOps & Deployment
| Document | Description |
|----------|-------------|
| [`deployment-guide.md`](10-deployment/deployment-guide.md) | Docker Compose + dev setup + VPS deployment |
| [`ci-cd.md`](10-deployment/ci-cd.md) | 4 GitHub Actions workflows |
| [`docker.md`](10-deployment/docker.md) | Docker configuration for all services |
| [`env-variables.md`](10-deployment/env-variables.md) | Complete env variable reference |

### 11-operations — Operations
| Document | Description |
|----------|-------------|
| [`admin-guide.md`](11-operations/admin-guide.md) | System administration and user management guide |

### 12-handover — Project Handover
| Document | Description |
|----------|-------------|
| [`handover-document.md`](12-handover/handover-document.md) | Project handover — architecture, decisions, current state |
| [`developer-onboarding.md`](12-handover/developer-onboarding.md) | New developer setup and contribution workflow |
| [`known-issues.md`](12-handover/known-issues.md) | Tracked issues and limitations |

### reference — Reference Documents
| Document | Description |
|----------|-------------|
| [`repository-status.md`](reference/repository-status.md) | Git state, metrics, release-readiness snapshot |
| [`engineering-metrics.md`](reference/engineering-metrics.md) | Verified metric values from codebase |
| [`gitnexus-codebase-scan.md`](reference/gitnexus-codebase-scan.md) | Code intelligence snapshot |
| [`frontend-route-inventory.md`](reference/frontend-route-inventory.md) | 72 frontend route files cataloged |
| [`role-screen-api-matrix.md`](reference/role-screen-api-matrix.md) | Role → Screen → API endpoint mapping |
| [`current-system-flows.md`](reference/current-system-flows.md) | Cross-role workflow interaction map |
| [`demo-accounts-and-seed-data.md`](reference/demo-accounts-and-seed-data.md) | All demo account details |
| [`removed-endpoints.md`](reference/removed-endpoints.md) | Intentionally removed endpoint families |
| [`agent-workflow-governance.md`](reference/agent-workflow-governance.md) | AI agent asset classification |
| [`project-evidence-sheet.md`](reference/project-evidence-sheet.md) | Project evidence and deliverables |

### archive — Historical Documents
| Document | Description |
|----------|-------------|
| [`ui-completion-plan.md`](archive/ui-completion-plan.md) | UI completion plan (historical) |
| [`integration-gaps.md`](archive/integration-gaps.md) | Integration gaps analysis (historical) |
| [`documentation-audit-complete.md`](archive/documentation-audit-complete.md) | Documentation audit (historical) |

---

## 2. Canonical Rules

1. **`frontend/`** is the canonical Next.js application — single source of frontend truth.
2. **Repository source reality** is the tie-breaker when documents disagree with code.
3. **Endpoint changes** require updates to `05-api/api-contract.md`.
4. **Frontend route changes** require updates to `reference/frontend-route-inventory.md`.
5. **Migration changes** require updates to `06-database/migration-guide.md` and `06-database/db-schema.md`.
6. **Test suite changes** require updates to `09-testing/test-plan-full.md`.

---

## 3. Maintenance

- This index should be updated whenever a document is added, moved, or removed.
- All documentation paths are relative to `docs/` directory.
- The HTML portal at `HMS_DOCUMENTATION.html` serves as the interactive entry point.
- Archival decisions: documents move to `archive/` when superseded, never deleted.
