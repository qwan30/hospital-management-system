# Full HMS Verification Report - Final Pass 2026-05-22

## 1. Executive verdict

**P0 release-demo functional gate: PASS with non-P0 conditions.**

The P0 user journeys were verified with synthetic/release-demo data on the isolated `hmsfulltest` stack:
BF-01 public booking, BF-02 staff auth/RBAC, BF-05 queue/check-in/intake, BF-06 doctor consultation/record, and BF-08 patient portal all passed browser/API verification.

**Production readiness: NOT READY.**

Production sign-off remains blocked by non-P0 quality/security gates: visual baselines failed and need human review, frontend branch coverage is below the 80% policy, and the Docker frontend build reports npm dependency vulnerabilities.

## 2. Environment summary

| Item | Final value |
| --- | --- |
| Repo | `D:\projects\hospital-management-system` |
| Report date | 2026-05-22 |
| Data policy | Synthetic/release-demo data only |
| GitNexus index | Current at commit `60eada8` |
| Compose project | `hmsfulltest` |
| Frontend URL | `http://localhost:13001` |
| Backend URL | `http://localhost:18082` |
| API URL | `http://127.0.0.1:18082/api/v1` |
| Postgres host port | `15433` |
| Public rate limit for test stack | `300/minute` |
| Dirty worktree | Preserved; 226 `git status --short` lines at final source scan |

## 3. Source-level check result

| Check | Result |
| --- | ---: |
| `web/src/app/**/page.tsx` routes | 72 |
| `web/e2e/helpers/routes.ts` lines | 116 |
| Backend controller mappings | 148 |
| Flyway migrations | 18 |
| BF ID mentions in test docs/report | 83 |
| GitNexus status | Up to date |

Artifact: `docs/06-testing/artifacts/source-scan-final-corrected-2026-05-22.json`

## 4. Backend result

| Command | Result | Duration | Evidence |
| --- | --- | ---: | --- |
| `mvn.cmd verify` from `backend/` | PASS | 94.10s | `docs/06-testing/artifacts/mvn-verify-backend-final-2026-05-22.log` |

Backend summary: 145 tests passed, 0 failures, 0 errors. Flyway validated and applied 18 migrations in test containers.

## 5. Frontend result

| Command | Result | Duration | Evidence |
| --- | --- | ---: | --- |
| `npm.cmd run lint` | PASS with 31 warnings | 19.51s | `docs/06-testing/artifacts/npm-lint-final-after-e2e-test-drift-fix-2026-05-22.log` |
| `npm.cmd run test:unit` | PASS | 29.53s | `docs/06-testing/artifacts/npm-test-unit-final-2026-05-22.log` |
| `npm.cmd run test:unit:coverage` | PASS command, coverage warning | 31.25s | `docs/06-testing/artifacts/npm-test-unit-coverage-final-2026-05-22.log` |
| `npm.cmd run build` | PASS | 24.44s | `docs/06-testing/artifacts/npm-build-final-2026-05-22.log` |

Coverage summary:

| Metric | Result |
| --- | ---: |
| Statements | 85.91% |
| Branches | 73.59% |
| Functions | 83.97% |
| Lines | 86.88% |

Branch coverage is below the stated 80% policy and remains a production-readiness risk.

## 6. Docker/release-demo result

| Check | Result | Evidence |
| --- | --- | --- |
| `docker compose -p hmsfulltest up --build -d` | PASS after correct isolated port variables | `docker-compose-hmsfulltest-rebuild-after-admin-users-a11y-correct-ports-2026-05-22.log` |
| Backend health | PASS, `UP` | `docker-smoke-hmsfulltest-after-admin-users-a11y-pass-2026-05-22.json` |
| Frontend HTTP | PASS, 200 | same smoke artifact |
| Public departments | PASS, 8 records | same smoke artifact |
| Public doctors | PASS, 4 records | same smoke artifact |
| Staff auth | PASS, `ADMIN` | same smoke artifact |
| Patient auth | PASS, `PATIENT` | same smoke artifact |
| Isolated cleanup | PASS, `hmsfulltest` and `hmsdiag20260521` removed with volumes | `docker-compose-cleanup-final-2026-05-22.log` |

