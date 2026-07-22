# HMS Production Readiness — Mario E2E Task Ledger

Branch: `codex/production-readiness-e2e-20260721-next`  
Base: `716d56de11ac05653bd11caeb2089f0c363cd609` (`origin/master`)  
Workspace: normal checkout; Git worktrees are prohibited by user instruction.  
Current release verdict: **DO NOT SHIP**.

## Global gates

- Preserve `.codegraph/daemon.pid`, `.instructions.md`, `AGENTS.md`, `CLAUDE.md`, and `interview/` unless the user explicitly assigns them.
- Run GitNexus upstream impact before every symbol edit; stop and warn on HIGH or CRITICAL risk.
- Use RED → GREEN → REFACTOR for every behavior change.
- Require zero open P0/P1 findings. P2 findings require an owner, mitigation, and expiry-bound waiver.
- Require frontend and backend line and branch coverage of at least 80%.
- Certify one immutable commit SHA; no merge, deploy, or release is performed by agents.

## Phase 0 — Discovery and baseline

- [x] Refresh GitNexus index and inspect live source.
- [x] Run frontend lint, unit coverage, and production build.
- [x] Run Docker-backed backend `mvn verify`.
- [x] Record security, CI/CD, dependency, clinical-safety, and runtime findings.

## Phase 1 — Design and scheduling

- [x] Complete architecture, planning, council, and independent design review.
- [x] Obtain explicit user approval to resume the saved Khuym handoff.
- [x] Commit and push inherited changes to `master`; start a new normal branch.
- [x] Maintain issue-sized implementation plans under `docs/superpowers/plans/`.

## Phase 2 — Branch and evidence controls

- [x] Use `codex/production-readiness-e2e-20260721-next` without a worktree.
- [ ] Keep a clean, attributable release-affecting diff.
- [ ] Run staged and full-branch GitNexus `detect-changes` before every commit.

## Phase 3 — TDD remediation

- [x] P0: reject staff refresh tokens after user deactivation.
- [x] P0: enforce treatment-relationship scope for patient-record and AI patient PHI; lab-result scope remains a separate follow-up slice.
- [ ] P0: make demo seeding and known credentials fail closed outside explicit demo profiles.
- [ ] P1: secure patient account claim against takeover, replay, enumeration, and brute force.
- [ ] P1: enforce support-ticket list/export authorization.
- [ ] P1: make CI/CD scans, image publication, and Flyway migration fail closed.
- [ ] P2: remove production dependency vulnerabilities and restore 80% branch coverage.
- [ ] Clinical/product: implement only policies approved by the release owner; otherwise retain NO-GO blockers.

## Phase 4 — Adversarial review

- [ ] Per task: implementer self-review plus independent spec and code-quality review.
- [ ] Whole branch: code reviewer, Santa adversarial review, bug hunter, and two independent reviewers.
- [ ] Resolve every Critical/Important and every P0/P1 finding before proceeding.

## Phase 5 — Production certification

- [ ] Backend unit/integration/coverage with real PostgreSQL/Testcontainers.
- [ ] Frontend lint/unit/coverage/build with at least 80% line and branch coverage.
- [ ] Real-stack Playwright across supported browsers, RBAC, accessibility, and critical clinical paths.
- [ ] SAST, SCA, secret scan, authorized disposable DAST, SBOM, and provenance.
- [ ] Clean-install/upgrade migration, injected migration failure, backup/restore, rollback/forward-fix rehearsal.
- [ ] Exact-SHA evidence report and final Production Ready or DO NOT SHIP verdict.
