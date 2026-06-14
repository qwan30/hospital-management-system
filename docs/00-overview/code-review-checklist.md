# Code Review Checklist — HMS

> Tai lieu danh cho toan bo nhan vien ky thuat. Cac muc duoc phan theo muc do nghiem trong.
> Bao gom ca phan Tieng Viet mo ta quy trinh va phan Tieng Anh danh muc kiem tra.

---

## Quy trinh Code Review

### 1. Chuan bi truoc khi review

1.  **Kiem tra CI/CD da PASS.** Khong review neu build hoac test dang do. Xu ly loi build truoc.
    _Do not review if build or tests are failing._
2.  **Cap nhat nhanh (branch) voi nhanh dich (target).** Giai quyet xung dot truoc.
    _Rebase/merge target branch; resolve conflicts._
3.  **Chay `git diff` de nam duoc pham vi thay doi.**
    _Run `git diff` first to understand scope._
4.  **Su dung GitNexus de danh gia tac dong.**
    _Run `gitnexus_impact` on each modified symbol to assess blast radius._

### 2. Trong khi review — phan loai theo muc do

| Muc do | Y nghia | Hanh dong |
|--------|---------|-----------|
| CRITICAL | Lo hong bao mat hoac mat du lieu | **CHAN** — phai sua truoc khi merge |
| HIGH | Bug hoac van de chat luong nghiem trong | **CANH BAO** — nen sua truoc khi merge |
| MEDIUM | Van de duy tri ma nguon | **LUU Y** — can nhac sua |
| LOW | Goi y ve phong cach hoac toi uu nho | **GOP Y** — tuy chon |

### 3. Sau khi review

1.  **Danh dau trang thai:** Approved / Changes Requested / Comment.
2.  **Gan nguoi phu trach** neu co van de CRITICAL hoac HIGH.
3.  **Kiem tra lai** sau khi tac gia fix.
4.  **Chay `gitnexus_detect_changes()` truoc khi merge** de xac nhan pham vi thay doi chi anh huong cac symbol du kien.

---

## Checklist chi tiet (Detailed Checklist)

### 1. Chuc nang (Functionality)

| # | Item | Severity |
|---|------|----------|
| 1.1 | **AC compliance.** Every acceptance criterion in the user story is covered by the implementation. _Tung tieu chi chap nhan (AC) trong user story deu duoc implement._ | CRITICAL |
| 1.2 | **Business rules in the right layer.** Domain rules live in `domain/` or `application/`, never in `controller/`. _Logic nghiep vu nam trong domain/ hoac application/, khong bao gio dat o controller/._ | CRITICAL |
| 1.3 | **Edge cases covered.** Empty lists, null inputs, boundary values, concurrent access, duplicate submissions. _Xu ly cac truong hop dac biet: danh sach rong, null, gia tri bien, truy cap dong thoi, trung lap._ | HIGH |
| 1.4 | **Error responses are meaningful.** API errors return `ApiResponse.fail()` with a valid error code and a user-readable message. _Loi API tra ve `ApiResponse.fail()` voi ma loi va thong bao co y nghia._ | HIGH |
| 1.5 | **Idempotency for mutating endpoints.** Creating or updating the same resource twice does not produce inconsistent state. _Tao/cap nhat cung mot tai lieu hai lan khong gay mat nhat quan du lieu._ | HIGH |
| 1.6 | **Confirmation codes / reference numbers are unique and traceable.** Check generation strategy in AppointmentWriteService and similar. _Ma xac nhan phai duy nhat va co the truy vet._ | MEDIUM |

### 2. Kien truc (Architecture)

