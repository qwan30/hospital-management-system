# Hospital Management System Flow-Driven Execution Plan

## 1. Project Understanding Summary

This is not just a feature roadmap. It is a flow-driven execution plan for converting the existing Hospital Management System UI from a mostly visual prototype into real end-to-end hospital business flows.

The main problem is that many UI features already exist visually: buttons, search boxes, forms, calendars, tables, filters, modals, cards, and status controls. However, many of those elements are not connected through the full technical chain: frontend state, event handlers, API calls, backend controller logic, service validation, database reads/writes, response handling, and UI refresh behavior.

For every important existing UI feature, implementation must follow this sequence:

1. Understand the intended business flow.
2. Define the correct user flow.
3. Define the correct technical flow.
4. Compare the current implementation against that flow.
5. Identify the exact missing links.
6. Change code so UI, frontend state, API, backend logic, database, and UI refresh match the expected flow.
7. Verify the flow manually and with automated checks where feasible.

Every code change must be justified by a previously defined flow. If a code change does not support a defined business flow, technical flow, documented gap, acceptance criterion, and verification step, do not make it.

Current architecture facts:

- Backend: Spring Boot 3.3 modular monolith under `backend`.
- Backend modules: `domain`, `infrastructure`, `application`, `controller`, `start`.
- Database: PostgreSQL with Flyway migrations `V1` through `V17`.
- API base: `/api/v1`.
- API envelope: `ApiResponse<T>` with success/data/message/error/pagination/timestamp.
- Frontend: Next.js 16, React 19, TypeScript under `web`.
- Reference-only frontend prototype: `frontend`.
- API client: `frontend/src/lib/api-client.ts`.
- Auth/session: staff and patient tokens stored by auth scope and attached by the API client.
- Existing tests: backend integration/application tests and Playwright/unit tests under `web`.

## 2. Global Flow Execution Model

Every feature must be implemented as a full vertical flow:

User action -> frontend state update -> event handler -> API request -> backend controller -> backend validation/business logic -> database read/write -> backend response -> frontend UI update -> loading/error/empty/success handling -> verification

A feature is not considered working if it only has visible UI. It is also not considered working if it has an event handler but no real API call, an API call but fake IDs, a backend endpoint but no database mutation, or a successful backend mutation but no UI refresh.

For each flow, Codex must identify the weakest missing link and connect the feature end-to-end without redesigning the UI.

## 3. Task 0 - Baseline Verification

Purpose:

Establish the current working state before any code changes.

Scope:

- Do not modify application code.
- Verify backend startup.
- Verify frontend startup.
- Verify database and migrations.
- Verify required environment variables.
- Confirm API base URL convention.
- Confirm `ApiResponse<T>` envelope handling.
- Confirm staff auth/session token handling.
- Confirm patient auth/session token handling.
- Confirm seed users, doctors, patients, appointments, slots.
- Run available lint/typecheck/test/build commands if feasible.
- Document pre-existing failures separately from failures caused by new work.

Output:

- Commands run.
- Current pass/fail status.
- Existing failures.
- Required environment variables.
- Confirmed API response shape.
- Confirmed auth mechanism.
- Confirmed available seed data.
- First safe implementation task.

Suggested commands:

```powershell
cd D:\projects\hospital-management-system
npx.cmd gitnexus status
node .codex\khuym_status.mjs --json
cd backend
mvn.cmd -pl start -am test
cd ..\web
npm run lint
npm run build
npm run test:unit
```

If Docker/Testcontainers are unavailable, record that as a baseline blocker rather than treating it as a new implementation failure.

## 4. Required Flow Definition Template

Every feature must be documented using this structure before code is changed.

### Feature: [Feature name]

Business purpose:
[What this feature is supposed to achieve in the hospital system]

Current behavior:
[What the current UI/code does now]

Problem:
[Why the current feature is static, partially functional, or broken]

Expected user flow:

1. User does ...
2. User sees ...
3. User selects/submits/clicks ...
4. System responds ...

Expected technical flow:

1. Frontend loads ...
2. Frontend stores state ...
3. User action triggers ...
4. Frontend calls API ...
5. Backend controller receives ...
6. Backend service validates ...
7. Backend reads/writes database ...
8. Backend returns response ...
9. Frontend updates UI ...
10. Frontend handles loading/error/empty/success states ...

Current implementation gap:

- Missing frontend state:
- Missing event handler:
- Missing API call:
- Missing API client mapping:
- Missing backend endpoint:
- Missing DTO mapping:
- Missing database operation:
- Missing validation:
- Missing UI refresh:
- Hardcoded/static data:
- Fake IDs:
- Missing tests:

Required code changes:

- Frontend files:
- API client/type files:
- Backend files, only if required:
- Test files:

Acceptance criteria:

- ...

Manual verification:

- ...

Automated verification:

- ...

Status after implementation:
Working / Partially Working / Blocked

## 5. Mock and Static Data Rule

For any implemented flow, active render paths must use real API/database-backed data.

Allowed:

- Real database seed data.
- Loading states.
- Error states.
- Empty states.
- Honest unsupported states.

Not allowed:

- Hardcoded doctors, patients, appointments, invoices, slots, departments, lab results, or medical records in the active render path.
- Fake `doctorId`.
- Fake `slotId`.
- Fake `patientId`.
- Fake `appointmentId`.
- Fake `invoiceId`.
- Fake `labResultId`.
- Fake success messages.
- Silent fallback to mock data after API failure.
- Pretending unsupported actions work.

If backend/API support does not exist:

- Mark the feature as unsupported or blocked.
- Hide the action, disable it, or show honest unsupported copy.
- Do not fake the functionality.

## 6. API Contract Verification Rule

Before implementing each flow, Codex must inspect:

1. Existing frontend component/page.
2. Existing API client.
3. `API_CONTRACT.md`.
4. Backend controller.
5. Request DTO.
6. Response DTO.
7. Backend service/business logic.
8. Database model/migration.
9. Auth/RBAC requirements.

Codex must confirm:

- Endpoint path.
- HTTP method.
- Request payload.
- Response payload.
- Whether response is wrapped in `ApiResponse<T>`.
- Auth requirement.
- Error response format.
- Database tables affected.

Do not guess field names. Do not guess response shape. Do not create duplicate API clients.

## 7. Global Definition of Done

A flow is only done when:

1. Existing UI is preserved unless a small structural change is required.
2. Expected business flow is documented.
3. Expected technical flow is documented.
4. Current implementation gaps are documented.
5. Static/mock data is removed from the implemented render path.
6. No fake IDs are used.
7. Frontend state exists for data, loading, error, empty, and success states.
8. User actions are wired to real handlers.
9. API calls use the existing API client convention.
10. `ApiResponse<T>` is handled correctly.
11. Auth/session/token handling follows the existing project pattern.
12. Existing backend endpoints are reused when available.
13. DTOs and validation rules are respected.
14. Database read/write happens through existing backend services.
15. Mutations refresh or invalidate affected UI data.
16. Backend validation errors are displayed clearly.
17. Unsupported features are not faked.
18. Relevant tests/checks are run where feasible.
19. Manual verification steps are documented.
20. Changed files are summarized.

## 8. Flow-Specific Execution Details

### Feature: Public Doctor Directory

Business purpose:
Allow public users to discover real doctors and choose an actual doctor for later appointment booking.

Current behavior:
`frontend/src/app/(public)/doctors/page.tsx` shows visible doctor directory UI, search, filters, doctor cards, and action buttons, but the render path is static/hardcoded.

Problem:
Typing a doctor name or selecting filters does not reliably query real doctor data. Doctor cards may not map to real backend `doctorId` values, so downstream booking can use fake or unsupported doctor identifiers.

Expected user flow:

1. User opens `/doctors`.
2. User sees loading while doctors load.
3. User sees real doctors from the backend.
4. User searches by name or specialty.
5. User sees filtered results, empty state, or error state.
6. User selects a doctor and is routed to a real booking path using the real `doctorId`.

Expected technical flow:

1. Frontend loads the doctor directory page.
2. Frontend stores doctors, search/filter state, loading, error, and empty state.
3. Search/filter input updates local state or query params.
4. Frontend calls `GET /api/v1/doctors`.
5. Backend doctor controller returns real `DoctorResponse` data.
6. Backend service reads active doctor users and department/specialty data.
7. Database read uses `users` and related department data.
8. Backend returns `ApiResponse<List<DoctorResponse>>`.
9. Frontend unwraps `data` and renders real cards.
10. Frontend handles loading/error/empty states without mock fallback.

Current implementation gap:

