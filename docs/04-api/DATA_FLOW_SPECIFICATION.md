# Data Flow Specification

**Status:** current frontend-backend data-flow map for `web/`.
**Generated:** 2026-05-18.
**Source basis:** GitNexus queries, service modules under `web/src/lib`, and controllers under `backend/controller/src/main/java`.

The current frontend does not use Redux or Zustand. State is distributed by page component with React `useState`, `useEffect`, and `useMemo`; shared API behavior lives in `api-client.ts`; auth tokens and roles are stored in browser `sessionStorage`.

## Shared Request Path

```text
User action or page mount
  -> page component calls service function
  -> service function calls apiRequest(path, init, { authScope })
  -> apiRequest builds headers and reads sessionStorage token when authScope is set
  -> fetch(NEXT_PUBLIC_API_BASE_URL || http://localhost:8081/api/v1)
  -> backend controller returns ApiResponse envelope
  -> apiRequest returns envelope or throws ApiClientError
  -> page updates local state
  -> React re-renders loading, success, empty, or error UI
```

## Public Booking

```text
/booking mount
  -> listDoctors()
  -> GET /api/v1/doctors
  -> setDoctors(), choose initial doctor when query contains doctorId
  -> loadSlots(doctorId, date)
  -> GET /api/v1/doctors/{doctorId}/slots?date=YYYY-MM-DD
  -> setSlots(), setSelectedSlotId()
  -> user submits patient form
  -> createPublicAppointment(AppointmentCreateRequest)
  -> POST /api/v1/appointments
  -> setConfirmation(), show confirmation code
```

**State owner:** `PublicBookingPage`.

**Primary state:** `doctors`, `selectedDoctorId`, `slotDate`, `slots`, `selectedSlotId`, `isLoadingDoctors`, `isLoadingSlots`, `isSubmitting`, `message`, `messageTone`, `confirmation`.

**Test anchors:** `web/src/app/(public)/booking/__tests__/page.test.tsx`, `web/src/lib/__tests__/public-api.test.ts`, `web/e2e/specs/booking-wizard.spec.ts`.

## Queue Lifecycle

```text
/staff/queue mount
  -> Promise.all(getTodayQueue(), getTodayAppointments())
  -> GET /api/v1/queue/today and GET /api/v1/appointments/today
  -> mergeAppointments(queue, appointments)
  -> local queue state renders waiting, ready, in-progress columns

Check-in button
  -> checkInAppointment(id, { checkedInAt })
  -> POST /api/v1/appointments/{id}/checkin
  -> merge updated appointment into state

Queue action button
  -> callQueuePatient / assignQueueRoom / startQueueConsultation / completeQueueVisit / skipQueuePatient
  -> POST /api/v1/queue/{id}/{action}
  -> merge updated appointment into state
```

**State owner:** `QueueBoardPage`.

**Derived state:** `getQueueFilter`, `calculatePhysicianLoads`, `calculateAverageWaitMinutes`, and wait badge helpers in `staff-queue.ts`.

**Error handling:** queue-specific `toQueueError` maps 401 to session-expired messaging and 403 to authorization messaging.

**Test anchors:** `web/src/app/staff/(app)/queue/__tests__/page.test.tsx`, `web/src/lib/__tests__/clinical-api.test.ts`, `web/src/lib/__tests__/staff-queue.test.ts`, `web/e2e/specs/staff-queue.spec.ts`, `backend/start/src/test/java/com/hospital/api/QueueWorkflowIntegrationTest.java`.

## Doctor Clinical Record

```text
/staff/medical-records/[id]/edit mount
  -> getAppointmentDetail(appointmentId)
  -> GET /api/v1/appointments/{appointmentId}
  -> populate appointment context and form
  -> doctor edits diagnosis, notes, vitals, follow-up, prescriptions
  -> createMedicalRecord(payload)
  -> POST /api/v1/medical-records
  -> backend saves record, marks appointment DONE, plans reminder, generates PDF, sends visit result email
  -> UI shows success or navigates according to page behavior
```

**State owner:** `MedicalRecordEditorPage`.

**Primary state:** appointment detail, diagnosis form fields, prescription drafts, saving state, and submit error/success state.