Docker build note: `npm prune --omit=dev` reports 7 vulnerabilities, 5 moderate and 2 high. This is not a demonstrated P0 functional failure, but it blocks a clean production security gate until triaged.

## 7. Playwright result

| Suite | Final result | Duration | Evidence |
| --- | --- | ---: | --- |
| `npm run test:e2e:release-data` | PASS | 3.91s | `playwright-release-data-final-after-audit-filter-2026-05-22.log` |
| `npm run test:e2e:ci` | PASS | 53.01s | `playwright-ci-final-2026-05-22.log` |
| `npm run test:e2e:integrated` | PASS | 96.83s | `playwright-integrated-final-after-audit-filter-2026-05-22.log` |
| `npm run test:e2e:ui` | PASS | 103.01s | `playwright-ui-final-rerun-2026-05-22.log` |
| `npm run test:e2e:visual` | FAIL | 18.52s | `playwright-visual-final-2026-05-22.log` |

Final passing counts:

| Suite | Count |
| --- | ---: |
| CI | 180 passed, 1 skipped |
| Integrated | 90 passed |
| UI | 319 passed, 1 skipped |

Visual result: 14/14 screenshot baselines differ. No baselines were updated because the plan requires intentional visual review before accepting snapshot changes.

## 8. BF-01 to BF-12 status table

| Flow | Final status | Evidence and notes |
| --- | --- | --- |
| BF-01 Public discovery/booking | Passed | Public departments/doctors smoke passed; browser booking flow passed in integrated suite. |
| BF-02 Staff auth/RBAC | Passed | Staff login, logout, role routing, and RBAC enforcement passed across integrated browsers. |
| BF-03 Admin operations | Passed | Admin route/UI/a11y checks passed; admin setup data available. Full destructive CRUD remains outside P0 proof. |
| BF-04 Scheduling/availability | Partial | Booking availability and schedule-template seed checks passed; full schedule maintenance lifecycle was not exhaustively tested. |
| BF-05 Queue/check-in/vitals | Passed | Queue check-in, nurse intake, and vital-signs UI/API path passed. |
| BF-06 Doctor consultation/medical record/prescription | Passed | Doctor queue and medical-record editor checks passed; prescription path is present but not a full dispense workflow. |
| BF-07 Lab results | Partial | Lab route/detail coverage passed in UI smoke; full lab order/result creation lifecycle was not fully executed. |
| BF-08 Patient portal | Passed | Patient login, portal overview/messages/appointments, and patient route guards passed with synthetic patient data. |
| BF-09 Inventory/pharmacy | Partial | Inventory items and seeded movement data are available; end-to-end dispense workflow was not fully executed. |
| BF-10 Finance | Partial | Invoices, pricing, revenue, paid/unpaid seed checks passed; full payment workflow was not fully executed. |
| BF-11 Notifications/reminders | Partial | Follow-up/reminder side effects are seeded/documented; notification delivery was not externally verified. |
| BF-12 Release-demo UAT readiness | Partial | P0 functional demo gate passed; production gate remains blocked by visual, coverage, and dependency-security risks. |

## 9. P0/P1/P2/P3 summary

| Priority | Status | Details |
| --- | --- | --- |
| P0 | Passed | BF-01, BF-02, BF-05, BF-06, BF-08 passed with synthetic data. No unresolved P0 product defect remains from this pass. |
| P1 | Partial | Admin, route contracts, accessibility, and integrated browser suites passed. Lab/admin/finance full CRUD depth is still not exhaustive. |
| P2 | Partial | Search/filter/static/secondary routes passed broad UI checks. Visual baselines failed and require review. |
| P3 | Not fully executed | Nice-to-have UX and snapshot acceptance were not signed off. |

## 10. Failed command logs