- Missing frontend state: real doctors, loading, error, empty, filter state.
- Missing event handler: search/filter should affect displayed real data.
- Missing API call: directory page must call existing doctors endpoint.
- Missing API client mapping: add/reuse typed doctor API function.
- Missing backend endpoint: none expected if `GET /doctors` satisfies need.
- Missing DTO mapping: confirm `DoctorResponse` fields before rendering.
- Missing database operation: read-only existing backend.
- Missing validation: search input trimming and safe empty handling.
- Missing UI refresh: reload on retry or filter change.
- Hardcoded/static data: remove active hardcoded doctor cards.
- Fake IDs: remove fake doctor IDs from booking links.
- Missing tests: add UI/API-backed mocked test for directory behavior.

Required code changes:

- Frontend files: public doctors page and any doctor card component.
- API client/type files: central doctor API function/types.
- Backend files, only if required: none unless contract gap is confirmed.
- Test files: Playwright or unit test covering real doctor API render, search, empty, error.

Acceptance criteria:

- `/doctors` renders only backend doctors.
- Search changes visible doctor results.
- Empty state appears when no doctor matches.
- API failure shows an error and retry path.
- Booking action carries real `doctorId`.

Manual verification:

- Start backend and frontend.
- Open `/doctors`.
- Search for seeded doctor name/specialty.
- Click booking action and verify real doctor context is preserved.
- Force API failure and verify no mock fallback appears.

Automated verification:

- Mock `GET /api/v1/doctors` in Playwright/unit test.
- Assert loading, success, empty, and error states.
- Assert no hardcoded doctor appears when API returns empty data.

Status after implementation:
Pending.

### Feature: Doctor Slot Lookup

Business purpose:
Allow patients and staff to see real available appointment slots for a selected doctor and date.

Current behavior:
Slot/calendar UI exists in public booking and staff booking screens, but date/time choices may be static or may use fake `slotId` values.

Problem:
Booking cannot be trustworthy unless selected slots come from backend availability and map to real `time_slots` rows.

Expected user flow:

1. User selects a real doctor.
2. User selects a date.
3. User sees loading while slots load.
4. User sees available slots for that doctor/date.
5. User selects one real slot.
6. User sees empty state if no slots are available.

Expected technical flow:

1. Frontend receives or stores selected `doctorId`.
2. Frontend stores selected date, slots, selected slot, loading, error, empty state.
3. Date change triggers slot lookup.
4. Frontend calls `GET /api/v1/doctors/{doctorId}/slots?date=YYYY-MM-DD`.
5. Backend controller receives doctor ID and date.
6. Backend service validates doctor/date and queries availability.
7. Database read uses `time_slots`.
8. Backend returns `ApiResponse<List<DoctorSlotResponse>>`.
9. Frontend renders only returned available slots and stores selected real `slotId`.
10. Frontend handles loading/error/empty states and clears invalid previous selections.

Current implementation gap:

- Missing frontend state: selected doctor/date/slot, slot loading/error/empty.
- Missing event handler: date selection must trigger real lookup.
- Missing API call: slot endpoint must be called.
- Missing API client mapping: typed slot lookup helper.
- Missing backend endpoint: none expected if `GET /doctors/{doctorId}/slots` is sufficient.
- Missing DTO mapping: confirm `DoctorSlotResponse` fields.
- Missing database operation: read-only existing backend.
- Missing validation: invalid date/no doctor selected.
- Missing UI refresh: clear selected slot after doctor/date changes.
- Hardcoded/static data: remove static time buttons from active render path.
- Fake IDs: remove fake `slotId`.
- Missing tests: slot lookup success/empty/error and selection test.

Required code changes:

- Frontend files: booking date/slot step, staff slot selector if used.
- API client/type files: doctor slot API function/types.
- Backend files, only if required: none unless contract gap is confirmed.
- Test files: mocked E2E/unit for slot loading and selection.

Acceptance criteria:

- Slot UI is disabled until real doctor/date exist.
- Slots shown are exactly backend slots.
- Selecting a slot stores backend `slot.id`.
- Changing doctor/date clears stale selected slot.
- API failure does not show fake slots.

Manual verification:

- Select seeded doctor.
- Choose date with seeded available slots.
- Confirm real slots render.
- Choose date without slots and confirm empty state.
- Start booking and confirm selected `slotId` is real.

Automated verification:

- Mock slot endpoint.
- Assert loading, success, empty, error, and stale-selection clearing.

Status after implementation:
Pending.

