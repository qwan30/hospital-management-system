---
title: So luoc Du an - Project Foundation
version: 1.0
status: current
last_updated: 2026-06-14
---

# So luoc Du an -- Hospital Management System (HMS)

> Tai lieu nay mo ta nen tang ky thuat, kien truc, va quy trinh van hanh cua he thong. Day la tai lieu tham chieu chinh cho moi quyet dinh thiet ke va phat trien.

## 1. Tong quan (Overview)

| Muc | Gia tri |
|-----|---------|
| Ten du an | Hospital Management System (HMS) |
| Loai | Web Application (Enterprise Healthcare ERP) |
| Ngon ngu Backend | Java 17 (Temurin) |
| Framework Backend | Spring Boot 3.3.5 |
| Cong cu build | Maven 3.9+ (reactor multi-module) |
| Kien truc Backend | DDD Modular Monolith (5 modules) |
| Ngon ngu Frontend | TypeScript 5 |
| Framework Frontend | Next.js 16.2 (App Router) |
| UD React | React 19.2 |
| Styling | Tailwind CSS 4 + Base UI + shadcn |
| CSDL | PostgreSQL 15 (pgvector/pgvector:pg15) |
| Quan ly DB migrations | Flyway (20 migrations, V1--V20) |
| Container hoa | Docker Compose (3 services: postgres, backend, frontend) |
| CI/CD | GitHub Actions (4 workflows) |
| Container registry | GHCR (ghcr.io/tranhquan099-commits/hospital-management-system) |
| Dieu phoi | Git branch master, HEAD 2ab7e3f |
| Thu muc nguon | D:\projects\hospital-management-system |

### So luong nguon

| Chi so | Gia tri |
|--------|---------|
| Module Maven | 5: `domain`, `infrastructure`, `application`, `controller`, `start` |
| Controller method mappings | 148 |
| Page.tsx (frontend) | 72 |
| Route/layout files | 77 |
| Bang CSDL | 35 |
| Flyway migrations | 20 |
| Permission RBAC | 34 |
| Vai tro nguoi dung | 7 (ADMIN, DOCTOR, NURSE, RECEPTIONIST, PHARMACIST, ACCOUNTANT, PATIENT) |
| GitNexus symbol count | 5.380 nodes, 12.297 edges, 300 execution flows |

## 2. Tai lieu lien quan (Related Documents)

Tai lieu nay nam trong cum `00-overview/`. Cac tai lieu tham chieu khac:

| Chu de | Tai lieu chinh | Duong dan |
|--------|----------------|-----------|
| San pham va pham vi | HMS PRD | [01-product/prd.md](../01-product/prd.md) -- ban hien tai: [HMS_PRD.md](../HMS_PRD.md) |
| Yeu cau he thong | HMS SRS | [02-requirements/srs.md](../02-requirements/srs.md) -- ban hien tai: [HMS_SRS.md](../HMS_SRS.md) |
| Thiet k ky thuat | HMS TDD | [03-architecture/architecture.md](../03-architecture/architecture.md) -- ban hien tai: [HMS_TDD.md](../HMS_TDD.md) |
| API contract | API Contract | [API_ENDPOINTS_COMPREHENSIVE.md](../API_ENDPOINTS_COMPREHENSIVE.md) |
| Kien truc Frontend | Frontend Architecture | [03-architecture/FRONTEND_ARCHITECTURE.md](../03-architecture/FRONTEND_ARCHITECTURE.md) |
| Kiem thu | Test Plan | [06-testing/test-plan.md](../06-testing/test-plan.md) |
| Trieu khai | Deployment Guide | [HMS_DeploymentGuide.md](../HMS_DeploymentGuide.md) |
| So do use case | Use Case Diagram | [HMS_UseCaseDiagram.md](../HMS_UseCaseDiagram.md) |
| So do nguoi dung hien tai | Current System Flows | [reference/current-system-flows.md](../reference/current-system-flows.md) |
| Ma tran man hinh-API | Role-Screen-API Matrix | [reference/role-screen-api-matrix.md](../reference/role-screen-api-matrix.md) |
| Chi so engineering | Engineering Metrics | [reference/engineering-metrics.md](../reference/engineering-metrics.md) |

