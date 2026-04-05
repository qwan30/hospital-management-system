# Execution Plan: Internal Assistant V1 Safe Rollout

Generated: 2026-03-23
Orchestrator: primary coordinator for this epic

## Operating Rules

- Run `planning` outputs first, then let the orchestrator assign tracks.
- Do not start model/prompt optimization before corpus, policy, and eval work.
- Use backend-enforced authorization for every patient-scoped path.
- Keep track file scopes disjoint where possible.
- Use subagents only for bounded work units with a clear write scope.

## Phase Gates

### Gate A: Scope Locked

- v1 scope approved as:
  - docs mode
  - patient mode with selected context
  - hybrid mode with selected context
  - `DOCTOR` + `NURSE`
  - `ADMIN docs-only`

### Gate B: Policy Safe

- Nurse support lands with backend tests.
- Selected context rules are enforced in backend and reflected in UI.

### Gate C: Corpus Operational

- Knowledge documents can be uploaded, activated, revoked, and re-indexed.
- Retrieval excludes revoked/inactive documents.

### Gate D: Persistence and Eval Ready

- Session persistence and feedback persistence are live.
- Eval set exists and runs.

### Gate E: Release Hardening

- Integration and E2E gates pass on a Docker-capable machine.
- Metrics and audit coverage are complete enough for rollout.

## Tracks

| Track | Agent | Scope | Main File Areas |
| --- | --- | --- | --- |
| 1 | BlueLake | Access policy and selected context | `backend/api/internalassistant`, `backend/core/internalassistant`, `backend/shared/internalassistant`, `frontend/features/internal-assistant`, `frontend/features/auth`, `frontend/features/patient-records-management`, `frontend/features/medical-record` |
| 2 | GreenCastle | Knowledge admin and ingestion pipeline | `backend/core/internalassistant/knowledge`, `backend/api/admin`, `backend/api/resources/db/migration`, `frontend/app/admin-monitoring`, `frontend/features/admin-monitoring` |
| 3 | RedStone | Session persistence and feedback | `backend/core/internalassistant`, `backend/shared/internalassistant`, `backend/api/internalassistant`, `backend/api/resources/db/migration`, `frontend/features/internal-assistant` |
| 4 | SilverForge | Eval, integration, and E2E | `backend/api/src/test`, `backend/core/src/test`, `frontend/**/*.test.tsx`, `frontend/tests/e2e`, `frontend/playwright.config.*`, `docs/**` |
| 5 | GoldBranch | Observability, rollout, and docs | `backend/core/audit`, `backend/api/config`, `frontend/features/internal-assistant`, `docs/**`, `history/**` |

## Track Details

### Track 1: BlueLake - Access Policy and Selected Context

Objective: make the current assistant safe and usable for `NURSE` without widening beyond selected-context v1.

Ordered tasks:

1. `IA-101` Backend role admission
   - Admit `NURSE` at the assistant controller boundary.
   - Extend patient authorization policy beyond doctor-only assumptions.
   - Preserve `ADMIN docs-only`.
2. `IA-102` Context-safe patient authorization
   - Require `patientId` or `appointmentId` for patient/hybrid.
   - Ensure nurse queries are scoped to approved workflow context, not broad patient search.
   - Refuse missing-context or out-of-scope requests with audited outcomes.
3. `IA-103` Frontend role and route alignment
   - Add `NURSE` typing to assistant context.
   - Update route guards and assistant usage surfaces for nurse workflows where appropriate.
   - Stop coercing non-admin users into doctor semantics.
4. `IA-104` Context provenance cleanup
   - Bind assistant context to resolved patient/editor state.
   - Add context banner and patient-switch warning.

Suggested subagent split:

- Subagent A: backend controller/service policy
- Subagent B: frontend typing, route guards, panel affordances
- Subagent C: tests for nurse, missing context, admin restriction, hybrid behavior

Definition of done:

- Nurse can use docs/patient/hybrid only in selected context.
- Admin remains docs-only.
- No patient-scoped request succeeds without explicit context and citation.

### Track 2: GreenCastle - Knowledge Admin and Ingestion Pipeline

Objective: turn the seeded corpus into an operational knowledge base with admin lifecycle.

Ordered tasks:

1. `IA-201` Metadata and lifecycle schema
   - Add fields for status, version, owner, effective date, tags.
   - Move from simple active flag semantics to explicit lifecycle control while preserving compatibility.
2. `IA-202` Ingestion job/state model
   - Track per-document ingestion status by stage:
     - uploaded
     - chunked
     - entities extracted
     - edges built
     - indexed
     - failed
3. `IA-203` Admin APIs
   - list documents
   - upload document
   - activate/revoke document
   - re-index document
   - view ingestion state
4. `IA-204` Retrieval enforcement
   - Exclude revoked/inactive documents from assistant retrieval.
   - Ensure citations resolve to admin-viewable document/chunk targets.
5. `IA-205` Admin UI
   - upload
   - metadata edit
   - activate/revoke
   - re-index
   - ingestion status viewer

Suggested subagent split:

- Subagent A: migrations and domain model
- Subagent B: ingestion service and retrieval filtering
- Subagent C: admin UI and citation click-through

