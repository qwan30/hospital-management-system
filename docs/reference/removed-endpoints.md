# Removed Endpoints Reference

**Status:** canonical removed-endpoint reference for the April 26, 2026 repository baseline.
**Verification sources:** controller mappings under `backend/controller/src/main/java` and Flyway migration `V11__Remove_ai_assistant_features.sql`.

The following endpoint families are intentionally removed from the active Hospital Management System API. They may appear in documentation only as removed, historical, deprecated, or cleanup references.

## 1. Removed Endpoint Families

| Endpoint family | Status | Replacement/current behavior |
| --- | --- | --- |
| `/api/v1/ai/analyze-symptoms` | Removed | Booking keeps symptom intake as form context; no external model-backed symptom analysis exists |
| `/api/v1/internal-assistant/**` | Removed | Staff workflows use normal clinical, queue, lab, and record APIs |
| `/api/v1/admin/knowledge-documents/**` | Removed | No active admin knowledge-document manager exists |
| `/api/v1/admin/monitoring/internal-assistant` | Removed | Admin monitoring is available only through `/api/v1/admin/monitoring` |

## 2. Database Cleanup

Flyway migration `V11__Remove_ai_assistant_features.sql` drops the historical assistant and knowledge tables created by `V9` and `V10` and removes vector-extension usage from the active product.

## 3. Documentation Rule

Removed endpoint families must not appear as:

- active API capabilities
- active UI requirements
- active design requirements
- active integration requirements
- active deployment requirements
- Playwright route smoke-test targets

They may appear only in removed, historical, deprecated, verification, or archive sections.

## 4. Verification

When endpoint documentation changes, search active docs for:

- `/api/v1/ai/analyze-symptoms`
- `/api/v1/internal-assistant`
- `/api/v1/admin/knowledge-documents`
- `/api/v1/admin/monitoring/internal-assistant`

Every occurrence must be clearly framed as removed or historical.
