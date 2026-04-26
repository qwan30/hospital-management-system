# Engineering Metrics Reference

**Status:** current-vs-target metrics reference for the April 26, 2026 repository baseline.

Use this file for portfolio or review metrics only when the metric source has been verified. Do not present targets or future goals as completed implementation.

| Metric | Type | Source | Status |
| --- | --- | --- | --- |
| Backend Maven modules | Current verified | `backend/pom.xml` | 5 modules: `domain`, `infrastructure`, `application`, `controller`, `start` |
| Frontend page count | Current verified | `web/src/app` | 65 `page.tsx` files |
| Frontend route/layout file count | Current verified | `web/src/app` | 71 `page.tsx`, `layout.tsx`, and `route.ts` files |
| Repository controller method mappings | Current verified | `backend/controller/src/main/java` | roughly 110 mapped controller methods |
| Flyway migration count | Current verified | `backend/start/src/main/resources/db/migration` | 16 migrations, `V1` through `V16` |
| Playwright spec files | Current verified | `web/e2e/specs` | 9 spec files |
| Backend test classes | Current verified | `backend/application/src/test`, `backend/start/src/test` | 12 test classes |
| 80%+ coverage | Target | project quality gate | Target only unless a fresh coverage report is generated |
| Dockerized frontend service | Future target | future Docker work | Not current |
| CI pipeline covering backend/frontend/E2E | Future target | future CI work | Not current |
| Large demo dataset | Future target | future seed/performance work | Not current |

## Maintenance

Update this file after route additions, test additions, migration additions, or verified metric changes.
