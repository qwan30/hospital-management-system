# Frontend UI After Updated Login Foundation Context

## Objective

Apply the `web/screenshot-each-page/UI-after-updated` visual direction and `docs/design_system.md` tokens to the `web/` frontend without reverting unrelated dirty-tree work.

## Locked Decisions

- Treat PNGs as the visual target where a screen is clear; use `docs/design_system.md` for shared Hospital Core tokens, spacing, shell behavior, and operational density.
- Keep the implementation contract-backed; do not replace working pages with static screenshots or fake data.
- Use Lucide icons and existing app components rather than reintroducing Material Symbols.
- Staff Login is the first concrete parity target because it clearly differed from the updated PNG set.
- The updated PNG folder contains mixed authenticated shell variants, so continue future pages in small role/page groups instead of a blind global rewrite.

## Completed

- Refreshed `web/src/app/staff/(auth)/login/page.tsx` to the centered Hospital Core card, cyan cross brand mark, blue/white clinical background, accessible labels, emergency access action, and status/version tiles.
- Refined `web/src/app/staff/(auth)/login/page.tsx` for real browser viewport height by widening inner card padding, tightening vertical rhythm, adding a compact `max-height:860px` layout mode, and making the bottom compliance footer readable over the blue background.
- Reworked the same route background to match `staff_login.png` more closely: darker-to-light clinical blue left field, subtle curved linework, and a faded hospital-corridor scene on the right instead of the previous abstract grid.
- Reduced the same route for 100% browser zoom without `transform: scale`: card max-width `540px`, card padding `32-40px`, title `34px`, subtitle `15px`, inputs `48px`, primary button `50px`, card icon `48px`, block gaps around `20px`, and footer text `12px`.
- Extended `web/src/app/globals.css` with missing Hospital Core token aliases used by the updated designs.
- Aligned `web/src/components/shells/public-top-nav.tsx` and `web/src/components/shells/top-nav.tsx` with the updated brand/action icon direction and role-aware profile text.
- Fixed the `web/src/app/staff/(app)/schedule/page.tsx` React lint blocker around initial schedule loading while preserving existing page behavior.

## Verification

- `npm.cmd run lint`: pass with 17 warnings and 0 errors.
- `npm.cmd run test:unit -- "src/app/staff/(auth)/login/__tests__/page.test.tsx" "src/components/shells/__tests__/public-top-nav.test.tsx" "src/components/shells/__tests__/top-nav.test.tsx"`: 11 passed.
- `npm.cmd run build`: pass.
- `npx.cmd playwright screenshot --browser=chromium --viewport-size=1672,941 http://localhost:3000/staff/login C:\Users\NITRO\AppData\Local\Temp\hms-staff-login-reference-final.png`: pass.
- `npx.cmd playwright screenshot --browser=chromium --viewport-size=1524,792 http://localhost:3000/staff/login C:\Users\NITRO\AppData\Local\Temp\hms-staff-login-compact-final.png`: pass.
- `npx.cmd playwright screenshot --browser=chromium --viewport-size=1672,941 http://localhost:3000/staff/login C:\Users\NITRO\AppData\Local\Temp\hms-staff-login-same-bg-reference-v2.png`: pass.
- `npx.cmd playwright screenshot --browser=chromium --viewport-size=1524,792 http://localhost:3000/staff/login C:\Users\NITRO\AppData\Local\Temp\hms-staff-login-same-bg-compact-v2.png`: pass.
- `npx.cmd playwright screenshot --browser=chromium --viewport-size=1920,1080 http://localhost:3000/staff/login C:\Users\NITRO\AppData\Local\Temp\hms-staff-login-1920-1080-100pct.png`: pass.
- `npx.cmd playwright screenshot --browser=chromium --viewport-size=1905,990 http://localhost:3000/staff/login C:\Users\NITRO\AppData\Local\Temp\hms-staff-login-1905-990-100pct.png`: pass.
- `npm.cmd run test:unit`: 35 passed files, 11 failed files, 345 passed tests, 20 failed tests outside this edited login/top-nav slice.
- `npx.cmd playwright screenshot --browser=chromium --viewport-size=1672,941 http://127.0.0.1:3110/staff/login C:\Users\NITRO\AppData\Local\Temp\hms-staff-login-after-refined.png`: pass.
- `npx.cmd gitnexus status`: index up-to-date at commit `60eada8`.

## External Blockers

- Installed GitNexus CLI does not expose `detect_changes`; use `gitnexus status`, graph impact checks, and git diff scope unless MCP tools become available.
- Playwright MCP browser is blocked by the missing Chrome Playwright extension in this profile; CLI screenshot works.
- Full unit suite has unrelated accessibility/name and content assertion failures in admin CRUD, lab-result detail, inventory, slots, and medical-record tests.