Definition of done:

- Revoked docs do not appear in retrieval.
- Admin can upload and re-index documents with observable ingestion status.

### Track 3: RedStone - Session Persistence and Feedback

Objective: persist conversation and feedback in a way that preserves context isolation.

Ordered tasks:

1. `IA-301` Session data model
   - session/thread table keyed by user, role, context, patient or appointment
   - assistant/user message persistence
2. `IA-302` Context isolation rules
   - new patient context creates a new thread or resets the old one
   - no cross-patient conversation carryover
3. `IA-303` Response identity
   - issue stable response/message ids so feedback can target a concrete answer
4. `IA-304` Feedback model and API
   - helpful / not helpful
   - optional note
   - separate persistence from session memory
5. `IA-305` UI affordances
   - restore session history
   - submit feedback
   - show explicit context/thread state

Suggested subagent split:

- Subagent A: schema + backend APIs
- Subagent B: frontend session restoration and feedback actions
- Subagent C: audit coverage and context-switch tests

Definition of done:

- Assistant history survives reload inside the same context.
- Patient switch never leaks previous patient context.
- Feedback is stored independently from chat memory.

### Track 4: SilverForge - Eval, Integration, and E2E

Objective: make assistant quality measurable and release-gated.

Ordered tasks:

1. `IA-401` Eval corpus authoring
   - 40 grounded queries minimum:
     - 10 docs
     - 10 patient
     - 10 hybrid
     - 10 refusal
2. `IA-402` Eval runner and rubric
   - expected scope
   - expected citation count/type
   - expected refusal / allowed answer
3. `IA-403` Backend test expansion
   - nurse support
   - hybrid behavior
   - missing context refusal
   - revoked doc exclusion
   - session reset
   - feedback persistence
   - rate-limit and audit assertions
4. `IA-404` Frontend/E2E setup
   - add Playwright config
   - add stable selectors
   - doctor flow
   - nurse flow
   - admin docs-only flow
   - forbidden/refusal flow

Suggested subagent split:

- Subagent A: eval dataset and runner
- Subagent B: backend integration and unit tests
- Subagent C: Playwright scaffolding and browser specs

Definition of done:

- Assistant changes are measured by eval results, not only by manual impressions.
- Critical role-based flows run in browser automation.

### Track 5: GoldBranch - Observability, Rollout, and Docs

Objective: finish the operational surface required for production rollout.

Ordered tasks:

1. `IA-501` Metrics
   - latency by mode
   - refusal rate
   - top cited docs
   - auth failures
   - feedback score
2. `IA-502` Audit completion
   - success
   - refusal
   - forbidden
   - document lifecycle actions
3. `IA-503` Rollout guardrails
   - feature flag or staged enablement if needed
   - runbook for Docker/Testcontainers validation
4. `IA-504` Docs and history updates
   - user-facing internal ops notes
   - implementation references
   - release checklist

Suggested subagent split:

- Subagent A: backend metrics and audit coverage
- Subagent B: rollout checklist and environment validation
- Subagent C: docs/history refresh

Definition of done:

- Team can observe assistant behavior after rollout and audit who accessed what.

## Cross-Track Dependencies

- Track 1 must reach `IA-102` before Track 4 can finalize nurse and refusal evals.
- Track 2 must complete `IA-204` before Track 4 can validate revoked-document behavior.
- Track 3 must complete `IA-303` before feedback UI and feedback evals can stabilize.
- Track 4 can start authoring the eval corpus immediately, but final pass/fail execution depends on Tracks 1 to 3.
- Track 5 should start metrics design early, but final rollout reporting depends on Track outputs.

## Recommended Start Order for the Team

Start now:

1. Track 1
2. Track 2
3. Track 4 on eval authoring only

Start once policy/corpus contracts are clearer:

4. Track 3
5. Track 5

## Recommended ECC Agent Assignment

- `planner`: owns plan upkeep when scope changes
- `architect`: reviews policy boundaries, session model, and ingestion architecture
- `tdd-guide`: attached to Tracks 1 to 4 before implementation starts
- `security-reviewer`: mandatory reviewer for Tracks 1, 2, 3, and 5
- `database-reviewer`: attached to Tracks 2 and 3 migrations
- `e2e-runner`: attached to Track 4
- `code-reviewer`: runs after each track lands
- `doc-updater`: lands final docs/history updates from Track 5

## Two-Week Delivery Shape

### Week 1

- Lock scope and source corpus
- Finish Track 1
- Start Track 2 schema + retrieval enforcement
- Author eval dataset skeleton

### Week 2

- Finish Track 2 admin flow
- Finish Track 3 persistence
- Finish Track 4 integration + E2E
- Finish Track 5 metrics, docs, and rollout checklist

## Ship Criteria

- `DOCTOR` and `NURSE` patient-scoped flows are safe and tested.
- `ADMIN` remains docs-only.
- Revoked docs are excluded from retrieval.
- Sessions and feedback persist correctly.
- Eval set exists and passes agreed thresholds.
- Integration and E2E checks pass on a Docker-capable machine.