### Feature: Public Appointment Booking

Business purpose:
Allow a public patient to book a real appointment with a selected doctor and available slot, creating or updating patient data and reserving backend time slots.

Current behavior:
`frontend/src/app/(public)/booking/page.tsx` already posts to `/appointments`, but it uses environment/fake doctor and slot IDs plus placeholder patient fields in places.

Problem:
The form can appear successful without reflecting a real hospital booking flow. A real booking must use selected backend doctor/slot IDs and payload fields matching `AppointmentCreateRequest`.

Expected user flow:

1. User selects a real doctor.
2. User selects a real date and slot.
3. User enters patient/contact details.
4. User submits the form.
5. System validates required fields.
6. System creates appointment or returns conflict/validation error.
7. User sees real confirmation code or clear error.
8. Selected slots refresh so booked slots are no longer shown as available.

Expected technical flow:

1. Frontend loads doctor selection from real doctor API.
2. Frontend loads slots from real slot API.
3. Frontend stores form state matching `AppointmentCreateRequest`.
4. Submit handler validates required client-side fields without inventing backend-only data.
5. Frontend calls `POST /api/v1/appointments`.
6. Backend controller receives `AppointmentCreateRequest`.
7. Backend service validates doctor, slot ownership, contiguous availability, patient identifiers, and conflict conditions.
8. Database write creates/updates patient, creates appointment, and marks slots booked.
9. Backend returns `ApiResponse<AppointmentResponse>` with confirmation details.
10. Frontend shows success state, confirmation code, and refreshes affected slot data.

Current implementation gap:

- Missing frontend state: real doctor/slot selection integrated with form state.
- Missing event handler: submit must block without real doctorId and slotId.
- Missing API call: existing call must use real payload.
- Missing API client mapping: typed appointment create function.
- Missing backend endpoint: none expected; public `POST /appointments` exists.
- Missing DTO mapping: form must match `AppointmentCreateRequest`.
- Missing database operation: existing backend handles patient, appointment, slot mutation.
- Missing validation: CCCD/email/phone/date/gender/address/required fields.
- Missing UI refresh: slots should refresh after successful booking or conflict.
- Hardcoded/static data: remove placeholder patient and booking values.
- Fake IDs: remove fake `doctorId` and `firstSlotId`.
- Missing tests: booking success, validation failure, conflict handling.

Required code changes:

- Frontend files: public booking page/steps.
- API client/type files: appointment request/response types.
- Backend files, only if required: none unless contract gap is found.
- Test files: E2E/unit for booking payload, success, conflict, validation.

Acceptance criteria:

- Booking cannot submit without real doctor and slot.
- Payload conforms to `AppointmentCreateRequest`.
- Backend validation errors are displayed.
- Slot conflict returns an honest conflict message.
- Success confirmation uses backend response, not fake text.

Manual verification:

- Select seeded doctor and real slot.
- Fill valid patient details.
- Submit and confirm appointment is created.
- Recheck slots and confirm booked slot is no longer available.
- Try booking same slot again and confirm conflict handling.

Automated verification:

- Mock appointment API for success and validation/conflict errors.
- Integrated test if backend/database are available.
- Assert no fake IDs are sent.

Status after implementation:
Pending.

### Feature: Staff Patient Search and Detail

Business purpose:
Allow staff to find real patients and review patient context before clinical or administrative actions.

Current behavior:
Staff patient screens exist visually, but search and detail data may be static rather than backed by `patient-records`.

Problem:
Clinical workflows cannot safely proceed if staff search results or patient detail panels are not real database records.

Expected user flow:

1. Staff logs in.
2. Staff opens patient search/detail page.
3. Staff types patient name, phone, or CCCD.
4. System shows matching real patients.
5. Staff selects a patient.
6. System shows patient demographics, appointments, and medical record history.

Expected technical flow:

1. Route guard confirms staff auth.
2. Frontend stores query, results, selected patient/detail, loading, error, empty state.
3. Search input triggers debounced or submitted search.
4. Frontend calls `GET /api/v1/patient-records?query=...`.
5. Backend controller checks auth/RBAC.
6. Backend service searches patients and maps summaries.
7. Database reads `patients`.
8. Selecting patient calls `GET /api/v1/patient-records/{patientId}`.
9. Backend reads patient, appointments, medical records.
10. Frontend renders real detail and handles loading/error/empty states.

Current implementation gap:

- Missing frontend state: query/results/detail/loading/error/empty.
- Missing event handler: search input and row/card selection.
- Missing API call: search and detail endpoints.
- Missing API client mapping: patient record API functions/types.
- Missing backend endpoint: none expected.
- Missing DTO mapping: confirm patient summary/detail response.
- Missing database operation: read-only existing backend.
- Missing validation: query trimming and minimum search behavior if required.
- Missing UI refresh: detail reload after related mutations.
- Hardcoded/static data: remove active fake patient rows.
- Fake IDs: remove fake patient IDs.
- Missing tests: authenticated patient search/detail behavior.

Required code changes:

- Frontend files: staff patient search/list/detail pages.
- API client/type files: patient record API functions/types.
- Backend files, only if required: none unless contract gap is confirmed.
- Test files: authenticated mocked or integrated staff patient tests.

Acceptance criteria:

- Staff-only route uses existing session handling.
- Search results come from backend.
- Selecting patient loads real detail.
- Empty and error states are honest.
- No fake patient IDs are used.

Manual verification:

- Log in as seeded staff user.
- Search seeded patient by name/CCCD.
- Open patient detail.
- Confirm appointments and records match backend data.
- Verify unauthorized access redirects or errors correctly.

Automated verification:

- Mock authenticated patient search/detail endpoints.
- Assert auth token scope is staff.
- Assert empty/error states and selected detail render.

Status after implementation:
Pending.

### Feature: Doctor Schedule and Appointment Status Update

Business purpose:
Allow clinical staff to view real appointment schedules and update appointment status as care progresses.

Current behavior:
Staff schedule/status screens exist visually. Queue flow is partly functional, but schedule and status controls may still be static or disconnected outside the queue path.

Problem:
Clinical operations require real appointment state transitions. Static status buttons create false confidence and do not update the database.

Expected user flow:

1. Doctor or staff logs in.
2. User opens schedule/appointments view.
3. User sees real appointments for today/date filters.
4. User selects an appointment.
5. User updates status, check-in, vitals, or follow-up only where backend supports it.
6. System persists the change and refreshes schedule/queue/detail UI.

Expected technical flow:

1. Route guard confirms staff auth and role.
2. Frontend stores appointments, filters, selected appointment, loading, error, success.
3. Date/status filters trigger appointment list API.
4. Frontend calls existing appointment endpoints such as `GET /appointments`, `GET /appointments/today`, `PUT /appointments/{id}/status`, `PUT /appointments/{id}/checkin`, or related supported endpoints.
5. Backend controller checks auth/RBAC.
6. Backend service validates allowed status transition and ownership/role rules.
7. Database updates `appointments`, and related vitals/follow-up tables if used.
8. Backend returns `ApiResponse<AppointmentResponse>` or supported DTO.
9. Frontend refreshes affected appointment list/detail.
10. Frontend shows loading/error/success and does not fake unsupported actions.

Current implementation gap:

- Missing frontend state: schedule data, filters, mutation state, success/error.
- Missing event handler: status/change controls must call real API.
- Missing API call: appointment list/status endpoints wired where absent.
- Missing API client mapping: appointment list/status helpers.
- Missing backend endpoint: likely none for basic appointment status; confirm per action.
- Missing DTO mapping: status request DTO and response DTO.
- Missing database operation: existing backend for supported mutations.
- Missing validation: allowed status values and role permissions.
- Missing UI refresh: invalidate/reload list after mutation.
- Hardcoded/static data: remove active fake appointment rows.
- Fake IDs: remove fake appointment IDs.
- Missing tests: status transition success and backend error behavior.

Required code changes:

- Frontend files: doctor/staff schedule and appointment status pages/components.
- API client/type files: appointment query/update functions/types.
- Backend files, only if required: only for confirmed contract gaps.
- Test files: authenticated schedule/status tests.

Acceptance criteria:

- Appointment list is API-backed.
- Status actions send real appointment IDs.
- Unsupported actions are disabled or honest.
- Successful mutation refreshes UI.
- Backend validation/RBAC errors are shown.

Manual verification:

- Log in as seeded doctor/staff.
- Open schedule/today appointments.
- Update one supported status.
- Confirm database-backed list reflects new status after refresh.
- Try invalid transition and confirm clear error.

Automated verification:

- Mock appointment list and status update APIs.
- Assert mutation payload and UI refresh.
- Backend integration test if existing test harness supports status transition.

