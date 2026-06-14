# HMS Documentation Index

**Generated:** 2026-06-14
**Scope:** Complete inventory of all documentation files in the Hospital Management System repository.

This index catalogs every documentation artifact. Use `docs/README.md` for the source-of-truth navigation map and this index for the full file-level inventory.

---

## 1. Root-Level Documents

| # | File | Purpose | Status | Owner |
|---|------|---------|--------|-------|
| 1 | `README.md` | Repository overview: badges, feature summary, clinical workflow diagram, tech stack, quick start, project structure | Complete | Project Team |
| 2 | `API_CONTRACT.md` | High-level API contract: endpoint families, base URL, active domains | Complete | Backend Team |
| 3 | `CLAUDE.md` | Claude Code project instructions: GitNexus workflow, testing guidelines, skills reference | Complete | Project Team |
| 4 | `AGENTS.md` | ECC agent instructions: specialized agents, skills, commands, hooks, rules | Complete | Project Team |
| 5 | `.instructions.md` | HMS Claude Code instructions: ECC installation, project conventions | Complete | Project Team |
| 6 | `api_testing_subagent_execution_plan.md` | API testing subagent execution plan | Complete | QA Team |

## 2. Documentation Map and Navigation (`docs/`)

| # | File | Purpose | Status | Owner |
|---|------|---------|--------|-------|
| 7 | `docs/README.md` | Canonical documentation map: source-of-truth rules, document classification, category navigation, maintenance rules | Complete | Project Team |

## 3. Overview (`docs/00-overview/`)

| # | File | Purpose | Status | Owner |
|---|------|---------|--------|-------|
| 8 | `docs/00-overview/README.md` | Overview navigation layer: pointers to key overview documents | Complete | Project Team |
| 9 | `docs/00-overview/documentation-index.md` | **This file** -- comprehensive inventory of all documentation files | Complete | Project Team |

## 4. Product Documentation (`docs/01-product/`)

| # | File | Purpose | Status | Owner |
|---|------|---------|--------|-------|
| 10 | `docs/01-product/README.md` | Product documentation category index | Complete | Project Team |

## 5. Requirements Documentation (`docs/02-requirements/`)

| # | File | Purpose | Status | Owner |
|---|------|---------|--------|-------|
| 11 | `docs/02-requirements/README.md` | Requirements documentation category index | Complete | Project Team |

## 6. Architecture Documentation (`docs/03-architecture/`)

| # | File | Purpose | Status | Owner |
|---|------|---------|--------|-------|
| 12 | `docs/03-architecture/README.md` | Architecture documentation category index | Complete | Project Team |
| 13 | `docs/03-architecture/FRONTEND_ARCHITECTURE.md` | Frontend architecture reference: runtime shape, component model, API layer, test approach | Complete | Frontend Team |

## 7. API Documentation (`docs/04-api/`)

| # | File | Purpose | Status | Owner |
|---|------|---------|--------|-------|
| 14 | `docs/04-api/README.md` | API documentation category index | Complete | Project Team |
| 15 | `docs/04-api/COMPONENT_API_MAPPING.md` | Frontend page-to-backend API mapping by service module | Complete | Fullstack Team |
| 16 | `docs/04-api/DATA_FLOW_SPECIFICATION.md` | Frontend-backend data flow: request path from UI through API to controller | Complete | Fullstack Team |
| 17 | `docs/04-api/ERROR_HANDLING_MATRIX.md` | API and UI error handling contract: envelope format, error codes, frontend handling | Complete | Backend Team |

## 8. UX and UI Documentation (`docs/05-ux-ui/`)

| # | File | Purpose | Status | Owner |
|---|------|---------|--------|-------|
| 18 | `docs/05-ux-ui/README.md` | UX/UI documentation category index | Complete | Project Team |

## 9. Testing Documentation (`docs/06-testing/`)

