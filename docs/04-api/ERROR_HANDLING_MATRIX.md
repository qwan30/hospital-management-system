# Error Handling Matrix

**Status:** current API and UI error handling contract.
**Generated:** 2026-05-18.
**Sources:** `RestExceptionHandler`, `SecurityConfig`, `SecurityErrorResponseWriter`, `api-client.ts`, `staff-queue.ts`, and current page-level error states.

Backend errors should be returned in the shared `ApiResponse` envelope:

```json
{
  "success": false,
  "error": {
    "code": "validation_error",
    "message": "..."
  }
}
```

Frontend `apiRequest` reads that envelope and throws `ApiClientError(message, status, code)` when `response.ok` is false.

## HTTP Matrix

| HTTP status | Backend source | Error code | Business meaning | Default UI action | Retry strategy |
| --- | --- | --- | --- | --- | --- |
| 400 | validation handlers, illegal arguments, malformed JSON, parameter mismatch | `validation_error` | Request shape or business input is invalid | Show inline form error or page alert with backend message | Do not auto-retry; user must correct input |
| 401 | security entry point, bad credentials | `unauthorized` | Missing, expired, malformed, or invalid credentials | Staff: redirect to `/staff/login` or show session-expired message. Patient: redirect to `/portal/login` | Retry only after successful login/refresh |
| 403 | access denied handler or authorization exceptions | `forbidden` | Authenticated actor lacks permission | Route to `/forbidden` or show role-specific denial | Do not auto-retry; requires different role |
| 404 | `NotFoundException`, missing resource | `not_found` | Entity or route is not found | Show not-found/empty state and keep page stable | Do not auto-retry unless user changes filters |
| 409 | `ConflictException` | `conflict` | Valid request conflicts with current state | Show conflict message such as slot taken, duplicate invoice, invalid transition | Reload affected resource before a manual retry |
| 415 | unsupported media type handler | `unsupported_media_type` | Request content type is not accepted | Show upload/request format error | Retry with supported content type only |
| 429 | `RateLimitFilter` | rate-limit code from security writer | Too many requests from caller | Show throttling message and disable rapid action | Retry after backoff; avoid tight loops |
| 500 | generic exception handler | `internal_error` | Unexpected server failure | Show generic failure and preserve user input where possible | Manual retry or short exponential backoff for idempotent reads |

## Feature-Specific UI Behavior

| Feature | Expected error behavior | Current anchor |
| --- | --- | --- |
| Public booking | Slot or validation conflicts should keep patient form values and show the backend message. Successful booking shows confirmation code. | `web/src/app/(public)/booking/page.tsx` |
| Queue | 401 maps to staff-session-expired copy; 403 maps to queue authorization copy; other API errors use the backend message. | `web/src/lib/staff-queue.ts` |
| Medical record edit | Missing appointment detail blocks form use; save failure should keep draft data. | `web/src/app/staff/(app)/medical-records/[id]/edit/page.tsx` |
| Patient portal | Read failures show page-level alerts and empty lists instead of leaking another patient's data. | `web/src/app/portal/(app)/*` |
| Inventory | Save/delete failures should keep the form open and show the service error. | `web/src/app/staff/(app)/inventory/page.tsx` |
| Finance | Duplicate invoice, invalid payment, and invalid void attempts should show conflict copy and reload invoice state. | `web/src/app/staff/(app)/invoices/page.tsx` |
| Admin schedule | Slot generation/block/delete failures should preserve filters and show the action error. | `web/src/app/admin/(app)/slots/page.tsx` |

## Backend Exception Mapping

| Exception or condition | HTTP status | Envelope code | Notes |
| --- | --- | --- | --- |
| `NotFoundException` | 404 | `not_found` | Missing entity or resource |
| `ConflictException` | 409 | `conflict` | Duplicate record, invalid state transition, booked slot, paid invoice void |
| `BadCredentialsException` | 401 | `unauthorized` | Invalid login or credential verification |
| `IllegalArgumentException` | 400 | `validation_error` | Business validation not represented by bean validation |
| `AccessDeniedException` | 403 | `forbidden` | Role or ownership check failed |
| `AuthorizationDeniedException` | 403 | `forbidden` | Method security denial with sanitized copy |
| `MethodArgumentNotValidException` | 400 | `validation_error` | Field-level request DTO validation |
| `ConstraintViolationException` | 400 | `validation_error` | Parameter validation |
| `HttpMessageNotReadableException` | 400 | `validation_error` | Malformed request body |
| `MethodArgumentTypeMismatchException` | 400 | `validation_error` | Bad UUID/date/enum parameter |
| `HttpMediaTypeNotSupportedException` | 415 | `unsupported_media_type` | Unsupported upload or request media type |
| unhandled `Exception` | 500 | `internal_error` | Message is intentionally generic |

## Retry And Refresh Guidance

| Request type | Safe to retry? | Guidance |
| --- | --- | --- |
| GET list/detail requests | usually yes | Retry after network failure or 500 with short backoff; do not retry 401/403 without auth change |
| POST create appointment | no automatic retry | User may duplicate a booking; reload slots after conflict |
| POST queue action | no automatic retry | Refresh queue state after conflict before retrying |
| POST medical record | no automatic retry | Duplicate medical record is a real conflict; keep form values |
| POST invoice/payment | no automatic retry | Reload invoice state after conflict |
| PUT profile/admin edits | manual retry | Preserve form values and require user confirmation |
| DELETE/deactivate actions | manual retry | Reload list after success or conflict |

## Test Anchors

| Layer | Current tests |
| --- | --- |
| API client | `web/src/lib/__tests__/api-client.test.ts` |
| Queue error mapping | `web/src/lib/__tests__/staff-queue.test.ts` |
| Backend security envelope | `backend/start/src/test/java/com/hospital/api/SecurityHardeningIntegrationTest.java` |
| Backend edge cases | `backend/start/src/test/java/com/hospital/api/EdgeCaseIntegrationTest.java` |
| Frontend route/API contracts | `web/e2e/specs/api-client.spec.ts`, `web/e2e/specs/security.spec.ts` |