| # | Item | Severity |
|---|------|----------|
| 2.1 | **Dependency direction respected.** `domain` <-- `infrastructure` <-- `application` <-- `controller` <-- `start`. No reverse imports. _Tuan tu phu thuoc: domain khong import infra/app/controller. Kiem tra khong co import nguoc._ | CRITICAL |
| 2.2 | **No cross-boundary data access.** `controller` does not inject `*Repository` directly; it goes through `*Service`. _Controller khong goi truc tiep Repository, ma phai qua Service._ | CRITICAL |
| 2.3 | **No business logic in controllers.** Controllers only parse HTTP input, delegate to service, format response. _Controller chi xu ly HTTP, goi Service, tra ve response._ | CRITICAL |
| 2.4 | **Domain entities are anemic-free?** Rich domain model: entity methods encapsulate behavioral logic (e.g., `AppointmentEntity.cancel()` instead of setter chain). _Thuc the domain co hanh vi dong goi ben trong (setStatus -> method co y nghia nghiep vu)._ | MEDIUM |
| 2.5 | **Flyway migration order.** New migration files have a version number greater than the latest. Check `V{next}__description.sql` does not conflict. _File migration moi phai co so version lon hon version hien tai. Khong duoc chen ep._ | HIGH |
| 2.6 | **Module boundaries.** `shared` DTOs/events are used across modules; internal DTOs stay within their module. _DTO dung chung dat o shared/; DTO noi bo o trong module._ | HIGH |
| 2.7 | **No circular dependencies.** A -> B -> A. Check pom.xml or import graph. _Khong co vong lap phu thuoc giua cac module._ | CRITICAL |

### 3. Chat luong ma nguon (Quality)

| # | Item | Severity |
|---|------|----------|
| 3.1 | **Naming clarity.** Classes, methods, variables reveal intent. Avoid abbreviations like `svc`, `repo`, `mgr`. _Ten bien, phuong thuc, class phai ro rang, tranh viet tat._ | MEDIUM |
| 3.2 | **No duplicate logic.** Extract repeated code into shared methods/services. _Khong co ma bi lap lai. Trich xuat thanh phuong thuc dung chung._ | HIGH |
| 3.3 | **No dead code.** Unused imports, methods, parameters, or commented-out blocks are removed. _Xoa import chet, phuong thuc khong dung, ma bi comment._ | MEDIUM |
| 3.4 | **No sensitive data in logs.** PHI (patient name, CCCD, diagnosis) must never appear in log output. _Khong duoc log du lieu PHI (ten benh nhan, CCCD, chan doan)._ | CRITICAL |
| 3.5 | **Immutability respected.** Use `record` for DTOs. Avoid mutable fields on shared objects. Use `@ReadOnlyProperty` or `Collections.unmodifiableList()` where needed. _Su dung `record` cho DTO. Tranh mutable fields tren object dung chung._ | MEDIUM |
| 3.6 | **Function length.** Functions stay under ~50 lines. Controllers are thin. _Ham duoi ~50 dong. Controller phai mong._ | MEDIUM |
| 3.7 | **File length.** Files stay under ~800 lines. Extract large files into multiple focused modules. _File duoi ~800 dong. Tach file lon thanh nhieu module nho._ | LOW |
| 3.8 | **Deep nesting.** Avoid more than 4 levels of nesting. Prefer early returns / guard clauses. _Tranh long nhau qua 4 cap. Dung early return._ | MEDIUM |

### 4. Bao mat (Security)