**Test anchors:** `web/src/app/staff/(app)/medical-records/[id]/edit/__tests__/page.test.tsx`, `web/src/lib/__tests__/medical-records-api.test.ts`, `backend/application/src/test/java/com/hospital/core/medicalrecord/MedicalRecordServiceTest.java`, `backend/start/src/test/java/com/hospital/api/ClinicalWorkflowIntegrationTest.java`.

## Patient Portal Reads

```text
/portal/login submit
  -> apiRequest("/patient-auth/login", POST)
  -> persistSession("patient", tokens, role)
  -> route to /portal/overview

/portal/overview mount
  -> Promise.all(getPatientPortalOverview(), listPatientPortalLabResults())
  -> GET /api/v1/patient-portal/overview and /patient-portal/lab-results
  -> setOverview(), setLabResults()
  -> render next appointment, unread counts, lab summary

/portal/appointments mount
  -> listPatientPortalAppointments()
  -> GET /api/v1/patient-portal/appointments
  -> split upcoming and past appointments in component state
```

**State owner:** individual portal page components.

**Auth scope:** `patient`, backed by `hms_patient_access_token` and `hms_patient_role`.

**Test anchors:** `web/src/app/portal/(app)/appointments/__tests__/page.test.tsx`, `web/src/app/portal/(app)/lab-results/__tests__/page.test.tsx`, `web/src/lib/__tests__/operations-api.test.ts`, `backend/start/src/test/java/com/hospital/api/PatientPortalIntegrationTest.java`.

## Inventory Operations

```text
/staff/inventory mount
  -> Promise.all(listInventoryItems(), listInventoryLots(), listInventoryMovements(), listInventoryAlerts())
  -> GET inventory endpoints
  -> set items/lots/movements/alerts

Create or update item
  -> createInventoryItem() or updateInventoryItem()
  -> POST or PUT /api/v1/inventory/items
  -> merge saved item into local list or reload

Create lot or movement
  -> createInventoryLot() or recordInventoryMovement()
  -> POST /api/v1/inventory/lots or /inventory/movements
  -> update local lot/movement state
```

**State owner:** `InventoryPage`.

**Test anchors:** `web/src/app/staff/(app)/inventory/__tests__/page.test.tsx`, `web/src/lib/__tests__/operations-api.test.ts`, `backend/start/src/test/java/com/hospital/api/InventoryIntegrationTest.java`.

## Finance

```text
/staff/invoices mount or filter change
  -> listInvoices(status?)
  -> GET /api/v1/invoices?status=...
  -> setInvoices()

Create invoice
  -> createInvoice({ appointmentId })
  -> POST /api/v1/invoices
  -> prepend or reload invoice list

Record payment
  -> recordInvoicePayment(invoiceId, { paymentMethod })
  -> POST /api/v1/invoices/{invoiceId}/payments
  -> update invoice status to PAID in UI

/staff/revenue mount/filter change
  -> getDailyRevenueReport(date) and getMonthlyRevenueReport(month)
  -> render KPI and department breakdown
```

**State owner:** invoices, pricing, and revenue page components.

**Test anchors:** `web/src/app/staff/(app)/invoices/__tests__/page.test.tsx`, `web/src/app/staff/(app)/revenue/__tests__/page.test.tsx`, `web/src/lib/__tests__/operations-api.test.ts`, `backend/start/src/test/java/com/hospital/api/FinanceIntegrationTest.java`.

## Schedule And Availability

```text
/admin/schedule-templates mount
  -> listAdminScheduleTemplates()
  -> GET /api/v1/admin/schedule-templates
  -> render template list

/admin/slots mount
  -> Promise.all(listAdminSlots(), listAdminUsers())
  -> GET /api/v1/admin/slots and /admin/users
  -> render slots and doctor filters

Generate slots
  -> generateAdminSlots({ doctorId, fromDate, toDate })
  -> POST /api/v1/admin/slots/generate
  -> reload or update slot list

Doctor schedule read
  -> backend endpoint exists at GET /api/v1/me/schedule?date=... or ?week=YYYY-Www
  -> no dedicated frontend service wrapper is currently present
```

**State owner:** admin schedule template and slots pages. Staff schedule page remains static.

**Test anchors:** `web/src/app/admin/(app)/schedule-templates/__tests__/page.test.tsx`, `web/src/app/admin/(app)/slots/__tests__/page.test.tsx`, `web/src/lib/__tests__/operations-api.test.ts`, `backend/start/src/test/java/com/hospital/api/ClinicalWorkflowIntegrationTest.java`.
