# Documentation Review And Improvement Plan

**Status:** completed for the April 26, 2026 documentation professionalization pass.
**Requirement source:** `../HMS_Documentation_Audit_Professionalization_Requirement_COMPLETE.md`
**Scope:** documentation-only.

## 1. Completed Phases

| Phase | Status | Output |
| --- | --- | --- |
| Inventory and guardrails | Completed | `../README.md`, `../reference/*`, and this audit folder define source-of-truth rules |
| P0 correctness corrections | Completed | migration count, frontend canonical location, removed endpoints, setup/test wording, and coverage target wording corrected |
| P1 missing reference docs | Completed | route inventory, role-screen/API matrix, demo seed reference, removed endpoints, and engineering metrics added |
| P1 alignment updates | Completed | API, test, deployment, PRD, TDD, and project-plan docs aligned to current repo state |
| P2 professionalization | Completed | docs map, cross-links, maintenance rules, and archive handling added |
| Phase 2 professional navigation | Completed | `../00-overview/` through `../10-portfolio/` category folders added as a compatibility-safe navigation layer |
| Verification and requirement ticking | Completed | `verification-checklist.md` and requirement checkboxes updated |

## 2. Source Checks Used

| Area | Source checked |
| --- | --- |
| Backend modules | `backend/pom.xml`, module folders |
| Backend endpoints | controller mappings under `backend/controller/src/main/java` |
| API envelope | `backend/controller/src/main/java/com/hospital/shared/api` |
| RBAC | `backend/application/src/main/java/com/hospital/core/security/RbacAuthorizationService.java`, `frontend/src/lib/rbac.ts` |
| Migrations | `backend/start/src/main/resources/db/migration` |
| Backend tests | `backend/application/src/test`, `backend/start/src/test` |
| Frontend routes | `frontend/src/app` |
| Frontend scripts | `frontend/package.json`, `frontend/playwright.config.ts` |
| E2E suites | `frontend/e2e/specs` |
| Local services | `docker-compose.yml`, `.env.example` |
| Seed data | `backend/application/src/main/java/com/hospital/core/seed/SeedDataService.java` |

## 3. Known Outcome

- The active docs now identify `frontend/` as the canonical frontend and `frontend/` as reference-only.
- Active API docs no longer present removed AI/internal-assistant routes as active.
- Migration docs include `V16`.
- Test docs identify current backend and Playwright test locations.
- Demo accounts are centralized in `../reference/demo-accounts-and-seed-data.md`.
- Obsolete resolved implementation notes were moved to `../archive/resolved/`.
- Long-term category navigation folders were added without moving active source documents, preserving existing links.
- Agent workflow assets are classified in `../reference/agent-workflow-governance.md`.

## 4. Deferred Engineering Work

The following remain future engineering work, not documentation-pass implementation:

- production frontend Dockerfile and Compose service
- CI/CD pipeline
- broad frontend API integration beyond current selected flows
- larger demo data generation
- patient self-service cancel/reschedule
- patient-side message send/reply
- queue call/skip/room-board workflow
