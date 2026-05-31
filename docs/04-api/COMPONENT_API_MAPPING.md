# Component API Mapping

**Status:** GitNexus-backed integration map for the current `web/` frontend and Spring Boot API.
**Generated:** 2026-05-18.
**GitNexus status refresh:** `hospital-management-system`, commit `c255231`, status up to date on 2026-05-27.

This document maps user-facing frontend pages and service modules to backend API endpoints. It should be updated with `docs/reference/role-screen-api-matrix.md` whenever a route, service function, or controller endpoint changes.

## Frontend Service Layer

| Service module | Responsibility | Auth scope | Backend family |
| --- | --- | --- | --- |
| `web/src/lib/api-client.ts` | Base `fetch` wrapper, envelope parsing, token headers, session storage helpers | `staff`, `patient`, or public | all `/api/v1/*` endpoints |
| `web/src/lib/public-api.ts` | Public discovery and appointment booking | public | departments, doctors, appointments |
| `web/src/lib/clinical-api.ts` | Staff queue, appointment listing, check-in, queue actions, doctor status update | staff | appointments, queue |
| `web/src/lib/medical-records-api.ts` | Appointment detail and medical record creation | staff | appointments, medical records |
| `web/src/lib/patient-records-api.ts` | Staff patient record search and detail | staff | patient records |
| `web/src/lib/operations-api.ts` | Inventory, finance, admin operations, patient portal read/update, schedule admin | staff or patient | inventory, invoices, pricing, reports, admin, patient portal |

`BookingWizard` is not a current indexed symbol. The active public booking implementation is `PublicBookingPage` in `web/src/app/(public)/booking/page.tsx`.

## Public Booking

| Frontend route/component | Service function | API endpoint | Method | Request payload | Expected response |
| --- | --- | --- | --- | --- | --- |
| `/booking` / `PublicBookingPage` | `listDoctors()` | `/api/v1/doctors` | GET | none | `DoctorResponse[]` |
| `/booking` / `PublicBookingPage` | `listDoctorSlots(doctorId, date)` | `/api/v1/doctors/{doctorId}/slots?date=YYYY-MM-DD` | GET | query date | `DoctorSlotResponse[]` |
| `/booking` / `PublicBookingPage` | `createPublicAppointment(request)` | `/api/v1/appointments` | POST | `AppointmentCreateRequest` with doctor, first slot, duration, patient identity, address, symptoms | `AppointmentResponse` with appointment id, confirmation code, status, date |
| `/departments` | `listDepartments()` | `/api/v1/departments` | GET | none | `DepartmentResponse[]` |
| `/departments/[id]` | `getDepartment(departmentId)` | `/api/v1/departments/{departmentId}` | GET | path department id | `DepartmentDetailResponse` |

## Queue And Clinical Workflow

| Frontend route/component | Service function | API endpoint | Method | Request payload | Expected response |
| --- | --- | --- | --- | --- | --- |
| `/staff/queue` / `QueueBoardPage` | `getTodayQueue()` | `/api/v1/queue/today` | GET | staff bearer token | `ClinicalAppointmentResponse[]` |
| `/staff/queue` / `QueueBoardPage` | `getTodayAppointments()` | `/api/v1/appointments/today` | GET | staff bearer token | `ClinicalAppointmentResponse[]` |
| `/staff/queue` / `handleCheckIn` | `checkInAppointment(id, request)` | `/api/v1/appointments/{appointmentId}/checkin` | POST | `{ checkedInAt }` | updated `ClinicalAppointmentResponse` |
| `/staff/queue` / action buttons | `callQueuePatient(id)` | `/api/v1/queue/{appointmentId}/call` | POST | none | updated `ClinicalAppointmentResponse` |
| `/staff/queue` / action buttons | `assignQueueRoom(id, request)` | `/api/v1/queue/{appointmentId}/assign-room` | POST | `{ roomName }` | updated `ClinicalAppointmentResponse` |
| `/staff/queue` / action buttons | `startQueueConsultation(id)` | `/api/v1/queue/{appointmentId}/start-consultation` | POST | none | updated `ClinicalAppointmentResponse` |
| `/staff/queue` / action buttons | `completeQueueVisit(id)` | `/api/v1/queue/{appointmentId}/complete` | POST | none | updated `ClinicalAppointmentResponse` |
| `/staff/queue` / action buttons | `skipQueuePatient(id)` | `/api/v1/queue/{appointmentId}/skip` | POST | none | updated `ClinicalAppointmentResponse` |
| `/staff/doctor/dashboard` | `updateAppointmentStatus(id, status)` | `/api/v1/appointments/{appointmentId}/status` | PUT | `{ status }` | updated `ClinicalAppointmentResponse` |
| `/staff/medical-records/[id]/edit` | `getAppointmentDetail(id)` | `/api/v1/appointments/{appointmentId}` | GET | path appointment id | `AppointmentDetailResponse` |
| `/staff/medical-records/[id]/edit` | `createMedicalRecord(request)` | `/api/v1/medical-records` | POST | diagnosis, notes, vital signs, follow-up date, prescriptions | `MedicalRecordResponse` |