Status after implementation:
Pending.

### Feature: Medical Record Creation

Business purpose:
Allow clinicians to create a real medical record for a valid appointment after the patient has reached an allowed clinical status.

Current behavior:
Medical record edit/create UI exists visually, but may not load real appointment/patient context or submit real `MedicalRecordCreateRequest`.

Problem:
Medical records are clinical source-of-truth data. They cannot be faked or detached from a real appointment.

Expected user flow:

1. Doctor opens a valid appointment.
2. System loads appointment and patient context.
3. Doctor enters diagnosis, clinical notes, vitals/follow-up, and prescription items.
4. Doctor submits record.
5. System validates appointment status and duplicate record rules.
6. System saves record and updates appointment state.
7. Doctor sees success, record detail, or supported PDF actions.

Expected technical flow:

1. Frontend loads appointment context by real `appointmentId`.
2. Frontend stores appointment, patient context, form state, prescription rows, loading, error, success.
3. Submit handler validates required fields.
4. Frontend calls `POST /api/v1/medical-records`.
5. Backend controller checks staff auth/RBAC.
6. Backend service validates appointment exists, doctor ownership if applicable, appointment status, and duplicate medical record.
7. Database writes `medical_records` and `prescription_items`, then updates appointment status to done where service defines it.
8. Backend returns `ApiResponse<MedicalRecordResponse>`.
9. Frontend shows success and refreshes related appointment/patient context.
10. PDF preview/download is enabled only if backend endpoint supports it.

Current implementation gap:

- Missing frontend state: appointment context, form data, prescription rows, mutation state.
- Missing event handler: form submit to real endpoint.
- Missing API call: medical record create endpoint.
- Missing API client mapping: medical record request/response types.
- Missing backend endpoint: `POST /medical-records` exists; PDF preview/download endpoints must be verified before UI enablement.
- Missing DTO mapping: `MedicalRecordCreateRequest`.
- Missing database operation: existing backend writes medical records/prescriptions.
- Missing validation: diagnosis/notes/appointment status/prescription item rules.
- Missing UI refresh: update appointment/patient history after save.
- Hardcoded/static data: remove fake patient/appointment context.
- Fake IDs: remove fake appointment IDs.
- Missing tests: duplicate record, invalid appointment status, success.

Required code changes:

- Frontend files: medical record create/edit page and prescription form component.
- API client/type files: medical record API functions/types.
- Backend files, only if required: none unless contract gap is confirmed.
- Test files: authenticated medical record create tests.

Acceptance criteria:

- Record cannot be created without real appointment context.
- Payload matches `MedicalRecordCreateRequest`.
- Duplicate and invalid appointment status errors are shown.
- Successful save persists real record and refreshes UI.
- PDF actions only appear when backend support is confirmed.

Manual verification:

- Log in as seeded doctor.
- Open eligible appointment.
- Create medical record.
- Confirm appointment/patient history updates.
- Attempt duplicate record and verify error.
- Attempt invalid appointment status and verify error.

Automated verification:

- Mock medical record create success and validation errors.
- Backend integration test for duplicate/status if already present or feasible.
- Assert no fake appointment ID is submitted.

Status after implementation:
Pending.

## 9. Split Flow Slices

Public Booking:

- A. Real doctor selection.
- B. Real date and slot selection.
- C. Patient/contact form validation based on `AppointmentCreateRequest`.
- D. Real appointment submit.
- E. Confirmation and conflict handling.

Medical Record:

- A. Load appointment and patient context.
- B. Wire form state and validation.
- C. Submit real medical record.
- D. PDF preview/download only if backend supports it.
- E. Handle duplicate record and invalid appointment status errors.

Admin CRUD:

- A. Users.
- B. Departments.
- C. Rooms.
- D. News/content.
- E. Schedule templates.
- F. Closures.
- G. Slots.

Finance:

- A. Invoice list.
- B. Invoice creation.
- C. Payment/void actions.
- D. Pricing CRUD.
- E. Revenue reports.

Portal:

- A. Appointments.
- B. Lab results.
- C. Messages.
- D. Profile update.
- E. Unsupported actions handling.

## 10. Recommended Implementation Order

