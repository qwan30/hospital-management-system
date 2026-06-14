# Security Architecture

> **Document ID:** HMS-SEC-ARCH-001  
> **Version:** 1.0  
> **Last Updated:** 2026-06-14  
> **Audience:** Developers, DevOps engineers, security reviewers

---

## Table of Contents

1. [Overview](#1-overview)
2. [Authentication Architecture](#2-authentication-architecture)
   - 2.1 [Staff Authentication](#21-staff-authentication)
   - 2.2 [Patient Authentication](#22-patient-authentication)
   - 2.3 [JWT Token Service](#23-jwt-token-service)
   - 2.4 [Cookie-Based Refresh Token](#24-cookie-based-refresh-token)
3. [Authorization Architecture (RBAC)](#3-authorization-architecture-rbac)
   - 3.1 [Roles](#31-roles)
   - 3.2 [Permission Catalog](#32-permission-catalog)
   - 3.3 [Enforcement Points](#33-enforcement-points)
   - 3.4 [RbacAuthorizationService](#34-rbacauthorizationservice)
4. [PHI Protection](#4-phi-protection)
   - 4.1 [PatientIdentifierProtector](#41-patientidentifierprotector)
   - 4.2 [Encryption Workflow (AES-GCM)](#42-encryption-workflow-aes-gcm)
   - 4.3 [Searchable Hashing (SHA-256)](#43-searchable-hashing-sha-256)
5. [API Security](#5-api-security)
   - 5.1 [Filter Chain](#51-filter-chain)
   - 5.2 [CORS Configuration](#52-cors-configuration)
   - 5.3 [Rate Limiting](#53-rate-limiting)
   - 5.4 [Security Headers & CSP](#54-security-headers--csp)
   - 5.5 [Error Response Envelope](#55-error-response-envelope)
   - 5.6 [Request Correlation](#56-request-correlation)
6. [Audit System](#6-audit-system)
   - 6.1 [AuditLogService](#61-auditlogservice)
   - 6.2 [Authorization Denial Auditing](#62-authorization-denial-auditing)
   - 6.3 [Audited Operations](#63-audited-operations)
7. [Infrastructure Security](#7-infrastructure-security)
   - 7.1 [Secrets Management](#71-secrets-management)
   - 7.2 [Docker Compose Networking](#72-docker-compose-networking)
   - 7.3 [CI/CD Security Scanning](#73-cicd-security-scanning)
   - 7.4 [Actuator Endpoint Exposure](#74-actuator-endpoint-exposure)
8. [Threat Model Considerations](#8-threat-model-considerations)
   - 8.1 [STRIDE Analysis](#81-stride-analysis)
   - 8.2 [Trust Boundaries](#82-trust-boundaries)
   - 8.3 [Data Sensitivity Classification](#83-data-sensitivity-classification)
9. [Security Configuration Reference](#9-security-configuration-reference)
   - 9.1 [Environment Variables](#91-environment-variables)
   - 9.2 [Filter Order](#92-filter-order)
10. [Dependencies](#10-dependencies)

---

## 1. Overview

The Hospital Management System (HMS) employs a defense-in-depth security strategy spanning authentication, authorization, data protection, API hardening, audit logging, and infrastructure controls. The architecture follows the principle of least privilege, ensures encrypted storage of personally identifiable information (PII), and maintains a complete audit trail for security-relevant events.

### Key Design Principles

- **Defense in Depth**: Multiple layers of security controls (network, transport, application, data)
- **Least Privilege**: Granular RBAC with 36 permissions across 7 roles
- **Secure by Default**: Endpoints require authentication unless explicitly permitted
- **Fail Secure**: Authentication/authorization failures produce consistent error envelopes, never stack traces
- **Complete Mediation**: Every protected API request is authenticated, authorized, and audited on denial
- **PHI at Rest Encryption**: Patient identifiers encrypted with AES-256-GCM at the application layer

---

## 2. Authentication Architecture

HMS implements a **dual authentication system** -- one for hospital staff and one for patients. Both use JWT-based tokens with distinct identity verification workflows.

### 2.1 Staff Authentication

File: [`AuthController.java`](../../backend/controller/src/main/java/com/hospital/api/auth/AuthController.java)  
File: [`AuthService.java`](../../backend/application/src/main/java/com/hospital/api/auth/AuthService.java)

**Flow:**

1. **Login** (`POST /api/v1/auth/login`): Staff provide email + password. The `AuthService` looks up the user by email (case-insensitive) in `UserRepository`, verifies the password hash against `BCryptPasswordEncoder`, and on success returns:
   - **Access token** (in response body) -- a short-lived JWT stored client-side (sessionStorage)
   - **Refresh token** (in `httpOnly` cookie) -- a longer-lived JWT

2. **Token Refresh** (`POST /api/v1/auth/refresh`): The `AuthService` reads the refresh token from the `httpOnly` cookie (with fallback to request body). Validates the token claims (checks `type=refresh`, `scope=staff`), looks up the user, and issues a new access token and refresh token (token rotation).

3. **Logout** (`POST /api/v1/auth/logout`): Clears the refresh cookie by setting `Max-Age=0`.

**Key authentication properties:**

| Property | Value |
|----------|-------|
| Password hashing | BCrypt (via `BCryptPasswordEncoder`) |
| Access token TTL | 900 seconds (15 minutes) |
| Refresh token TTL | 604800 seconds (7 days) |
| Refresh cookie name | `hms_refresh_token` |
| Refresh cookie path | `/api/v1/auth` |

**Security considerations:**
- Password errors use a generic "Invalid email or password" message to prevent user enumeration.
- Refresh tokens use the `scope` claim (`"staff"`) to prevent patient refresh tokens from being accepted at the staff auth endpoint.
- The refresh cookie is `httpOnly`, preventing JavaScript access.
- Token rotation occurs on every refresh (old refresh tokens remain valid until expiry).

### 2.2 Patient Authentication

File: [`PatientAuthController.java`](../../backend/controller/src/main/java/com/hospital/api/patientauth/PatientAuthController.java)  
File: [`PatientAuthService.java`](../../backend/application/src/main/java/com/hospital/api/patientauth/PatientAuthService.java)

The patient authentication system introduces a **claim-based initial access** workflow that verifies real-world identity before allowing portal account creation.

**Claim Flow** (`POST /api/v1/patient-auth/claim`):

1. Patient submits `email`, `dateOfBirth`, `fullName`, `cccd` (national ID number), and a chosen `password`.
2. `PatientAuthService` verifies the patient exists in the `PatientRepository` by matching email AND date of birth.
3. The submitted `fullName` is normalized (trimmed, whitespace-collapsed) and compared case-insensitively against the stored name.
4. The submitted `cccd` is SHA-256 hashed and compared against the stored `cccdHash` (see [PHI Protection](#4-phi-protection)).
5. If all checks pass, a `PatientAccountEntity` is created or updated with `email`, `passwordHash` (BCrypt), and `active=true`.
6. A JWT access token and refresh cookie are returned.

**Login Flow** (`POST /api/v1/patient-auth/login`):
- Standard email + password verification against `PatientAccountEntity`.
- Uses `scope=patient` in refresh tokens to distinguish from staff tokens.

**Patient auth specifics:**

| Property | Value |
|----------|-------|
| Refresh cookie name | `hms_refresh_token_patient` |
| Refresh cookie path | `/api/v1/patient-auth` |
| Identity verification | Email + DOB + name + CCCD hash match |
| Account storage | Separate `patient_accounts` table |

### 2.3 JWT Token Service

File: [`JwtTokenService.java`](../../backend/application/src/main/java/com/hospital/api/auth/JwtTokenService.java)  
File: [`JwtProperties.java`](../../backend/application/src/main/java/com/hospital/api/config/JwtProperties.java)

**Token structure:**

```
Access Token Claims:
  sub:    UUID (user/patient ID)
  role:   String (ADMIN, DOCTOR, NURSE, etc.)
  name:   String (full name)
  iat:    Date
  exp:    Date

Refresh Token Claims:
  sub:    UUID (user/patient ID)
  type:   "refresh"
  scope:  "staff" | "patient"
  iat:    Date
  exp:    Date
```

**Signing:** HMAC-SHA256 via the jjwt library (`io.jsonwebtoken:jjwt:0.12.6`). The signing key is derived from `JWT_SECRET`:
- If the secret is 32+ characters, it is used directly as an HMAC key.
- Otherwise, it is treated as a Base64-encoded key.

**Validation:** `JwtProperties` validates via `@Validated` that:
- `secret` is not blank
- `accessTokenExpirationSeconds` >= 1
- `refreshTokenExpirationSeconds` >= 1
- `refreshCookieName` is not blank

### 2.4 Cookie-Based Refresh Token

File: [`AuthController.java`](../../backend/controller/src/main/java/com/hospital/api/auth/AuthController.java) (lines 72-89)  
File: [`PatientAuthController.java`](../../backend/controller/src/main/java/com/hospital/api/patientauth/PatientAuthController.java) (lines 91-109)

Refresh tokens are delivered via `Set-Cookie` with Spring's `ResponseCookie`:

```java
ResponseCookie.from(cookieName, value)
    .httpOnly(true)
    .secure(securityHttpProperties.secureCookies())   // true in production
    .sameSite(securityHttpProperties.refreshCookieSameSite())  // "Lax" default
    .path("/api/v1/auth")   // or "/api/v1/patient-auth" for patient cookies
    .maxAge(refreshTokenExpirationSeconds())
    .build();
```

| Cookie Attribute | Production Value |
|------------------|------------------|
| `httpOnly` | `true` |
| `secure` | Configurable (`HMS_SECURE_COOKIES`, default `false`) |
| `sameSite` | Configurable (`HMS_REFRESH_COOKIE_SAME_SITE`, default `Lax`) |

---

## 3. Authorization Architecture (RBAC)

### 3.1 Roles

Defined in [`UserRole.java`](../../backend/domain/src/main/java/com/hospital/shared/enums/UserRole.java):

| Role | Description |
|------|-------------|
| `ADMIN` | Full system administration |
| `DOCTOR` | Clinical care, medical records |
| `NURSE` | Patient care support |
| `RECEPTIONIST` | Front desk, appointment scheduling |
| `PHARMACIST` | Medication dispensing, inventory |
| `ACCOUNTANT` | Billing, invoicing, revenue |
| `PATIENT` | Portal access (self-service) |

### 3.2 Permission Catalog

Defined in [`RbacAuthorizationService.java`](../../backend/application/src/main/java/com/hospital/core/security/RbacAuthorizationService.java) -- 36 permissions across 9 functional categories:

#### Admin (7 permissions)

| Permission | Roles |
|------------|-------|
| `ADMIN_USERS_MANAGE` | ADMIN |
| `ADMIN_DEPARTMENTS_MANAGE` | ADMIN |
| `ADMIN_ROOMS_MANAGE` | ADMIN |
| `ADMIN_SCHEDULE_MANAGE` | ADMIN |
| `ADMIN_CONTENT_MANAGE` | ADMIN |
| `ADMIN_MONITORING_READ` | ADMIN |
| `ADMIN_STATS_READ` | ADMIN |

#### Queue (3 permissions)

| Permission | Roles |
|------------|-------|
| `QUEUE_READ` | ADMIN, NURSE, RECEPTIONIST |
| `QUEUE_CHECK_IN` | ADMIN, NURSE, RECEPTIONIST |
| `QUEUE_MANAGE` | ADMIN, NURSE, RECEPTIONIST |

#### Appointments (4 permissions)

| Permission | Roles |
|------------|-------|
| `APPOINTMENT_READ` | ADMIN, DOCTOR, NURSE, RECEPTIONIST |
| `APPOINTMENT_WRITE` | ADMIN, DOCTOR, NURSE, RECEPTIONIST |
| `APPOINTMENT_CANCEL` | ADMIN, NURSE, RECEPTIONIST |
| `APPOINTMENT_STATUS_WRITE` | DOCTOR |

#### Clinical (4 permissions)

| Permission | Roles |
|------------|-------|
| `FOLLOW_UP_READ` | ADMIN, DOCTOR, NURSE |
| `FOLLOW_UP_WRITE` | DOCTOR |
| `SCHEDULE_READ` | DOCTOR |
| `PATIENT_HISTORY_READ` | DOCTOR |

#### Lab & Vitals (4 permissions)

| Permission | Roles |
|------------|-------|
| `LAB_RESULT_READ` | ADMIN, DOCTOR, NURSE |
| `LAB_RESULT_WRITE` | ADMIN, DOCTOR |
| `VITAL_SIGNS_READ` | ADMIN, DOCTOR, NURSE |
| `VITAL_SIGNS_WRITE` | ADMIN, DOCTOR, NURSE |

#### Patient Records (4 permissions)

| Permission | Roles |
|------------|-------|
| `PATIENT_RECORD_READ` | ADMIN, DOCTOR |
| `MEDICAL_RECORD_WRITE` | ADMIN, DOCTOR |
| `PRESCRIPTION_READ` | ADMIN, DOCTOR, PHARMACIST |
| `AUDIT_LOG_READ` | ADMIN, ACCOUNTANT |

#### Finance (4 permissions)

| Permission | Roles |
|------------|-------|
| `INVOICE_READ` | ADMIN, ACCOUNTANT |
| `INVOICE_WRITE` | ADMIN, ACCOUNTANT |
| `PRICING_MANAGE` | ADMIN, ACCOUNTANT |
| `REVENUE_READ` | ADMIN, ACCOUNTANT |

#### Inventory (2 permissions)

| Permission | Roles |
|------------|-------|
| `INVENTORY_READ` | ADMIN, PHARMACIST |
| `INVENTORY_MANAGE` | ADMIN, PHARMACIST |

#### Patient Portal (2 permissions)

| Permission | Roles |
|------------|-------|
| `PATIENT_PORTAL_READ` | PATIENT |
| `PATIENT_PORTAL_WRITE` | PATIENT |

### 3.3 Enforcement Points

Authorization is enforced at the controller method level using Spring Security's `@PreAuthorize` annotation with the SpEL expression `@rbac.hasPermission(authentication, 'PERMISSION_NAME')`.

**Controllers with method-level RBAC enforcement:**

| Controller | Permission(s) | File |
|------------|----------------|------|
| `AdminUserController` | ADMIN_USERS_MANAGE | [`AdminUserController.java`](../../backend/controller/src/main/java/com/hospital/api/admin/AdminUserController.java) |
| `AdminDepartmentController` | ADMIN_DEPARTMENTS_MANAGE | [`AdminDepartmentController.java`](../../backend/controller/src/main/java/com/hospital/api/admin/AdminDepartmentController.java) |
| `AdminRoomController` | ADMIN_ROOMS_MANAGE | [`AdminRoomController.java`](../../backend/controller/src/main/java/com/hospital/api/admin/AdminRoomController.java) |
| `AdminScheduleTemplateController` | ADMIN_SCHEDULE_MANAGE | [`AdminScheduleTemplateController.java`](../../backend/controller/src/main/java/com/hospital/api/admin/AdminScheduleTemplateController.java) |
| `AdminTimeSlotController` | ADMIN_SCHEDULE_MANAGE | [`AdminTimeSlotController.java`](../../backend/controller/src/main/java/com/hospital/api/admin/AdminTimeSlotController.java) |
| `AdminSpecialClosureController` | ADMIN_SCHEDULE_MANAGE | [`AdminSpecialClosureController.java`](../../backend/controller/src/main/java/com/hospital/api/admin/AdminSpecialClosureController.java) |
| `AdminContentController` | ADMIN_CONTENT_MANAGE | [`AdminContentController.java`](../../backend/controller/src/main/java/com/hospital/api/admin/AdminContentController.java) |
| `AdminPublicContentController` | ADMIN_CONTENT_MANAGE | [`AdminPublicContentController.java`](../../backend/controller/src/main/java/com/hospital/api/admin/AdminPublicContentController.java) |
| `AdminNewsController` | ADMIN_CONTENT_MANAGE | [`AdminNewsController.java`](../../backend/controller/src/main/java/com/hospital/api/admin/AdminNewsController.java) |
| `AdminMonitoringController` | ADMIN_MONITORING_READ | [`AdminMonitoringController.java`](../../backend/controller/src/main/java/com/hospital/api/admin/AdminMonitoringController.java) |
| `AdminStatsController` | ADMIN_STATS_READ | [`AdminStatsController.java`](../../backend/controller/src/main/java/com/hospital/api/admin/AdminStatsController.java) |
| `AdminAuditLogController` | AUDIT_LOG_READ | [`AdminAuditLogController.java`](../../backend/controller/src/main/java/com/hospital/api/admin/AdminAuditLogController.java) |
| `AppointmentController` | APPOINTMENT_READ, APPOINTMENT_WRITE, APPOINTMENT_CANCEL, APPOINTMENT_STATUS_WRITE, QUEUE_READ, QUEUE_CHECK_IN, VITAL_SIGNS_READ, VITAL_SIGNS_WRITE, FOLLOW_UP_READ, FOLLOW_UP_WRITE | [`AppointmentController.java`](../../backend/controller/src/main/java/com/hospital/api/appointment/AppointmentController.java) |
| `QueueController` | QUEUE_READ, QUEUE_MANAGE | [`QueueController.java`](../../backend/controller/src/main/java/com/hospital/api/queue/QueueController.java) |
| `ScheduleController` | SCHEDULE_READ | [`ScheduleController.java`](../../backend/controller/src/main/java/com/hospital/api/schedule/ScheduleController.java) |
| `PatientRecordController` | PATIENT_RECORD_READ | [`PatientRecordController.java`](../../backend/controller/src/main/java/com/hospital/api/patientrecord/PatientRecordController.java) |
| `MedicalRecordController` | MEDICAL_RECORD_WRITE, PRESCRIPTION_READ | [`MedicalRecordController.java`](../../backend/controller/src/main/java/com/hospital/api/medicalrecord/MedicalRecordController.java) |
| `PatientController` | PATIENT_HISTORY_READ | [`PatientController.java`](../../backend/controller/src/main/java/com/hospital/api/patient/PatientController.java) |
| `VitalSignsController` | VITAL_SIGNS_READ, VITAL_SIGNS_WRITE | [`VitalSignsController.java`](../../backend/controller/src/main/java/com/hospital/api/vitalsigns/VitalSignsController.java) |
| `LabResultController` | LAB_RESULT_READ, LAB_RESULT_WRITE | [`LabResultController.java`](../../backend/controller/src/main/java/com/hospital/api/lab/LabResultController.java) |
| `InvoiceController` | INVOICE_READ, INVOICE_WRITE | [`InvoiceController.java`](../../backend/controller/src/main/java/com/hospital/api/invoice/InvoiceController.java) |
| `PricingController` | PRICING_MANAGE | [`PricingController.java`](../../backend/controller/src/main/java/com/hospital/api/invoice/PricingController.java) |
| `RevenueReportController` | REVENUE_READ | [`RevenueReportController.java`](../../backend/controller/src/main/java/com/hospital/api/invoice/RevenueReportController.java) |
| `InventoryController` | INVENTORY_READ, INVENTORY_MANAGE | [`InventoryController.java`](../../backend/controller/src/main/java/com/hospital/api/inventory/InventoryController.java) |
| `PatientPortalController` | PATIENT_PORTAL_READ, PATIENT_PORTAL_WRITE | [`PatientPortalController.java`](../../backend/controller/src/main/java/com/hospital/api/patientportal/PatientPortalController.java) |
| `AiIntegrationController` | PATIENT_RECORD_READ | [`AiIntegrationController.java`](../../backend/controller/src/main/java/com/hospital/api/ai/AiIntegrationController.java) |

### 3.4 RbacAuthorizationService

File: [`RbacAuthorizationService.java`](../../backend/application/src/main/java/com/hospital/core/security/RbacAuthorizationService.java)

The service is registered as a Spring bean named `"rbac"`, making it accessible in SpEL expressions as `@rbac`. The `hasPermission` method:

1. Returns `false` if the authentication is null, not authenticated, or the permission name is null.
2. Looks up the permission in the `PERMISSIONS` map.
3. Returns `false` if the permission is not found or has no roles assigned.
4. Extracts the role from the user's `GrantedAuthority` (stripping the `ROLE_` prefix).
5. Returns `true` if the mapped role is in the allowed set for that permission.

---

## 4. PHI Protection

### 4.1 PatientIdentifierProtector

File: [`PatientIdentifierProtector.java`](../../backend/infrastructure/src/main/java/com/hospital/core/patient/PatientIdentifierProtector.java)  
File: [`PatientIdentifierProperties.java`](../../backend/infrastructure/src/main/java/com/hospital/core/patient/PatientIdentifierProperties.java)

HMS protects national identification numbers (CCCD/CMND) using a dual strategy: **AES-256-GCM encryption** for decryption-capable storage and **SHA-256 hashing** for searchable indexes. This separation ensures that plaintext identifiers cannot be recovered from the search index.

### 4.2 Encryption Workflow (AES-GCM)

```java
// Encryption
String encrypt(String plainValue) {
    // 1. Generate a 12-byte random IV
    // 2. Create AES/GCM/NoPadding cipher with AES-256 key
    //    (derived by SHA-256 hashing PATIENT_IDENTIFIER_SECRET)
    // 3. Encrypt plaintext
    // 4. Prepend IV to ciphertext
    // 5. Base64URL-encode with "enc:" prefix
}

// Decryption
String decrypt(String encryptedValue) {
    // 1. Strip "enc:" prefix
    // 2. Base64URL-decode payload
    // 3. Extract first 12 bytes as IV
    // 4. Decrypt remaining bytes
}
```

**Encrypted output format:** `enc:{Base64URL(IV || Ciphertext)}`

**Security parameters:**

| Parameter | Value |
|-----------|-------|
| Algorithm | AES/GCM/NoPadding |
| Key derivation | SHA-256(PATIENT_IDENTIFIER_SECRET) |
| Key size | 256 bits |
| IV length | 12 bytes (96 bits) |
| GCM tag length | 128 bits |
| Encoding | Base64URL (no padding) |
| Storage prefix | `enc:` |

**Secret requirements:**
- Enforced via `@Validated @NotBlank` on `PatientIdentifierProperties.secret`
- Minimum recommended: 32 characters (256 bits)
- Configuration key: `PATIENT_IDENTIFIER_SECRET` (must be different from `JWT_SECRET`)

### 4.3 Searchable Hashing (SHA-256)

For querying without decrypting, a SHA-256 hash of the identifier is stored in the `cccd_hash` column:

```java
public String hash(String plainValue) {
    // SHA-256 hash, hex-encoded
    return toHex(sha256(plainValue.getBytes(StandardCharsets.UTF_8)));
}
```

This enables lookup operations like `findByCccdHash()` on the `PatientRepository` while keeping the plaintext identifier encrypted at rest.

The claim flow (patient registration) verifies:
```java
if (!patientIdentifierProtector.hash(request.cccd()).equals(patient.getCccdHash())) {
    throw new BadCredentialsException("Patient identity could not be verified");
}
```

---

## 5. API Security

### 5.1 Filter Chain

File: [`SecurityConfig.java`](../../backend/controller/src/main/java/com/hospital/api/config/SecurityConfig.java)

The `SecurityFilterChain` defines the following filter order:

```
1. RequestCorrelationFilter           (@Order(HIGHEST_PRECEDENCE))
2. AuthorizationDenialAuditFilter     (before RateLimitFilter)
3. RateLimitFilter                     (before UsernamePasswordAuthenticationFilter)
4. JwtAuthenticationFilter             (after RateLimitFilter)
5. UsernamePasswordAuthenticationFilter (built-in)
```

**Filter chain execution flow:**

1. `RequestCorrelationFilter` -- Assigns/injects `X-Request-Id` header, populates MDC for distributed tracing, records HTTP metrics, logs request summaries.

2. `AuthorizationDenialAuditFilter` -- Wraps `filterChain.doFilter()` in a try/finally block. In the `finally` block, checks if the response status is 401 or 403 on a protected API path (`/api/v1/...`). If so, increments a Micrometer counter (`hms.security.authorization_denials`) and records an audit log entry via `AuditLogService`.

3. `RateLimitFilter` -- Intercepts POST requests to `/api/v1/auth/login`, `/api/v1/auth/refresh`, `/api/v1/appointments`, and `/api/v1/chatbot/messages`. Maintains a per-IP sliding window counter (1-minute window). Returns HTTP 429 when limit exceeded.

4. `JwtAuthenticationFilter` -- Extracts `Authorization: Bearer <token>` header. Validates the JWT via `JwtTokenService.parseClaims()`. On success, sets a `UsernamePasswordAuthenticationToken` with the user's ID (sub) as principal and `ROLE_{role}` as authority. Handles expired tokens, malformed tokens, and missing role claims with 401 responses.

**Public endpoint whitelist** (no authentication required):

| Pattern | Method |
|---------|--------|
| `/actuator/health` | ANY |
| `/actuator/health/**` | ANY |
| `/actuator/prometheus` | ANY |
| `/swagger-ui/**` | ANY |
| `/v3/api-docs/**` | ANY |
| `/api/v1/auth/**` | ANY |
| `/api/v1/patient-auth/**` | ANY |
| `/api/v1/departments/**` | GET |
| `/api/v1/doctors/**` | GET |
| `/api/v1/content/**` | GET |
| `/api/v1/news` | GET |
| `/api/v1/appointments` | POST |
| `/api/v1/chatbot/messages` | POST |

### 5.2 CORS Configuration

Configured in `SecurityConfig.corsConfigurationSource()`:

```java
allowedOrigins:    HMS_ALLOWED_ORIGIN_PRIMARY (default: http://localhost:3000)
                   HMS_ALLOWED_ORIGIN_SECONDARY (default: http://localhost:4173)
allowedMethods:    GET, POST, PUT, DELETE, OPTIONS
allowedHeaders:    Authorization, Content-Type, Accept, Origin, X-Request-Id
exposedHeaders:    Set-Cookie, X-Request-Id
allowCredentials:  true (in development), configurable
maxAge:            3600s
```

CORS is production-hardened through the `allowCredentials` toggle, which should be `false` in production environments that do not serve the frontend from a different origin.

### 5.3 Rate Limiting

File: [`RateLimitFilter.java`](../../backend/controller/src/main/java/com/hospital/api/config/RateLimitFilter.java)

Scope: POST requests to public endpoints (login, refresh, appointment booking, chatbot).
Algorithm: Per-IP sliding window (`ConcurrentHashMap<String, WindowCounter>`) with a 1-minute window.

| Property | Default | Env Variable |
|----------|---------|-------------|
| Rate limit | 30 requests/minute | `HMS_PUBLIC_RATE_LIMIT_PER_MINUTE` |
| Window | 60 seconds | Fixed |
| Counter type | In-memory `AtomicInteger` | -- |

An in-memory counter is sufficient for single-instance deployments. For horizontal scaling, this should be replaced with a Redis-backed distributed rate limiter.

### 5.4 Security Headers & CSP

Configured in `SecurityConfig`:

```java
// Content Security Policy
default-src 'self'; img-src 'self' data: https:;
style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline';
object-src 'none'; base-uri 'self'; frame-ancestors 'self'

// Referrer Policy
Referrer-Policy: no-referrer

// Frame Options
X-Frame-Options: SAMEORIGIN

// Session Management
Session creation policy: STATELESS (no HTTP sessions)
```

### 5.5 Error Response Envelope

File: [`SecurityErrorResponseWriter.java`](../../backend/controller/src/main/java/com/hospital/api/config/SecurityErrorResponseWriter.java)  
File: [`RestExceptionHandler.java`](../../backend/controller/src/main/java/com/hospital/api/config/RestExceptionHandler.java)

All security errors are returned in a consistent JSON envelope using `ApiResponse.fail(code, message)`:

```json
{
  "success": false,
  "error": {
    "code": "unauthorized | forbidden | rate_limited | validation_error | not_found",
    "message": "Human-readable error description"
  },
  "data": null
}
```

Error code mapping:

| HTTP Status | Error Code | Source | Message |
|-------------|------------|--------|---------|
| 401 | `unauthorized` | `JwtAuthenticationFilter` | "Authentication is required" / "Access token has expired" / "Bearer token is malformed" |
| 401 | `unauthorized` | `SecurityConfig` entry point | "Authentication is required" |
| 403 | `forbidden` | `SecurityConfig` access denied handler | "Access is denied" |
| 403 | `forbidden` | `RestExceptionHandler` | "Access is denied" (via `AuthorizationDeniedException`) |
| 429 | `rate_limited` | `RateLimitFilter` | "Rate limit exceeded" |

The `SecurityErrorResponseWriter` also stores denial metadata as request attributes (`hms.security.denial.reason`, `hms.security.denial.code`), which the `AuthorizationDenialAuditFilter` reads later.

The `RestExceptionHandler` explicitly handles `BadCredentialsException`, `AccessDeniedException`, and `AuthorizationDeniedException` to prevent stack trace leakage -- all domain/security exceptions return controlled error envelopes matching the public endpoint error format.

### 5.6 Request Correlation

File: [`RequestCorrelationFilter.java`](../../backend/controller/src/main/java/com/hospital/api/config/RequestCorrelationFilter.java)

- Runs at the highest precedence in the filter chain.
- Accepts `X-Request-Id` from clients (validated against `[A-Za-z0-9._:-]{8,128}`) or generates a UUID.
- Sets the `X-Request-Id` response header for correlation.
- Populates MDC with `requestId`, `traceId`, and `spanId` for structured logging.
- Records HTTP metrics (`hms.http.server.requests`) with method, status, and outcome tags.
- Logs a request summary line per request with method, path (sanitized), status, duration, and trace ID.

---

## 6. Audit System

### 6.1 AuditLogService

File: [`AuditLogService.java`](../../backend/application/src/main/java/com/hospital/core/audit/AuditLogService.java)  
File: [`AuditLogEntity.java`](../../backend/domain/src/main/java/com/hospital/core/audit/AuditLogEntity.java)

The audit log uses a dedicated database table (`audit_logs`) with `JSONB` metadata storage.

**Schema:**

| Column | Type | Description |
|--------|------|-------------|
| `id` | `UUID` | Primary key, auto-generated |
| `actor_id` | `UUID (FK -> users)` | The user who performed the action (nullable for anonymous) |
| `action` | `VARCHAR(120)` | Action identifier (e.g., `SECURITY_ACCESS_DENIED`, `APPOINTMENT_CREATED`) |
| `entity_type` | `VARCHAR(120)` | Entity type (e.g., `PROTECTED_API`, `APPOINTMENT`, `INVENTORY_ITEM`) |
| `entity_id` | `UUID` | Entity identifier (nullable) |
| `metadata` | `JSONB` | Flexible metadata payload |
| `created_at` | `TIMESTAMP` | Auto-populated on persist |

**Key behaviors:**
- Audit writes use `Propagation.REQUIRES_NEW` to ensure audit logging succeeds independently of the parent transaction.
- Failures are tracked via Micrometer counter `hms.audit_log.write.failures`.
- The `list()` method provides in-memory filtering by entity type and action (limit defaults to 50).

### 6.2 Authorization Denial Auditing

File: [`AuthorizationDenialAuditFilter.java`](../../backend/controller/src/main/java/com/hospital/api/config/AuthorizationDenialAuditFilter.java)

Every 401 (unauthorized) or 403 (forbidden) response on a `/api/v1/...` path triggers:

1. Micrometer counter increment: `hms.security.authorization_denials` with `status` and `reason` tags.
2. Audit log entry with action `SECURITY_ACCESS_DENIED`, entity type `PROTECTED_API`, and metadata containing:
   - `method` -- HTTP method (e.g., GET, POST)
   - `path` -- Request URI with UUID and numeric paths sanitized to `{id}`
   - `status` -- HTTP status code
   - `reason` -- Denial reason (from `SecurityErrorResponseWriter` attributes, or default message)
   - `role` -- User's role (if authenticated)
   - `actorId` -- User's UUID (if authenticated)
   - `requestId` -- Correlation request ID

**Path sanitization** prevents sensitive identifiers from being stored in audit logs:
```
/api/v1/appointments/f47ac10b-58cc-4372-a567-0e02b2c3d479/status
  -> /api/v1/appointments/{id}/status
```

### 6.3 Audited Operations

Beyond authorization denials, the following business operations are audited:

| Action | Entity Type | Source |
|--------|-------------|--------|
| `SECURITY_ACCESS_DENIED` | `PROTECTED_API` | `AuthorizationDenialAuditFilter` |
| `APPOINTMENT_CREATED` | `APPOINTMENT` | `AppointmentWorkflowService` |
| `APPOINTMENT_CANCELLED` | `APPOINTMENT` | `AppointmentWorkflowService` |
| `CHECKED_IN` | `APPOINTMENT` | `AppointmentWorkflowService` |
| `STATUS_CHANGED` | `APPOINTMENT` | `AppointmentWorkflowService` |
| `INVOICE_CREATED` | `INVOICE` | `InvoiceService` |
| `INVOICE_VOIDED` | `INVOICE` | `InvoiceService` |
| `PAYMENT_RECORDED` | `INVOICE` | `InvoiceService` |
| `INVENTORY_ITEM_DELETED` | `INVENTORY_ITEM` | `InventoryWriteService` |
| `INVENTORY_LOT_CREATED` | `INVENTORY_LOT` | `InventoryWriteService` |
| `INVENTORY_LOT_UPDATED` | `INVENTORY_LOT` | `InventoryWriteService` |

---

## 7. Infrastructure Security

### 7.1 Secrets Management

All secrets are injected via environment variables from a `.env` file, which is git-ignored. Required secrets with no default value:

| Variable | Purpose | Validation |
|----------|---------|------------|
| `JWT_SECRET` | JWT signing key | `@NotBlank` (in `JwtProperties`), min 32 chars recommended |
| `PATIENT_IDENTIFIER_SECRET` | AES-GCM encryption key for PHI | `@NotBlank` (in `PatientIdentifierProperties`), min 32 chars recommended |
| `POSTGRES_PASSWORD` | Database connection | No default value in `application.yml` |

**Security configuration defaults** (verified by `SecurityConfigurationDefaultsTest`):
- `JWT_SECRET` must be provided at runtime (`${JWT_SECRET}`), never has a fallback default.
- `PATIENT_IDENTIFIER_SECRET` must be provided at runtime (`${PATIENT_IDENTIFIER_SECRET}`), never has a fallback default.
- `POSTGRES_PASSWORD` must be provided at runtime (`${POSTGRES_PASSWORD}`), never has a fallback default.
- `docker-compose.yml` does not provide default values for any of these secrets.

File: [`SecurityConfigurationDefaultsTest.java`](../../backend/start/src/test/java/com/hospital/api/SecurityConfigurationDefaultsTest.java)

### 7.2 Docker Compose Networking

File: [`docker-compose.yml`](../../docker-compose.yml)

- Three services: `postgres`, `backend`, `frontend`.
- Backend communicates with the database via Docker internal networking (`postgres:5432`).
- No secrets are hardcoded in `docker-compose.yml` -- all use `${VARIABLE}` syntax with no `:-` fallback for sensitive values.
- The `postgres` service depends on a health check before the backend starts.
- The `frontend` service depends on backend availability.

### 7.3 CI/CD Security Scanning

File: [`security-scan.yml`](../../.github/workflows/security-scan.yml)

Weekly scheduled security scanning (Mondays at 06:00) and manual trigger via `workflow_dispatch`:

| Scan | Tool | Scope | Threshold |
|------|------|-------|-----------|
| npm audit | npm | Frontend dependencies | High severity |
| OWASP Dependency Check | Maven plugin | Backend dependencies | CVSS >= 7 |
| Secret detection | TruffleHog | Full repository | -- |
| Container vulnerability scan | Trivy | Published Docker images (backend + frontend) | CRITICAL, HIGH, MEDIUM |

All scans use `continue-on-error` to avoid blocking pipelines while collecting results. SARIF results are uploaded for GitHub Security tab integration.

### 7.4 Actuator Endpoint Exposure

File: [`application.yml`](../../backend/start/src/main/resources/application.yml)

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      probes:
        enabled: true
      show-details: when_authorized
    prometheus:
      enabled: true
```

- Health endpoint details restricted to authorized users (`when_authorized`).
- Prometheus metrics endpoint explicitly enabled for monitoring/observability.
- All actuator endpoints are publicly accessible (see security config whitelist) but contain only operational, non-sensitive data.

---

## 8. Threat Model Considerations

### 8.1 STRIDE Analysis

| Threat Type | Risk | Mitigation |
|-------------|------|------------|
| **S**poofing | Attacker impersonates a legitimate user | BCrypt password hashing, JWT signing with HMAC-SHA256, claim-based identity verification for patient portal |
| **T**ampering | Attacker modifies data in transit or at rest | HTTPS assumed (TLS at the transport layer), AES-256-GCM encryption for patient identifiers at rest, JWT signature validation |
| **R**epudiation | User denies performing an action | Comprehensive audit logging (`audit_logs` table) with actor tracking, `SECURITY_ACCESS_DENIED` logs |
| **I**nformation Disclosure | Leakage of PHI or credentials | Generic error messages (no user enumeration), path sanitization in audit logs, consistent error envelopes (no stack traces), CSP headers, httpOnly cookies |
| **D**enial of Service | Overwhelming auth or booking endpoints | Per-IP rate limiting (30 req/min default) on public POST endpoints, session statelessness prevents session table exhaustion |
| **E**levation of Privilege | User accesses data/actions beyond their role | RBAC with 36 permissions, `@PreAuthorize` on every controller method, `AuthorizationDenialAuditFilter` logs every denied access |

### 8.2 Trust Boundaries

```
[External Client / Browser]
        |
        | HTTPS (assumed)
        v
[Load Balancer / Reverse Proxy]         <-- TLS termination assumed here
        |
        v
[RateLimitFilter]                       <-- Public POST rate limiting
        |
        v
[JwtAuthenticationFilter]               <-- Token parsing + validation
        |
        v
[@PreAuthorize (RBAC)]                   <-- Permission check
        |
        v
[Application Service Layer]
        |
        v
[PostgreSQL Database]                    <-- Encrypted PHI at rest
```

**Key trust boundaries:**
1. **Client to API**: All public endpoints rate-limited; authenticated endpoints require valid JWT.
2. **API to Database**: Connection credentials injected at runtime, never committed.
3. **PHI data**: Encrypted at the application layer before database storage.

### 8.3 Data Sensitivity Classification

| Classification | Example Data | Protection Measures |
|----------------|-------------|-------------------|
| **Critical** | JWT_SECRET, PATIENT_IDENTIFIER_SECRET, POSTGRES_PASSWORD | Environment variables only, no defaults, no fallbacks |
| **PHI** | CCCD/CMND (national ID) | AES-256-GCM encryption + SHA-256 hash for search |
| **Sensitive** | Passwords, email addresses | BCrypt hashing (passwords), encrypted identifiers |
| **Operational** | Appointment data, schedules | RBAC-gated access, audit logged |
| **Public** | Department info, doctor profiles, news | Read-only public endpoints |

---

## 9. Security Configuration Reference

### 9.1 Environment Variables

| Variable | Type | Default | Required | Purpose |
|----------|------|---------|----------|---------|
| `JWT_SECRET` | String | -- | Yes | JWT HMAC-SHA256 signing key (min 32 chars recommended) |
| `PATIENT_IDENTIFIER_SECRET` | String | -- | Yes | AES-GCM key for PHI encryption (min 32 chars, must differ from `JWT_SECRET`) |
| `POSTGRES_PASSWORD` | String | -- | Yes | Database connection password |
| `HMS_ALLOWED_ORIGIN_PRIMARY` | String | `http://localhost:3000` | No | Primary CORS allowed origin |
| `HMS_ALLOWED_ORIGIN_SECONDARY` | String | `http://localhost:4173` | No | Secondary CORS allowed origin |
| `HMS_ALLOW_CREDENTIALS` | Boolean | `false` | No | CORS credentials mode |
| `HMS_SECURE_COOKIES` | Boolean | `false` | No | Secure flag on cookies (set `true` in production over HTTPS) |
| `HMS_REFRESH_COOKIE_SAME_SITE` | String | `Lax` | No | SameSite attribute for cookies |
| `HMS_PUBLIC_RATE_LIMIT_PER_MINUTE` | Integer | `30` | No | Rate limit for public POST endpoints |
| `SPRING_PROFILES_ACTIVE` | String | -- | No | Spring profile (use `dev` for development) |

### 9.2 Filter Order

```
# Position  : Filter                        : Effect
─────────────────────────────────────────────────────────────
HIGHEST        RequestCorrelationFilter       Request ID + tracing
               AuthorizationDenialAuditFilter 401/403 recording
               RateLimitFilter                Public POST throttling
               JwtAuthenticationFilter        Token validation
Built-in       UsernamePasswordAuthenticationFilter
Built-in       ExceptionTranslationFilter     Access denied handling
Built-in       FilterSecurityInterceptor      URL-based authorization
```

---

## 10. Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| `org.springframework.boot:spring-boot-starter-security` | 3.x | Core security framework |
| `io.jsonwebtoken:jjwt-api` | 0.12.6 | JWT creation and parsing |
| `io.jsonwebtoken:jjwt-impl` | 0.12.6 | JWT implementation |
| `io.jsonwebtoken:jjwt-jackson` | 0.12.6 | JWT JSON serialization |
| `org.springframework.security:spring-security-test` | 3.x | Security test utilities |
| `io.micrometer:micrometer-core` | -- | Security metrics (rate limit rejections, authorization denials) |
| `org.owasp:dependency-check-maven` | -- | CI dependency vulnerability scanning |
| `trufflesecurity/trufflehog` | -- | CI secret detection |
| `aquasecurity/trivy` | -- | CI container image scanning |

---

## Related Documents

- [Technical Design Document](../HMS_TDD.md)
- [API Contract](../../API_CONTRACT.md)
- [CI Workflow](../../.github/workflows/ci.yml)
- [Security Scan Workflow](../../.github/workflows/security-scan.yml)
- [Docker Compose Configuration](../../docker-compose.yml)
- [Application Configuration](../../backend/start/src/main/resources/application.yml)
- [Deployment Guide](../HMS_DeploymentGuide.md)
