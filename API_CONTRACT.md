# Hospital Management System API Contract

Status: aligned with the repository on 2026-04-26 after AI and internal assistant removal.

Base URL: `/api/v1`

## Active Endpoint Families

| Domain | Endpoints |
| --- | --- |
| Staff auth | `/auth/login`, `/auth/refresh`, `/auth/logout` |
| Patient auth | `/patient-auth/claim`, `/patient-auth/login`, `/patient-auth/refresh`, `/patient-auth/logout` |
| Public content | `/content/home`, `/news`, `/departments`, `/doctors` |
| Public booking and helper | `/appointments`, `/chatbot/messages` |
| Clinical workflows | `/appointments`, `/queue`, `/medical-records`, `/patient-records`, `/vital-signs`, `/lab-results` |
| Finance | `/invoices`, `/pricing`, `/reports/revenue/daily`, `/reports/revenue/monthly` |
| Inventory | `/inventory/items`, `/inventory/lots`, `/inventory/movements` |
| Patient portal | `/patient-portal/overview`, `/patient-portal/appointments`, `/patient-portal/lab-results`, `/patient-portal/messages`, `/patient-portal/profile` |
| Admin | `/admin/users`, `/admin/departments`, `/admin/rooms`, `/admin/schedule-templates`, `/admin/special-closures`, `/admin/slots`, `/admin/stats`, `/admin/monitoring`, `/admin/audit-logs`, `/admin/content/sections`, `/admin/public-content`, `/admin/news` |

## Removed Endpoint Families

The following endpoint families are intentionally removed and should not be used by frontend or integrations:

- `/ai/analyze-symptoms`
- `/internal-assistant/**`
- `/admin/knowledge-documents/**`
- `/admin/monitoring/internal-assistant`

## Response Envelope

```json
{
  "success": true,
  "data": {},
  "message": "string"
}
```

Errors use the shared API error envelope from `backend/controller/src/main/java/com/hospital/shared/api`.

## Compatibility Note

The booking request still contains the legacy field `aiDurationMinutes` for compatibility with the existing appointment schema. It now represents the planned visit duration and is not backed by an external model integration.
