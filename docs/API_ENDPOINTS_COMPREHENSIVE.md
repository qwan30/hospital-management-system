# Hospital Management System - API Endpoints Documentation

**Last Updated:** April 26, 2026
**API Version:** v1
**Base URL:** `/api/v1`
**Authentication:** JWT Bearer Token for staff APIs; patient refresh tokens use HttpOnly cookies.

## Active API Families

| Area | Base paths | Authentication |
| --- | --- | --- |
| Staff auth | `/auth/*` | public login/refresh/logout flow |
| Patient auth | `/patient-auth/*` | public login/claim/refresh/logout flow |
| Public content | `/content/home`, `/news`, `/departments`, `/doctors` | public read |
| Public booking | `/appointments`, `/chatbot/messages` | public create/chatbot |
| Clinical operations | `/appointments`, `/queue`, `/medical-records`, `/patient-records`, `/vital-signs`, `/lab-results` | staff roles |
| Finance | `/invoices`, `/pricing`, `/reports/revenue/*` | accountant/admin |
| Inventory | `/inventory/items`, `/inventory/lots`, `/inventory/movements` | staff roles |
| Patient portal | `/patient-portal/overview`, `/patient-portal/appointments`, `/patient-portal/lab-results`, `/patient-portal/messages`, `/patient-portal/profile` | patient |
| Admin | `/admin/users`, `/admin/departments`, `/admin/rooms`, `/admin/schedule-templates`, `/admin/special-closures`, `/admin/slots`, `/admin/stats`, `/admin/monitoring`, `/admin/audit-logs`, `/admin/content/sections`, `/admin/public-content`, `/admin/news` | admin |

## Removed API Families

The following endpoint families are no longer part of the active API:

- `/api/v1/ai/analyze-symptoms`
- `/api/v1/internal-assistant/**`
- `/api/v1/admin/knowledge-documents/**`
- `/api/v1/admin/monitoring/internal-assistant`

Flyway migration `V11__Remove_ai_assistant_features.sql` drops the historical assistant and knowledge tables.

## Response Envelope

Successful responses use the shared envelope:

```json
{
  "success": true,
  "data": {},
  "message": "string"
}
```

Error responses use the shared error envelope and should not expose stack traces or secrets.

## Public Endpoints

Public read endpoints:

- `GET /api/v1/content/home`
- `GET /api/v1/news`
- `GET /api/v1/departments`
- `GET /api/v1/departments/{id}`
- `GET /api/v1/doctors`
- `GET /api/v1/doctors/{id}`
- `GET /api/v1/doctors/{id}/slots`

Public write endpoints:

- `POST /api/v1/appointments`
- `POST /api/v1/chatbot/messages`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/patient-auth/claim`
- `POST /api/v1/patient-auth/login`
- `POST /api/v1/patient-auth/refresh`

## Authorization

| Role | Access |
| --- | --- |
| `ADMIN` | admin configuration, monitoring, audit, content, and operational setup |
| `DOCTOR` | assigned clinical appointments, patient records, medical records, prescriptions, lab/vital reads |
| `NURSE` | queue, check-in, vital signs, and supported clinical reads |
| `ACCOUNTANT` | invoices, pricing, revenue reports, and supported audit reads |
| `PATIENT` | own portal overview, appointments, lab results, messages, and profile |

## Rate Limiting

The rate limiter applies to public state-changing routes such as login, refresh, appointment creation, and chatbot messages.

Configure with:

- `security.http.public-rate-limit-per-minute`
- `HMS_PUBLIC_RATE_LIMIT_PER_MINUTE`

## Verification

After endpoint changes, run:

```bash
cd backend
mvn test
```

For frontend route coverage, run the Playwright commands documented in `HMS_TestPlan.md`.
