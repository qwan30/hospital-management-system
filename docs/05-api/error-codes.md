# Error Codes

**Scope:** Backend HTTP API error contract for the Hospital Management System.
**Source files:**
- `backend/controller/src/main/java/com/hospital/shared/api/ApiResponse.java`
- `backend/controller/src/main/java/com/hospital/api/config/RestExceptionHandler.java`
- `backend/controller/src/main/java/com/hospital/api/config/SecurityErrorResponseWriter.java`
- `backend/controller/src/main/java/com/hospital/api/auth/JwtAuthenticationFilter.java`
- `backend/controller/src/main/java/com/hospital/api/config/RateLimitFilter.java`

---

## Error Envelope

Every error response follows a consistent structure using the shared `ApiResponse<T>` record:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "validation_error",
    "message": "email: must not be empty"
  },
  "message": "email: must not be empty",
  "pagination": null,
  "timestamp": "2026-06-14T10:30:00Z"
}
```

### Field Reference

| Field | Type | Always Present | Description |
|-------|------|----------------|-------------|
| `success` | `boolean` | Yes | `false` for all error responses |
| `data` | `null` | Yes | Always `null` when `success` is `false` |
| `error.code` | `string` | Yes | Machine-readable error identifier |
| `error.message` | `string` | Yes | Human-readable explanation; safe for UI display |
| `message` | `string` | Yes | Duplicates `error.message` for convenience |
| `pagination` | `null` | Yes | Always `null` when `success` is `false` |
| `timestamp` | `string` (ISO 8601) | Yes | Server-side timestamp of the response |

---

## HTTP Status Code Summary

| Status | Meaning | Primary Error Code(s) |
|--------|---------|----------------------|
| 200 OK | Successful response | -- |
| 201 Created | Resource created successfully | -- |
| 204 No Content | Successful deletion | -- |
| 400 Bad Request | Validation or business rule failure | `validation_error` |
| 401 Unauthorized | Missing, expired, or malformed credentials | `unauthorized` |
| 403 Forbidden | Authenticated but insufficient permissions | `forbidden` |
| 404 Not Found | Resource does not exist | `not_found` |
| 409 Conflict | Request conflicts with current server state | `conflict` |
| 415 Unsupported Media Type | Request content type not accepted | `unsupported_media_type` |
| 429 Too Many Requests | Rate limit exceeded | `rate_limited` |
| 500 Internal Server Error | Unexpected server failure | `internal_error` |

---

## RestExceptionHandler Pattern

Located at `backend/controller/src/main/java/com/hospital/api/config/RestExceptionHandler.java`.

This `@RestControllerAdvice` maps domain and framework exceptions to standardized `ApiResponse` envelopes:

| Exception | HTTP Status | Error Code |
|-----------|-------------|------------|
| `NotFoundException` | 404 | `not_found` |
| `ConflictException` | 409 | `conflict` |
| `BadCredentialsException` | 401 | `unauthorized` |
| `IllegalArgumentException` | 400 | `validation_error` |
| `AccessDeniedException` | 403 | `forbidden` |
| `AuthorizationDeniedException` | 403 | `forbidden` |
| `MethodArgumentNotValidException` | 400 | `validation_error` |
| `ConstraintViolationException` | 400 | `validation_error` |
| `HttpMessageNotReadableException` | 400 | `validation_error` (malformed body) |
| `MethodArgumentTypeMismatchException` | 400 | `validation_error` (invalid parameter) |
| `HttpMediaTypeNotSupportedException` | 415 | `unsupported_media_type` |
| `Exception` (catch-all) | 500 | `internal_error` |

### Response Flow

```
Request
  |
  v
RateLimitFilter                 (429 if exceeded)
  |
  v
JwtAuthenticationFilter         (401 if token missing/expired/malformed)
  |
  v
Controller / @RestControllerAdvice
  |
  +--> RestExceptionHandler     (400, 401, 403, 404, 409, 415, 500)
  |
  v
