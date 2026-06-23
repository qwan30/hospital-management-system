# HMS Interview-Ready Cleanup And Security Hardening

  ## Summary

  - Goal: make HMS credible for interviewer review by restoring green gates,
    hardening security, improving readability, and cleaning files that do not
    belong in the project.

  - Baseline: dirty worktree, branch ahead by 1 commit, backend mvn verify fails
    on JaCoCo, frontend lint fails, frontend unit coverage passes but branch
    coverage is below 80%.

  - Run GitNexus or supported impact analysis before editing target symbols.

  ## Key Changes

  - Restore gates first:
      - Fix frontend lint without weakening ESLint.
      - Fix backend JaCoCo with focused infrastructure tests.
      - Re-run backend/frontend gates before deeper cleanup.

  - Harden security:
      - Stop storing access tokens in sessionStorage; use in-memory tokens plus
        httpOnly refresh cookies.

      - Add origin/CSRF-style protection for cookie-backed refresh/logout/claim
        flows.

      - Gate Swagger/OpenAPI and Prometheus behind auth or explicit demo/local
        flags.

      - Externalize demo/default passwords and protect demo seeding outside dev/
        demo.

  - Clean unnecessary files:
      - Audit tracked artifacts with git ls-files and reference search before
        deletion.

      - Remove stale local/runtime files such as stack dumps, frontend/
        ts_errors.txt, .codegraph/daemon.pid, old logs, one-off refactor scripts,
        and unused local report files.

      - Remove or relocate raw screenshot capture folders like screen-demo/,
        frontend/screenshot-each-page/**, and frontend/screenshots/*_init.png
        when not referenced by docs/tests.

      - Keep intentional assets: README/docs screenshots, Playwright visual
        baselines, public images, and any file referenced by docs or automated
        tests.

      - Tighten .gitignore, frontend .gitignore, and .dockerignore so these files
        do not return.

  - Improve readability:
      - Refactor noisy files after gates are green: api-client, top-nav, admin
        inventory/support, and largest staff/admin pages.

      - Extract shared badges, empty/error states, export helpers, and dashboard
        sections.

  ## Comment Policy

  - Add concise reader-support comments for every touched or newly extracted
    production function, method, React component, hook, and important helper.

  - Comments should explain intent, inputs/outputs, side effects, security
    assumptions, or workflow role.

  - Avoid comments that merely repeat obvious code.
  - Prioritize comments in security, auth, PHI, domain workflow, and shared
    utility code.

  ## Test Plan

  - Required gates: mvn.cmd verify, npm run lint, npm run test:unit:coverage, npm
    run build.

  - Security tests: refresh/logout origin rejection, cookie attributes, no
    refresh token in JSON, no access token in durable browser storage, gated
    Swagger/Prometheus.

  - Cleanup checks: git status, git diff --check, tracked-artifact scan, docs/
    test reference scan for deleted files.

  - Final smoke: Docker Compose config validation and targeted Playwright auth/
    portal/admin/staff flows.

  ## Assumptions

  - Do not commit or push until explicitly requested.
  - Preserve unrelated dirty worktree changes.
  - Treat repo as interview-ready/release-candidate, not unconstrained
    “Production Ready,” unless full verification and waivers are resolved.