| # | File | Purpose | Status | Owner |
|---|------|---------|--------|-------|
| 19 | `docs/06-testing/README.md` | Testing documentation category index | Complete | Project Team |
| 20 | `docs/06-testing/business-flow-test-matrix.md` | Canonical BA/QA A-to-Z business flow test document: module, exception, test matrix, button/action inspection | Complete | QA Team |
| 21 | `docs/06-testing/full-hms-production-readiness-report-2026-05-22.md` | Release readiness report (May 22): demo-ready verdict, waiver tracking, gate evidence | Complete | QA Team |
| 22 | `docs/06-testing/full-hms-production-readiness-report-2026-06-01.md` | Release readiness report (June 1): release-candidate verdict, all waivers closed, remaining P1/P2 backlog | Complete | QA Team |
| 23 | `docs/06-testing/full-hms-verification-report-2026-05-21.md` | Verification report: P0 journey verification, production readiness assessment | Complete | QA Team |
| 24 | `docs/06-testing/p1-ui-truthfulness-real-user-qa-2026-06-01.md` | P1 UI truthfulness and destructive-action safety QA: real browser checks, broken control detection | Complete | QA Team |
| 25 | `docs/06-testing/release-observability-gate-2026-06-06.md` | Release-candidate observability gate: Prometheus/Grafana/OTel/Tempo/Loki local stack verification | Complete | DevOps Team |

### 9.1 Testing Artifacts (Historical Audit Records)

| # | File | Purpose | Status | Owner |
|---|------|---------|--------|-------|
| 26 | `docs/06-testing/artifacts/all-routes-live-ui-audit-2026-05-22/route-ux-audit.md` | All-routes live UI/UX screenshot audit (70 routes, 1920x1080) | Complete | QA Team |
| 27 | `docs/06-testing/artifacts/all-routes-live-ui-audit-2026-05-23-responsive-shell-fix/route-ux-audit.md` | Follow-up UI audit after responsive shell fix (70 routes) | Complete | QA Team |
| 28 | `docs/06-testing/artifacts/all-routes-live-ui-audit-2026-05-23-responsive-shell-fix/mobile-spot-checks.md` | Mobile navigation spot checks (390x844, 9 routes) | Complete | QA Team |
| 29 | `docs/06-testing/artifacts/p0-browser-diagnostic-2026-05-21/diagnostic-summary.md` | P0 browser diagnostic: initial CORS/CSP issues | Complete | QA Team |
| 30 | `docs/06-testing/artifacts/p0-browser-diagnostic-2026-05-21-before-cors-fix/diagnostic-summary.md` | P0 diagnostic snapshot before CORS fix | Complete | QA Team |
| 31 | `docs/06-testing/artifacts/p0-browser-diagnostic-2026-05-21-before-csp-fix/diagnostic-summary.md` | P0 diagnostic snapshot before CSP fix | Complete | QA Team |
| 32 | `docs/06-testing/artifacts/p0-browser-diagnostic-2026-05-21-before-final-p0-fix/diagnostic-summary.md` | P0 diagnostic snapshot before final P0 fix | Complete | QA Team |
| 33 | `docs/06-testing/artifacts/p0-browser-diagnostic-2026-05-21-before-vitals-fix/diagnostic-summary.md` | P0 diagnostic snapshot before vitals fix | Complete | QA Team |
| 34 | `docs/06-testing/artifacts/visual-production-readiness-2026-05-22/visual-review-decisions-2026-05-22.md` | Visual gate review decisions: baseline failure analysis, acceptance decisions | Complete | QA Team |

## 10. DevOps Documentation (`docs/07-devops/`)

| # | File | Purpose | Status | Owner |
|---|------|---------|--------|-------|
| 35 | `docs/07-devops/README.md` | DevOps documentation category index | Complete | Project Team |

## 11. Operations Documentation (`docs/08-operations/`)

| # | File | Purpose | Status | Owner |
|---|------|---------|--------|-------|
| 36 | `docs/08-operations/README.md` | Operations documentation category index | Complete | Project Team |

## 12. Agent Workflow Documentation (`docs/09-agent-workflows/`)

| # | File | Purpose | Status | Owner |
|---|------|---------|--------|-------|
| 37 | `docs/09-agent-workflows/README.md` | Agent workflow documentation category index | Complete | Project Team |

## 13. Portfolio Documentation (`docs/10-portfolio/`)

