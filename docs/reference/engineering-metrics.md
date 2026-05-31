# Engineering Metrics Reference

**Status:** current-vs-target metrics reference for the 2026-05-31 repository status refresh.

Use this file for portfolio or review metrics only when the metric source has been verified. Do not present targets or future goals as completed implementation.

| Metric | Type | Source | Status |
| --- | --- | --- | --- |
| Backend Maven modules | Current verified | `backend/pom.xml` | 5 modules: `domain`, `infrastructure`, `application`, `controller`, `start` |
| Frontend page count | Current verified | `web/src/app` | 72 `page.tsx` files |
| Frontend route/layout file count | Current verified | `web/src/app` | 78 `page.tsx`, `layout.tsx`, and `route.ts` files |
| Repository controller method mappings | Current verified | `backend/controller/src/main/java` | 117 method-level mappings; 148 total mapping annotations including `@RequestMapping` |
| Flyway migration count | Current verified | `backend/start/src/main/resources/db/migration` | 18 migrations, `V1` through `V18` |
| Playwright spec files | Current verified | `web/e2e/specs` | 24 tracked spec files; 24 files in the current working tree |
| Backend test classes | Current verified | `backend/application/src/test`, `backend/start/src/test` | 32 test classes |
| 80%+ frontend coverage gate | Current evidence | `docs/06-testing/full-hms-production-readiness-report-2026-05-22.md` | 80.08% branch coverage in the 2026-05-22 final coverage artifact; rerun before a new production sign-off |
| Dockerized frontend service | Current verified | `web/Dockerfile`, `docker-compose.yml` | Active `frontend` service builds `web/` |
| CI pipeline covering backend/frontend/E2E | Current verified | `.github/workflows/ci.yml` | Backend, frontend lint/build, Playwright, and Docker build jobs defined |
| Demo seed datasets | Current verified | `backend/application/src/main/java/com/hospital/core/seed` | Default non-billing demo and optional release-demo seed targets are configurable |
| GitNexus graph size | Current verified | `.gitnexus/meta.json` | 705 files, 5,380 nodes, 12,297 edges, 240 communities, 300 execution flows |

## Maintenance

Update this file after route additions, test additions, migration additions, or verified metric changes.

Detailed code-intelligence snapshot: [GitNexus Codebase Scan](gitnexus-codebase-scan.md).