## Lab Results

| Frontend route/component | Service function | API endpoint | Method | Request payload | Expected response |
| --- | --- | --- | --- | --- | --- |
| `/portal/lab-results` / `PatientLabResultsPage` | `listPatientPortalLabResults()` | `/api/v1/patient-portal/lab-results` | GET | patient bearer token | `PatientPortalLabResultResponse[]` |
| `/staff/lab-results/new` | `createLabResult()` | `/api/v1/lab-results` | POST | `LabResultCreateRequest` (`appointmentId`, `testName`, `resultValue`, `referenceRange`, `status`, `notes`) | `LabResultResponse` |
| `/staff/lab-results/[id]` | `getLabResult()` | `/api/v1/lab-results/{resultId}` | GET | result id | `LabResultResponse` |
| `/staff/lab-results` | `listAppointments()` + `listLabResultsByAppointment()` | `/api/v1/appointments/{appointmentId}/lab-results` | GET | appointment id | `LabResultResponse[]` |
| staff lab result actions | `deleteLabResult()` | `/api/v1/lab-results/{resultId}` | DELETE | result id | no content |

The backend lab API exists and has integration tests. Staff lab list/detail/create/delete flows are now API-backed in `web/`; patient portal lab-result read is API-backed.

## Patient Portal

| Frontend route/component | Service function | API endpoint | Method | Request payload | Expected response |
| --- | --- | --- | --- | --- | --- |
| `/portal/login` | `apiRequest<PatientLoginResponse>("/patient-auth/login")` | `/api/v1/patient-auth/login` | POST | email/password | patient token envelope |
| `/portal/claim` | `apiRequest<PatientLoginResponse>("/patient-auth/claim")` | `/api/v1/patient-auth/claim` | POST | identity proof and password | patient token envelope |
| `/portal/overview` | `getPatientPortalOverview()` | `/api/v1/patient-portal/overview` | GET | patient bearer token | `PatientPortalOverviewResponse` |
| `/portal/appointments` | `listPatientPortalAppointments()` | `/api/v1/patient-portal/appointments` | GET | patient bearer token | `PatientPortalAppointmentResponse[]` |
| `/portal/lab-results` | `listPatientPortalLabResults()` | `/api/v1/patient-portal/lab-results` | GET | patient bearer token | `PatientPortalLabResultResponse[]` |
| `/portal/messages` | `listPatientPortalMessages()` | `/api/v1/patient-portal/messages` | GET | patient bearer token | `PatientPortalMessageThreadResponse[]` |
| `/portal/profile` | `getPatientPortalProfile()` | `/api/v1/patient-portal/profile` | GET | patient bearer token | `PatientPortalProfileResponse` |
| `/portal/profile` | `updatePatientPortalProfile(request)` | `/api/v1/patient-portal/profile` | PUT | profile update payload | `PatientPortalProfileResponse` |

Patient appointment cancel/reschedule actions are intentionally disabled in the UI because no patient-side write API exists for those operations.

## Inventory And Pharmacy

| Frontend route/component | Service function | API endpoint | Method | Request payload | Expected response |
| --- | --- | --- | --- | --- | --- |
| `/staff/inventory` | `listInventoryItems()` | `/api/v1/inventory/items` | GET | staff bearer token | `InventoryItemResponse[]` |
| `/staff/inventory` | `createInventoryItem(request)` | `/api/v1/inventory/items` | POST | item create payload | `InventoryItemResponse` |
| `/staff/inventory` | `updateInventoryItem(itemId, request)` | `/api/v1/inventory/items/{itemId}` | PUT | item update payload | `InventoryItemResponse` |
| `/staff/inventory` | `deleteInventoryItem(itemId)` | `/api/v1/inventory/items/{itemId}` | DELETE | path item id | empty envelope |
| `/staff/inventory` | `listInventoryLots()` | `/api/v1/inventory/lots` | GET | staff bearer token | `InventoryLotResponse[]` |
| `/staff/inventory` | `createInventoryLot(request)` | `/api/v1/inventory/lots` | POST | lot create payload | `InventoryLotResponse` |
| `/staff/inventory` | `listInventoryMovements()` | `/api/v1/inventory/movements` | GET | staff bearer token | `InventoryMovementResponse[]` |
| `/staff/inventory` | `recordInventoryMovement(request)` | `/api/v1/inventory/movements` | POST | movement payload | `InventoryMovementResponse` |
| `/staff/inventory` | `listInventoryAlerts()` | `/api/v1/inventory/alerts` | GET | staff bearer token | `InventoryAlertResponse[]` |

