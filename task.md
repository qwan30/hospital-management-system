# HMS Interview-Readiness — Mario E2E Task Ledger

Run: interview release-readiness remediation
Branch: `master` @ `c95a1ca` (fast-forwarded from `origin/master`; PR #32 patient-modal already merged)
Workspace: normal checkout. Worktree planned for Phase 2 (`sandbox/interview-hardening`).
Release verdict: **NOT CERTIFIED — P0 open.** Agents do not merge, deploy, or release.

> Supersedes the previous ledger, which pointed at the stale `codex/production-readiness-e2e-20260721-next`
> branch. Note: this file being tracked at repo root with a "DO NOT SHIP" line is itself finding **P0-4**.

## Global gates

- Zero open P0/P1 before certification. P2 needs owner + mitigation + expiry-bound waiver.
- RED → GREEN → REFACTOR for every behavior change (no fix without a failing test first).
- Run GitNexus/codegraph impact before editing any symbol; stop and warn on HIGH/CRITICAL.
- Every executing sub-agent is paired with reviewers per phase (3 in Phase 3, 2 extra in Phase 4).
- Preserve `.codegraph/daemon.pid`, `.instructions.md`, `AGENTS.md`, `CLAUDE.md`, `interview/`.
- Certify one immutable commit SHA. No merge.

## Environment prerequisites (checked)

| Item | State |
|---|---|
| Playwright binary | ✅ present (`frontend/node_modules/.bin/playwright`) |
| Docker engine | ✅ **UP** (28.5.1) — started this session |
| Postgres container | ✅ `infra-postgres-1` **healthy** |
| Stale worktree | ✅ pruned |
| Orphan containers | ⚠️ `infra-nginx-1`, `infra-worker-1`, `infra-redis-1` — compose reports orphans; `--remove-orphans` when convenient |

## PR #33 — CI status (verified, not assumed)

Branch `fix/interview-readiness-p0` → `master`. **OPEN / MERGEABLE.**

All functional gates **SUCCESS**: Backend Maven verify · Frontend lint, test, build & E2E ·
CodeQL (java-kotlin + javascript-typescript) · Gemini AI Review · SonarCloud analysis job · CI summary.

One **FAILURE — "SonarCloud Code Analysis" quality gate — is PRE-EXISTING, not caused by this PR.**
Queried both gates directly rather than guessing:

| Condition | PR #33 | `master` baseline |
|---|---|---|
| `new_coverage` (threshold 80) | **0.0 → ERROR** | **22.3 → ERROR** |
| new_reliability / security / maintainability rating | OK | OK |
| new_duplicated_lines_density | OK (0.0) | OK (1.1) |
| new_security_hotspots_reviewed | OK (100) | OK (100) |

`master` fails the identical condition, so the gate was already red before this branch existed.
Note the inconsistency this exposes, which is the same theme as the coverage finding in the audit:
**SonarCloud demands 80% new-coverage while the enforced build gates are JaCoCo 40% / vitest 40-35.**
Worth reconciling — either lower Sonar's gate to match reality or raise the build gates — but it is
its own work item, not part of this PR. Logged as P2.

## Committed work

Branch **`fix/interview-readiness-p0`**, commit **`5beac10`** (branched off `master` @ `c95a1ca`; **not merged**).
4 files, +32/−9. AI-tooling churn deliberately excluded from the commit.

Fail-closed verification (P0-1), all **PASS**:
- `secret: ${JWT_SECRET}` present, no `${JWT_SECRET:` fallback ⇒ unresolvable when unset ⇒ Spring aborts startup
- `password: ${POSTGRES_PASSWORD}` present, no fallback
- `clean-disabled: true`
- hardcoded literal `this-is-a-very-secure-secret-key-123456` **gone**
- `SecurityConfigurationDefaultsTest`: **5 tests, 0 failures, 0 errors**

## Phase 0 — Discovery & scan  ✅ COMPLETE

Evidence: 3 parallel audit agents + personal verification of every P0/P1 against source.
Two subagent claims were **rejected on verification** and are recorded as corrections:
- "34 RBAC permissions" → the *count* is right (34) but via a different route than reported;
  36 `entry(` matches minus the 2 at `RbacAuthorizationService.java:75-76`, which are the helper
  method's own definition. README's "36" is therefore **overstated**.
- "dependabot actively targets a dead `web/` dir" → **false**; `.github/dependabot.yml` targets only
  `/frontend`, `/backend`, `/`. The `web/` items are dead leftover *branches*.

## Phase 1 — Design & scheduling  🔄 IN PROGRESS

- [x] Findings triaged into P0/P1/P2 (see `C:\Users\NITRO\.claude\plans\checkout-v-main-and-logical-tiger.md`)
- [x] Design reviewer 1 — BOLA/authz: **DO NOT IMPLEMENT AS PROPOSED** (verdict accepted)
- [x] Design reviewer 2 — config/secrets: GO on 1a/1b/1c, **NO-GO on `.env.example` passwords**
- [x] Design reviewer 3 — frontend mock-UI: 3 factual errors found, 1 would break green CI
- [x] Corrections folded in; all 3 reviewers rejected part of the original design

### ⚠️ Phase-1 design corrections (my original plan was WRONG — personally re-verified)

**C1 — Nurse lockout (CRITICAL regression that the original plan would have shipped).**
Plan said "apply the existing `requireReadAccess` to vitals + lab endpoints." Verified false-safe:
`RbacAuthorizationService.java:36,38,39` grants `LAB_RESULT_READ`, `VITAL_SIGNS_READ`, `VITAL_SIGNS_WRITE`
to **NURSE**, but `hasReadAccess` (`PatientRecordService.java:163-169`) allows only ADMIN + DOCTOR.
Verbatim application ⇒ **every nurse gets 403**; nurse intake (the front door of the clinical flow) stops.
→ Need a separate `hasClinicalAccess` with a NURSE arm (scoped to patients with an active
CHECKED_IN/IN_PROGRESS appointment). **Requires owner sign-off — it is a clinical-policy decision.**

**C2 — The fix as scoped would not have closed the hole.** `AppointmentController.java:133-146` exposes
**duplicate unguarded vitals routes** (`POST`/`GET /appointments/{id}/vital-signs`), and
`frontend/src/lib/clinical-api.ts:200,217` calls *those*, not `VitalSignsController`. Patching only
`VitalSignsController` leaves the vulnerability fully exploitable while appearing fixed.
Scope grows 4 → 6+ endpoints (also `GET/POST /{id}/follow-up`, `AppointmentController.java:148-161`).

**C3 — PUT/DELETE vitals key on `vitalSignId`, not `appointmentId`** (`VitalSignsController.java:43,49`)
⇒ two-hop resolution. `VitalSignsService.deleteVitalSigns:70` uses `existsById` and never loads the
entity, so it **cannot** be guarded without switching to `findById` first.

**C4 — Enumeration oracle.** Resolution must precede the check, so a naive `NotFoundException` gives a
404/403 split — an existence oracle over the **national-ID keyspace** on the endpoint that returns
plaintext CCCD. Order must be: resolve (don't throw) → check → *response-identical* failure → then 404.
Project convention already exists: test named `unrelatedDoctorCannotReadPatientDetailOrProbeExistence`.

**C5 — Read-scope ≠ write-scope.** `LAB_RESULT_WRITE` excludes NURSE while `_READ` includes it, so the
permission layer already distinguishes them; the object layer must too. DELETE needs stricter handling:
vitals delete is a **hard, unaudited delete** while lab delete is a soft delete.

**C6 — Seed failure is a HARD CRASH, not a silent skip.** `SeedDataConfiguration.java:15-18` invokes the
seed from a **`CommandLineRunner`** ⇒ exception propagates out of `SpringApplication.run()` and the JVM
exits non-zero, *after* Flyway has migrated. So P0-3's real symptom is "app won't start", which raises
its severity from cosmetic to an availability defect.

**C7 — Do NOT put demo passwords in `.env.example`** (it is tracked/committed; permanent scanner noise +
erodes the deliberate fail-closed design). Ship a separate tracked `.env.demo.example` instead, and add
`.env.demo` to `.gitignore` (`.env.*.local` does **not** match it). Keep `.env.example` at
`ENABLED=false` — `SecurityConfigurationDefaultsTest.java:47` pins the compose default; **fix README:326
instead**, and drop `hospital_pass` from README:327.

**C8 — A guard test pins these YAML patterns.** `SecurityConfigurationDefaultsTest.java:18-23` asserts
`application.yml` contains `secret: ${JWT_SECRET}` and **no** `${VAR:fallback}` forms. So the dev-profile
fix must use no-fallback syntax, and the test should be **extended to cover `application-dev.yml`** —
that is the durable fix; the YAML edit alone is one-time cleanup.

**C9 — The dev JWT literal also causes a config-precedence bug:** `run.ps1:33-41` already *requires*
`JWT_SECRET`, so today the hardcoded literal silently **overrides the operator's real secret**.
Removing it fixes that too. Regression surface for making it mandatory: **empty** — no test loads the
`dev` profile (only `production`/`test`), and all 3 runtime entry points already supply the var.

**C10 — No history rewrite.** Literal is dev-only in 3 commits + 8 branches; prod always required
`${JWT_SECRET}`. Deletion suffices; rewriting would break 5 open Dependabot PRs for a zero-value string.

**C11 — RESOLVED, not currently reachable (verified).** `application-dev.yml:36` and `run.ps1:46` do force
`HMS_NON_BILLING_DEMO_SEED_ENABLED=true`, and `NonBillingDemoSeedProperties:82-87`
`requireConfiguredPassword()` does throw on a blank password. **But** its only caller
`SeedDataService.seedNonBillingDemoDataIfEnabled():463` is reached only *after*
`seedIfEmpty()` passes its own gate, and `initial-demo.enabled` defaults **false** ⇒ the early `return`
at `SeedDataService.java:141` short-circuits first. So no crash today. **Latent trap**: it fires the
moment anyone enables initial-demo without also setting the non-billing doctor password. Logged as P2.

**C12 — Highest *production* impact finding, above the dev secret:** `HMS_SECURE_COOKIES` defaults
`false` (`application.yml:67`) and is in **neither** `.env.example` **nor** `infra/docker-compose.yml`
⇒ the `hms_refresh_token` cookie ships **without `Secure`** on the real deploy path.

**C13 — Wiring mock pages WILL turn CI red.** `e2e/specs/admin-pages.spec.ts:148-149` asserts
`getByText('APT-99214')` and `getByText('Ariana M.')` — the exact invented rows — and `:36` asserts
`getByText('28')`. **`admin-pages.spec.ts` IS in the `test:e2e:ci` gate** (verified). `portal-pages.spec.ts`
likewise asserts portal mock strings. ⇒ **page change and spec rewrite must land in the same commit.**
Reuse the existing `installTruthfulnessApiMocks` pattern (`ui-truthfulness.spec.ts`) via `page.route()`.

**C14 — "Badge it as demo data" is only CI-safe if controls are also `disabled`.**
`ui-truthfulness.spec.ts:83-86` classifies an *enabled* control whose accessible name matches
`/unavailable|unsupported|not exposed|read-only/` as a `"bug"` and fails. So badging + leaving buttons
live goes red. This spec is an existing honesty gate — an asset, and a constraint.

**C15 — Two "wire it up" items are IMPOSSIBLE (verified).**
- `AdminSupportController` has **`@GetMapping` only** (lines 24, 31) — no PUT/PATCH/POST. The support
  status control cannot be wired; disable it or file a backend ticket.
- There is **no staff-side patient write endpoint** — the only patient `@PutMapping` is
  `PatientPortalController:61 /profile` (the patient's *own* profile, wrong actor). So the
  `staff/patients` edit button cannot be made to work; fixing the state mutation alone is not enough.
- 5 of 7 mocked `/portal/` pages (`inventory`, `staff`, `patients`, `pharmacy`, `admit`) are
  **staff-domain pages under a patient route tree** — an RBAC smell. Prefer deletion over badging.

**C16 — PATIENT-SAFETY BUG, verified, smallest diff of any P1.**
`booking/review/page.tsx:147-148` — textarea labeled **"Known Allergies or Contraindications"**
(placeholder "List any drug allergies...") is bound to `value={symptoms}` and POSTed as `symptoms`.
A clinician reading the chief complaint sees "Penicillin". Also `:154` "Current Medications" is bound to
**nothing** and silently discarded. **Fix the UI label, not the API** — `symptoms` is the correct shared
contract (`public-api.ts:104`); remove the unbound input rather than invent a field.

**C17 — Toast migration is CHEAPER than planned, but confirm/prompt migration is DEARER.**
`useToast` is consumed in exactly **one** file (`booking/review/page.tsx:7,12`) — verified, no adoption to
preserve. But of the 33 real call sites: **21 notifications** (toast-swappable), **10 `window.confirm`**
(need an async-resolving dialog — each handler splits in two), **2 `prompt()`** (need a real input modal).
A toast **cannot** replace the latter 12. Budget confirm-dialog work as its own item.

**C18 — Don't add `sonner`.** `@base-ui/react ^1.4.0` is already a dependency (verified) and the project
has an established `--hc-*` token system. Also **reuse `components/ui/dialog.tsx`** (already used by 8
files, has a unit test) — PR #32's patient modal consumes it rather than defining its own. Harden it once
(focus trap/restore, `Escape`, `role="dialog"`, `aria-modal`, `aria-labelledby`) to benefit all 8.

**C19 — The proposed refresh-race fix was WRONG and strictly worse.** "Clear on next call instead of
`finally`" caches a resolved-`false` promise forever ⇒ user can never re-authenticate for the process
lifetime (transient failure becomes permanent). Correct fix: attach `.finally()` to the promise itself
with a `get(scope) === p` guard, keyed by a **per-`AuthScope` Map** — the current single global
`refreshPromise` also collides across staff/patient scopes, a second bug the plan missed entirely.
Thread `_retried` as an internal param (not module-level, which would suppress unrelated retries).

### P0 — blocks showing the repo to anyone

| ID | Finding | Anchor |
|---|---|---|
| P0-1 | Hardcoded JWT signing secret (dev profile; prod fails closed via `${JWT_SECRET}`) | `application-dev.yml:29` |
| P0-2 | BOLA on 4 PHI endpoints; history returns **plaintext** national ID, no actor param, no audit | `PatientController.java:21`; `MedicalRecordService.java:187,202`; `LabResultController.java:36,42`; `VitalSignsController.java:37,43,49` |
| P0-3 | Documented quickstart **cannot boot** — 7 seed passwords have empty defaults, `requireComplete()` throws, `.env.example` defines none | `application.yml:119-127`; `ReleaseDemoSeedProperties.java:112-128`; `.env.example` |
| P0-4 | This ledger, tracked at root, previously read "DO NOT SHIP" vs README "RC 1.0" | `task.md` |

### P1

| ID | Finding | Anchor |
|---|---|---|
| P1-5 | Toast system is a 7-line `alert()` stub; 34 alert/prompt/confirm across 20 files | `components/ui/use-toast.ts` |
| P1-6 | Mock UI sold as real: monitoring health check hardcoded "operational"; patient edit mutates state, no API; admin appointments/support mocked though real APIs exist; booking wizard posts hardcoded PII | see plan §6 |
| P1-7 | Token-refresh race → forced logout mid-demo; 401 retry recurses with no counter | `lib/api-client.ts:67-108,163-175` |
| P1-8 | `rbac-enforcement.spec.ts` **not in** `test:e2e:ci`; frontend CI job has no backend ⇒ integrated specs self-skip and report green | `package.json:14`; `ci.yml:190-274` |
| P1-9 | Overstated metrics: 36→**34** permissions, 73→**58** controller tests. Frontend tests **measured: 633 passing / 70 files** (a real `vitest run` this session) — so "611+" is actually TRUE and the earlier "526" grep estimate was wrong; only the permission and controller-test numbers need fixing | `README.md:15,43,238,259,426`; `CLAUDE.md:79,87,124` |

### P2
Repo hygiene (1,199/2,204 tracked files are AI tooling) · backend N+1 & unbounded queries
(`AuditLogService.java:59`, `TimeSlotAdminService.java:61`) · no Next.js middleware ·
`/patient-auth/*` unrate-limited · coverage floors 40/35 · vitals DTO unvalidated · missing LICENSE.

## Phase 2 — Sandbox  🔄 PARTIAL
- [x] `git worktree prune` — removed stale `hospital-management-system-m3-finish`
- [ ] Create `sandbox/interview-hardening` worktree at Phase 3 start

## Phase 3 — Execution (TDD, coder + 3 reviewers + orchestrator)  ⏳ PENDING

**Blocked pending owner decisions — D1 and D2 below must be answered before any authz code is written.**

Revised order (was: P0-1→P0-2→P0-3→P0-4→P1-5/6→P1-7→P1-8→P1-9). Reordered so isolated,
zero-blast-radius work lands first and the CI-coupled work lands last:

| # | Work item | Why here | Effort |
|---|---|---|---|
| 1 | ✅ **DONE — P0-1 config/secrets** — `application-dev.yml`: JWT literal → `${JWT_SECRET}`, `hospital_pass` → `${POSTGRES_PASSWORD}`, `clean-disabled: false` → `true`. Added guard test `devProfileDoesNotHardcodeSecretsOrEnableFlywayClean`. **Verified: 5 tests, 0 failures.** | Regression surface **empty** (C9); also fixes a config-precedence bug | S |
| 2 | ✅ **DONE — C12 `HMS_SECURE_COOKIES`** documented in `.env.example` with a prod warning, plus `HMS_REFRESH_COOKIE_SAME_SITE` and `HMS_EXPOSE_SPEC_ENDPOINTS`. Runtime defaults unchanged (matches `application.yml:67`), so zero behavior change — the vars are now *discoverable*. | Highest *production* impact in the whole audit | S |
| 3 | ✅ **DONE — C16 symptoms/allergies mislabel** — label/placeholder now "Symptoms / Reason for Visit"; removed the unbound "Current Medications" input that silently discarded input. **Verified: no test asserted the old labels; eslint clean.** | Patient-safety bug, smallest diff | S |
| 4 | ✅ **DONE — P1-7 api-client** — per-scope `Map`, `.finally()` on the promise with an identity guard, threaded one-shot `retriedAfterRefresh`. **RED was empirical: the unbounded-retry test crashed the Vitest worker with `FATAL ERROR: Reached heap limit` after 105s; now 7.2s.** Guard placed on the *refresh* not the whole 401 block, so a second 401 still clears the session instead of leaving it dangling. **25/25 + consumers 15/15.** | Isolated, zero UI blast radius | S |
| 5 | ✅ **DONE — C18 harden `ui/dialog.tsx`** — `role="dialog"`, `aria-modal`, `aria-labelledby`/`describedby` via `useId`, Escape, Tab/Shift+Tab wrap, focus-on-open + focus-restore-on-close. Listeners attached only while open. `dialog-hidden` contract preserved. `DialogProps` unchanged ⇒ all 8 call sites untouched. **13/13 (4 RED first); full suite 70 files / 641 tests pass.** | Prerequisite for items 7-8; benefits 8 consumers | S |
| 6 | ✅ **DONE — P0-3 demo boot** — new `.env.demo.example` (all 7 seed passwords), `.gitignore` rewritten to `.env.*` + template negations, README split into demo vs clean-install paths, Vietnamese comment and republished `hospital_pass` removed, all 9 staff accounts documented. **Proven by booting the stack: Tomcat up, health UP, no "Refusing seed", 7/7 staff + patient portal logins HTTP 200 with real JWTs, seeded data present (8 departments, 4 doctors, appointments/audit-logs/invoices).** Also corrected the 3 overstated metrics (36→34 permissions, 73→58 controller tests, 611+→641 frontend tests). | Unblocks every demo | M |
| 7 | **P1-5 toast** on `@base-ui/react` + `--hc-*`; migrate **21** notification sites | Cheap (one consumer) | M |
| 8 | **`<ConfirmDialog>`** + migrate **10** confirms + **2** prompts | The genuinely large item (C17) | L |
| 9 | **P0-2 BOLA** — `hasClinicalAccess` w/ NURSE arm; **6+** endpoints incl. the `AppointmentController` bypass; resolve→check→uniform-fail ordering; audit vitals writes/deletes | Needs D1/D2 answered; largest test surface | L |
| 10 | **P1-6 wiring** — monitoring → receptionist KPIs → support list → admin appointments, **each with its spec rewritten in the same commit** (C13) | CI-coupled; do last | M |
| 11 | 🔸 **PARTIAL — P1-9 metrics done** in item 6 (36→34, 73→58, 611+→641). Still open: P0-4 untrack `task.md` / `recent_changes.diff` and the `.agents/` footprint | Docs-only | S |
| 12 | **P1-8 CI** — add postgres+backend to frontend job and include `rbac-enforcement.spec.ts`, **or** stop claiming those scenarios pass | Honesty gate | M |

Deferred to a follow-up (needs a product decision, not code): `admin/support` status control and
`staff/patients` edit have **no backing endpoint** (C15) — disable with honest labels; and the 5
staff-domain pages under `/portal/`.

### ✅ Owner decisions — ACCEPTED (user approved both recommendations)

- **D1 — NURSE clinical scope: option (a) ACCEPTED.** A nurse may read/write vitals and read lab results
  **only** for patients holding an appointment in an active clinical state (CHECKED_IN / IN_PROGRESS) —
  i.e. currently present in the facility. Patients in `DONE` state are excluded. This is strictly tighter
  than today's unrestricted role gate while keeping nurse intake working. Requires a new repository
  predicate (`existsByPatientIdAndStatusIn`).
- **D2 — Failure-response policy ACCEPTED.**
  - `/patients/{cccd}/history` ⇒ **404 for both** "not found" and "forbidden" (hides existence in the
    national-ID keyspace — the endpoint that returns plaintext CCCD).
  - UUID-keyed endpoints (lab results, vitals) ⇒ **403 for both** (UUIDs unguessable, existence leakage
    low-value).
  - Responses must be **byte-identical** within each class. No timing short-circuit: for the CCCD path,
    `hash(cccd)` is computed unconditionally.

## Phase 4 — Dual review & debug (Santa adversarial + 2 extra reviewers)  ⏳ PENDING

## Measured baseline (pre-change, this session)

| Metric | Measured | Method |
|---|---|---|
| Frontend unit tests | **633 passed / 70 files**, 105s, 0 failures | `npx vitest run` |
| E2E specs total | **31** | `ls e2e/specs/*.spec.ts` |
| E2E specs in CI gate | **12** | parsed from `package.json:14` |
| **E2E specs EXCLUDED from CI** | **19** | incl. `rbac-enforcement`, `auth-integrated`, `rate-limiting`, `concurrent-sessions`, `network-failure`, `staff-clinical`, `workflows`, `duplicate-submission`, `a11y-integrated`, `responsive`, `visual`, `error-pages`, `performance`, `ui-smoke`, `ui-truthfulness`, `route-audit`, `live-*`, `capture-screenshots` |
| Known noise | React warning: non-boolean `jsx` attribute in `admin/rooms/__tests__/page.test.tsx` | stderr during run |

## Phase 5 — QA/QC & production audit  ⏳ PENDING (blocked: Docker engine down)

Prerequisite: start Docker Desktop. Without it Postgres → backend → integrated E2E cannot run, and
every health-gated spec **self-skips while reporting green** — which is finding P1-8 itself.

- [ ] Boot full stack; log in as **all 9** seeded accounts (not the 7 documented)
- [ ] Walk the clinical flow: book → check-in → vitals → consult → prescribe → dispense → invoice
- [ ] Playwright report that **actually ran** — assert skip-count is 0 for the security specs
- [ ] **BOLA re-test:** `doctor1` → unrelated patient ⇒ **403/404 per D2**, not a PHI payload;
      repeat via the `AppointmentController` bypass route (C2) and for lab + vitals PUT/DELETE
- [ ] **Anti-oracle check:** unknown-CCCD and forbidden-CCCD responses must be **byte-identical**
- [ ] **Nurse regression:** nurse intake → vitals write still **200** (guards against C1)
- [ ] `JWT_SECRET` unset ⇒ app must **refuse to start**
- [ ] `mvn verify` (JaCoCo 40% gate) + `npm run lint` + `npm run build`
- [ ] Production audit + cost report; certify one immutable SHA. **No merge.**
