# Frontend Integration Readiness

## Current Frontend Truth
- `frontend/src/main.ts` is still the Vite starter page.
- There is no hospital route tree, auth store, API client, feature screens, or role layouts yet.
- The workspace still matters because it already declares the intended UI stack and aliases.

## Existing Frontend Stack
- React 19
- Vite 8
- TypeScript 6
- Tailwind 4
- React Router
- React Query
- React Hook Form + Zod
- Zustand
- Base UI + shadcn-compatible config

Main files:
- `frontend/package.json`
- `frontend/tsconfig.json`
- `frontend/vite.config.ts`
- `frontend/components.json`
- `frontend/src/main.ts`
- `frontend/src/lib/utils.ts`

## Current Blockers
- `npm run build` fails because `frontend/tsconfig.json` still uses the deprecated `baseUrl` option.
- There is no real app shell yet, so UI onboarding must be built from contracts and briefs rather than runtime tracing.
- `README.md` still frames frontend status conservatively, while the package manifest shows the intended stack direction.

## What The Frontend Should Consume
- API standards:
  - `API_CONTRACT.md`
- endpoint inventory:
  - `docs/API_ENDPOINTS_COMPREHENSIVE.md`
- product/UX intent:
  - `docs/HMS_PRD.md`
  - `docs/HMS_SRS.md`
  - `docs/HMS_FrontendDesignBrief.md`
  - `docs/HMS_ProjectPlan.md`

## Screen Families To Plan

| Surface | Actors | Backend anchors |
| --- | --- | --- |
| Public home and content | guest | `/content/home`, `/news` |
| Doctor discovery | guest | `/doctors`, `/doctors/{id}`, `/doctors/{id}/slots` |
| Department discovery | guest | `/departments`, `/departments/{id}`, `/departments/{id}/doctors` |
| Booking wizard | guest | `/ai/analyze-symptoms`, `/appointments` |
| Staff auth shell | doctor, nurse, accountant, admin | `/auth/login`, `/auth/refresh`, `/auth/logout` |
| Doctor dashboard | doctor | `/me/schedule`, `/appointments/*`, `/medical-records/*`, `/patients/{cccd}/history` |
| Nurse dashboard | nurse | `/appointments/today`, `/appointments/{id}/checkin`, `/queue/today`, `/vital-signs`, `/lab-results` |
| Accountant dashboard | accountant | `/inventory/*`, `/invoices/*`, `/pricing/*`, `/reports/revenue/*`, `/admin/audit-logs` |
| Admin dashboard | admin | `/admin/*`, selected finance/inventory surfaces |
| Patient portal | patient | `/patient-auth/*`, `/patient-portal/*` |
| Internal assistant shell | doctor, nurse, admin | `/internal-assistant/*`, `/admin/knowledge-documents/*` |

## Sprint-Zero Implementation Plan
1. Create a real app bootstrap:
   - router
   - query client
   - global error boundary
   - layout system
2. Create an API client layer:
   - auth-aware fetch/axios wrapper
   - consistent handling of `ApiResponse`
   - refresh-token strategy
3. Create state and auth boundaries:
   - staff auth store
   - patient auth store
   - role-based route guards
4. Create route shells:
   - public shell
   - staff shell
   - patient shell
5. Implement contract-first feature skeletons:
   - booking wizard shell
   - doctor schedule and appointment detail shell
   - nurse queue shell
   - accountant finance shell
   - admin operations shell
   - patient portal shell
   - internal assistant shell

## Frontend Design Constraints To Respect
- Access tokens should be memory-first, not localStorage-first, per the contract guidance.
- Refresh tokens come from HttpOnly cookies, so frontend auth must be cookie-aware.
- Some routes are public and some require strict role gating.
- Several backend surfaces return paginated or envelope-style responses and should not be normalized ad hoc.

## Immediate Repo Repair Candidate
- Fix `frontend/tsconfig.json` so `npm run build` becomes a valid baseline check before real UI implementation starts.