| Failure ID | Command/log | Current state | Root cause |
| --- | --- | --- | --- |
| F-01 | `playwright-release-data-final-2026-05-22.log` | Fixed | Test expected an invoice for `Nguyen Van Clinical`, but the release seed gives invoices to other synthetic patients. Test drift. |
| F-02 | `playwright-integrated-final-2026-05-22.log` | Fixed | Same stale finance assertion failed across browsers. |
| F-03 | `playwright-release-data-final-after-finance-assertion-2026-05-22.log` | Fixed | Audit-log assertion assumed seed entries were on page one; later security audit events pushed them down. Test drift. |
| F-04 | `playwright-integrated-final-after-finance-assertion-2026-05-22.log` | Fixed | Same audit-log pagination issue plus transient browser navigation interruptions; rerun passed after filter-backed assertion. |
| F-05 | `playwright-visual-final-2026-05-22.log` | Open | 14 screenshot baseline diffs require visual review before updating baselines. |
| F-06 | `docker-compose-hmsfulltest-rebuild-after-admin-users-a11y-2026-05-22.log` | Fixed | First rebuild used wrong compose variable names and tried to bind Postgres to `5432`; rerun used `HMS_*_HOST_PORT`. Environment/config usage issue. |
| F-07 | `docker-smoke-hmsfulltest-after-admin-users-a11y-2026-05-22.json` | Fixed | First smoke used stale `/api/v1/public/departments` and wrong demo account credentials. Environment/test drift. |

## 11. Affected modules

| Module | Files changed in this hardening pass | Impact |
| --- | --- | --- |
| Backend appointment workflow | `backend/application/src/main/java/com/hospital/core/appointment/AppointmentWorkflowService.java` | Fixed optional-filter query failures for appointment listing. |
| Backend release demo seed | `backend/application/src/main/java/com/hospital/core/seed/ReleaseDemoSeedService.java` | Made patient seeding resilient to email/CCCD natural-key replay cases. |
| Clinical web API/UI | `web/src/lib/clinical-api.ts`, `web/src/app/staff/(app)/nurse-intake/page.tsx`, `web/src/app/staff/(app)/vital-signs/page.tsx` | Connected nurse intake and vital signs to live backend data. |
| Navigation/accessibility | `web/src/components/shells/top-nav.tsx`, `web/src/app/admin/(app)/layout.tsx`, `web/src/app/admin/(app)/users/page.tsx`, `web/src/app/admin/(app)/monitoring/page.tsx`, `web/src/app/staff/(app)/dashboard/page.tsx` | Fixed stale support links and missing accessible names. |
| E2E contracts | `web/e2e/specs/*.ts`, `web/e2e/pages/booking-page.ts`, `web/e2e/helpers/exhaustive-route-contracts.ts` | Removed stale UI/seed assumptions and aligned browser tests with real release-demo data. |
| Runtime config | `docker-compose.yml`, `.env.example`, `web/next.config.ts` | Added isolated CORS/rate-limit configuration and CSP API-origin support. |

## 12. Root cause summary

| Failure ID | Business flow | Priority | Affected module | Browser evidence | Root cause category | Recommended fix | Release gate impact |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RC-01 | BF-02 | P0 | Web auth/CSP/config | Browser/API auth mismatch during earlier UAT | Product/config defect | Add API origin to CSP and align isolated CORS config | Fixed, no longer blocks |
| RC-02 | BF-01 | P0 | Booking test data | Booking reused conflicting synthetic patient identity | Test/seed drift | Generate unique public booking identity and select a real available slot | Fixed, no longer blocks |
| RC-03 | BF-05 | P0 | Nurse intake/vitals UI | Static UI did not complete API-backed workflow | Product defect | Wire nurse intake and vital-signs screens to backend APIs | Fixed, no longer blocks |
| RC-04 | BF-06 | P0 | Appointment listing backend | Doctor/dashboard route had backend listing failure with optional filters | Product defect | Replace null-sensitive repository query with dynamic JPQL filters | Fixed, no longer blocks |
| RC-05 | BF-08 | P0 | Patient portal/test auth | Portal routes needed synthetic patient account and correct token scoping | Test drift plus route guard validation | Use seeded patient persona and verify portal APIs through browser/API | Fixed, no longer blocks |
| RC-06 | BF-03 | P1 | Admin accessibility | Icon-only controls had no accessible names | Product UX defect | Add aria labels to dashboard/admin controls | Fixed |
| RC-07 | BF-10 | P1 | Release-data tests | Finance assertion expected wrong seeded patient | Test drift | Assert actual paid/unpaid seeded invoice contract | Fixed |
| RC-08 | BF-03/BF-11 | P1 | Audit log tests | Audit seed records were hidden by newer security events | Test drift | Query audit logs with `entityType=RELEASE_DEMO&limit=100` | Fixed |
| RC-09 | BF-12 | P2 | Visual baselines | 14 screenshots differ from stored baselines | Visual baseline drift | Human review, then refresh or fix UI | Open, blocks clean visual gate |
| RC-10 | BF-12 | P2 | Frontend coverage | Branch coverage 73.59% | Quality gap | Add branch/error-state tests or waive policy | Open |
| RC-11 | BF-12 | P2 | Dependencies | 7 npm vulnerabilities in production install | Dependency risk | Run `npm audit`, upgrade/remediate packages | Open |