## 3. Ngan xep ky thuat (Tech Stack)

### 3.1 Backend

| Thanh phan | Cong nghe | Phien ban | Muc dich |
|------------|-----------|-----------|----------|
| Language | Java | 17 (Temurin) | Runtime |
| Framework | Spring Boot | 3.3.5 | DI, web, security, data |
| Build | Maven | 3.9+ | Module reactor, dependency management |
| API layer | Spring Web + SpringDoc | 2.6.0 | REST endpoints, OpenAPI docs |
| Validation | Jakarta Validation | -- | DTO validation |
| Security | Spring Security + JJWT | 0.12.6 | Authentication, RBAC, JWT |
| Database | Spring Data JPA + Hibernate | -- | ORM |
| DB Migration | Flyway | -- | Schema versioning |
| DB Engine | PostgreSQL 15 (pgvector) | 15 | Primary datastore |
| PDF generation | Apache PDFBox | 3.0.4 | Prescription PDF |
| Testing | JUnit 5 + Mockito + Testcontainers | 1.20.4 | Unit + integration tests |
| Coverage | JaCoCo | 0.8.12 | Code coverage |
| Logging | Logstash Logback Encoder | 8.0 | Structured JSON logging |

### 3.2 Frontend

| Thanh phan | Cong nghe | Phien ban | Muc dich |
|------------|-----------|-----------|----------|
| Runtime | React | 19.2.4 | UI library |
| Framework | Next.js | 16.2.6 | App Router, SSR, routing |
| Ngon ngu | TypeScript | 5 | Type safety |
| Styling | Tailwind CSS | 4 | Utility-first CSS |
| UI primitives | Base UI | 1.4.0 | Accessible headless components |
| Icons | Lucide React | 1.8.0 | Icon set |
| Class helpers | class-variance-authority + clsx + tailwind-merge | -- | Class composition |
| Lint | ESLint 9 + eslint-config-next | -- | Code quality |
| Unit test | Vitest 4.1 + @testing-library/react 16 | -- | Component tests |
| E2E test | Playwright | 1.59 | Browser-level tests |
| A11y audit | axe-core Playwright | 4.11 | Accessibility checks |

### 3.3 DevOps & Infrastructure

| Thanh phan | Cong cu | Muc dich |
|------------|---------|----------|
| Container runtime | Docker + Docker Compose | Local dev va deploy |
| Container registry | GitHub Container Registry (GHCR) | Image storage |
| CI | GitHub Actions | Build, test, scan, push |
| CD | GitHub Actions (workflow_run trigger) | Auto-deploy staging, manual promotion |
| Security scan | CodeQL + Trivy + TruffleHog + OWASP Dependency Check | Vulnerability detection |
| DB image | pgvector/pgvector:pg15 | Vector extension compatibility |

### 3.4 Observability (optional overlay)

| Thanh phan | Image | Cong |
|------------|-------|------|
| Metrics | prom/prometheus | :9090 |
| Visualisation | grafana/grafana | :3001 |
| Log aggregation | grafana/loki + promtail | :3100 |
| Distributed tracing | grafana/tempo | :3200 |
| OpenTelemetry | otel/opentelemetry-collector-contrib | :4317 (gRPC), :4318 (HTTP) |

Kich hoat bang lenh: `docker compose -f docker-compose.yml -f docker-compose.observability.yml up -d`

## 4. Kien truc he thong (System Architecture)

### 4.1 DDD Modular Monolith

Backend duoc to chuc theo mo hinh Domain-Driven Design voi 5 module Maven, dependency chi theo mot chieu:

