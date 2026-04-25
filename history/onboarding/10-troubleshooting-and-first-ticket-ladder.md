# Troubleshooting and First-Ticket Ladder

## Troubleshooting Checklist

| Symptom | First check | Likely area |
| --- | --- | --- |
| GitNexus query returns stale or wrong context | `npx gitnexus status` | local code index |
| Protected route returns `401` | bearer token, refresh flow, `JwtAuthenticationFilter` | auth |
| Protected route returns `403` | role, `@PreAuthorize`, doctor ownership logic | security + workflow |
| Booking fails with conflict | slot ownership, contiguous window, slot status | appointment write flow |
| Patient claim fails | email + DOB + normalized name + hashed CCCD match | patient auth |
| Assistant returns `refused` | missing patient context or no active knowledge evidence | internal assistant |
| Revenue endpoint looks empty | invoice must be `PAID` first | invoice/report flow |
| Portal shows nothing | patient auth, seeded patient data, portal repositories | patient portal |
| Inventory counts drift | movement delta and item-status recalculation | inventory |
| Swagger or health unavailable | backend not running or Docker DB unavailable | runtime bootstrap |

## Current Known Repo Issues
1. Backend tests are not green because `VitalSignsServiceTest` is stale.
2. Frontend build is not green because `tsconfig.json` uses deprecated `baseUrl`.
3. Docker runtime could not be verified in this environment.
4. Vital-signs table migration coverage is not obvious from `V1...V10`.

## First-Ticket Ladder

### Tier 1: Baseline Repair
- Fix `backend/core/src/test/java/com/hospital/core/vitalsigns/VitalSignsServiceTest.java`
  - Why it is good for an intern:
    - narrow scope
    - reveals entity shape drift
    - improves trust in the clinical baseline
- Fix `frontend/tsconfig.json` so `npm run build` works
  - Why it is good:
    - isolated change
    - introduces frontend workspace conventions without yet building UI

### Tier 2: Contract and Docs Alignment
- Verify whether `appointment_vital_signs` has a missing migration or an undocumented schema path.
- Reconcile any finance status naming differences between code and docs.
- Tighten README/runtime notes so they match current frontend/backend truth.

### Tier 3: Small Feature Work
- Add or tighten tests around patient portal read flows.
- Add service/integration coverage for finance or admin monitoring endpoints.
- Implement a thin frontend API client and auth shell once the build baseline is fixed.

## Suggested First Two Weeks

### Week 1
- repair one red baseline item
- read all onboarding docs in this folder
- shadow one real bugfix or docs-alignment task

### Week 2
- take one low-risk API-facing task
- add or fix unit + integration coverage
- present the change back using controller -> service -> repository reasoning

## Mentor Review Checklist
- Intern can explain the module graph without prompting.
- Intern can trace the eight golden flows from memory with file anchors.
- Intern understands which docs are canonical and which are secondary.
- Intern can identify at least three current repo risks or mismatches.
- Intern proposes a sensible first ticket and test strategy before coding.