| # | Item | Severity |
|---|------|----------|
| 4.1 | **No hardcoded secrets.** API keys, passwords, JWT secrets, encryption keys must be in environment variables or a secrets manager. _Khong duoc hardcode secret. Tat ca phai qua env hoac secrets manager._ | CRITICAL |
| 4.2 | **Input validation.** All user input at controller boundary is validated (`@Valid`, Jakarta Bean Validation). _Dau vao tu nguoi dung phai duoc validate bang `@Valid` + Bean Validation._ | CRITICAL |
| 4.3 | **Authorization check on every endpoint.** Each controller endpoint has `@PreAuthorize("@rbac.hasPermission(...)")` or equivalent. _Moi endpoint controller phai co kiem tra phan quyen._ | CRITICAL |
| 4.4 | **PHI encryption.** Patient identifiers (CCCD) must go through `PatientIdentifierProtector.encrypt()` before storing. _CCCD va identifier benh nhan phai duoc ma hoa truoc khi luu._ | CRITICAL |
| 4.5 | **SQL parameterized.** All database queries use parameterized inputs (JPA/`@Query` with `:param`). No string concatenation. _Truy van SQL phai dung tham so (parameterized). Khong duoc noi chuoi._ | CRITICAL |
| 4.6 | **Rate limiting.** Public endpoints (`/auth/login`, `/appointments`, `/chatbot/messages`) are covered by `RateLimitFilter`. _Endpoint cong cong phai co gioi han toc do._ | HIGH |
| 4.7 | **JWT token security.** Access tokens expire, refresh tokens rotate, no sensitive claims in payload. _Token JWT phai co thoi han, refresh token phai xoay vong._ | HIGH |
| 4.8 | **CSRF / CORS.** CORS configuration is restrictive (not `allowCredentials: true` with wildcard origin). _CORS phai cau hình chat che, khong dung wildcard origin voi credentials._ | HIGH |
| 4.9 | **Security headers.** Response security headers (X-Content-Type-Options, Strict-Transport-Security, etc.) are set via SecurityConfig or filter. _Header bao mat phai duoc cau hình trong SecurityConfig._ | MEDIUM |
| 4.10 | **No SQL injection in Flyway.** Check that Flyway migration scripts do not interpolate user input. _Kiem tra Flyway migration khong noi dung dau vao tu nguoi dung._ | CRITICAL |

### 5. Kiem thu (Testing)

| # | Item | Severity |
|---|------|----------|
| 5.1 | **AC has a test.** Every acceptance criterion maps to at least one automated test (unit, integration, or E2E). _Moi tieu chi chap nhan co it nhat mot test tu dong._ | HIGH |
| 5.2 | **Regression test for bug fixes.** If a PR fixes a bug, the bug's reproduction steps are codified as a test that passes after the fix. _Bug fix phai co test tai hien va pass sau khi fix._ | HIGH |
| 5.3 | **Tests do not depend on implementation internals.** Tests mock at boundaries, not internal methods. Prefer integration tests over mocking repositories. _Test khong phu thuoc vao noi bo implement. Mock o bien (boundary), khong mock method noi bo._ | MEDIUM |
| 5.4 | **E2E covers critical user flow.** The primary user journey (e.g., booking an appointment, check-in, discharge) has a Playwright E2E spec. _Flow chinh cua nguoi dung phai co E2E test._ | HIGH |
| 5.5 | **Test isolation.** Database state is reset between tests (`@Sql`, `@DirtiesContext`, or Testcontainers lifecycle). _Trang thai database phai duoc reset giua cac test._ | HIGH |
| 5.6 | **No flaky tests.** Tests that depend on timing, random data, or external services are flagged. _Test khong duoc phu thuoc vao thoi gian, du lieu ngau nhien, hoac dich vu ben ngoai._ | HIGH |
| 5.7 | **Coverage threshold.** JaCoCo reports at least 80% line coverage for new code. _Code moi phai dat it nhat 80% line coverage._ | MEDIUM |
| 5.8 | **Frontend unit tests.** Vitest tests for components and utility functions. _Component va utility function phai co unit test (Vitest)._ | MEDIUM |

### 6. Van hanh (Operations)

