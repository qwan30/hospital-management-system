# Hospital Management System Test Plan

Status: aligned to the repository on 2026-04-16

## 1. Current Automated Test Coverage

The repository currently has meaningful backend test coverage and no real frontend test suite.

### 1.1 Backend unit tests in `backend/core`

Current unit-tested service areas include:

- symptom analysis
- appointment write workflow
- appointment workflow
- medical record service
- prescription PDF service
- reminder service
- inventory write service
- lab result service
- vital signs service
- internal assistant service and query routing

### 1.2 Backend integration tests in `backend/api`

Current integration and hardening suites include:

- `ClinicalWorkflowIntegrationTest`
- `InternalAssistantIntegrationTest`
- `SecurityHardeningIntegrationTest`

### 1.3 Frontend tests

- no frontend unit tests
- no frontend integration tests
- no frontend end-to-end tests

## 2. Current Backend Verification Goals

### 2.1 Public and booking

Verify:

- public content endpoints return expected payloads
- doctor and department discovery endpoints return active data
- booking succeeds with valid data
- double-booking and slot conflicts are rejected correctly
- symptom analysis returns either Gemini or heuristic output safely

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

### 2.4 Patient portal

Verify:

- claim flow matches patient identity
- patient auth login and refresh work with cookies
- portal overview, appointments, lab results, messages, and profile endpoints honor patient scope

### 2.5 Internal assistant

Verify:

- role restrictions by mode
- patient context restrictions for doctor and nurse
- citations are returned when evidence exists
- refusal states occur when evidence or access is missing
- knowledge document upload and lifecycle actions work for admin

## 3. Frontend Test Plan For Upcoming UI Work

When the frontend is implemented, add:

### 3.1 Unit tests

- form schema validation
- auth stores
- assistant state logic
- table/filter helpers
- status badge formatting

### 3.2 Integration tests

- public booking wizard against mocked API responses
- staff auth refresh behavior
- doctor medical record submission flow
- nurse check-in and vital signs flow
- patient portal overview and profile update flow

### 3.3 End-to-end tests

- guest booking journey
- doctor completes encounter and downloads PDF
- nurse checks in and records vital signs
- accountant records a payment
- admin uploads and activates a knowledge document
- patient claims access and views lab results

## 4. Manual QA Checklist For Design And Frontend Work

- role navigation matches permissions
- forbidden actions are hidden or disabled before submission
- cookie-based refresh does not create visible auth churn
- PDFs open or download correctly
- assistant refusal states are understandable
- patient portal clearly distinguishes read-only areas from editable areas
- public and portal layouts work on mobile
- staff layouts remain readable on desktop and tablet widths

## 5. Quality Gates

Before calling the UI implementation complete:

- backend tests remain green
- frontend test coverage exists for critical forms and auth flows
- at least one E2E journey exists for guest, staff, admin, and patient users
- no UX flow depends on an API that the current repository does not expose