| # | File | Purpose | Status | Owner |
|---|------|---------|--------|-------|
| 38 | `docs/10-portfolio/README.md` | Portfolio documentation category index | Complete | Project Team |
| 39 | `docs/10-portfolio/project-evidence-sheet.md` | Verified project metrics and evidence for portfolio/presentation use | Complete | Project Team |

## 14. Legacy HMS Documents (`docs/` root -- active source documents)

| # | File | Purpose | Status | Owner |
|---|------|---------|--------|-------|
| 40 | `docs/HMS_PRD.md` | Product Requirements Document: product baseline, feature scope, user journeys | Complete | Product Team |
| 41 | `docs/HMS_SRS.md` | System Requirements Specification: functional and non-functional requirements mapped to implemented APIs | Complete | BA Team |
| 42 | `docs/HMS_TDD.md` | Technical Design Document: backend stack, module architecture, DB design, API design | Complete | Architecture Team |
| 43 | `docs/HMS_DeploymentGuide.md` | Deployment Guide: local Docker/Java/Maven setup, Docker Compose services, environment configuration | Complete | DevOps Team |
| 44 | `docs/HMS_TestPlan.md` | Test Plan: automated test coverage, backend unit/integration tests, Playwright frontend tests | Complete | QA Team |
| 45 | `docs/HMS_ProjectPlan.md` | Project Plan: delivery snapshot, phases, frontend implementation roadmap | Complete | PM Team |
| 46 | `docs/HMS_UserManual.md` | User Manual: role-based workflow guide for all actors (guest, patient, staff, admin) | Complete | Product Team |
| 47 | `docs/HMS_IntegrationGuide.md` | Integration Guide: Gmail API OAuth2 email integration configuration | Complete | DevOps Team |
| 48 | `docs/HMS_DBMigrationPlan.md` | Database Migration Plan: Flyway strategy, migration inventory (V1-V20), schema summary | Complete | Backend Team |
| 49 | `docs/HMS_UseCaseDiagram.md` | Use Case Diagram summary: active actors, use case groups | Complete | BA Team |
| 50 | `docs/HMS_UseCaseDiagram.puml` | Use Case Diagram PlantUML source | Complete | BA Team |
| 51 | `docs/HMS_Documentation_Audit_Professionalization_Requirement_COMPLETE.md` | Documentation audit requirement specification and completion tracker | Complete | Project Team |
| 52 | `docs/API_ENDPOINTS_COMPREHENSIVE.md` | Comprehensive API endpoint reference: ~110 controller methods, response envelopes, domain families | Complete | Backend Team |
| 53 | `docs/design_brief.md` | Design brief: product direction, UX goals, removed product surfaces | Complete | Product Team |
| 54 | `docs/design_system.md` | Unified Design System: dark navy top nav, clinical sidebar, token colors, typography, component standards | Complete | Design Team |
| 55 | `docs/INTEGRATION_GAPS.md` | Historical integration gaps audit: frontend-backend disconnect analysis | Complete | Fullstack Team |
| 56 | `docs/ui_completion_plan.md` | UI completion plan: screen-by-screen visual/functional audit and remediation blueprint | Complete | Frontend Team |
| 57 | `docs/hospital-flow-driven-execution-plan.md` | Flow-driven execution plan: methodology for converting UI prototypes into end-to-end flows | Complete | Product Team |

## 15. Reference Documents (`docs/reference/`)

| # | File | Purpose | Status | Owner |
|---|------|---------|--------|-------|
| 58 | `docs/reference/repository-status.md` | Repository status: Git state, GitNexus index, source metrics, release-readiness label | Complete | Project Team |
| 59 | `docs/reference/engineering-metrics.md` | Current vs. target engineering metrics: module counts, route counts, test coverage | Complete | Project Team |
| 60 | `docs/reference/gitnexus-codebase-scan.md` | Code intelligence snapshot: GitNexus graph metrics, key code surfaces, source inventory | Complete | Project Team |
| 61 | `docs/reference/frontend-route-inventory.md` | Frontend route inventory: all route files under `web/src/app`, area-by-area status | Complete | Frontend Team |
| 62 | `docs/reference/role-screen-api-matrix.md` | Role-to-screen and API matrix: actor permissions, accessible screens, API families | Complete | Fullstack Team |
| 63 | `docs/reference/current-system-flows.md` | Current system flow map: end-to-end business flows across all roles | Complete | Product Team |
| 64 | `docs/reference/demo-accounts-and-seed-data.md` | Seed data reference: baseline staff accounts, release-demo seed accounts, passwords | Complete | Backend Team |
| 65 | `docs/reference/removed-endpoints.md` | Removed endpoint families: AI/assistant endpoints removed from active API | Complete | Backend Team |
| 66 | `docs/reference/agent-workflow-governance.md` | Agent asset classification: workflow tools vs. product features | Complete | Project Team |

