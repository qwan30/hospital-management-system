# Hospital Management System API Endpoint Reference

**Last updated:** April 26, 2026  
**API version:** v1  
**Base URL:** `/api/v1`  
**Primary contract:** [`../API_CONTRACT.md`](../API_CONTRACT.md)  
**Verification source:** controller mappings under `backend/controller/src/main/java`

The current repository contains roughly 110 mapped controller methods, excluding SpringDoc and Actuator support endpoints.

## 1. Response Envelope

Successful JSON responses use the shared envelope from `backend/controller/src/main/java/com/hospital/shared/api`:

```json
{
  "success": true,
  "data": {},
  "message": "Request completed successfully",
  "error": null,
  "pagination": null,
  "timestamp": "2026-04-26T00:00:00Z"
}
```

Error responses use the same envelope with `success: false`, `data: null`, and an `error` object containing `code`, `message`, and `timestamp`.

PDF endpoints return `application/pdf` instead of the JSON envelope.

## 2. Active API Families

| Area | Base paths | Authentication |
| --- | --- | --- |
| Staff auth | `/auth/*` | public login/refresh/logout flow |
| Patient auth | `/patient-auth/*` | public login/claim/refresh/logout flow |
| Public content | `/content/home`, `/news`, `/departments`, `/doctors` | public read |
| Public booking/helper | `/appointments`, `/chatbot/messages` | public create/chatbot only |
| Clinical operations | `/appointments`, `/queue`, `/medical-records`, `/patient-records`, `/patients`, `/vital-signs`, `/lab-results`, `/me/schedule` | staff roles |
| Finance | `/invoices`, `/pricing`, `/reports/revenue/*` | accountant/admin |
| Inventory | `/inventory/items`, `/inventory/lots`, `/inventory/movements`, `/inventory/alerts` | pharmacist/admin |
| Patient portal | `/patient-portal/overview`, `/patient-portal/appointments`, `/patient-portal/lab-results`, `/patient-portal/messages`, `/patient-portal/profile` | patient |
| Admin | `/admin/users`, `/admin/departments`, `/admin/rooms`, `/admin/schedule-templates`, `/admin/special-closures`, `/admin/slots`, `/admin/stats`, `/admin/monitoring`, `/admin/audit-logs`, `/admin/content/sections`, `/admin/public-content`, `/admin/news` | admin, except audit logs also allow accountant |

## 3. Endpoint Inventory

### 3.1 Public And Authentication

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/api/v1/auth/login` | staff login |
| `POST` | `/api/v1/auth/refresh` | staff refresh-cookie flow |
| `POST` | `/api/v1/auth/logout` | staff logout |
| `POST` | `/api/v1/patient-auth/claim` | patient portal claim |
| `POST` | `/api/v1/patient-auth/login` | patient login |
| `POST` | `/api/v1/patient-auth/refresh` | patient refresh-cookie flow |
| `POST` | `/api/v1/patient-auth/logout` | patient logout |
| `GET` | `/api/v1/content/home` | public homepage content |
| `GET` | `/api/v1/news` | public news |
| `GET` | `/api/v1/departments` | public department list |
| `GET` | `/api/v1/departments/{departmentId}` | public department detail |
| `GET` | `/api/v1/departments/{departmentId}/doctors` | public department doctors |
| `GET` | `/api/v1/doctors` | public doctor list |
| `GET` | `/api/v1/doctors/{doctorId}` | public doctor detail |
| `GET` | `/api/v1/doctors/{doctorId}/slots` | public slot lookup |
| `POST` | `/api/v1/appointments` | public appointment booking |
| `POST` | `/api/v1/chatbot/messages` | deterministic public helper |

### 3.2 Staff Clinical Operations

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/v1/appointments` | appointment list |
| `GET` | `/api/v1/appointments/today` | today queue/intake list |
| `GET` | `/api/v1/appointments/{appointmentId}` | appointment detail |
| `PUT` | `/api/v1/appointments/{appointmentId}` | appointment metadata update |
| `DELETE` | `/api/v1/appointments/{appointmentId}` | appointment cancel |
| `POST` | `/api/v1/appointments/{appointmentId}/checkin` | queue check-in |
| `PUT` | `/api/v1/appointments/{appointmentId}/status` | doctor status update |
| `POST` | `/api/v1/appointments/{appointmentId}/vital-signs` | appointment-scoped vital signs |
| `GET` | `/api/v1/appointments/{appointmentId}/vital-signs` | appointment-scoped vital signs read |
| `POST` | `/api/v1/appointments/{appointmentId}/follow-up` | follow-up scheduling |
| `GET` | `/api/v1/appointments/{appointmentId}/follow-up` | follow-up read |
| `GET` | `/api/v1/queue/today` | queue board |
| `POST` | `/api/v1/queue/{appointmentId}/call` | queue call patient action |
| `POST` | `/api/v1/queue/{appointmentId}/skip` | move ready patient to back of queue |
| `POST` | `/api/v1/queue/{appointmentId}/assign-room` | assign queue patient to consultation room note |
| `POST` | `/api/v1/queue/{appointmentId}/start-consultation` | mark queue patient in consultation |
| `POST` | `/api/v1/queue/{appointmentId}/complete` | complete queue visit |
| `GET` | `/api/v1/me/schedule` | signed-in staff schedule |
| `POST` | `/api/v1/medical-records` | create medical record |
| `POST` | `/api/v1/medical-records/preview.pdf` | prescription PDF preview |
| `GET` | `/api/v1/medical-records/{recordId}/prescription.pdf` | prescription PDF download |
| `GET` | `/api/v1/patient-records` | patient record summaries |
| `GET` | `/api/v1/patient-records/{patientId}` | patient record detail |
| `GET` | `/api/v1/patients/{cccd}/history` | patient history lookup |
| `POST` | `/api/v1/vital-signs` | independent vital signs create |
| `GET` | `/api/v1/vital-signs/{appointmentId}` | independent vital signs read by appointment |
| `PUT` | `/api/v1/vital-signs/{vitalSignId}` | vital signs update |
| `DELETE` | `/api/v1/vital-signs/{vitalSignId}` | vital signs delete |
| `POST` | `/api/v1/lab-results` | create lab result |
| `GET` | `/api/v1/lab-results/{resultId}` | lab result detail |
| `GET` | `/api/v1/appointments/{appointmentId}/lab-results` | lab results for appointment |
| `DELETE` | `/api/v1/lab-results/{resultId}` | lab result delete |