| # | Item | Severity |
|---|------|----------|
| 6.1 | **Logging at appropriate level.** `ERROR` for failures, `WARN` for degradation, `INFO` for state transitions. Structured logging (JSON) via Logstash encoder. _Log phai dung cap do, su dung structured logging (JSON)._ | MEDIUM |
| 6.2 | **Metrics for critical flows.** Appointment bookings, payments, auth attempts are instrumented with Micrometer counters/timers. _Cac flow quan trong (dat lich, thanh toan, auth) phai co metric._ | HIGH |
| 6.3 | **Timeout for external calls.** HTTP clients, AI integration, email service have configured connect/read timeouts. _Goi dich vu ben ngoai phai co timeout._ | HIGH |
| 6.4 | **Safe Flyway migrations.** `ALTER TABLE ... ADD COLUMN` allows NULL or has a sensible default. Backfill is done in a separate script if needed. _Migration phai an toan: them cot cho phep NULL, backfill bang script rieng._ | HIGH |
| 6.5 | **Rollback plan.** Every migration has a corresponding rollback script or strategy documented. _Moi migration phai co phuong an rollback._ | MEDIUM |
| 6.6 | **Request correlation ID.** Every API call carries `X-Request-Id` header. Logged in all downstream services. _Moi API call co request ID de truy vet._ | MEDIUM |
| 6.7 | **Graceful shutdown.** Application handles `SIGTERM` and completes in-flight requests. _Ung dung xu ly SIGTERM, hoan thanh request dang xu ly._ | MEDIUM |

### 7. Frontend — Giao dien nguoi dung (Frontend-specific)

| # | Item | Severity |
|---|------|----------|
| 7.1 | **Component accessibility.** Semantic HTML (`<nav>`, `<main>`, `<button>`), `aria-*` attributes, keyboard navigation, focus management, color contrast. _Component dung HTML dung nghia, co aria-*, ho tro ban phim._ | HIGH |
| 7.2 | **Responsive design.** Layout works on mobile (320px+), tablet, and desktop. Uses Tailwind breakpoints (`sm:`, `md:`, `lg:`) or CSS media queries. _Giao dien hien thi tot tren mobile, tablet, desktop._ | HIGH |
| 7.3 | **No `console.log` in production code.** All debug output removed. Use a logger or `hms:api-request` CustomEvent for diagnostics. _Khong duoc de `console.log` trong code production._ | HIGH |
| 7.4 | **Route guards.** Protected routes use `RouteGuard` or equivalent. Unauthorized users are redirected to login or `/forbidden`. _Trang bao ve phai co RouteGuard; nguoi dung khong co quyen bi redirect._ | CRITICAL |
| 7.5 | **API client error handling.** `api-client.ts` errors are caught and displayed as user-friendly messages. Network failures show a meaningful fallback. _Loi API phai duoc bat va hien thi thanh thong bao than thien._ | HIGH |
| 7.6 | **Loading and empty states.** Skeleton/spinner during data fetch. "No data" message for empty lists. _Trang thai load phai co skeleton/spinner. Danh sach rong phai co thong bao._ | MEDIUM |
| 7.7 | **No client-side secrets.** API keys, tokens are stored in `sessionStorage` (not `localStorage` for tokens). No secrets in client code. _Khong duoc luu secret o client. Token luu trong sessionStorage._ | CRITICAL |
| 7.8 | **Form validation.** Forms validate client-side (Zod schema or HTML5) before submitting. Error states shown inline. _Form phai validate phia client truoc khi submit._ | HIGH |
| 7.9 | **Accessibility E2E.** Playwright aXe/`@axe-core/playwright` test runs on each public and protected page. _Kiem tra accessibility bang Playwright + aXe._ | MEDIUM |

### 8. Backend — Phia may chu (Backend-specific)