```
domain  ←  infrastructure  ←  application  ←  controller  ←  start
```

| Module | Nhiem vu | Phu thuoc vao |
|--------|----------|---------------|
| `domain` | JPA entities, enums, DTOs, domain exceptions | Khong co |
| `infrastructure` | Spring Data repositories, external adapters | `domain` |
| `application` | Use-case services, auth, orchestration, seed data | `domain`, `infrastructure` |
| `controller` | REST controllers, API envelope, security filters | `application`, `domain` |
| `start` | Entry point, config, Flyway migrations, integration tests | Tat ca cac module |

### 4.2 Bounded Contexts

He thong duoc chia thanh cac bounded contexts sau, phan anh trong cau truc package `com.hospital.core.*` va `com.hospital.api.*`:

| Bounded Context | Core Entities | Controller chinh | Mieu ta |
|-----------------|---------------|------------------|---------|
| **Appointment** | AppointmentEntity, AppointmentVitalSignsEntity, FollowUpEntity | AppointmentController | Dat lich, kham benh, theo doi |
| **Queue** | (su dung AppointmentEntity) | QueueController | Xep hang, check-in, phan phong |
| **MedicalRecord** | MedicalRecordEntity, PrescriptionItemEntity | MedicalRecordController | Ho so benh an, don thuoc |
| **LabResult** | LabResultEntity (domain + portal) | LabResultController | Ket qua xet nghiem |
| **Inventory** | InventoryItemEntity, InventoryLotEntity, InventoryMovementEntity | InventoryController | Quan ly kho, ton kho, xuat nhap |
| **Invoice** | InvoiceEntity, ServicePricingEntity | InvoiceController, PricingController | Hoa don, thanh toan, dinh gia |
| **PatientPortal** | PatientAccountEntity, PatientMessageEntity, PatientMessageThreadEntity | PatientPortalController | Cong thong tin benh nhan |
| **Admin** | RoomEntity, DoctorScheduleTemplateEntity, SpecialClosureEntity, UserEntity | 12 Admin*Controller + AdminAuditLog | Quan tri he thong |
| **Department** | DepartmentEntity | DepartmentController (public) + AdminDepartmentController | Khoa/phong |
| **Content** | HospitalContentSectionEntity, NewsArticleEntity | ContentController + AdminContentController | Noi dung cong khai |
| **User/Auth** | UserEntity | AuthController | Xac thuc, phan quyen |
| **Patient** | PatientEntity, PatientAccountEntity | PatientController (staff) | Thong tin benh nhan |
| **TimeSlot** | TimeSlotEntity | (qua Appointment/Admin) | Khung gio kham |
| **Email** | EmailDeliveryAttemptEntity | (internal) | Gui email giao dich |

### 4.3 Luong du lieu chinh

```text
Nguoi dung (Browser)  →  Next.js (SSR/CSR)  →  REST API (JSON)
                                                ↓
                          controller/  →  application/  →  infrastructure/  →  PostgreSQL
                              |                |                  |
                          Security         Use-case           Spring Data
                          Filters          Services           JPA/Hibernate
                          (JWT, RBAC,      (orchestration,    (repositories)
                           RateLimit,       domain logic)
                           Audit)
```

## 5. Co so du lieu (Database)

| Chi so | Gia tri |
|--------|---------|
| He quan tri | PostgreSQL 15 |
| DB image | pgvector/pgvector:pg15 |
| So bang | 35 |
| So migration | 20 (V1__Create_initial_schema.sql -- V20__Add_email_delivery_attempts.sql) |
| ORM | Spring Data JPA / Hibernate |
| Migration tool | Flyway |

