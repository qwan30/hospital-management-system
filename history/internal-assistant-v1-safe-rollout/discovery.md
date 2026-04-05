# Discovery Report: Internal Assistant V1 Safe Rollout

Generated: 2026-03-23

## Scope Freeze

- Ship a narrow v1 first: `docs` mode plus `patient` / `hybrid` only when a selected patient context is present.
- Support `DOCTOR` and `NURSE` for patient-scoped usage.
- Keep `ADMIN` as `docs`-only until selected-patient audit and policy controls are hardened.
- Do not optimize prompt/model behavior ahead of corpus quality, access policy, and eval coverage.

## Current Architecture Snapshot

### Backend

- Assistant API exists at `POST /api/v1/internal-assistant/messages`.
- Controller currently admits only `DOCTOR` and `ADMIN`.
- Service already supports `docs`, `patient`, and `hybrid` modes, returns citations, deep links, and refusal scope.
- `ADMIN` is already blocked from non-docs modes.
- Patient context enforcement already requires `patientId` or `appointmentId`, but only for `DOCTOR`.
- Audit logging is already wired for completed and refused assistant responses.
- Rate limiting already includes a dedicated internal-assistant bucket.

### Knowledge Layer

- Flyway schema already contains `knowledge_documents`, `knowledge_chunks`, `knowledge_nodes`, `knowledge_edges`, and `knowledge_ingestion_states`.
- Boot-time seed corpus exists with 3 markdown documents:
  - medical record completion
  - follow-up reminders
  - patient portal communications
- Retrieval is lexical + graph expansion and currently loads all knowledge rows in memory.
- `knowledge_documents.is_active` exists in schema but is not enforced during retrieval.

### Frontend

- Assistant panel exists and is embedded in:
  - patient records management
  - medical record editor
- Doctor dashboard currently acts as a shortcut, not a full chat host.
- Frontend assistant role typing only supports `DOCTOR | ADMIN`.
- Patient-context affordances are coded as doctor-only today.
- Patient records and medical-record routing are not ready for nurse assistant usage.

### Tests and Quality

- Backend unit and integration tests exist for doctor success/forbidden and admin docs-only cases.
- Integration tests already use Testcontainers with pgvector.
- Frontend has component tests for the assistant panel.
- No persistent conversation/session model exists.
- No assistant feedback model, API, or UI exists.
- No assistant eval dataset or eval runner artifacts exist in the repo.
- No Playwright E2E setup exists yet.

## Gap Analysis

| Area | Have | Need | Gap |
| --- | --- | --- | --- |
| Role support | `DOCTOR`, `ADMIN` | `DOCTOR`, `NURSE`, `ADMIN docs-only` | Nurse missing end-to-end |
| Context policy | Doctor-only selected patient enforcement | Same enforcement for nurse, explicit selected-context sourcing in UI | Service + frontend context gaps |
| Knowledge corpus | Seeded corpus with basic graph schema | Admin-managed upload/revoke/re-index lifecycle | No admin API/UI or ingestion job model |
| Knowledge metadata | title/category/summary/active/source path | status/version/owner/effective date/tags | Metadata too thin |
| Revocation | `is_active` column exists | Retrieval must exclude inactive or revoked docs | Not enforced today |
| Session memory | Request payload can carry conversation array | Persistent sessions keyed by user/role/context/thread | Not implemented |
| Feedback | None | Helpful / not helpful with optional note | Not implemented |
| Eval | None | 30-50 grounded eval queries with expected behavior | Not implemented |
| E2E | None | Playwright flows for doctor/nurse/admin | Not implemented |
| Observability | Audit + rate limit | latency/refusal/top-cited/auth-failure/feedback metrics | Partial only |

## Immediate Constraints

- Keep assistant read-only in v1.
- No global patient search through the assistant.
- `patient` / `hybrid` must refuse when no `patientId` or `appointmentId` is present.
- Do not ship nurse access without backend authorization tests.
- Do not ship knowledge revoke/upload UI before retrieval respects active status.
- Do not expand assistant capability before an eval set exists.

## Repo-Grounded Findings That Drive Sequence

1. The current implementation already supports a decent `docs + doctor-selected-patient` baseline.
2. The largest functional hole is `NURSE` support across controller, service policy, frontend typing, route guards, and tests.
3. The largest platform hole is the lack of an operational knowledge-base admin and ingestion pipeline.
4. Session memory and feedback are absent, so follow-up quality and improvement signals are not yet trustworthy.
5. The repo has enough backend testing infrastructure to start hardening immediately, but E2E is not yet in place.

## Recommended Planning Principle

Treat the next wave as a safe-rollout program, not as a model-improvement program:

1. Access policy and context integrity
2. Knowledge corpus lifecycle and admin controls
3. Session and feedback persistence
4. Eval coverage
5. UI and production hardening
