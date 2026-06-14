# Stabilization Readiness Audit - 2026-05-13

## Verdict

Continue development, but keep the next slice in stabilization mode until Docker-backed verification is refreshed and the review remediation gates stay green.

The repository is not in a stop-and-rewrite state. The frontend unit/build gates and CI Playwright route/API smoke suite were green in the first stabilization pass. Backend integration readiness is blocked, not green, because Docker Desktop is not reachable from this shell; Testcontainers-backed coverage was skipped and `docker compose build backend frontend` could not run.

## Workflow Gates

- Khuym onboarding gate: applied and reported `up_to_date`.
- Khuym status: onboarding complete; after remediation, local state records `review-remediation-complete-docker-blocked`.
- GKG: supported but not reachable/indexed in this shell, so this pass used GitNexus plus direct repository inspection.
- GitNexus status: current index at commit `9ae36bf`, current commit `9ae36bf`.
- GitNexus impact before runtime API-client edit: `getApiBaseUrl` risk LOW; direct affected caller `apiRequest`.
- GitNexus CLI limitation: this local CLI exposes `status`, `query`, `context`, `impact`, and `cypher`, but no `detect-changes` command. Final scope check used GitNexus `status`, `git diff --check`, `git diff --name-status`, and `git status --short`.

## Fixes Applied

- Aligned active API defaults to backend port `8081` in `.env.example`, CI env, `frontend/Dockerfile`, the web API client fallback, E2E backend helper, and active docs.
- Removed insecure dev fallback defaults for database password, JWT secret, and patient identifier secret from `backend/start/src/main/resources/application-dev.yml`; dev now requires environment-provided values.
- Cleaned generated backend output files from the worktree and added ignore rules for `backend/start/test_output*.txt` and `backend/start/startup-log.txt`.
- Fixed newly added Playwright spec lint issues by replacing `any` metric casts with a typed layout-shift entry shape and removing unused fixtures/variables.
- Excluded generated `frontend/coverage/**` from ESLint so lint output reflects source files.

## Verification Results

| Gate | Result | Evidence |
| --- | --- | --- |
| `git diff --check` | Pass | no whitespace errors after cleanup |
| `npx.cmd gitnexus status` | Pass | index up to date at `9ae36bf` |
| `mvn.cmd -pl start -am -DskipTests=false test` from `backend/` | Blocked for integration confidence | build success; 80 application tests passed; start module reported 144 tests, 140 skipped because Testcontainers could not find a valid Docker environment |
| `npm.cmd run lint` from `frontend/` | Pass | ESLint completed without warnings after `coverage/**` ignore |
| `npm.cmd run test:unit` from `frontend/` | Pass | 16 test files, 177 tests passed |
| `npm.cmd run build` from `frontend/` | Pass | Next.js production build completed; 65 app routes generated, including `/robots.txt` and `/sitemap.xml` |
| `npm.cmd run test:e2e:ci` from `frontend/` | Pass | 167 Chromium Playwright tests passed, 1 HTTPS ingress test intentionally skipped |
| `npm.cmd run test:e2e:visual` from `frontend/` | Pass | 14 Chromium visual snapshots passed after baseline refresh |
| `node .codex\khuym_status.mjs --json` | Pass with known missing optional tools | 19 Khuym skills detected; `br`, `bv`, and `node` found; `cass`, `cm`, and `gkg` remain unavailable |
| `docker compose build backend frontend` | Blocked | Docker Desktop Linux engine pipe `//./pipe/dockerDesktopLinuxEngine` was unavailable |

## Review Remediation

The Khuym reviewing pass found two P1 issues:

- Khuym shell guardrails were Unix/Bash-focused. The local hook now also matches PowerShell-oriented shell tool names and detects common PowerShell write commands such as `Set-Content`, `Out-File`, `Copy-Item`, `Move-Item`, and `Remove-Item`.
- Security, SEO, and performance specs created false confidence. Security and SEO specs now assert real local contracts; the performance spec is explicitly exploratory and skipped until stable Web Vitals instrumentation is added.

The visual suite is scoped to Chromium because WebKit/Mobile Safari binaries and maintained baselines are not present in this environment.

## Remaining Work

1. Start Docker Desktop and rerun:
   - `mvn.cmd -pl start -am -DskipTests=false test`
   - `docker compose build backend frontend`
2. Review and stage the current stabilization slice, including Khuym onboarding files, docs updates, E2E additions, visual snapshots, and runtime config corrections.
3. After commit, rerun `npx.cmd gitnexus analyze` to refresh the index.
4. Treat the Playwright webserver LCP hints as a performance follow-up if this release needs above-the-fold image tuning.

## Next Development Decision

Do not stop the project. Continue after the Docker-backed gates are green. Until then, avoid adding new product scope; focus only on verification, cleanup, and release-readiness fixes.