Cac bang chinh theo bounded context:
- **Appointment**: `appointments`, `appointment_vital_signs`, `appointment_follow_ups`, `time_slots`
- **Medical**: `medical_records`, `prescription_items`, `lab_results`
- **Inventory**: `inventory_items`, `inventory_lots`, `inventory_movements`
- **Finance**: `invoices`, `service_pricing`
- **Patient**: `patients`, `patient_accounts`, `patient_messages`, `patient_message_threads`
- **Admin**: `users`, `departments`, `rooms`, `doctor_schedule_templates`, `special_closures`, `audit_logs`
- **Content**: `hospital_content_sections`, `news_articles`
- **Email**: `email_delivery_attempts`
- **Seed/Support**: `schema_version` (Flyway)

## 6. Bao mat (Security)

### 6.1 Xac thuc (Authentication)

- **Staff**: JWT access token (ngan han) + refresh cookie (dai han) qua `/api/v1/auth/**`
- **Patient**: JWT token rieng qua `/api/v1/patient-auth/**`
- **Public**: Khong can xac thuc cho `/api/v1/departments`, `/api/v1/doctors`, `/api/v1/content`, `/api/v1/news`, `POST /api/v1/appointments`

### 6.2 Phan quyen (Authorization)

He thong RBAC co 7 vai tro va 34 quyen (permissions) duoc dinh nghia trong `RbacAuthorizationService`:

**Nhom Admin (ADMIN):**
1. `ADMIN_USERS_MANAGE` -- Quan ly nguoi dung
2. `ADMIN_DEPARTMENTS_MANAGE` -- Quan ly khoa/phong
3. `ADMIN_ROOMS_MANAGE` -- Quan ly phong
4. `ADMIN_SCHEDULE_MANAGE` -- Quan ly lich
5. `ADMIN_CONTENT_MANAGE` -- Quan ly noi dung
6. `ADMIN_MONITORING_READ` -- Xem giam sat
7. `ADMIN_STATS_READ` -- Xem thong ke
8. `AUDIT_LOG_READ` -- Xem nhat ky (ADMIN + ACCOUNTANT)

**Nhom Tac nghiep (Queue & Appointment):**
9. `QUEUE_READ` -- Xem hang doi (ADMIN, NURSE, RECEPTIONIST)
10. `QUEUE_CHECK_IN` -- Check-in benh nhan (ADMIN, NURSE, RECEPTIONIST)
11. `QUEUE_MANAGE` -- Dieu khien hang doi (ADMIN, NURSE, RECEPTIONIST)
12. `APPOINTMENT_READ` -- Xem lich hen (ADMIN, DOCTOR, NURSE, RECEPTIONIST)
13. `APPOINTMENT_WRITE` -- Tao/sua lich hen (ADMIN, DOCTOR, NURSE, RECEPTIONIST)
14. `APPOINTMENT_CANCEL` -- Huy lich hen (ADMIN, NURSE, RECEPTIONIST)
15. `APPOINTMENT_STATUS_WRITE` -- Cap nhat trang thai (DOCTOR)
16. `FOLLOW_UP_READ` -- Xem tai kham (ADMIN, DOCTOR, NURSE)
17. `FOLLOW_UP_WRITE` -- Tao tai kham (DOCTOR)
18. `SCHEDULE_READ` -- Xem lich (DOCTOR)

**Nhom Lam sang (Clinical):**
19. `PATIENT_RECORD_READ` -- Xem ho so benh nhan (ADMIN, DOCTOR)
20. `PATIENT_HISTORY_READ` -- Xem tien su (DOCTOR)
21. `MEDICAL_RECORD_WRITE` -- Ghi benh an (ADMIN, DOCTOR)
22. `PRESCRIPTION_READ` -- Xem don thuoc (ADMIN, DOCTOR, PHARMACIST)
23. `LAB_RESULT_READ` -- Xem ket qua xet nghiem (ADMIN, DOCTOR, NURSE)
24. `LAB_RESULT_WRITE` -- Ghi ket qua xet nghiem (ADMIN, DOCTOR)
25. `VITAL_SIGNS_READ` -- Xem dau hieu sinh ton (ADMIN, DOCTOR, NURSE)
26. `VITAL_SIGNS_WRITE` -- Ghi dau hieu sinh ton (ADMIN, DOCTOR, NURSE)

