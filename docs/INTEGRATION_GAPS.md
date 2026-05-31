# Integration Gaps

**Status:** historical GitNexus-backed integration audit retained for documentation and implementation follow-up.
**Generated:** 2026-05-18.
**Scope:** frontend-backend integration gaps visible from source, tests, and docs at the 2026-05-18 audit point. This file is not the current open-gap register.

## Audit Evidence

Commands run:

```powershell
npx.cmd gitnexus status
npx.cmd gitnexus query "business flows appointment booking lab testing schedule" -r hospital-management-system
npx.cmd gitnexus query "frontend component API integration data flow state management" -r hospital-management-system
npx.cmd gitnexus query "error handling exception validation response mapping" -r hospital-management-system
npx.cmd gitnexus context "AppointmentController" -r hospital-management-system
npx.cmd gitnexus context "BookingWizard" -r hospital-management-system
npx.cmd gitnexus context "QueueBoardPage" -r hospital-management-system
npx.cmd gitnexus context "PublicBookingPage" -r hospital-management-system
npx.cmd gitnexus query "AppointmentController API endpoint" -r hospital-management-system
npx.cmd gitnexus query "catch error try exception" -r hospital-management-system
npx.cmd gitnexus query "lab result controller patient portal staff lab results frontend" -r hospital-management-system
npx.cmd gitnexus query "admin schedule templates slots doctor availability frontend API" -r hospital-management-system
npx.cmd gitnexus query "appointment cancel reschedule reminder notification email frontend API" -r hospital-management-system
```

The 2026-05-31 repository refresh verified the GitNexus index is up to date for committed `HEAD` at `c255231`. Use `docs/06-testing/business-flow-test-matrix.md` and `docs/06-testing/full-hms-production-readiness-report-2026-05-22.md` for the current flow status; this file preserves the original gap audit context.

## Original Gap Table

| Component or flow | Issue | Root cause | Fix |
| --- | --- | --- | --- |
| `BookingWizard` | Stale name in audit prompt; GitNexus cannot find this symbol | Current public booking route is `PublicBookingPage` in `web/src/app/(public)/booking/page.tsx` | Update docs/tests to reference `PublicBookingPage`; keep `booking-wizard.spec.ts` only as E2E file name |
| `/staff/lab-results` and `/staff/lab-results/[id]` | Previous static staff lab shell is now API-backed | `listLabResultsByAppointment`, `getLabResult`, `createLabResult`, and `deleteLabResult` are wired in `web/src/lib/clinical-api.ts` | Keep final release verification current after W-01 changes; export remains intentionally unsupported until an export contract exists |
| `/staff/schedule` | Staff schedule page is static | Backend doctor schedule endpoint exists at `/api/v1/me/schedule`, but no frontend wrapper/page integration exists | Add `getMySchedule({ date | week })` in a clinical or schedule API module and replace static page data |
| Patient appointment cancellation/rescheduling | Portal UI disables actions; no patient write API is exposed | Backend has staff/admin appointment cancel/update metadata APIs, but no patient self-service cancel/reschedule contract | Keep disabled UI until backend contract is designed; document as unsupported in user-facing flows |
| Notification/reminder visibility | Reminder planning/dispatch exists only as backend side effect | `ReminderService` is triggered through medical record follow-up and scheduled dispatch, not exposed as a UI/API workflow | Document as backend side effect; add operational visibility only if product requires it |
| Automatic token refresh in frontend | `apiRequest` does not replay failed requests after 401 | Current client stores tokens and sends credentials but has no generic refresh interceptor | Either document manual-login behavior or implement tested refresh/retry boundary in `api-client.ts` |
| Component-to-API documentation | Previously spread across route matrix, flow map, and tests | No single component-to-endpoint map existed | Created `docs/04-api/COMPONENT_API_MAPPING.md` |
| Data-flow documentation | Request -> state -> render flow was implicit in source | No docs described current page-local state architecture | Created `docs/04-api/DATA_FLOW_SPECIFICATION.md` |
| Error handling documentation | Backend and frontend error behavior was scattered | `RestExceptionHandler`, `SecurityConfig`, `api-client.ts`, and page errors were not mapped together | Created `docs/04-api/ERROR_HANDLING_MATRIX.md` |

## Implementation Checklist Template

Use this checklist for every missing business flow or frontend integration gap:

- [ ] Backend API implemented and covered by service or integration tests
- [ ] API endpoint documented in `docs/04-api/COMPONENT_API_MAPPING.md`
- [ ] Frontend route/component uses real service data, not static fixture data
- [ ] Frontend service function created under `web/src/lib`
- [ ] Request and response DTOs typed from backend contracts
- [ ] Page state handles loading, empty, success, validation error, conflict, 401, and 403 states
- [ ] Component test written with React Testing Library and Vitest mocks
- [ ] Service test written for endpoint, HTTP method, payload, and auth scope
- [ ] E2E test written with Playwright when the flow is business-critical
- [ ] Data flow documented in `docs/04-api/DATA_FLOW_SPECIFICATION.md`
- [ ] Error scenarios documented in `docs/04-api/ERROR_HANDLING_MATRIX.md`
- [ ] Role mapping checked against `docs/reference/role-screen-api-matrix.md`

## Original Priority Fix List

1. Staff lab-result integration: backend exists, patient read exists, but staff UI is still static.
2. Staff doctor schedule integration: backend exists, admin availability management exists, but staff schedule page is static.
3. Patient cancellation/rescheduling decision: either design backend APIs or keep the disabled UI and docs explicit.
4. Frontend token refresh policy: decide whether refresh-cookie support stays backend-only or becomes an automatic frontend retry path.