## Finance

| Frontend route/component | Service function | API endpoint | Method | Request payload | Expected response |
| --- | --- | --- | --- | --- | --- |
| `/staff/invoices` | `listInvoices(status?)` | `/api/v1/invoices?status=...` | GET | optional invoice status | `InvoiceResponse[]` |
| `/staff/invoices` | `createInvoice(request)` | `/api/v1/invoices` | POST | `{ appointmentId }` | `InvoiceResponse` |
| `/staff/invoices` | `recordInvoicePayment(invoiceId, request)` | `/api/v1/invoices/{invoiceId}/payments` | POST | `{ paymentMethod }` | `InvoiceResponse` |
| `/staff/invoices` | `voidInvoice(invoiceId)` | `/api/v1/invoices/{invoiceId}/void` | POST | none | `InvoiceResponse` |
| `/staff/pricing` | `listServicePricing()` | `/api/v1/pricing` | GET | staff bearer token | `ServicePricingResponse[]` |
| `/staff/pricing` | `createServicePricing(request)` | `/api/v1/pricing` | POST | pricing payload | `ServicePricingResponse` |
| `/staff/pricing` | `updateServicePricing(id, request)` | `/api/v1/pricing/{pricingId}` | PUT | pricing payload | `ServicePricingResponse` |
| `/staff/revenue` | `getDailyRevenueReport(date)` | `/api/v1/reports/revenue/daily?date=...` | GET | date query | `DailyRevenueReportResponse` |
| `/staff/revenue` | `getMonthlyRevenueReport(month)` | `/api/v1/reports/revenue/monthly?month=...` | GET | month query | `MonthlyRevenueReportResponse` |

External payment gateways are out of scope. Payments are recorded as invoice state changes.

## Schedule And Availability Administration

| Frontend route/component | Service function | API endpoint | Method | Request payload | Expected response |
| --- | --- | --- | --- | --- | --- |
| `/admin/schedule-templates` | `listAdminScheduleTemplates()` | `/api/v1/admin/schedule-templates` | GET | staff bearer token | `DoctorScheduleTemplateResponse[]` |
| `/admin/schedule-templates` | `createAdminScheduleTemplate(request)` | `/api/v1/admin/schedule-templates` | POST | template payload | `DoctorScheduleTemplateResponse` |
| `/admin/schedule-templates` | `updateAdminScheduleTemplate(id, request)` | `/api/v1/admin/schedule-templates/{templateId}` | PUT | template payload | `DoctorScheduleTemplateResponse` |
| `/admin/slots` | `listAdminSlots()` | `/api/v1/admin/slots` | GET | staff bearer token | `AdminSlotResponse[]` |
| `/admin/slots` | `generateAdminSlots(request)` | `/api/v1/admin/slots/generate` | POST | doctor/date range payload | `AdminSlotGenerateResult` |
| `/admin/slots` | `blockAdminSlot(slotId)` | `/api/v1/admin/slots/{slotId}/block` | PUT | path slot id | `AdminSlotResponse` |
| `/admin/slots` | `deleteAdminSlot(slotId)` | `/api/v1/admin/slots/{slotId}` | DELETE | path slot id | empty envelope |
| `/admin/special-closures` | `listAdminSpecialClosures()` | `/api/v1/admin/special-closures` | GET | staff bearer token | `SpecialClosureResponse[]` |
| `/admin/special-closures` | `createAdminSpecialClosure(request)` | `/api/v1/admin/special-closures` | POST | closure payload | `SpecialClosureResponse` |

`/staff/schedule` is currently a static schedule page. The doctor schedule data endpoint exists as `/api/v1/me/schedule`, and doctor dashboard uses appointment status update APIs, but a full staff schedule service wrapper is still a candidate integration gap.