**Nhom Tai chinh & Kho (Finance & Inventory):**
27. `INVOICE_READ` -- Xem hoa don (ADMIN, ACCOUNTANT)
28. `INVOICE_WRITE` -- Tao/sua hoa don (ADMIN, ACCOUNTANT)
29. `PRICING_MANAGE` -- Quan ly bang gia (ADMIN, ACCOUNTANT)
30. `REVENUE_READ` -- Xem bao cao doanh thu (ADMIN, ACCOUNTANT)
31. `INVENTORY_READ` -- Xem ton kho (ADMIN, PHARMACIST)
32. `INVENTORY_MANAGE` -- Quan ly kho (ADMIN, PHARMACIST)

**Nhom Cong thong tin (Patient Portal):**
33. `PATIENT_PORTAL_READ` -- Xem cong thong tin (PATIENT)
34. `PATIENT_PORTAL_WRITE` -- Cap nhat cong thong tin (PATIENT)

### 6.3 Bao mat du lieu (Data Protection)

- **PHI Encryption**: Thong tin benh nhan duoc ma hoa bang **AES-256-GCM** (PatientIdentifierProtector) voi key dan xuat tu SHA-256 cua secret cau hinh va IV 12-byte ngau nhien
- **Patient Identifier Hashing**: Dinh danh benh nhan duoc bam bang **SHA-256** hex de tra cuu an toan
- **Xac thuc**: `BCryptPasswordEncoder` cho staff password; JWT ky bang `HMAC-SHA` (JJWT)
- **TLS**: Tat ca API endpoint chi chap nhan HTTPS (config o tang proxy/reverse proxy)
- **CORS**: Gioi han origin (primary + secondary, cau hinh duoc)
- **CSP**: Content-Security-Policy han che script, style, frame-ancestors
- **Rate Limiting**: Gioi han request cong khai (30/phut mac dinh)
- **Stateless**: `SessionCreationPolicy.STATELESS` -- khong co server-side session

## 7. API

- **Kieu**: REST/JSON
- **Envelope**: ApiResponse<T> thong nhat (success indicator, data payload, error message, metadata cho pagination)
- **API Base Path**: `/api/v1`
- **API Docs (OpenAPI)**: `/swagger-ui/` va `/v3/api-docs/`
- **Endpoints cong khai**: `/api/v1/auth/**`, `/api/v1/patient-auth/**`, `GET /api/v1/departments/**`, `GET /api/v1/doctors/**`, `GET /api/v1/content/**`, `GET /api/v1/news`, `POST /api/v1/appointments`, `POST /api/v1/chatbot/messages`
- **Actuator endpoints**: `/actuator/health`, `/actuator/prometheus` (cong khai)
- **Staff endpoints**: `/api/v1/appointments`, `/api/v1/queue`, `/api/v1/medical-records`, `/api/v1/lab-results`, `/api/v1/vital-signs`, `/api/v1/inventory`, `/api/v1/invoices`, `/api/v1/pricing`, `/api/v1/revenue`, `/api/v1/schedule`, `/api/v1/patient-records`, `/api/v1/admin/**`
- **Patient portal endpoints**: `/api/v1/patient-portal/**` (overview, appointments, lab-results, messages, profile)

## 8. Kiem thu (Testing)

### 8.1 Backend

| Loai | Cong cu | So luong |
|------|---------|----------|
| Unit test | JUnit 5 + Mockito | 34 test classes |
| Integration test | Spring Boot Test + Testcontainers (PostgreSQL) | (trong `start/src/test`) |
| Coverage | JaCoCo (Maven verify) | @PreAuthorize, service logic |