0. Baseline verification.
1. Public doctor directory.
2. Doctor slot lookup.
3. Public appointment booking.
4. Public departments.
5. Staff patient search/detail.
6. Doctor schedule/status update.
7. Medical record creation.
8. Patient portal appointments/labs/messages/profile.
9. Finance invoices/pricing/revenue.
10. Admin CRUD and scheduling.
11. Inventory mutations.
12. Notifications only if backend schema/API exists.

Reasoning:

- Start with read-only public flows because they are easiest to verify and prove API/client/envelope handling.
- Implement slot lookup before booking because booking must not use fake `slotId`.
- Make public appointment booking the first true database mutation.
- Continue into staff and clinical workflows after public booking proves frontend -> API -> backend -> database integration.
- Leave broad admin, finance, and inventory work until core hospital flows are stable.
- Notifications must remain blocked unless backend schema/API support is confirmed.

## 10A. Execution Progress Checklist

- [x] Task 0: Baseline verification.
- [x] Task 1: Public doctor directory.
- [x] Task 2: Doctor slot lookup.
- [x] Task 3A: Public booking real doctor selection.
- [x] Task 3B: Public booking real date and slot selection.
- [x] Task 3C: Public booking form validation.
- [x] Task 3D: Public booking submit.
- [x] Task 3E: Public booking confirmation and conflict handling.
- [x] Task 4: Public departments.
- [x] Task 5: Staff patient search and detail.
- [x] Task 6: Doctor schedule and appointment status update.
- [x] Task 7A: Medical record context loading.
- [x] Task 7B: Medical record form state and validation.
- [x] Task 7C: Medical record submit.
- [x] Task 7D: Medical record PDF support gated by backend support.
- [x] Task 7E: Medical record duplicate/status error handling.
- [x] Task 8A: Patient portal appointments.
- [x] Task 8B: Patient portal lab results.
- [x] Task 8C: Patient portal messages.
- [x] Task 8D: Patient portal profile update.
- [x] Task 8E: Patient portal unsupported actions handling.
- [x] Task 9A: Finance invoice list.
- [x] Task 9B: Finance invoice creation.
- [x] Task 9C: Finance payment/void actions.
- [x] Task 9D: Finance pricing CRUD.
- [x] Task 9E: Finance revenue reports.
- [x] Task 10A: Admin users.
- [x] Task 10B: Admin departments.
- [x] Task 10C: Admin rooms.
- [x] Task 10D: Admin news/content.
- [x] Task 10E: Admin schedule templates.
- [x] Task 10F: Admin closures.
- [x] Task 10G: Admin slots.
- [x] Task 11: Inventory mutations.
- [x] Task 12: Notifications support check.

Last checkpoint:

- `npm run lint`: passed.
- `npm run test:unit`: passed, 33 files and 257 tests.
- `npm run build`: passed.
- `git diff --check`: passed with line-ending warnings only.
- Task 10A admin users checkpoint: focused admin user list/detail/API tests passed and `npm run lint` passed.
- Task 10B admin departments checkpoint: focused department/API tests passed and `npm run lint` passed.
- Task 10C admin rooms checkpoint: focused room/API tests passed and `npm run lint` passed.
- Task 10D admin news/content checkpoint: focused news, public-content, and API tests passed and `npm run lint` passed.
- Task 10E admin schedule templates checkpoint: focused schedule-template/API tests passed and `npm run lint` passed.
- Task 10F admin closures checkpoint: focused special-closure/API tests passed and `npm run lint` passed.
- Task 10G admin slots checkpoint: focused slot/API tests passed and `npm run lint` passed.
- Task 11 inventory mutations checkpoint: focused inventory/API tests passed and `npm run lint` passed.
- Task 12 notifications checkpoint: no dedicated notification schema/controller/API contract was found; notification implementation remains unsupported and was not faked.
- Final execution checkpoint: `npm run lint`, `npm run test:unit` (43 files, 332 tests), `npm run build`, and `git diff --check` passed. `git diff --check` reported line-ending warnings only. GitNexus CLI status reported the index is up to date; this installed CLI does not expose the documented `detect-changes` command.

## 11. Codex Implementation Task List

Task 0: Baseline Verification - Done

- Scope: Run startup/check/test commands and document pre-existing failures.
- Out of scope: application code changes.
- Acceptance: first safe implementation task identified.

Task 1: Public Doctor Directory Flow - Done

- Scope: Connect `/doctors` to real doctor API and remove active hardcoded render data.
- Out of scope: doctor admin CRUD.
- Commands: `npm run lint`, focused unit/E2E if available.

