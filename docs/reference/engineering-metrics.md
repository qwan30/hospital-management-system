# Engineering Metrics Reference

**Status:** current-vs-target metrics reference for the 2026-06-14 repository status refresh.

Use this file for portfolio or review metrics only when the metric source has been verified. Do not present targets or future goals as completed implementation.

| Metric | Type | Source | Status |
| --- | --- | --- | --- |
| Backend Maven modules | Current verified | `backend/pom.xml` | 5 modules: `domain`, `infrastructure`, `application`, `controller`, `start` |
| Frontend page count | Current verified | `frontend/src/app` | 72 `page.tsx` files |
| Frontend route/layout file count | Current verified | `frontend/src/app` | 77 `page.tsx`, `layout.tsx`, and `route.ts` files |
| Repository controller method mappings | Current verified | `backend/controller/src/main/java` | 118 method-level mappings; 148 total mapping annotations including `@RequestMapping` |
| Flyway migration count | Current verified | `backend/start/src/main/resources/db/migration` | 20 migrations, `V1` through `V20` |
| Playwright spec files | Current verified | `frontend/e2e/specs` | 25 tracked spec files |
| Backend test files | Current verified | `backend/application/src/test`, `backend/start/src/test` | 34 test Java files |
| 80%+ frontend coverage gate | Current evidence | `docs/06-testing/full-hms-production-readiness-report-2026-06-01.md` | 80.48% branch coverage verified; rerun before a new production sign-off |
| Dockerized frontend service | Current verified | `frontend/Dockerfile`, `docker-compose.yml` | Active `frontend` service builds `frontend/` |
| CI pipeline covering backend/frontend/E2E | Current verified | `.github/workflows/ci.yml` | Backend, frontend lint/build, Playwright, and Docker build jobs defined; rollback and security-scan workflows added |
| Demo seed datasets | Current verified | `backend/application/src/main/java/com/hospital/core/seed` | Default non-billing demo and optional release-demo seed targets are configurable |
| GitNexus graph size | Current verified | `.gitnexus/meta.json` | 705 files, 5,380 nodes, 12,297 edges, 240 communities, 300 execution flows |

## Maintenance

Update this file after route additions, test additions, migration additions, or verified metric changes.

Detailed code-intelligence snapshot: [GitNexus Codebase Scan](gitnexus-codebase-scan.md).
