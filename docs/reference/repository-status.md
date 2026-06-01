# Repository Status

**Status refresh:** 2026-06-01 00:00 +07:00; P1 UI truthfulness refresh added later on 2026-06-01.
**Scope:** Git state, GitNexus index state, source-derived metrics, release-readiness label, and waiver-closure evidence.

## Current Git State

| Check | Result |
| --- | --- |
| Branch | `master` |
| HEAD before this pass | `dc7051d3123127ccccc04c38a2a874cf53a26ca2` |
| HEAD subject before this pass | `feat(lab-results): add staff result creation flow` |
| Post-pass commit | This status document is included in the waiver-closure/P1 hardening commits; use `git log -1 --oneline` for the exact commit id |
| Working tree at refresh | Clean after the waiver-closure commit; P1 UI truthfulness hardening prepared in the current commit |

## GitNexus State

| Check | Result |
| --- | --- |
| Command | `npx.cmd gitnexus status` |
| Repository | `D:\projects\hospital-management-system` |
| Indexed commit before this pass | `dc7051d` |
| Current commit before this pass | `dc7051d` |
| Freshness | Up to date after the waiver-closure commit and `npx.cmd gitnexus analyze` closeout |
| CLI note | Local CLI exposes `status`, `query`, `context`, and `impact`; documented `detect_changes` remains unavailable, so scope checks use GitNexus status plus Git status/diff checks |

## Source-Derived Metrics

| Metric | Current value | Verification source |
| --- | ---: | --- |
| Backend Maven modules | 5 | `backend/pom.xml` |
| Controller Java files | 41 | `backend/controller/src/main/java` |
| Method-level controller mappings | 118 | `rg "@(GetMapping|PostMapping|PutMapping|PatchMapping|DeleteMapping)\b"`; new mapping is `POST /api/v1/inventory/dispense` |
| Flyway migrations | 20 | `backend/start/src/main/resources/db/migration` |
| Frontend page files | 72 | `web/src/app/**/page.tsx` |
| Backend test classes | 33 | `backend/application/src/test`, `backend/start/src/test` |
| Playwright specs | 25 | `web/e2e/specs/*.ts`; new `ui-truthfulness.spec.ts` covers action truthfulness |

## Release-Readiness Label

**Current label: Release Candidate / Ship with fixes.**

The 2026-06-01 waiver-closure pass implemented and verified:

| ID | Flow | Status |
| --- | --- | --- |
| W-01 | BF-07 Lab results | Closed 2026-05-31 by `/staff/lab-results/new` and supporting test coverage |
| W-02 | BF-09 Inventory/pharmacy | Closed 2026-06-01 by pharmacy dispense workflow, stock/audit traceability, UI, and regression coverage |
| W-03 | BF-11 Notifications/reminders | Closed 2026-06-01 by delivery-attempt persistence, safe local-record staging provider, and retry-preserving failure handling |

The label remains conservative because the broader P1/P2 product backlog is still open: patient self-service scope decisions, remaining click-path review items, support-ticket contracts, clinical record locking/addendum policy, and drug/allergy interaction scope. The 2026-06-01 P1 UI truthfulness slice removed verified fake/hash-link controls from the audited route set and added browser confirmations for the listed destructive actions.

## Verification Snapshot

| Gate | Result |
| --- | --- |
| Backend `mvn.cmd verify` | PASS, 148 tests |
| Frontend lint | PASS, 29 existing warnings |
| Frontend unit coverage | PASS, branch coverage 80.48% |
| Frontend build | PASS |
| npm audit / production audit | PASS, 0 vulnerabilities |
| Docker release-demo rebuild and smoke | PASS on `hmsprod20260601` |
| Playwright release-data | PASS, 2 passed |
| Playwright chromium CI | PASS, 183 passed, 1 skipped |
| Playwright integrated | PASS serialized, 92 passed, 3 expected skips |
| Playwright UI | PASS, 323 passed, 1 skipped |
| Playwright visual | PASS, 14 passed |
| P1 UI truthfulness Playwright | PASS, 2 passed; actionable-control manifest reports 0 bugs |
| Real-user Chrome browser QA | PASS, 23 checks, 11 screenshots, 0 unfiltered console errors, 0 4xx/5xx app/API requests |
| High-confidence secret scan | PASS, 0 findings |
| Backup/restore smoke | PASS |
| Git diff check | PASS with line-ending warnings only |

Primary evidence: [Full HMS Production Readiness Report - 2026-06-01](../06-testing/full-hms-production-readiness-report-2026-06-01.md).