Response to client
```

---

## SecurityErrorResponseWriter

Located at `backend/controller/src/main/java/com/hospital/api/config/SecurityErrorResponseWriter.java`.

Used by servlet filters (where `@RestControllerAdvice` does not apply) to write standard `ApiResponse` error envelopes directly to the `HttpServletResponse` output stream. Sets request attributes for audit tracing:

| Attribute Name | Value |
|----------------|-------|
| `hms.security.denial.code` | Machine-readable error code (`unauthorized`, `forbidden`, `rate_limited`) |
| `hms.security.denial.reason` | Human-readable explanation |

Used by:
- `SecurityConfig` authentication entry point (401) and access denied handler (403)
- `JwtAuthenticationFilter` expired/malformed token handling (401)
- `RateLimitFilter` rate limit exceeded (429)

---

## Validation Error Field-Level Details

When `@Valid` request body validation fails (`MethodArgumentNotValidException`), field-level errors are concatenated into a single message:

```
status: must not be null, email: must not be empty, patientName: must not be blank
```

Each field error is formatted as `fieldName: errorMessage`, separated by `, `.

### Common Validation Constraints

| Annotation | Typical Message |
|------------|-----------------|
| `@NotBlank` | `field: must not be blank` |
| `@Email` | `field: must be a well-formed email address` |
| `@Size(min, max)` | `field: size must be between {min} and {max}` |
| `@NotNull` | `field: must not be null` |
| `@Positive` | `field: must be greater than 0` |
| `@Past` | `field: must be a past date` |

---

## Error Code Reference

### Authentication (401)

| Scenario | Error Message | Source |
|----------|---------------|--------|
| No `Authorization` header on protected route | `Authentication is required` | `SecurityConfig` entry point |
| Bearer token is malformed or unparseable | `Bearer token is malformed` | `JwtAuthenticationFilter` |
| JWT has expired | `Access token has expired` | `JwtAuthenticationFilter` |
| Invalid login credentials | `Bad credentials` | `RestExceptionHandler` / `BadCredentialsException` |
| Token missing `role` claim | `Bearer token is malformed` | `JwtAuthenticationFilter` |

**Code:** `unauthorized`
**Retry guidance:** Do not auto-retry. Obtain a fresh token via `/api/v1/auth/login` or `/api/v1/auth/refresh`.

### Authorization (403)

| Scenario | Error Message | Source |
|----------|---------------|--------|
| Role lacks permission for a protected action | `Access is denied` | `RestExceptionHandler` / `AccessDeniedException` |
| Method-security annotation rejects the call | `Access is denied` | `RestExceptionHandler` / `AuthorizationDeniedException` |

**Code:** `forbidden`
**Retry guidance:** Do not auto-retry. Authenticate with a different role.

### Validation (400)

| Scenario | Error Message | Source |
|----------|---------------|--------|
| `@Valid` fails on a request DTO | Concatenated field-level errors | `RestExceptionHandler` / `MethodArgumentNotValidException` |
| Constraint violation on parameters | Delegates to Hibernate Validator message | `RestExceptionHandler` / `ConstraintViolationException` |
| `IllegalArgumentException` from business logic | Custom message from thrown exception | `RestExceptionHandler` / `IllegalArgumentException` |
| Malformed JSON request body | `Malformed request body` | `RestExceptionHandler` / `HttpMessageNotReadableException` |
| Type mismatch (e.g., invalid UUID) | `Invalid request parameter` | `RestExceptionHandler` / `MethodArgumentTypeMismatchException` |

**Code:** `validation_error`
**Retry guidance:** Correct the input before resubmitting.

### Conflict (409)

| Scenario | Error Message | Source |
|----------|---------------|--------|
| Duplicate booking on the same time slot | `Slot is already booked` | `RestExceptionHandler` / `ConflictException` |
| Invalid appointment status transition | State-machine-specific message | `RestExceptionHandler` / `ConflictException` |
| Duplicate record creation | Resource-specific message | `RestExceptionHandler` / `ConflictException` |

**Code:** `conflict`
**Retry guidance:** Reload resource state and present the conflict to the user.

### Not Found (404)

| Scenario | Error Message | Source |
|----------|---------------|--------|
| Entity not found by ID | `{Entity} not found` | `RestExceptionHandler` / `NotFoundException` |

**Code:** `not_found`
**Retry guidance:** Do not auto-retry unless the user changed filters.

### Rate Limited (429)

| Scenario | Error Message | Source |
|----------|---------------|--------|
| Too many requests per minute on public endpoint | `Rate limit exceeded` | `RateLimitFilter` |

**Code:** `rate_limited`

**Rate-limited endpoints:**
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/appointments`
- `POST /api/v1/chatbot/messages`

The limit is configured via `HMS_PUBLIC_RATE_LIMIT_PER_MINUTE` (default 30). Uses a sliding-window counter keyed by remote IP. Rejections are tracked with the Micrometer counter `hms.security.rate_limit.rejections`.

**Retry guidance:** Retry after a backoff period.

### Internal Server Error (500)

| Scenario | Error Message | Source |
|----------|---------------|--------|
| Any unhandled exception | `Internal server error` | `RestExceptionHandler` catch-all |

**Code:** `internal_error`
**Note:** Stack traces are never returned to clients. Full traces are written to server-side logs via SLF4J.

---

## Quick Reference

| Code | HTTP Status | Category | When It Fires |
|------|-------------|----------|---------------|
| `unauthorized` | 401 | Authentication | Missing, expired, or invalid credentials |
| `forbidden` | 403 | Authorization | Authenticated but insufficient role/permission |
| `validation_error` | 400 | Validation | Invalid request body, parameters, or business rule |
| `conflict` | 409 | Business logic | Valid request conflicts with current server state |
| `not_found` | 404 | Not Found | Resource does not exist |
| `rate_limited` | 429 | Rate limit | Too many requests per minute |
| `unsupported_media_type` | 415 | Media type | Unsupported Content-Type |
| `internal_error` | 500 | Internal | Unexpected server error (message is always generic) |