Task 2: Doctor Slot Lookup Flow - Done

- Scope: Connect doctor/date selection to real slot endpoint.
- Out of scope: slot generation/admin.
- Commands: `npm run lint`, focused slot tests.

Task 3A: Public Booking Real Doctor Selection - Done

- Scope: Booking step uses real selected doctor.
- Out of scope: appointment submit.
- Acceptance: no fake `doctorId`.

Task 3B: Public Booking Real Date and Slot Selection - Done

- Scope: Booking step uses real backend slots.
- Acceptance: no fake `slotId`.

Task 3C: Public Booking Form Validation - Done

- Scope: Map form to `AppointmentCreateRequest`.
- Acceptance: invalid client data blocks submit; backend errors display.

Task 3D: Public Booking Submit - Done

- Scope: `POST /appointments` with real payload.
- Acceptance: appointment created in database.

Task 3E: Public Booking Confirmation and Conflict Handling - Done

- Scope: backend confirmation and slot conflict states.
- Acceptance: no fake success; conflict message shown.

Task 4: Public Departments - Done

- Scope: Connect public department pages to backend/public content where supported.
- Acceptance: no active hardcoded department list if API exists.

Task 5: Staff Patient Search and Detail - Done

- Scope: Search/detail via `patient-records`.
- Acceptance: staff auth, real patient IDs, real detail.

Task 6: Doctor Schedule and Appointment Status Update - Done

- Scope: API-backed appointment list/status actions.
- Acceptance: real mutation and UI refresh.

Task 7A: Medical Record Context Loading - Done

- Scope: Load real appointment/patient context.
- Acceptance: no fake clinical context.

Task 7B: Medical Record Form State and Validation - Done

- Scope: Form maps to `MedicalRecordCreateRequest`.
- Acceptance: required fields validated.

Task 7C: Medical Record Submit - Done

- Scope: `POST /medical-records`.
- Acceptance: database record created.

Task 7D: Medical Record PDF Support - Done

- Scope: Enable preview/download only for confirmed backend endpoints.
- Acceptance: unsupported PDF action is hidden/disabled honestly.

Task 7E: Medical Record Error Handling - Done

- Scope: duplicate record and invalid appointment status.
- Acceptance: backend errors displayed.

Task 8A-8E: Portal Flows - Done

- Scope: appointments, labs, messages, profile update, unsupported actions.
- Acceptance: no fake portal actions.

Task 9A-9E: Finance Flows - Done

- Scope: invoices, creation, payment/void, pricing CRUD, revenue.
- Acceptance: actions backed by finance APIs.

Task 10A-10G: Admin CRUD and Scheduling

- Scope: users, departments, rooms, news/content, templates, closures, slots.
- Acceptance: each domain implemented and tested separately.

Task 11: Inventory Mutations

- Scope: convert read-only inventory UI into supported mutations if APIs exist.
- Acceptance: no fake stock movement.

Task 12: Notifications

- Scope: only if backend schema/API exists.
- Acceptance: otherwise marked unsupported.

## 12. After-Each-Flow Execution Report

After implementing each flow, Codex must report:

- Flow name.
- Status: Working / Partially Working / Blocked.
- Business flow implemented.
- Technical flow implemented.
- Files changed.
- APIs used.
- Database impact.
- Loading/error/empty/success states added.
- Tests/checks run.
- Manual verification result.
- Existing failures, if any.
- New failures, if any.
- Remaining limitations.

Do not proceed to the next flow if the current flow has unresolved compile/runtime errors caused by current changes.

## 13. Final Flow-Driven Execution Report

At the end of implementation, produce:

# Flow-Driven Implementation Report

## Summary

Which static or partially functional UI flows were converted into working end-to-end flows.

## Completed Flows

For each flow:

- Status.
- User actions supported.
- APIs used.
- Database impact.
- Verification result.
- Remaining limitations.

## Unsupported Features

List features that could not be implemented because backend API/schema does not exist.

## Changed Files

List changed files grouped by flow.

## Checks Run

List commands and results.

## Final Status

State whether the main supported hospital flows are now:

- API-backed.
- Database-backed.
- Free of fake IDs.
- Free of active hardcoded data in implemented flows.
- Manually or automatically verified.

## 14. Save Target

Save this revised plan as:

`docs/hospital-flow-driven-execution-plan.md`

Do not modify application code while saving this document. Only create or update this plan document.