### 3.3 Finance And Inventory

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/v1/invoices` | invoice list |
| `POST` | `/api/v1/invoices` | invoice create |
| `POST` | `/api/v1/invoices/{invoiceId}/payments` | record payment |
| `POST` | `/api/v1/invoices/{invoiceId}/void` | void invoice |
| `GET` | `/api/v1/pricing` | pricing list |
| `POST` | `/api/v1/pricing` | pricing create |
| `PUT` | `/api/v1/pricing/{pricingId}` | pricing update |
| `GET` | `/api/v1/reports/revenue/daily` | daily revenue report |
| `GET` | `/api/v1/reports/revenue/monthly` | monthly revenue report |
| `GET` | `/api/v1/inventory/items` | inventory item list |
| `POST` | `/api/v1/inventory/items` | inventory item create |
| `PUT` | `/api/v1/inventory/items/{itemId}` | inventory item update |
| `DELETE` | `/api/v1/inventory/items/{itemId}` | inventory item delete |
| `GET` | `/api/v1/inventory/lots` | inventory lot list |
| `POST` | `/api/v1/inventory/lots` | inventory lot create |
| `PUT` | `/api/v1/inventory/lots/{lotId}` | inventory lot update |
| `GET` | `/api/v1/inventory/movements` | inventory movement list |
| `POST` | `/api/v1/inventory/movements` | inventory movement create |
| `GET` | `/api/v1/inventory/alerts` | low-stock and expiry alert list |

### 3.4 Patient Portal

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/v1/patient-portal/overview` | portal overview |
| `GET` | `/api/v1/patient-portal/appointments` | patient appointments |
| `GET` | `/api/v1/patient-portal/lab-results` | patient lab results |
| `GET` | `/api/v1/patient-portal/messages` | patient message threads and nested messages |
| `GET` | `/api/v1/patient-portal/profile` | patient profile |
| `PUT` | `/api/v1/patient-portal/profile` | patient profile update |

Current limitation: the patient portal API does not expose patient-side message send/reply, self-cancel, reschedule, or password-change endpoints.

