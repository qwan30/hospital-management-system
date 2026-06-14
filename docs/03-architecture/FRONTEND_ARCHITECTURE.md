# Frontend Architecture

**Status:** current architecture reference for the canonical Next.js app in `frontend/`.
**Generated:** 2026-05-18.
**Sources:** GitNexus scan, `frontend/src/app`, `frontend/src/lib`, `frontend/src/components`, and current frontend tests.

## Runtime Shape

| Concern | Current implementation |
| --- | --- |
| App framework | Next.js app router under `frontend/src/app` |
| Component model | React client components for interactive pages |
| Shared UI | `frontend/src/components/ui`, `frontend/src/components/shells`, `frontend/src/components/auth` |
| API layer | thin service modules under `frontend/src/lib` |
| State management | page-local React state with `useState`, `useEffect`, and `useMemo` |
| Global client state | sessionStorage for access token, token expiry, and role |
| Route authorization | frontend route guard plus backend method/security authorization |
| Tests | Vitest + React Testing Library for unit/component tests; Playwright for E2E and visual flows |

The current codebase does not use Redux, Zustand, React Query, SWR, or Axios. Introducing one should be a deliberate feature decision, not an implicit documentation assumption.

## Service Layer Design

```text
page/component
  -> feature service in frontend/src/lib
  -> apiRequest(path, init, { authScope })
  -> fetch(`${apiBaseUrl}${path}`, credentials: "include")
  -> backend ApiResponse envelope
```

Service modules are grouped by business surface:

| Module | Purpose |
| --- | --- |
| `api-client.ts` | shared request wrapper, base URL, envelope parsing, `ApiClientError`, session persistence |
| `public-api.ts` | doctors, departments, public appointment booking |
| `clinical-api.ts` | queue, appointment list, check-in, queue state transitions |
| `medical-records-api.ts` | appointment detail and medical record creation |
| `patient-records-api.ts` | staff patient search and detail |
| `operations-api.ts` | inventory, finance, admin operations, patient portal reads/updates, schedule admin |
| `rbac.ts` | route/role decisions and navigation filtering |
| `staff-queue.ts` | queue-specific derived state and error mapping |

## API Client Initialization

`getApiBaseUrl()` uses `NEXT_PUBLIC_API_BASE_URL` when set, otherwise defaults to `http://localhost:8081/api/v1`.

`apiRequest` always:
- adds `Content-Type: application/json` and `Accept: application/json`
- includes `credentials: "include"` for refresh-cookie support
- attaches `Authorization: Bearer <token>` when `authScope` is `staff` or `patient`
- parses the response as `ApiEnvelope<T>`
- throws `ApiClientError` for non-2xx responses

Token storage keys:

| Scope | Access token | Expiry | Role |
| --- | --- | --- | --- |
| staff | `hms_staff_access_token` | `hms_staff_access_token_expires_in` | `hms_staff_role` |
| patient | `hms_patient_access_token` | `hms_patient_access_token_expires_in` | `hms_patient_role` |

## Authentication Flow

```text
Staff login submit
  -> POST /api/v1/auth/login
  -> backend returns staff token envelope and refresh cookie
  -> persistSession("staff", tokens, role)
  -> route guard reads staff role and allows matching routes

Patient login/claim submit
  -> POST /api/v1/patient-auth/login or /patient-auth/claim
  -> backend returns patient token envelope and refresh cookie
  -> persistSession("patient", tokens, role)
  -> portal pages call patient-scoped services

Logout
  -> POST /api/v1/auth/logout when staff logout path runs
  -> clearSessions() runs even when the backend logout request fails
```

Refresh-cookie endpoints exist in the backend, but the frontend does not currently implement a generic automatic response interceptor that retries 401s by calling refresh and replaying the original request.

## Request And Response Interceptor Pattern

There is no Axios-style interceptor stack. The current pattern is centralized inside `apiRequest`:

1. request interceptor equivalent: `buildHeaders(init.headers, authScope)`
2. response interceptor equivalent: `readJson(response)` and `if (!response.ok) throw ApiClientError(...)`
3. feature-specific error mapping: done in page components or helpers such as `toQueueError`

If automatic refresh is added later, it should be added at the `apiRequest` boundary and covered by `frontend/src/lib/__tests__/api-client.test.ts`.

## State Management Architecture

| State type | Owner | Example |
| --- | --- | --- |
| server response collections | page-local state | `QueueBoardPage` stores appointments; `InventoryPage` stores items/lots/movements/alerts |
| derived UI state | page `useMemo` or helper module | queue filters, portal appointment tabs, revenue totals |
| action state | page-local state | `isSubmitting`, `isSaving`, `actionErrors`, form errors |
| auth state | sessionStorage plus route guard | staff/patient access token and role |
| static shell navigation | shared shell components and RBAC filters | top nav, side nav, public nav |

This architecture keeps each page independent, but it means cross-page cache invalidation is manual. After mutations, pages either merge the returned object into local state or reload the list through the service function.

## Feature Integration Pattern

For a new backend-backed page:

1. Add or reuse a service function in `frontend/src/lib`.
2. Type the request and response DTOs from the backend controller/shared DTO contract.
3. In the page, keep `isLoading`, `error`, and form/action state explicit.
4. Use `authScope: "staff"` or `authScope: "patient"` for protected endpoints.
5. Add a Vitest service test that verifies the exact endpoint, method, payload, and auth scope.
6. Add a React Testing Library page test for loading, empty, success, and failure states.
7. Add Playwright coverage only when the user journey is business-critical.

## Known Integration Caveats

| Caveat | Evidence | Action |
| --- | --- | --- |
| `BookingWizard` is not a current symbol | GitNexus context failed for `BookingWizard`; `PublicBookingPage` is indexed | Use `PublicBookingPage` in docs and tests |
| Staff lab-results page is static | `frontend/src/app/staff/(app)/lab-results/page.tsx` uses local `labReports` data | Add staff lab result service functions and wire the page before claiming full staff lab integration |
| Staff schedule page is static | `/staff/schedule` has static layout; admin schedule/slot pages are API-backed | Add doctor schedule service wrapper for `/api/v1/me/schedule` if staff schedule becomes a release flow |
| Patient appointment actions are unsupported | portal appointments page disables reschedule/cancel action | Keep the unsupported state until backend APIs exist |
| No automatic token refresh replay | `apiRequest` attaches tokens but does not retry 401 | Document as current behavior or add a tested refresh strategy |