## 13. Environment blockers

| Blocker | Status |
| --- | --- |
| Docker engine availability | Resolved for this pass. |
| WebKit browser availability | Resolved with local Playwright WebKit install before final integrated run. |
| GitNexus `detect_changes` CLI | Still unavailable in the installed CLI surface; impact checks and `gitnexus status` were used instead. |
| Dirty worktree | Preserved. Existing unrelated user-owned changes were not reverted. |
| Compose port collision | Resolved by using `HMS_POSTGRES_HOST_PORT`, `HMS_BACKEND_HOST_PORT`, and `HMS_FRONTEND_HOST_PORT`. |

## 14. Product defects

Fixed during this hardening pass:

| ID | Defect | Status |
| --- | --- | --- |
| PD-01 | Appointment listing failed when optional filters were null in dashboard/doctor workflows. | Fixed and covered by backend tests. |
| PD-02 | Nurse intake and vital signs screens were not fully API-backed for UAT. | Fixed and covered by focused/UI tests. |
| PD-03 | Release-demo seed replay could hit patient natural-key conflicts. | Fixed and covered by `ReleaseDemoSeedIntegrationTest` and full backend verify. |
| PD-04 | Admin/staff icon-only controls had accessibility failures. | Fixed and covered by integrated accessibility tests. |

Open product/security quality risks:

| ID | Risk | Release impact |
| --- | --- | --- |
| OR-01 | Visual baselines failed 14/14. | Blocks clean visual sign-off, not P0 functional demo. |
| OR-02 | Branch coverage is 73.59%. | Blocks strict 80% production coverage policy. |
| OR-03 | npm reports 7 production dependency vulnerabilities. | Blocks clean production security sign-off until triaged. |

## 15. Test drift items

| ID | Drift | Status |
| --- | --- | --- |
| TD-01 | Staff queue expected `Checked in`; current UI/status is `Ready`. | Fixed. |
| TD-02 | Booking wizard assumed first doctor/current date had a slot. | Fixed by selecting the first actual available slot. |
| TD-03 | Route-contract mock for `/api/v1/departments/cardiology` returned wrong shape. | Fixed. |
| TD-04 | Release-data finance assertion expected the wrong seeded patient. | Fixed. |
| TD-05 | Audit-log assertion assumed seed audit entries were on page one. | Fixed with API filter. |
| TD-06 | Visual baselines are stale or intentionally changed. | Open, requires human visual review. |

## 16. Recommended next actions

1. Review the 14 visual diffs in `web/test-results` and decide whether current UI is intended. Only then update snapshots or fix layout regressions.
2. Run `npm audit` and remediate the 5 moderate and 2 high dependency vulnerabilities reported by the Docker frontend build.
3. Add targeted frontend branch tests around admin, inventory, lab results, portal, clinical API error paths, and stored-role branches to raise branch coverage above 80%.
4. Decide whether BF-04, BF-07, BF-09, BF-10, and BF-11 require deeper end-to-end CRUD/action tests before production.
5. Re-run `gitnexus detect_changes` if the installed GitNexus CLI gains that command; current CLI did not expose it.

## 17. Release-readiness conclusion

**Demo readiness for P0 functional UAT: PASS.**

The system can be demonstrated with synthetic/release-demo data for public booking, staff login/RBAC, queue and intake, doctor consultation/medical record, and patient portal workflows.

**Production readiness: FAIL/PARTIAL.**

Do not call the system production-ready until the visual baseline review, frontend branch coverage gap, and npm dependency vulnerabilities are resolved or explicitly accepted by the release owner.