## 16. Audit Documents (`docs/audits/`)

| # | File | Purpose | Status | Owner |
|---|------|---------|--------|-------|
| 67 | `docs/audits/documentation-review-and-improvement-plan.md` | Documentation review and improvement plan: completed audit phases and outputs | Complete | Project Team |
| 68 | `docs/audits/final-documentation-review-notes.md` | Final documentation review notes: updated files, verified assertions | Complete | Project Team |
| 69 | `docs/audits/stabilization-readiness-2026-05-13.md` | Stabilization readiness audit: repository state, workflow gates, fixes applied | Complete | QA Team |
| 70 | `docs/audits/verification-checklist.md` | Documentation verification checklist: file/link verification, removed endpoint checks | Complete | Project Team |

## 17. Archive Documents (`docs/archive/`)

| # | File | Purpose | Status | Owner |
|---|------|---------|--------|-------|
| 71 | `docs/archive/README.md` | Archive index: superseded documentation artifacts retained for traceability | Complete | Project Team |

## 18. Generated HTML Artifacts (`docs/` root)

| # | File | Purpose | Status | Owner |
|---|------|---------|--------|-------|
| 72 | `docs/HMS_ArchitectureDiagrams.html` | Generated architecture diagram artifact | Complete | Architecture Team |
| 73 | `docs/HMS_DOCUMENTATION.html` | Documentation reference HTML output | Complete | Project Team |
| 74 | `docs/codebase-onboarding-guide.html` | Codebase onboarding guide (HTML) | Complete | Project Team |

---

## 19. Summary

| Category | Document Count | Completeness |
|----------|---------------|--------------|
| Root-level documents | 6 | 100% Complete |
| Documentation map | 1 | 100% Complete |
| Overview (00-overview) | 2 | 100% Complete |
| Product (01-product) | 1 | 100% Complete (category index) |
| Requirements (02-requirements) | 1 | 100% Complete (category index) |
| Architecture (03-architecture) | 2 | 100% Complete |
| API (04-api) | 4 | 100% Complete |
| UX/UI (05-ux-ui) | 1 | 100% Complete (category index) |
| Testing (06-testing) | 7 primary + 9 artifacts | 100% Complete |
| DevOps (07-devops) | 1 | 100% Complete (category index) |
| Operations (08-operations) | 1 | 100% Complete (category index) |
| Agent Workflows (09-agent-workflows) | 1 | 100% Complete (category index) |
| Portfolio (10-portfolio) | 2 | 100% Complete |
| Legacy HMS documents (docs/ root) | 18 | 100% Complete |
| Reference (docs/reference/) | 9 | 100% Complete |
| Audit (docs/audits/) | 4 | 100% Complete |
| Archive (docs/archive/) | 1 | 100% Complete |
| Generated HTML artifacts | 3 | 100% Complete |
| **Total** | **74 unique documentation files** | **100% Complete** |

---

## 20. Maintenance Notes

- All documents are currently marked Complete. No Planned or Draft documents exist in the current inventory.
- Legacy `HMS_*` documents under `docs/` root are the active source documents; the numbered category folders (`00-overview` through `10-portfolio`) serve as a navigation layer.
- Category `README.md` files that function only as navigation indices are maintained by the Project Team.
- Testing artifacts under `docs/06-testing/artifacts/` are historical audit records, not active source-of-truth documents.
- The `api_testing_subagent_execution_plan.md` at the repository root is an execution plan, not a documentation artifact in the traditional sense.
- Owner assignments are inferred from document content; the repository does not contain explicit ownership metadata per file.