Chay: `cd backend && mvn verify -Dspring.datasource.url=jdbc:postgresql://localhost:5432/hospital_db -Dspring.datasource.username=hospital_user -Dspring.datasource.password=yourpass`

### 8.2 Frontend

| Loai | Cong cu | So luong / Ty le |
|------|---------|------------------|
| Unit/component test | Vitest + @testing-library/react | 80.48% branch coverage |
| E2E test | Playwright (Chromium) | 25 spec files (183+ tests: API client, RBAC, operations, queue, admin, portal, booking, security, SEO, UI audit, visual) |
| A11y | axe-core/Playwright | Tich hop trong E2E |
| Lint | ESLint 9 | Check style |

Chay:
- Unit: `cd web && npm run test:unit:coverage`
- E2E: `cd web && npm run test:e2e:ci`

### 8.3 CI Pipeline (GitHub Actions)

`.github/workflows/ci.yml` -- 6 jobs:

1. **changes** -- phat hien path da thay doi (backend, frontend, infra)
2. **codeql** -- CodeQL security scan (Java + JS/TS)
3. **backend-test** -- Maven verify (unit + integration + JaCoCo) voi PostgreSQL service container
4. **frontend-test** -- Lint + Vitest coverage + Next.js build + Playwright E2E (Chromium)
5. **validate-observability** -- Kiem tra docker-compose config
6. **docker-push** -- Build, scan (Trivy), push backend & frontend images len GHCR (non-PR)
7. **ci-summary** -- Tong hop ket qua

### 8.4 CD Pipeline

`.github/workflows/cd.yml` -- 3 stages:

1. **deploy-staging** -- Tu dong khi CI thanh cong (master/main), SSH deploy + migration + smoke check
2. **deploy-production** -- Thu cong (workflow_dispatch) hoac tu dong sau staging, SSH deploy + migration + smoke check
3. **notify** -- Slack webhook (neu cau hinh)

### 8.5 Security Scan (Weekly)

`.github/workflows/security-scan.yml` -- 4 jobs:
1. **dependency-review** -- npm audit + OWASP Dependency Check
2. **secret-scan** -- TruffleHog
3. **container-scan** -- Trivy scan GHCR images
4. **scan-summary** -- Tong hop

## 9. Van hanh (Operations)

### 9.1 Moi truong

| Moi truong | URL mac dinh | Ghi chu |
|-------------|--------------|---------|
| Local backend | http://localhost:8081 | Spring Boot |
| Local frontend | http://localhost:3000 | Next.js dev server |
| Local DB | localhost:5432 (hospital_db) | Docker PostgreSQL |
| Staging | https://staging.hms.local (example) | SSH deploy, GHCR images |
| Production | https://hms.local (example) | SSH deploy, GHCR images |

### 9.2 Local dev

Yeu cau: Docker Desktop, Java 17+ (Temurin), Node.js 22

```bash
# 1. Khoi dong PostgreSQL
docker compose up -d postgres

# 2. Chay backend (PowerShell)
cd backend
./run.ps1

# 3. Chay frontend
cd web
npm install
npm run dev
```

### 9.3 Docker Compose services

| Service | Image | Port | Ghi chu |
|---------|-------|------|---------|
| postgres | pgvector/pgvector:pg15 | 5432 | Volume: postgres-data |
| backend | ghcr.io/.../backend:latest | 8081 | Build tu backend/Dockerfile |
| frontend | ghcr.io/.../frontend:latest | 3000 | Build tu web/Dockerfile |

Bien moi truong bat buoc: `POSTGRES_PASSWORD`, `JWT_SECRET`, `PATIENT_IDENTIFIER_SECRET`

## 10. Luong nguoi dung chinh (Key User Flows)

