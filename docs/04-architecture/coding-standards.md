# Coding Standards

**Scope:** Java backend (Spring Boot) and TypeScript/React frontend (Next.js App Router).
**Purpose:** Ensure consistency, readability, and maintainability across the entire codebase.
**Status:** Active -- all new code must conform to these standards.

---

## Table of Contents

1. [General Principles](#1-general-principles)
2. [Java Backend](#2-java-backend)
   - [2.1 Package Structure](#21-package-structure)
   - [2.2 Controllers](#22-controllers)
   - [2.3 Services](#23-services)
   - [2.4 Entities](#24-entities)
   - [2.5 DTOs](#25-dtos)
   - [2.6 Error Handling](#26-error-handling)
   - [2.7 Validation](#27-validation)
   - [2.8 Security](#28-security)
   - [2.9 Naming](#29-naming)
3. [TypeScript / React Frontend](#3-typescript--react-frontend)
   - [3.1 File Organization](#31-file-organization)
   - [3.2 Components](#32-components)
   - [3.3 Hooks](#33-hooks)
   - [3.4 API Client](#34-api-client)
   - [3.5 Route Groups](#35-route-groups)
   - [3.6 Styling](#36-styling)
   - [3.7 Types](#37-types)
   - [3.8 Naming](#38-naming)
4. [Testing](#4-testing)
5. [Enforcement](#5-enforcement)

---

## 1. General Principles

### KISS (Keep It Simple)

Prefer the simplest solution that actually works. Optimize for clarity over cleverness. Avoid premature abstraction.

### DRY (Don't Repeat Yourself)

Extract repeated logic into shared functions, services, or utilities. Avoid copy-paste implementation drift. Introduce abstractions when repetition is real, not speculative.

### YAGNI (You Aren't Gonna Need It)

Do not build features or abstractions before they are needed. Start simple, then refactor when the pressure is real.

### Immutability

Prefer immutable objects over mutation. Create new instances instead of modifying existing ones. This prevents hidden side effects and makes debugging easier.

### File and Function Size Limits

| Measure | Limit |
|---------|-------|
| File size | 800 lines maximum |
| Function / method size | 50 lines maximum |
| Nesting depth | 4 levels maximum |

### Error Handling

Handle errors explicitly at every level. Never silently catch or ignore exceptions. Log detailed context server-side; provide user-friendly messages client-side.

### No Hardcoded Values

Use named constants, environment variables, or configuration for all meaningful values. Never hardcode API keys, URLs, magic numbers, or permission strings.

---

## 2. Java Backend

### 2.1 Package Structure

Packages follow a Domain-Driven Design module layout within the Maven reactor. The five modules are: `domain`, `infrastructure`, `application`, `controller`, and `start`.

```
com.hospital.api.<domain>       -- Controllers (REST endpoints)
com.hospital.core.<context>      -- Services, entities, repositories (domain logic)
com.hospital.shared.<domain>     -- DTOs, shared types, enums
com.hospital.shared.api          -- ApiResponse envelope, pagination, error types
```

**Contexts** map to business domains such as `appointment`, `department`, `user`, `audit`, `admin`, `inventory`, `ai`, `chatbot`, `content`, `invoice`.

```java
// Controller layer
com.hospital.api.admin.AdminUserController

// Domain layer
com.hospital.core.admin.AdminService
com.hospital.core.department.DepartmentEntity
com.hospital.core.department.DepartmentRepository

// Shared DTOs
com.hospital.shared.admin.AdminUserResponse
com.hospital.shared.admin.AdminUserUpsertRequest
```

### 2.2 Controllers

Controllers are thin -- they map HTTP verbs to service calls, apply security constraints, and delegate validation to the Jakarta validation layer.

**Rules:**
- Annotate with `@RestController` and `@RequestMapping("/api/v1/<domain>/...")`.
- Use constructor injection (no `@Autowired`).
- Return `ApiResponse<T>` from every endpoint.
- Apply `@PreAuthorize` at the class level for domain-wide permissions or at the method level for fine-grained control.
- Keep logic minimal: parse parameters, call service, return `ApiResponse`.

```java
@RestController
@RequestMapping("/api/v1/admin/audit-logs")
@PreAuthorize("@rbac.hasPermission(authentication, 'AUDIT_LOG_READ')")
public class AdminAuditLogController {

    private final AuditLogService auditLogService;

    public AdminAuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public ApiResponse<List<AuditLogResponse>> listAuditLogs(
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String action,
            @RequestParam(required = false, defaultValue = "50") int limit) {
        return ApiResponse.ok(auditLogService.list(entityType, action, limit));
    }
}
```

### 2.3 Services

Services contain business logic and transactional boundaries.

**Rules:**
- Annotate with `@Service`.
- Use constructor injection.
- Annotate read-only methods with `@Transactional(readOnly = true)`.
- Annotate write methods with `@Transactional`.
- Throw domain exceptions (`NotFoundException`, `ConflictException`) from service methods. The exception handler translates these to HTTP responses.
- Use `orElseThrow` on `Optional` returns from repositories instead of `.get()`.

```java
@Service
public class AdminService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    public AdminService(UserRepository userRepository, DepartmentRepository departmentRepository) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> listUsers() {
        return userRepository.findAllByOrderByFullNameAsc()
            .stream()
            .map(this::toAdminUserResponse)
            .toList();
    }

    @Transactional
    public AdminUserResponse createUser(AdminUserUpsertRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ConflictException("User email already exists");
        }
        var user = new UserEntity();
        applyUser(user, request, true);
        return toAdminUserResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public AdminUserResponse getUser(UUID userId) {
        return toAdminUserResponse(
            userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found")));
    }

    private AdminUserResponse toAdminUserResponse(UserEntity user) {
        return new AdminUserResponse(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getPhone(),
            user.getRole(),
            user.getDepartment() == null ? null : user.getDepartment().getId(),
            user.getDepartment() == null ? null : user.getDepartment().getName(),
            user.getSpecialty(),
            user.getQualification(),
            user.getExperienceYears(),
            user.isActive());
    }
}
```

### 2.4 Entities

JPA entities map to database tables. They are data holders with minimal logic.

**Rules:**
- Annotate with `@Entity`, `@Table(name = "...")`.
- Use Lombok `@Getter`, `@Setter`, `@NoArgsConstructor`.
- Use `UUID` as primary key type.
- Use `@PrePersist` and `@PreUpdate` lifecycle callbacks for timestamp management.
- Map column names with snake_case via `@Column(name = "...")`.
- Favor soft-delete (e.g., `isActive` boolean) over hard deletion to preserve referential integrity.

```java
@Entity
@Table(name = "departments")
@Getter
@Setter
@NoArgsConstructor
public class DepartmentEntity {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true, length = 150)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        var now = Instant.now();
        if (id == null) {
            id = UUID.randomUUID();
        }
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
```

### 2.5 DTOs

Request and response DTOs are Java `record` types. They are immutable by design.

**Rules:**
- Use `record` for all request and response types.
- Place in `com.hospital.shared.<domain>` package.
- Apply Jakarta Bean Validation annotations (`@NotBlank`, `@NotNull`, `@Email`, `@Size`) on request record components.
- Keep records focused -- one record per use case or group of closely related fields.
- Do not embed business logic in DTOs.

```java
// Request DTO
public record AdminDepartmentUpsertRequest(
    @NotBlank String name,
    String description,
    String imageUrl,
    String phone,
    Boolean active
) {}

// Response DTO
public record AdminDepartmentResponse(
    UUID departmentId,
    String name,
    String description,
    String imageUrl,
    String phone,
    boolean active
) {}
```

### 2.6 Error Handling

A single `@RestControllerAdvice` handler catches all exceptions and wraps them in a consistent `ApiResponse` envelope.

**`ApiResponse` envelope:**
```java
public record ApiResponse<T>(
    boolean success,
    T data,
    String message,
    ApiError error,
    PaginationMeta pagination,
    Instant timestamp
) {
    public static <T> ApiResponse<T> ok(T data) { ... }
    public static <T> ApiResponse<T> ok(T data, PaginationMeta pagination) { ... }
    public static <T> ApiResponse<T> ok(T data, String message) { ... }
    public static <T> ApiResponse<T> fail(String code, String message) { ... }
}
```

**Exception handling pattern (in `RestExceptionHandler`):**
- Catch `NotFoundException` -> 404
- Catch `ConflictException` -> 409
- Catch `BadCredentialsException` -> 401
- Catch `AccessDeniedException` / `AuthorizationDeniedException` -> 403
- Catch `MethodArgumentNotValidException` -> 400 (validation errors)
- Catch `Exception` -> 500 (generic fallback, never leaks internals)
- Always return `ApiResponse.fail(code, message)` with an appropriate error code.
- Never expose stack traces or internal implementation details in error responses.

```java
@RestControllerAdvice
public class RestExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    ResponseEntity<ApiResponse<Void>> handleNotFound(NotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.fail("not_found", exception.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException exception) {
        var message = exception.getBindingResult().getFieldErrors().stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest()
            .body(ApiResponse.fail("validation_error", message));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiResponse<Void>> handleGeneric(Exception exception) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.fail("internal_error", "Internal server error"));
    }
}
```

### 2.7 Validation

Use Jakarta Bean Validation (`jakarta.validation`) for input validation at the controller boundary.

**Rules:**
- Annotate request DTO record components with `@NotBlank`, `@NotNull`, `@Email`, `@Size`, `@Min`, `@Max` as appropriate.
- Use `@Valid @RequestBody` on controller method parameters to trigger validation.
- The `RestExceptionHandler` catches `MethodArgumentNotValidException` and returns a 400 response with field-level error messages.
- Validation is a cross-cutting concern. Services focus on business rules, not input shape validation.

```java
@PostMapping
public ApiResponse<AppointmentResponse> createAppointment(
    @Valid @RequestBody AppointmentCreateRequest request) {
    return ApiResponse.ok(appointmentService.create(request));
}
```

### 2.8 Security

Authorization is declared declaratively via `@PreAuthorize` on controllers.

**Rules:**
- Use `@PreAuthorize("@rbac.hasPermission(authentication, 'PERMISSION_STRING')")` with constant-style permission strings.
- Apply class-level annotations when all endpoints share the same permission.
- Apply method-level annotations for fine-grained resource access.
- Permission strings are uppercase snake_case (e.g., `AUDIT_LOG_READ`, `ADMIN_USERS_MANAGE`, `INVENTORY_MANAGE`).
- Never hardcode user roles in `@PreAuthorize` expressions -- always use the `@rbac` bean which resolves roles to permissions.

```java
@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("@rbac.hasPermission(authentication, 'ADMIN_USERS_MANAGE')")
public class AdminUserController {
    // all endpoints inherit the class-level restriction
}

@RestController
@RequestMapping("/api/v1/inventory/items")
public class InventoryController {

    @GetMapping
    @PreAuthorize("@rbac.hasPermission(authentication, 'INVENTORY_READ')")
    public ApiResponse<List<InventoryItemResponse>> listItems() { ... }

    @PostMapping
    @PreAuthorize("@rbac.hasPermission(authentication, 'INVENTORY_MANAGE')")
    public ResponseEntity<ApiResponse<InventoryItemResponse>> createItem(
        @Valid @RequestBody InventoryItemCreateRequest request) { ... }
}
```

### 2.9 Naming

| Element | Convention | Example |
|---------|-----------|---------|
| Classes / Interfaces | `PascalCase` | `AdminUserController`, `AuditLogService`, `DepartmentEntity` |
| Methods | `camelCase` | `listUsers()`, `findById()`, `toAdminUserResponse()` |
| Variables | `camelCase` | `userRepository`, `request`, `auditLogService` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_LOGIN_ATTEMPTS`, `DEFAULT_PAGE_SIZE` |
| Packages | `lowercase` | `com.hospital.api.admin` |
| Enum values | `UPPER_SNAKE_CASE` | `UserRole.DOCTOR`, `InvoiceStatus.PAID` |
| Permission strings | `UPPER_SNAKE_CASE` | `AUDIT_LOG_READ`, `ADMIN_USERS_MANAGE` |
| Database columns | `snake_case` | `image_url`, `is_active`, `created_at` |

---

## 3. TypeScript / React Frontend

### 3.1 File Organization

The frontend lives under `web/` and uses the Next.js App Router.

```
web/src/
  app/             -- Next.js App Router pages and layouts
    (public)/      -- Public-facing routes
    (auth)/        -- Authentication routes
    (app)/         -- Authenticated application routes (admin, portal, staff)
    api/           -- API route handlers
  components/
    ui/            -- Shared UI primitives (button, card, dialog, etc.)
    shells/        -- Layout shells (top-nav, side-nav, footer)
    auth/          -- Authentication-specific components
  lib/             -- Service modules, API client, utilities
    api-client.ts  -- Centralized API request wrapper
    utils.ts       -- Shared utility functions
    *.ts           -- Domain-specific service modules
```

**File naming:** Use `kebab-case` for all files.

| File | Correct Name |
|------|-------------|
| Icon component | `hc-icon.tsx` |
| Data panel component | `data-panel.tsx` |
| Page header component | `page-header.tsx` |
| KPI card component | `kpi-card.tsx` |
| Route error state | `route-error-state.tsx` |
| API client module | `api-client.ts` |
| Custom hook | `use-stored-role.ts` |

### 3.2 Components

**Rules:**
- Use PascalCase function components with explicit `interface` props.
- Do NOT use `React.FC` -- declare props directly in the function signature.
- Use named exports (not default exports).
- Keep components focused on a single responsibility.
- Extract reusable UI elements into `web/src/components/ui/`.

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DataPanelProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  filters?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function DataPanel({ title, action, children, filters, footer, className }: DataPanelProps) {
  return (
    <section className={cn("hc-data-panel", className)}>
      {title || action ? (
        <div className="flex items-center justify-between">
          {title ? <h2>{title}</h2> : <div />}
          {action ? <div>{action}</div> : null}
        </div>
      ) : null}
      {filters ? <div className="hc-filter-row">{filters}</div> : null}
      {children}
      {footer ? <div className="hc-table-footer">{footer}</div> : null}
    </section>
  );
}
```

### 3.3 Hooks

**Rules:**
- Name hooks with `camelCase` and a `use` prefix.
- Each hook file is a single module named after the hook (e.g., `use-stored-role.ts`).
- Keep hooks focused on a single concern.

```ts
// web/src/lib/use-stored-role.ts
export function useStoredRole(): string | null {
  // encapsulated read from sessionStorage with fallback
}
```

### 3.4 API Client

All HTTP communication goes through the centralized API client in `web/src/lib/api-client.ts`.

**`ApiEnvelope` interface (mirrors the backend):**
```ts
export interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: {
    code?: string;
    message?: string;
  };
}
```

**Rules:**
- Define typed request/response interfaces per domain in dedicated service modules under `web/src/lib/`.
- Use the `apiRequest` wrapper from `api-client.ts` which handles base URL resolution, JSON parsing, and error shaping.
- Domain service modules (e.g., `clinical-api.ts`, `public-api.ts`, `operations-api.ts`) encapsulate endpoint paths and typed return values.
- Handle errors through `ApiClientError` -- never swallow fetch failures.

```ts
// web/src/lib/public-api.ts
import { apiRequest } from "./api-client";

export interface Doctor {
  id: string;
  fullName: string;
  specialty: string;
}

export async function getDoctors(): Promise<Doctor[]> {
  const response = await apiRequest<Doctor[]>("/doctors", { authScope: "public" });
  return response.data ?? [];
}
```

### 3.5 Route Groups

Use Next.js route group conventions to organize the application by access level:

| Route Group | Purpose | Examples |
|-------------|---------|----------|
| `(public)` | Unauthenticated pages | Home, department listing, doctor listing |
| `(auth)` | Authentication flow | Login page |
| `(app)` | Authenticated application | Admin dashboard, portal, staff pages |

Layout files (`layout.tsx`) within each group provide the corresponding shell (navigation, footer, authentication guards) for all routes in that group.

### 3.6 Styling

**Rules:**
- Use Tailwind CSS utility classes for all styling.
- Custom design tokens use the `--hc-*` CSS custom property namespace.
- Define tokens at the root level (or via Tailwind CSS v4 `@theme` directive).

```css
/* src/app/globals.css -- conceptual example */
:root {
  --hc-border: #e2e8f0;
  --hc-text: #1e293b;
  --hc-surface-soft: #f8fafc;
  --hc-surface: #ffffff;
  --radius-xl: 12px;
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.08);
}
```

Usage in components:
```tsx
<div className="border-[var(--hc-border)] bg-[var(--hc-surface-soft)] rounded-[var(--radius-xl)]">
```

### 3.7 Types

**Rules:**
- Use `interface` for object shapes that represent public APIs, component props, and shared data contracts.
- Use `type` for unions, intersections, tuples, and mapped types.
- Avoid `any`. Use `unknown` for untrusted input and narrow it safely.
- Use `import type { ... }` for type-only imports.
- Prefer string literal unions over `enum` unless interoperability requires an enum.

```ts
// Good: interface for public contracts
export interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

// Good: type for unions
export type AuthScope = "staff" | "patient";

// Good: interface for component props
interface KpiCardProps {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
}
```

### 3.8 Naming

| Element | Convention | Example |
|---------|-----------|---------|
| Components | `PascalCase` | `DataPanel`, `KpiCard`, `PageHeader` |
| Component files | `kebab-case.tsx` | `data-panel.tsx`, `kpi-card.tsx` |
| Hooks | `camelCase` (use prefix) | `useStoredRole` |
| Hook files | `kebab-case.ts` | `use-stored-role.ts` |
| Utility functions | `camelCase` | `cn()`, `formatDate()`, `getApiBaseUrl()` |
| Service modules | `kebab-case.ts` | `public-api.ts`, `api-client.ts` |
| Interfaces | `PascalCase` | `ApiEnvelope<T>`, `DataPanelProps` |
| Type aliases | `PascalCase` | `AuthScope`, `TokenPair` |
| Constants | `UPPER_SNAKE_CASE` | `AUTH_SCOPES`, `API_BASE_URL` |

---

## 4. Testing

### AAA Pattern (Arrange-Act-Assert)

Organize all tests using the Arrange-Act-Assert structure for clarity.

```ts
test("returns empty array when no doctors match query", () => {
  // Arrange
  const query = "nonexistent-specialty";

  // Act
  const result = filterDoctors(allDoctors, query);

  // Assert
  expect(result).toEqual([]);
});
```

### Test Naming

Use descriptive names that explain the behavior under test, not the implementation.

```text
[method/feature] returns/throws [expected] when [scenario]

Examples:
- "creates appointment when all required fields are valid"
- "throws NotFoundException when user does not exist"
- "returns empty array when no departments match filter"
```

### Coverage Target

Maintain a minimum of 80% test coverage across both backend and frontend. The backend uses JaCoCo; the frontend uses Vitest with `@testing-library/react`.

### Test Scope

| Layer | Framework | Scope |
|-------|-----------|-------|
| Backend unit | JUnit 5 + Mockito | Services, utilities, domain logic |
| Backend integration | Spring Boot Test + Testcontainers | Repository queries, full controller stack |
| Frontend unit | Vitest + React Testing Library | Component rendering, hook behavior, utility functions |
| Frontend E2E | Playwright | Critical user flows (booking, login, admin CRUD) |

---

## 5. Enforcement

### Automated (CI/CD)

| Check | Tool / Mechanism | Trigger |
|-------|-----------------|---------|
| TypeScript compilation | `tsc --noEmit` | Pre-commit hook / CI |
| Linting | ESLint (`eslint-config-next`) | CI |
| Java compilation | Maven `compile` | CI |
| Backend tests | Maven `verify` (JaCoCo gate) | CI |
| Frontend tests | Vitest | CI |
| E2E tests | Playwright | CI (scheduled or on merge) |
| Code coverage | JaCoCo (backend), Vitest (frontend) | CI |

### Code Review

All pull requests must undergo code review. The reviewer checks for:
- Conformance to these coding standards
- Correct error handling (no swallowed exceptions, proper HTTP status codes)
- Security posture (`@PreAuthorize` present on new endpoints, no hardcoded secrets)
- Test coverage of new or changed logic
- Immutability compliance (no unintended mutation)

### Manual Review Checklist

Before marking code complete:
- [ ] Follows package/file organization rules
- [ ] No hardcoded values
- [ ] Proper error handling (no silent catches)
- [ ] `@PreAuthorize` applied to new controller endpoints
- [ ] DTOs are `record` types with validation annotations
- [ ] Services use constructor injection (no `@Autowired`)
- [ ] Frontend files use `kebab-case.tsx` naming
- [ ] Component props are typed with `interface`
- [ ] API calls go through `api-client.ts`
- [ ] No `console.log` in production code
- [ ] Tests follow AAA pattern
- [ ] Test coverage meets 80% minimum
