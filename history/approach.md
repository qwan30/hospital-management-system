# Approach: Clinical Hardening

This document replaces the earlier hms-greenfield planning artifacts (archived under `history/hms-greenfield`); that track is now considered stale while clinical hardening is the active wave.

## Gap Analysis
| Area | Have | Need | Gap |
| --- | --- | --- | --- |
| Clinical MVP | Public booking, nurse check-in, doctor schedule/history, medical records | Hardening: email-required booking, PDF download, reminders, negative auth flows | coverage + doc sync + PDF/reminder |
| Backend security | JWT filter + RBAC + envelopes | Explicit 401/403/error envelope tests, strict CORS, token error handling | missing negative-path coverage |
| Frontend quality | Nurse/doctor dashboards, auth store, basic Vitest | Live booking data, remove demo auth, Playwright E2E, booking/email validation tests | e2e + error-path tests absent |
| Docs/contracts | Postman partially updated, history greenfield (archived) | History refresh, Postman sync to live contract incl. PDF/reminders/email, README demo clarity | docs lag current implementation |
| Business/admin/chatbot | Finance + admin endpoints, chatbot entrypoints referenced in earlier plans | Wave focuses on clinical endpoints; finance/admin/chatbot work deferred to next release | deferred scope for next wave |

## Recommended Approach
1. Lock contracts: add `patientEmail` to booking, define prescription PDF endpoint, clarify reminder semantics (email at 09:00 Asia/Saigon on followUpDate; skip if none).
2. Harden backend: security/CORS/token errors; reminder scheduling idempotent; PDF authorization for doctors.
3. Harden frontend: live booking data, remove demo auth fallback, add Playwright + Vitest coverage for happy/negative paths.
4. Sync docs/Postman/README; keep traceability matrix current.

## Alternatives
- Minimal fixes only — risk: PDF/reminder/auth gaps remain and E2E is untestable.
- Start finance/admin now — risk: increases conflict and delays clinical stability.

## Risk Map
| Item | Risk | Mitigation |
| --- | --- | --- |
| PDF generation | MEDIUM | On-demand endpoint, authz checks, tests for doctor-only access |
| Reminder jobs | MEDIUM | Idempotent scheduler, skip when no followUpDate, document timezone |
| Token handling | MEDIUM | Add negative-path tests, tighten CORS, consistent envelope |
| E2E flakiness | MEDIUM | Playwright fixtures, deterministic demo data, stable selectors |
| Doc/contract drift | MEDIUM | Postman + history updates in this wave, traceability updates per change |

Accountant/admin/chatbot flows and AI chatbot interactions referenced elsewhere remain deferred and will be documented when the next wave kicks off.