| # | Item | Severity |
|---|------|----------|
| 8.1 | **Transaction boundaries.** `@Transactional` is on service methods, not controllers. Propagation and isolation levels are explicit when default is insufficient. _`@Transactional` dat o Service, khong dat o Controller._ | CRITICAL |
| 8.2 | **Entity validation.** JPA `@Column(nullable = false, length = ...)`, `@Enumerated(STRING)`, `@PrePersist`/`@PreUpdate` for auditing fields (createdAt, updatedAt). _Entity phai co validation annotation, truong audit tu dong._ | HIGH |
| 8.3 | **Flyway migration review.** Check each migration: (a) backward compatible, (b) no `DROP COLUMN` without deprecation period, (c) no `RENAME TABLE` without data migration, (d) idempotent. _Migration phai: tuong thich nguoc, khong xoa cot dot ngot, khong rename bang khong co di chuyen du lieu._ | CRITICAL |
| 8.4 | **API envelope consistency.** All endpoints return `ApiResponse<T>` with `success`, `data`, `message`, `error`, `pagination`, `timestamp`. _Tat ca endpoint phai tra ve `ApiResponse<T>` nhat quan._ | HIGH |
| 8.5 | **Pagination for list endpoints.** All GET list/collection endpoints support `page` / `size` parameters and return `PaginationMeta`. _Endpoint GET danh sach phai ho tro phan trang._ | HIGH |
| 8.6 | **HTTP method and status code correctness.** POST returns 201 Created, DELETE returns 200/204, validation errors return 400, unauthorized returns 401, forbidden returns 403. _Phuong thuc HTTP va status code phai dung._ | HIGH |
| 8.7 | **Service layer does not leak persistence exceptions.** Catch `DataIntegrityViolationException`, `OptimisticLockException`, translate to domain exceptions (`ConflictException`, `NotFoundException`). _Service phai bat exception persistence va chuyen thanh domain exception._ | HIGH |
| 8.8 | **Repository methods use `@Lock` for pessimistic writes.** Booking and inventory operations use `LOCK_MODE.PESSIMISTIC_WRITE` to prevent race conditions. _Repository cho booking/inventory phai dung `@Lock(PESSIMISTIC_WRITE)`._ | HIGH |
| 8.9 | **Audit logging for sensitive operations.** User creation, role change, permission change, patient record access are logged in `AuditLogEntity`. _Thao tac nhay cam (tao user, doi role, truy cap ho so) phai duoc audit log._ | HIGH |
| 8.10 | **No `@Autowired` field injection.** Use constructor injection. All beans are `final` fields with constructor DI. _Dung constructor injection, khong dung `@Autowired` tren field._ | MEDIUM |

---

## Phu luc: Tai nguyen tham khao (Appendix: Reference)

### Cac file can tham khao khi review

| Khu vuc | File |
|---------|------|
| API envelope | `backend/controller/src/main/java/com/hospital/shared/api/ApiResponse.java` |
| RBAC permissions | `backend/application/src/main/java/com/hospital/core/security/RbacAuthorizationService.java` |
| PHI encryption | `backend/infrastructure/src/main/java/com/hospital/core/patient/PatientIdentifierProtector.java` |
| Rate limiting | `backend/controller/src/main/java/com/hospital/api/config/RateLimitFilter.java` |
| Frontend RBAC | `web/src/lib/rbac.ts` |
| Route guard | `web/src/components/auth/route-guard.tsx` |
| API client | `web/src/lib/api-client.ts` |
| E2E specs | `web/e2e/specs/` |
| Integration tests | `backend/start/src/test/java/com/hospital/api/` |
| Domain entities | `backend/domain/src/main/java/com/hospital/core/` |
| Flyway migrations | `backend/start/src/main/resources/db/migration/` |
| Architecture guide | `docs/03-architecture/README.md` |
| Security config | `backend/controller/src/main/java/com/hospital/api/config/SecurityConfig.java` |
| Frontend tests | `web/src/**/__tests__/` |

### Cong cu ho tro (CLI / MCP tools)

- `gitnexus_impact({target: "symbolName", direction: "upstream"})` — danh gia pham vi anh huong truoc khi sua
- `gitnexus_detect_changes()` — kiem tra thay doi truoc khi commit
- `codegraph_explore("query")` — tra cuu kien truc va symbol
- Playwright `npx playwright test` — E2E
- Vitest `npx vitest run` — unit test
- JaCoCo `mvn verify` — coverage report
- `rtk git diff` — compact diff voi token optimization
