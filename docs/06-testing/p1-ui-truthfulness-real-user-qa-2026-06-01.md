# P1 UI Truthfulness Real-User QA - 2026-06-01

## 1. Test Plan

**Scope:** HMS `frontend/` P1 UI truthfulness and destructive-action safety slice after waiver closure.

**Critical journeys covered:**

- Public discovery: news read/archive actions and doctors footer links.
- Auth entry: staff and patient forgot-password actions.
- Admin operations: dashboard drilldowns, support, pricing, appointments pagination, audit-log pagination.
- Staff support: unsupported ticket submission.
- Destructive safety regression: user/dept/room deactivate, slot block/delete, queue skip/complete, invoice void.

**Done criteria:**

- No enabled `href="#"` controls in `frontend/src/app`.
- Unsupported visible actions are disabled with truthful copy or routed to a real screen.
- Dangerous actions listed in the P1 plan require explicit browser confirmation.
- Priority UI routes pass real browser checks with no unfiltered console errors and no 4xx/5xx app/API requests.
- Playwright regression writes a full actionable-control manifest and fails on enabled fake/hash-link controls.

## 2. Execution Log

| Step | Result | Evidence |
| --- | --- | --- |
| GitNexus impact checks | PASS/LOW for edited indexed page symbols; login source symbols were not resolved by the local index, so edits were kept to markup-only truthfulness | CLI `impact`/`query` output during implementation |
| Source scan for hash links | PASS | `rg 'href="#"' frontend/src/app frontend/src/components` returned no matches |
| Focused component tests | PASS, 32 tests | Admin users/departments/rooms/slots and staff queue/invoices confirmation tests |
| Playwright UI truthfulness spec | PASS, 2 tests | `npx.cmd playwright test e2e/specs/ui-truthfulness.spec.ts --project=chromium` |
| Actionable-control manifest | PASS, 0 bugs | `frontend/test-results/actionable-control-manifest/summary.md` |
| Real-user browser pass | PASS, 23 checks, 11 screenshots | `frontend/test-results/real-user-browser-qa-2026-06-01/summary.md` |

## 3. Bug Report

| ID | Title | Severity | Area | Status | Fix |
| --- | --- | --- | --- | --- | --- |
| UI-P1-001 | Public news read/archive controls implied unsupported detail/archive flows | Major | Public news | Fixed | Replaced with disabled truthful actions |
| UI-P1-002 | Doctors footer used enabled hash links | Major | Public doctors | Fixed | Routed privacy/terms to real pages and disabled admin contact |
| UI-P1-003 | Staff/patient forgot-password links used `href="#"` without reset API | Major | Auth | Fixed | Replaced with disabled reset-unavailable buttons |
| UI-P1-004 | Admin dashboard contained static visual actions | Major | Admin dashboard | Fixed for priority controls | Routed monitoring/inventory/audit and disabled unsupported settings/chart controls |
| UI-P1-005 | Admin appointments/audit-log pagination used fake hash links | Major | Admin operations | Fixed | Replaced with disabled pagination controls |
| UI-P1-006 | Support and admin pricing actions implied unsupported backend behavior | Major | Support/pricing | Fixed | Disabled unsupported create/export/drilldown/delete actions |
| UI-P1-007 | Destructive operations lacked explicit confirmation | Major | Admin/staff operations | Fixed | Added `window.confirm` gates and unit coverage for listed actions |

## 4. UX Review

- Unsupported actions now communicate their state in-place instead of allowing dead clicks.
- Public pages no longer expose fake footer or article links.
- Admin dashboard drilldowns behave like navigation, not decorative controls.
- Browser `confirm` is acceptable for this hardening slice, but a first-class modal confirmation pattern should replace it before a polished production UX claim.
- The actionable-control manifest still lists 363 enabled controls as `needs review`; those are not flagged as fake/hash-link bugs, but they need flow-specific click validation before an unconstrained production claim.

## 5. Technical Findings From Browser QA

- Chrome-headed real-user pass: 23 checks passed.
- Unfiltered console errors: 0.
- 4xx/5xx app/API requests: 0.
- Screenshots saved under `frontend/test-results/real-user-browser-qa-2026-06-01/`.
- Chrome DevTools MCP/extension was unavailable in this session, so the browser pass used Playwright launching the installed Chrome channel in headed mode.

## 6. Playwright Regression Plan

- Keep `frontend/e2e/specs/ui-truthfulness.spec.ts` in the UI suite.
- The priority-route test asserts specific disabled/routed controls.
- The manifest test crawls all route contracts, writes `manifest.json` and `summary.md`, and asserts there are no enabled fake/hash-link controls.
- Future P1 slices should reduce the `needs review` count by adding route-specific click tests or disabling unsupported controls.

## 7. Fix Plan

Completed in this slice:

- Public news, doctors footer, auth reset, admin dashboard, appointments/audit pagination, support pages, admin pricing delete.
- Destructive confirmations for user deactivate, department deactivate, room deactivate, slot block/delete, queue skip/complete, and invoice void.
- Local CSV export for admin users/departments/rooms/pricing where data is already loaded.

Remaining:

- Product decisions for patient cancel/reschedule, portal message writes, record print/export, and support-ticket APIs.
- Audit-log export/filter dropdown behavior.
- Staff booking sub-step and vital-sign action verification.
- Clinical signed-record/addendum policy and drug/allergy interaction scope.

## 8. Final Verdict

**Ship with fixes / Release Candidate remains correct.**

This P1 slice removes the verified fake/hash-link controls from the audited route set and adds destructive confirmations, but the wider product/safety backlog is not fully closed.
