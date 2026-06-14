# Hospital Management System API Contract

Status: aligned with the repository on 2026-06-14. AI and internal assistant endpoints removed. Inventory dispense endpoint added.

Base URL: `/api/v1`

## Active Endpoint Families

| Domain | Endpoints |
| --- | --- |
| Staff auth | `/auth/login`, `/auth/refresh`, `/auth/logout` |
| Patient auth | `/patient-auth/claim`, `/patient-auth/login`, `/patient-auth/refresh`, `/patient-auth/logout` |
| Public content | `/content/home`, `/news`, `/departments`, `/doctors` |
| Public booking and helper | `/appointments`, `/chatbot/messages` |
| Clinical workflows | `/appointments`, `/queue`, `/medical-records`, `/patient-records`, `/patients`, `/vital-signs`, `/lab-results`, `/me/schedule` |
| Finance | `/invoices`, `/pricing`, `/reports/revenue/daily`, `/reports/revenue/monthly` |
| Inventory | `/inventory/items`, `/inventory/lots`, `/inventory/movements` |
| Patient portal | `/patient-portal/overview`, `/patient-portal/appointments`, `/patient-portal/lab-results`, `/patient-portal/messages`, `/patient-portal/profile` |
| Admin | `/admin/users`, `/admin/departments`, `/admin/rooms`, `/admin/schedule-templates`, `/admin/special-closures`, `/admin/slots`, `/admin/stats`, `/admin/monitoring`, `/admin/audit-logs`, `/admin/content/sections`, `/admin/public-content`, `/admin/news` |

## Removed Endpoint Families

The following endpoint families are intentionally removed and should not be used by frontend or integrations:

- `/api/v1/ai/analyze-symptoms`
- `/api/v1/internal-assistant/**`
- `/api/v1/admin/knowledge-documents/**`
- `/api/v1/admin/monitoring/internal-assistant`

## Response Envelope

```json
{
  "success": true,
  "data": {},
  "message": "string",
  "error": null,
  "pagination": null,
  "timestamp": "2026-04-26T00:00:00Z"
}
```

Errors use the shared API error envelope from `backend/controller/src/main/java/com/hospital/shared/api` with `success: false`, a null data payload, and an `error` object containing `code`, `message`, and `timestamp`.

For the expanded endpoint inventory, see `docs/API_ENDPOINTS_COMPREHENSIVE.md`.

## Compatibility Note

The booking request still contains the legacy field `aiDurationMinutes` for compatibility with the existing appointment schema. It now represents the planned visit duration and is not backed by an external model integration.
