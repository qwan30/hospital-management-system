# Frontend Unified UI Implementation Context

## Objective

Implement `implementation_plan.md.resolved` for the `frontend/` frontend so Admin, Staff, Portal, and Public surfaces use the Hospital Core visual system consistently.

## Locked Decisions

- Authenticated Admin, Staff, and Portal pages use the shared Hospital Core topbar and light sidebar shell.
- Authenticated pages do not render the public footer.
- Public pages keep the public experience but align to Hospital Core tokens and branding.
- Material Symbols usage is removed from runtime UI in favor of Lucide-backed `HcIcon`.
- Visual tests seed role sessions and API mocks before screenshot capture.
- The staff queue visual route freezes only its live wait-duration clock; the rest of the visual suite uses real page time to avoid public booking SSR/client clock mismatch.

## Verification

- `npm.cmd run lint`: pass with two pre-existing warnings in `frontend/screenshot-each-page/capture.js`.
- `npm.cmd run test:unit`: 332 passed.
- `npm.cmd run build`: pass.
- Chromium E2E CI spec set with `--workers=1`: 167 passed, 1 skipped.
- Chromium visual update: 14 passed.
- Chromium visual no-update rerun: 14 passed.
- Brand/icon residue scan found only negative `About MedCore` assertions in public-content tests.

## External Blockers

- Docker Desktop Linux engine was unavailable for backend Testcontainers and docker compose build gates.
- Beads DB-backed Khuym review/compounding is unavailable in this checkout.
- GKG CLI/server is unavailable; GitNexus CLI was used where possible, but this installed CLI does not expose `detect_changes`.
