# Engineering Metrics Reference

**Status:** current-vs-target metrics reference for the May 13, 2026 repository baseline.

Use this file for portfolio or review metrics only when the metric source has been verified. Do not present targets or future goals as completed implementation.

| Metric | Type | Source | Status |
| --- | --- | --- | --- |
| Backend Maven modules | Current verified | `backend/pom.xml` | 5 modules: `domain`, `infrastructure`, `application`, `controller`, `start` |
| Frontend page count | Current verified | `web/src/app` | 65 `page.tsx` files |
| Frontend route/layout file count | Current verified | `web/src/app` | 71 `page.tsx`, `layout.tsx`, and `route.ts` files |
| Repository controller method mappings | Current verified | `backend/controller/src/main/java` | 117 method-level mappings; 148 total mapping annotations including `@RequestMapping` |
| Flyway migration count | Current verified | `backend/start/src/main/resources/db/migration` | 17 migrations, `V1` through `V17` |
| Playwright spec files | Current verified | `web/e2e/specs` | 16 tracked spec files; 21 files in the current working tree |
| Backend test classes | Current verified | `backend/application/src/test`, `backend/start/src/test` | 29 test classes |
| 80%+ coverage | Target | project quality gate | Target only unless a fresh coverage report is generated |
| Dockerized frontend service | Current verified | `web/Dockerfile`, `docker-compose.yml` | Active `frontend` service builds `web/` |
| CI pipeline covering backend/frontend/E2E | Current verified | `.github/workflows/ci.yml` | Backend, frontend lint/build, Playwright, and Docker build jobs defined |
| Large demo dataset | Current verified | `backend/application/src/main/java/com/hospital/core/seed` | Non-billing demo seed targets are configurable |
| GitNexus graph size | Current verified | `.gitnexus/meta.json` | 561 files, 4,057 nodes, 9,640 edges, 152 communities, 300 execution flows |

## Maintenance

Update this file after route additions, test additions, migration additions, or verified metric changes.

Detailed code-intelligence snapshot: [GitNexus Codebase Scan](gitnexus-codebase-scan.md).
