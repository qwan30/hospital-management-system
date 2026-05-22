# HMS Visual Gate Review Decisions - 2026-05-22

## Context

- Browser stack: isolated Docker Compose project `hmsprod20260522`.
- Frontend: `http://localhost:13002`.
- Backend: `http://127.0.0.1:18083`.
- Data: synthetic release-demo seed only.
- Baseline failure reproduced: `npm run test:e2e:visual` failed 14/14 before acceptance.
- Evidence folders:
  - `expected/actual/diff`: `docs/06-testing/artifacts/visual-production-readiness-2026-05-22/`
  - live-stack screenshots: `docs/06-testing/artifacts/visual-production-readiness-2026-05-22/live-stack/`

## Harness Stabilization

| Change | Reason | Risk |
| --- | --- | --- |
| Freeze Playwright visual clock for every visual route, not only `/staff/queue`. | Several pages derive dates from `new Date()`, so screenshots drift as calendar date changes. | Low; GitNexus impact for `roleForVisualRoute` was LOW and scope is visual spec only. |

## Route Decisions

| Route | Visual label | Classification | Evidence | Decision |
| --- | --- | --- | --- | --- |
| `/` | home | Browser/environment issue plus accepted current render | Diff was 0.01% pixels; live stack clean, no console/network errors. | Update snapshot. |
| `/booking` | booking | Intended UI change | Current booking page is taller with current form/sidebar summary; live stack clean. | Update snapshot. |
| `/staff/dashboard` | staff dashboard | Intended UI change | Current Hospital Core staff dashboard layout is clean; live stack clean. | Update snapshot. |
| `/staff/doctor/dashboard` | doctor dashboard | Intended UI/API-backed data change | Mocked visual state is empty; live stack shows seeded appointments correctly. | Update snapshot; keep live evidence. |
| `/staff/nurse-intake` | nurse intake | Intended UI/API-backed data change | Mocked visual state is empty; live stack shows seeded intake rows correctly. | Update snapshot; keep live evidence. |
| `/staff/medical-records/1/edit` | medical record edit | Test-route/live-data mismatch | Mocked visual route renders editor; live stack returns 400 for placeholder appointment id `1` because backend expects UUID. | Update snapshot for mocked visual route; document live warning, not a P0 product regression. |
| `/portal/overview` | portal overview | Intended UI/data spacing change | Live stack clean with seeded patient overview. | Update snapshot. |
| `/admin/users` | admin users | Intended UI/data change | Mocked visual state is empty; live stack shows seeded admin users. | Update snapshot; keep live evidence. |
| `/staff/login` | staff login | Intended UI change | Staff login redesigned to Hospital Core clinical suite layout; live stack clean. | Update snapshot. |
| `/portal/login` | portal login | Intended UI change | Patient portal login redesigned to Hospital Core layout; live stack clean. | Update snapshot. |
| `/staff/queue` | staff queue | Intended UI/data change | Mocked queue state differs from old baseline; live stack shows seeded queue rows. | Update snapshot. |
| `/staff/inventory` | staff inventory | Intended UI/data change | Visual mock and live stack both render cleanly; live stack has more seeded rows. | Update snapshot. |
| `/portal/appointments` | portal appointments | Intended UI/data change | Mocked visual empty state differs from live seeded appointments; live stack clean. | Update snapshot; keep live evidence. |
| `/admin/dashboard` | admin dashboard | Intended UI/dashboard expansion | Current dashboard is taller and more detailed; live stack clean. | Update snapshot. |

## Verification

| Command | Result | Evidence |
| --- | --- | --- |
| `npm run test:e2e:visual` before acceptance | FAIL, 14/14 | `playwright-visual-hmsprod20260522-current-baseline-2026-05-22.log` |
| Live-stack browser screenshot pass | PASS, 14 captured, 0 navigation failures | `live-stack/live-stack-visual-manifest.json` |
| `npm run test:e2e:visual -- --update-snapshots` | PASS, 14 regenerated | `playwright-visual-update-snapshots-2026-05-22.log` |
| `npm run test:e2e:visual` after snapshot update | PASS, 14/14 | `playwright-visual-after-snapshot-update-2026-05-22.log` |

## Open Follow-Up

The visual route `/staff/medical-records/1/edit` is valid only under API mocks. A live-stack route should use a seeded UUID appointment id if future browser-only visual evidence is required without mocks.
