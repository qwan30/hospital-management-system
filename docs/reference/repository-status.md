# Repository Status

**Status refresh:** 2026-06-14.
**Scope:** Git state, GitNexus index state, source-derived metrics, release-readiness label, and verification evidence.

## Current Git State

| Check | Result |
| --- | --- |
| Branch | `master` |
| HEAD at refresh | `2ab7e3f` |
| HEAD subject at refresh | `fix: remove dangling setIsExecuting reference in slots page` |
| Working tree at refresh | Modified: ci.yml, cd.yml, docker-compose.yml; Deleted: frontend/ design references; New: rollback.yml, security-scan.yml |
| Previous stable checkpoint | `dc7051d` — `feat(lab-results): add staff result creation flow` (2026-06-01) |

## GitNexus State

| Check | Result |
| --- | --- |
| Repository | `D:\projects\hospital-management-system` |
| Indexed commit | `dc7051d` (most recent full analyze); post-analyze commits include CI/CD hardening and frontend cleanup |
| Freshness | Stale — `npx gitnexus analyze` needed after current working-tree changes are committed |
| CodeGraph | Active — `.codegraph/` index present and current |

## Source-Derived Metrics

| Metric | Current value | Verification source |
| --- | ---: | --- |
| Backend Maven modules | 5 | `backend/pom.xml` |
| Controller Java files | 40 | `backend/controller/src/main/java` |
| Method-level controller mappings | 118 | `rg "@(GetMapping|PostMapping|PutMapping|PatchMapping|DeleteMapping)\b"` |
| Flyway migrations | 20 | `backend/start/src/main/resources/db/migration` |
| Frontend page files | 72 | `web/src/app/**/page.tsx` |
| Backend test files | 34 | `backend/application/src/test`, `backend/start/src/test` |
| Playwright specs | 25 | `web/e2e/specs/*.ts` |
| CI/CD workflows | 4 | ci.yml, cd.yml, rollback.yml, security-scan.yml |
| Docker services | 3 | postgres, backend, frontend (plus optional observability stack) |

## Release-Readiness Label

**Current label: Release Candidate / Ship with fixes.**

Previous waiver-closure items (W-01 through W-03) were closed in the 2026-06-01 pass. The working tree now includes CI/CD hardening (rollback workflow, security scanning) and frontend reference cleanup (removing `frontend/` design prototypes no longer needed).

The label remains conservative because the broader P1/P2 product backlog is still open: patient self-service scope decisions, remaining click-path review items, support-ticket contracts, clinical record locking/addendum policy, and drug/allergy interaction scope.

## Verification Snapshot (last full run: 2026-06-01)

| Gate | Result |
| --- | --- |
| Backend `mvn verify` | PASS, 148 tests |
| Frontend lint | PASS, 29 existing warnings |
| Frontend unit coverage | PASS, branch coverage 80.48% |
| Frontend build | PASS |
| npm audit / production audit | PASS, 0 vulnerabilities |
| Docker release-demo rebuild and smoke | PASS |
| Playwright chromium CI | PASS, 183 passed, 1 skipped |
| Playwright integrated | PASS serialized, 92 passed, 3 expected skips |
| Playwright UI | PASS, 323 passed, 1 skipped |
| Playwright visual | PASS, 14 passed |
| High-confidence secret scan | PASS, 0 findings |

Primary evidence: [Full HMS Production Readiness Report - 2026-06-01](../06-testing/full-hms-production-readiness-report-2026-06-01.md).