| Flow | Nguoi dung | API Endpoints | Trang thai |
|------|------------|---------------|------------|
| Xem noi dung cong khai | Guest | `GET /api/v1/content/home`, department, doctor, news | Implemented |
| Dat lich hen | Guest | `POST /api/v1/appointments`, `GET /api/v1/doctors/{id}/slots` | Implemented |
| Chatbot cong khai | Guest | `POST /api/v1/chatbot/messages` | Implemented |
| Xac thuc nhan vien | Staff | `POST /api/v1/auth/login`, `/refresh` | Implemented |
| Quan ly lich hen | Doctor/Nurse | `GET/PUT /api/v1/appointments/**` | Implemented |
| Xep hang, check-in | Nurse/Receptionist | `GET/PUT /api/v1/queue/**` | Implemented |
| Benh an dien tu | Doctor | `GET/POST /api/v1/medical-records/**` | Implemented |
| Dau hieu sinh ton | Doctor/Nurse | `GET/POST /api/v1/vital-signs/**` | Implemented |
| Ket qua xet nghiem | Doctor/Nurse | `GET/POST /api/v1/lab-results/**` | Implemented |
| Hoa don, thanh toan | Accountant | `GET/POST /api/v1/invoices/**` | Implemented |
| Quan ly kho | Pharmacist/Admin | `GET/POST /api/v1/inventory/**` | Implemented |
| Cong thong tin benh nhan | Patient | `GET/PUT /api/v1/patient-portal/**` | Partially implemented |
| Quan tri he thong | Admin | `/api/v1/admin/**` (12 controllers) | Implemented |
| Nhat ky kiem toan | Admin/Accountant | `GET /api/v1/admin/audit-logs` | Implemented |

## 11. NFR Targets (Non-Functional Requirements)

| Chi so | Target | Co che dam bao |
|--------|--------|----------------|
| Thoi gian phan hoi API | < 500ms (p95) | Health check, Prometheus metrics |
| Thoi gian chay CI | < 20 phut | Path filter, cache (Maven, Next.js, Playwright) |
| Backup CSDL | Hang ngay | docker volume + external backup script |
| Thoi gian recovery | < 30 phut | docker compose up -d, migration auto |
| Code coverage | >= 80% | JaCoCo (backend), Vitest (frontend) |
| Tinh san sang | High | Health check, multi-environment deploy |
| Security scanning | Hang tuan (automated) | CodeQL, Trivy, TruffleHog, OWASP DC |
| PHI encryption | AES-256-GCM | PatientIdentifierProtector |
| Container image scan | Moi lan build | Trivy (CRITICAL, HIGH) |
| Loi phan quyen | Forbidden (403) | RBAC @PreAuthorize + Audit filter |

## 12. Cac van de mo (Open Issues)

Cac van de chua duoc giai quyet hoac dang trong ke hoach phat trien:

1. **Patient self-service scope** (cancel/reschedule): API cancel da co (`APPOINTMENT_CANCEL`), nhung chua tich hop vao patient portal gui cho benh nhan tu xu ly.
2. **Clinical record locking**: Khong co co che locking / optimistic concurrency cho medical records khi nhieu bac sy cung cap nhat.
3. **Drug/allergy interaction**: Khong co module kiem tra tuong tac thuoc -- di ung khi ke don.
4. **External payment gateway**: Tich hop cong thanh toan (Visa, Momo, v.v.) chua duoc trien khai. Hoa don chi o trang thai noi bo.
5. **Full pharmacy workflows**: Vai tro PHARMACIST va RECEPTIONIST ton tai trong RBAC nhung chua co tai khoan seed hoac UI day du.
6. **Patient self-registration**: Benh nhan khong the tu dang ky tai khoan; can admin hoac nhan vien tao PatientAccount.

## 13. Lich su thay doi (Change History)

| Ngay | Phien ban | Nguoi thay doi | Mo ta |
|------|-----------|----------------|-------|
| 2026-06-14 | 1.0 | Claude (Code) | Tao tai lieu tu codebase hien tai. |
