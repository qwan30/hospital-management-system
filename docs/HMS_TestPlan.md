# Hospital Management System Test Plan

Status: aligned with the repository on 2026-05-13 after staff frontend auth, RBAC navigation, and queue component coverage updates.

Documentation map: [README.md](README.md)
Route inventory: [reference/frontend-route-inventory.md](reference/frontend-route-inventory.md)

## 1. Current Automated Test Coverage

The repository currently has meaningful backend test coverage and a Playwright-based frontend suite under `web/e2e/`.

The backend tests now follow the DDD-oriented Maven split:

- service/unit tests live under `backend/application`
- Spring Boot integration and module-boundary tests live under `backend/start`
- domain, infrastructure, and controller modules currently rely on downstream tests for coverage

### 1.1 Backend unit tests in `backend/application`

Current unit-tested service areas include:

- appointment write workflow
- appointment workflow
- medical record service
- prescription PDF service
- reminder service
- inventory write service
- inventory alert service
- operations monitoring snapshot service
- lab result service
- RBAC authorization service
- vital signs service

### 1.2 Backend integration tests in `backend/start`

Current integration and hardening suites include:

- `ClinicalWorkflowIntegrationTest`
- `SecurityHardeningIntegrationTest`
- `ModuleBoundaryTest`

`ModuleBoundaryTest` verifies both declared Maven module dependencies and source-level imports so controller/start code cannot accidentally rely on hidden transitive module dependencies.

### 1.3 Frontend tests

- API-client behavior coverage verifies optional staff bearer-token attachment without changing public calls.
- Component coverage verifies staff route-guard redirects, role-filtered staff navigation, hidden unauthorized staff CTAs, and staff login fail-closed behavior when a backend response lacks a session payload.
- Mocked UI coverage verifies `/staff/queue` unauthorized handling, live queue rendering, check-in row updates, and queue call/room/start/complete actions.
- Queue page component coverage verifies loading, unauthorized, filtering, check-in, terminal appointment hiding, and row-level action error states.
- Backend-integrated Playwright coverage verifies staff auth, patient auth/claim, logout, public booking, nurse queue access, nurse check-in when a waiting appointment exists, and forbidden non-nurse queue access.

Current Playwright spec files under `web/e2e/specs`:

- `a11y-integrated.spec.ts`
- `admin-pages.spec.ts`
- `all-routes-exhaustive.spec.ts`
- `api-client.spec.ts`
- `auth-integrated.spec.ts`
- `booking-wizard.spec.ts`
- `operations-api.spec.ts`
- `performance.spec.ts`
- `portal-pages.spec.ts`
- `rbac.spec.ts`
- `rbac-enforcement.spec.ts`
- `responsive.spec.ts`
- `route-audit.spec.ts`
- `security.spec.ts`
- `seo-audit.spec.ts`
- `staff-clinical.spec.ts`
- `staff-operations.spec.ts`
- `staff-queue.spec.ts`
- `ui-smoke.spec.ts`
- `visual.spec.ts`
- `workflows.spec.ts`

Verification scope note:

- Required CI smoke command: `npm run test:e2e:ci`. This runs the contract/API route smoke files explicitly listed in `web/package.json` on Chromium only.
- Required UI smoke command: `npm run test:e2e:ui`. This runs `@ui` tests on Chromium only.
- Required visual command: `npm run test:e2e:visual`. This is intentionally scoped to the maintained Chromium baseline set.
- `performance.spec.ts` is exploratory and skipped until stable browser Web Vitals instrumentation is added.
- WebKit, Mobile Safari, Firefox, and Mobile Chrome projects remain available for manual expansion, but they are not release gates until their browser binaries and snapshot baselines are maintained.

Coverage note: 80%+ remains a quality target. Do not treat it as measured current coverage unless a fresh coverage report is generated.

## 2. Current Backend Verification Goals

### 2.1 Public and booking

Verify:

- public content endpoints return expected payloads
- doctor and department discovery endpoints return active data
- booking succeeds with valid data
- double-booking and slot conflicts are rejected correctly

### 2.2 Staff workflows

Verify:

- staff auth login, refresh, and logout
- role-based access control for doctor, nurse, accountant, and admin routes
- appointment list filtering and pagination behavior
- check-in, status updates, follow-up, and vital signs flows
- medical record creation and PDF generation

### 2.3 Finance and inventory

Verify:

- invoice creation, payment capture, and void flows
- pricing create and update
- revenue report queries
- inventory item, lot, and movement write operations
- inventory low-stock and expiry alert generation
- inventory write audit events

### 2.4 Patient portal

Verify:

- claim flow matches patient identity
- patient auth login and refresh work with cookies
- portal overview, appointments, lab results, messages, and profile endpoints honor patient scope

## 3. Frontend Test Plan For Upcoming UI Work

The canonical Next.js frontend is `web/`. Static design prototypes in `frontend/` remain references only.

### 3.1 Unit tests

- form schema validation
- auth stores
- table/filter helpers
- status badge formatting

### 3.2 Integration tests

- public booking wizard against mocked API responses
- staff auth refresh behavior
- doctor medical record submission flow
- nurse check-in and vital signs flow
- patient portal overview and profile update flow

### 3.3 End-to-end tests

Playwright is configured in `web/playwright.config.ts` with tests under `web/e2e/`.

Commands:

- `npm run test:e2e:ui`: frontend-only route, runtime, accessibility, responsive, and workflow smoke checks on Chromium.
- `npm run test:e2e:integrated`: backend-backed auth/API checks. Requires `HMS_API_URL`, defaulting to `http://localhost:8081/api/v1`; skips if backend health is unavailable.
- `npm run test:e2e:visual`: Chromium visual snapshot baselines for high-risk pages.
- `npm run test:e2e:headed`: headed debug mode.
- `npm run test:e2e:report`: open the HTML report.

Covered route families:

- public: home, departments, department detail, doctors, news, booking, privacy, terms, security, session-expired
- staff: login, dashboard, patients, queue, schedule, booking, slots/review/success/symptoms, inventory, invoices, lab results, lab result create, medical record editor, nurse intake, doctor dashboard/detail, prescription preview, pricing, revenue, support, vital signs
- patient portal: login, overview, records, appointments, lab results, messages, profile, claim, billing, diagnostics, inventory, patients, pharmacy, scheduling, staff, support, admit
- admin: dashboard, appointments, audit logs, departments, monitoring, news, public content, rooms, users, user detail

Current E2E flows:

- staff login calls `/api/v1/auth/login`, stores the access token in session storage, and opens `/staff/dashboard`
- nurse queue opens `/staff/queue`, calls `/api/v1/queue/today`, merges today appointment data for waiting check-in actions, posts `/api/v1/appointments/{appointmentId}/checkin`, and exercises queue call, room assignment, consultation start, and completion endpoints
- non-nurse staff queue access handles `403` with an unauthorized state
- inventory workspace calls item, lot, movement, and alert APIs and renders low-stock and expiry counts
- admin monitoring renders active, inventory, and schedule alert counts from `/api/v1/admin/monitoring`
- admin audit logs render queue and inventory audit actions from `/api/v1/admin/audit-logs`
- invalid staff login stays on `/staff/login` and shows an alert
- patient login calls `/api/v1/patient-auth/login`
- patient claim calls `/api/v1/patient-auth/claim`
- staff logout calls `/api/v1/auth/logout`
- frontend route guards allow and deny routes according to `web/src/lib/rbac.ts`
- staff side navigation hides links and CTA targets that the stored role cannot access
- public booking validates required intake fields and emits an appointment request once the backend is available
- portal/staff/admin smoke checks validate the main user-facing destinations and headings

## 4. Manual QA Checklist For Design And Frontend Work

- role navigation matches permissions
- forbidden actions are hidden or disabled before submission
- cookie-based refresh does not create visible auth churn
- PDFs open or download correctly
- patient portal clearly distinguishes read-only areas from editable areas
- public and portal layouts work on mobile
- staff layouts remain readable on desktop and tablet widths

## 5. Quality Gates

Before calling the UI implementation complete:

- backend tests remain green
- frontend test coverage exists for critical forms and auth flows
- at least one E2E journey exists for guest, staff, admin, and patient users
- no UX flow depends on an API that the current repository does not expose
