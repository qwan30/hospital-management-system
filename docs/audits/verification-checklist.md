# Documentation Verification Checklist

**Status:** completed for the April 26, 2026 documentation professionalization pass.

## 1. File And Link Verification

- [x] Confirm every referenced file path exists or is marked future/planned.
- [x] Confirm every referenced directory exists or is marked future/planned.
- [x] Confirm Markdown code fences are closed.
- [x] Confirm major tables render with header separators.
- [x] Confirm each new Markdown file has a single clear H1.

## 2. Removed Endpoint Verification

- [x] Search docs for `/api/v1/ai/analyze-symptoms`.
- [x] Search docs for `/api/v1/internal-assistant`.
- [x] Search docs for `/api/v1/admin/knowledge-documents`.
- [x] Search docs for `/api/v1/admin/monitoring/internal-assistant`.
- [x] Verify all occurrences are in removed, historical, verification, or requirement sections only.

## 3. API Verification

- [x] Compare controller mappings in `backend/controller/src/main/java` against API docs.
- [x] Verify `/api/v1` base path is used consistently in active API docs.
- [x] Verify active endpoint families are represented in high-level summaries.
- [x] Verify removed endpoint families are not listed as active.

## 4. Frontend Verification

- [x] Compare route files in `web/src/app` against product docs.
- [x] Compare route files in `web/src/app` against design docs.
- [x] Compare route files in `web/src/app` against test docs.
- [x] Verify `web/` is documented as canonical.
- [x] Verify `frontend/` is documented as reference-only.

## 5. Testing Verification

- [x] Compare Playwright specs in `web/e2e/specs` against `docs/HMS_TestPlan.md`.
- [x] Compare backend tests under `backend/application/src/test` and `backend/start/src/test` against backend test claims.
- [x] Confirm test commands match `web/package.json` and backend Maven commands.
- [x] Confirm coverage targets are not presented as measured coverage unless reports exist.

## 6. Migration Verification

- [x] Compare migration files under `backend/start/src/main/resources/db/migration` against migration-count claims.
- [x] Confirm removed-assistant migration notes are accurate.
- [x] Confirm database docs do not describe old schema notes as current.

## 7. Deployment Verification

- [x] Verify setup commands in `README.md`.
- [x] Verify setup commands in `docs/HMS_DeploymentGuide.md`.
- [x] Verify Docker Compose documentation matches `docker-compose.yml`.
- [x] Verify frontend startup instructions point to `web/`.

## 8. Phase 2 And Agent Workflow Verification

- [x] Verify `docs/00-overview/` through `docs/10-portfolio/` category folders exist.
- [x] Verify each Phase 2 category folder has a `README.md`.
- [x] Verify agent workflow files are documented as development workflow assets, not product features.
- [x] Verify active source documents remain reachable from the category folders.
