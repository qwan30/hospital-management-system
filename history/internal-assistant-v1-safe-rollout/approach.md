# Approach: Internal Assistant V1 Safe Rollout

Generated: 2026-03-23

## Outcome

Deliver a controlled internal-assistant v1 that is trustworthy before it is ambitious:

- `DOCTOR`: docs + patient + hybrid in selected context
- `NURSE`: docs + patient + hybrid in selected context
- `ADMIN`: docs-only
- knowledge documents managed through admin lifecycle
- sessions and feedback stored separately
- eval set established before additional capability expansion

## Recommended Sequence

### Phase 0: Scope Lock and Contract Freeze

- Confirm the v1 contract:
  - no public search across all patients
  - no free-form patient discovery through assistant
  - no vector dependency required for v1
  - admin stays docs-only
- Freeze the first indexed corpus:
  - SOP medical record completion
  - follow-up reminders
  - lab-result workflow
  - patient portal communications
  - EMR workflow documents

### Phase 1: Access Policy and Selected Context Integrity

- Add `NURSE` to assistant backend and frontend surface.
- Keep all patient/hybrid authorization backend-enforced.
- Require `patientId` or `appointmentId` for patient-scoped queries.
- Normalize assistant context sourcing so the panel uses resolved chart/editor state, not loose URL parameters.

### Phase 2: Knowledge Base Administration and Ingestion

- Expand document metadata to cover lifecycle and ownership.
- Build an admin-managed ingestion pipeline:
  - upload
  - parse/chunk
  - entity extraction
  - edge building
  - ingestion-state persistence
- Make retrieval respect active/revoked status before exposing revoke in UI.

### Phase 3: Session Memory and Feedback

- Persist conversation sessions by:
  - userId
  - role
  - context type
  - patientId / appointmentId
  - session/thread id
- Split or reset sessions on patient-context switch.
- Add separate feedback persistence:
  - response/message id
  - helpful / not helpful
  - optional note

### Phase 4: Eval-Driven Hardening

- Author a grounded assistant eval set before widening scope:
  - 10 docs queries
  - 10 patient queries
  - 10 hybrid queries
  - 10 refusal queries
- For each eval item, define:
  - expected mode/scope
  - expected citation shape
  - expected refusal vs allowed answer

### Phase 5: UX and Production Hardening

- Improve UI states:
  - loading
  - refusal
  - citation click-through
  - context banner
  - patient-switch warning
- Complete production controls:
  - assistant-specific metrics
  - audit coverage for success/refusal/forbidden
  - integration tests on Docker/Testcontainers hosts
  - Playwright E2E for critical flows

## Why This Order

This order matches the actual repo gaps:

1. Nurse support is the most obvious missing capability in already-existing assistant surfaces.
2. Knowledge admin is the biggest missing operational dependency for trustworthy docs retrieval.
3. Sessions and feedback are foundational for follow-up quality and improvement loops.
4. Evals are required before adding more intelligence, breadth, or model tuning.
5. UI/ops hardening only pays off once access, corpus, and persistence are stable.

## Risk Map

| Area | Risk | Why | Mitigation |
| --- | --- | --- | --- |
| Nurse access | High | Expands PHI surface and route access | Backend-first policy tests, security review, no frontend-only gating |
| Selected context integrity | High | URL/state drift can leak wrong patient context | Bind panel to resolved context and reset on patient switch |
| Knowledge revoke lifecycle | High | `is_active` exists but retrieval ignores it | Enforce active filtering before any revoke UI ships |
| Upload pipeline | High | Adds file ingest, metadata validation, admin write path | Schema validation, file constraints, audit, staged ingestion states |
| Session persistence | Medium | Context bleed risk between patients | Separate session keys by patient/context and force resets |
| Feedback persistence | Medium | Easy to over-couple with chat memory | Separate tables, explicit response ids |
| E2E coverage | Medium | Missing Playwright baseline | Add stable selectors and narrow critical-path specs first |
| Metrics | Medium | Current observability is partial | Ship minimal dashboard metrics with each backend milestone |

## Required Quality Gates

### Security Gate

- No assistant endpoint or upload path ships without:
  - authn/authz checks
  - input validation
  - rate limiting
  - audit logging
  - no sensitive data leakage in user-facing errors

### TDD Gate

- Every track follows:
  - unit tests first
  - integration tests for API/service changes
  - E2E for user-facing assistant flows
- Coverage target remains at or above 80 percent for touched areas.

### Eval Gate

- No capability expansion beyond narrow v1 until the assistant eval set exists and passes.

## Non-Goals for This Wave

- Model upgrades or prompt beautification as a primary workstream
- Global patient retrieval
- Semantic/vector ranking as a release blocker
- Admin patient-mode access
- Write-back assistant actions
