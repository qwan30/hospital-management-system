# Repository Status

**Status refresh:** 2026-05-31 23:44:10 +07:00.
**Scope:** Git state, GitNexus index state, source-derived metrics, and current release-readiness label.

## Current Git State

| Check | Result |
| --- | --- |
| Branch | `master` |
| HEAD | `c2552311544ac16441e8a7d3af4f62d35dbb8a86` |
| HEAD subject | `docs(onboarding): add interactive codebase guide` |
| HEAD commit time | 2026-05-25 10:46:05 +0700 |
| Upstream comparison | `origin/master...HEAD` = 0 behind, 36 ahead |
| Working tree at refresh | dirty; contains uncommitted W-01 lab-result creation code/tests plus documentation refresh changes |

Until these changes are committed, `git status` will show the W-01 code/test files plus refreshed documentation files as modified or added.

## GitNexus State

| Check | Result |
| --- | --- |
| Command | `npx.cmd gitnexus status` |
| Repository | `D:\projects\hospital-management-system` |
| Indexed commit | `c255231` |
| Current commit | `c255231` |
| Freshness | up to date for committed `HEAD`; current W-01 working-tree code is not yet committed/indexed |
| Indexed at | 2026-05-25 10:46:21 +0700 |
| Graph size | 705 files, 5,380 nodes, 12,297 edges, 240 communities, 300 execution flows |
| Embeddings | 0 |

GitNexus CLI commands verified in this refresh include `status`, `query`, `context`, and `impact`. The local CLI help does not expose the documented `detect_changes` command, so scope checks use GitNexus `status` plus Git status/diff checks.

## Source-Derived Metrics

| Metric | Current value | Verification source |
| --- | ---: | --- |
| Backend Maven modules | 5 | `backend/pom.xml` |
| Controller Java files | 41 | `backend/controller/src/main/java` |
| Method-level controller mappings | 117 | `rg "@(GetMapping|PostMapping|PutMapping|PatchMapping|DeleteMapping)\b"` |
| Total controller mapping annotations | 148 | method mappings plus `@RequestMapping` |
| Flyway migrations | 18 | `backend/start/src/main/resources/db/migration` |
| Frontend page files | 72 | `web/src/app/**/page.tsx` |
| Frontend page/layout/route files | 78 | `web/src/app` |
| Backend test classes | 32 | `backend/application/src/test`, `backend/start/src/test` |
| Playwright specs | 24 | `web/e2e/specs/*.ts` |

## Release-Readiness Label

**Current label: Demo Ready Only.**

The executable 2026-05-22 hardening pass recorded green backend, frontend lint/unit/coverage/build, dependency security, Docker release-demo smoke, Playwright release-data/CI/integrated/UI/visual, backup/restore smoke, health/monitoring, and patient privacy/RBAC checks using synthetic release-demo data.

The system must not be labeled Production Ready until the release owner approves or closes the remaining waiver items and reruns the final release verification sequence on the current code. W-01 was closed in the working tree on 2026-05-31 by adding `/staff/lab-results/new`, backend DTO normalization, route RBAC, unit tests, and Playwright route coverage.

| ID | Flow | Required decision |
| --- | --- | --- |
| W-02 | BF-09 Inventory/pharmacy | Approve waiver or define and test a true medication dispensing workflow |
| W-03 | BF-11 Notifications/reminders | Approve waiver or verify external email/SMS delivery through a safe provider |

Primary evidence: [Full HMS Production Readiness Report - 2026-05-22](../06-testing/full-hms-production-readiness-report-2026-05-22.md).