### 3.5 Admin Operations

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/v1/admin/users` | user list |
| `GET` | `/api/v1/admin/users/{userId}` | user detail |
| `POST` | `/api/v1/admin/users` | user create |
| `PUT` | `/api/v1/admin/users/{userId}` | user update |
| `DELETE` | `/api/v1/admin/users/{userId}` | user delete |
| `POST` | `/api/v1/admin/users/{userId}/activate` | activate user |
| `POST` | `/api/v1/admin/users/{userId}/deactivate` | deactivate user |
| `PUT` | `/api/v1/admin/users/{userId}/role` | update role |
| `GET` | `/api/v1/admin/departments` | department list |
| `GET` | `/api/v1/admin/departments/{departmentId}` | department detail |
| `POST` | `/api/v1/admin/departments` | department create |
| `PUT` | `/api/v1/admin/departments/{departmentId}` | department update |
| `DELETE` | `/api/v1/admin/departments/{departmentId}` | department delete |
| `POST` | `/api/v1/admin/departments/{departmentId}/assign-doctor` | assign doctor |
| `DELETE` | `/api/v1/admin/departments/{departmentId}/remove-doctor/{doctorId}` | remove doctor |
| `GET` | `/api/v1/admin/rooms` | room list |
| `GET` | `/api/v1/admin/rooms/{roomId}` | room detail |
| `POST` | `/api/v1/admin/rooms` | room create |
| `PUT` | `/api/v1/admin/rooms/{roomId}` | room update |
| `PUT` | `/api/v1/admin/rooms/{roomId}/status` | room status update |
| `DELETE` | `/api/v1/admin/rooms/{roomId}` | room delete |
| `GET` | `/api/v1/admin/schedule-templates` | schedule template list |
| `POST` | `/api/v1/admin/schedule-templates` | schedule template create |
| `PUT` | `/api/v1/admin/schedule-templates/{templateId}` | schedule template update |
| `GET` | `/api/v1/admin/special-closures` | closure list |
| `POST` | `/api/v1/admin/special-closures` | closure create |
| `PUT` | `/api/v1/admin/special-closures/{closureId}` | closure update |
| `POST` | `/api/v1/admin/slots/generate` | generate slots |
| `PUT` | `/api/v1/admin/slots/{slotId}/block` | block slot |
| `DELETE` | `/api/v1/admin/slots/{slotId}` | delete slot |
| `GET` | `/api/v1/admin/stats` | admin stats |
| `GET` | `/api/v1/admin/monitoring` | monitoring snapshot |
| `GET` | `/api/v1/admin/audit-logs` | audit log list |
| `GET` | `/api/v1/admin/content/sections` | content sections |
| `POST` | `/api/v1/admin/content/sections` | content section create |
| `PUT` | `/api/v1/admin/content/sections/{sectionId}` | content section update |
| `GET` | `/api/v1/admin/public-content` | public content admin list |
| `POST` | `/api/v1/admin/public-content` | public content create |
| `PUT` | `/api/v1/admin/public-content/{contentId}` | public content update |
| `GET` | `/api/v1/admin/news` | admin news list |
| `POST` | `/api/v1/admin/news` | news create |
| `PUT` | `/api/v1/admin/news/{articleId}` | news update |

## 4. Removed API Families

The following endpoint families are no longer part of the active API and must not be used by frontend code or integrations:

- `/api/v1/ai/analyze-symptoms`
- `/api/v1/internal-assistant/**`
- `/api/v1/admin/knowledge-documents/**`
- `/api/v1/admin/monitoring/internal-assistant`

Flyway migration `V11__Remove_ai_assistant_features.sql` drops the historical assistant and knowledge tables. See `docs/reference/removed-endpoints.md` for the canonical removed-endpoint reference.

## 5. Authorization Summary

| Role | Active access |
| --- | --- |
| `ADMIN` | admin configuration, monitoring, audit, clinical support, finance, inventory, and protected operational setup |
| `DOCTOR` | appointments, status updates, follow-up, patient records, medical records, prescription PDF, lab/vital reads |
| `NURSE` | queue, check-in, appointments, follow-up reads, vital signs, and lab-result reads |
| `RECEPTIONIST` | queue, check-in, appointment read/write/cancel support; no seeded demo account is currently persisted |
| `PHARMACIST` | prescription PDF read and inventory read/manage support; no seeded demo account is currently persisted |
| `ACCOUNTANT` | invoices, pricing, revenue reports, and audit-log reads |
| `PATIENT` | own portal overview, appointments, lab results, messages, and profile |

## 6. Rate Limiting

The rate limiter applies to public state-changing routes such as login, refresh, appointment creation, and chatbot messages.

Configure with:

- `security.http.public-rate-limit-per-minute`
- `HMS_PUBLIC_RATE_LIMIT_PER_MINUTE`

## 7. Verification

After endpoint changes, update this file and run:

```bash
cd backend
mvn test
```

For frontend route coverage, run the Playwright commands documented in `docs/HMS_TestPlan.md`.
