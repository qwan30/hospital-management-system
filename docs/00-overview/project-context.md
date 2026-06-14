# Project Context: Hospital Management System (HMS)

> **Release status**: Release Candidate / Ship with fixes (2026-06-14)
> **Documentation conventions**: Vietnamese for business/product documentation, English for technical documentation

---

## 1. What This System Is

The Hospital Management System (HMS) is an enterprise healthcare ERP covering the full clinical and administrative lifecycle of a Vietnamese hospital. It is backend-first, DDD-oriented, and deployed as a modular monolith.

From public appointment booking through clinical queue/intake, EHR documentation, pharmacy dispensing, billing and revenue reporting, to the patient self-service portal, every major hospital workflow is represented.

### 1.1 Core Business Flows (Khepin)

The following end-to-end flow represents the canonical patient journey through the system:

```
Patient: books appointment online --> Receptionist: check-in and queue registration
  --> Nurse: vital signs and room assignment --> Doctor: clinical exam and prescription
  --> Pharmacist: dispense medication --> Accountant: settle invoice
```

### 1.2 Key Product Capabilities

| Capability | Technical approach | Real-world significance |
|---|---|---|
| **Appointment booking** | Transactional slot-lock prevents double-booking; patient identifiers encrypted with AES-GCM and indexed via SHA-256 hash | Guarantees scheduler consistency; protects PHI (CCCD/ID card numbers) |
| **Clinical queue/intake** | State-machine queue lifecycle: Check-in -> Room Assignment -> Consultation -> Complete | Enables nurse and doctor handoff, reduces patient wait time |
| **EHR and prescriptions** | Digital medical records, digital prescriptions, auto-generated prescription PDF, Gmail API delivery | Eliminates paper records |
| **Pharmacy dispensing** | Lot/movement inventory tracking; dispensing links directly to prescription ID and medical record | Prevents inventory shrinkage, provides full traceability |
| **Billing and revenue** | Auto-calculated invoices from service pricing table; daily/monthly revenue reports | Automates hospital cash-flow accounting |
| **RBAC security** | Spring Security + JWT with 36 granular permissions enforced via `@PreAuthorize` annotations | Six roles with distinct data access: Doctor, Nurse, Pharmacist, Accountant, Admin, Patient |

---

## 2. Technical Stack

### 2.1 Backend

| Component | Technology |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot 3.3.5 |
| Build | Maven (multi-module reactor) |
| Database | PostgreSQL 15 with pgvector extension |
| ORM | Hibernate (JPA) with `ddl-auto: validate` and Flyway migrations |
| Security | Spring Security, JWT (jjwt 0.12.6), BCrypt, CSP/CORS headers |
| API docs | Springdoc OpenAPI 2.6.0 (Swagger UI at `/swagger-ui`) |
| Testing | JUnit 5, Testcontainers 1.20.4, JaCoCo coverage |
| Observability | Micrometer, Prometheus, OpenTelemetry, structured logging (logstash-logback-encoder 8.0) |

### 2.2 Frontend

| Component | Technology |
|---|---|
| Framework | Next.js 16.2.6 (App Router) |
| UI library | React 19.2.4 |
| Styling | Tailwind CSS 4, Base UI React 1.4.0 |
| Icons | Lucide React 1.8.0 |
| Testing | Vitest 4.1.5 (unit), Playwright 1.59.1 (E2E) |
| Components | shadcn-style primitives (class-variance-authority, tailwind-merge) |

### 2.3 Infrastructure

| Component | Technology |
|---|---|
| Container runtime | Docker Compose (production + observability overlay) |
| Container registry | GitHub Container Registry (GHCR) |
| CI | GitHub Actions (build, test, CodeQL, image push) |
| CD | GitHub Actions (VPS deploy via Docker Compose) |
| Observability stack | Prometheus + Grafana + Loki + Tempo + OpenTelemetry Collector |
| Reverse proxy | Nginx (optional, for production deployment) |

---

## 3. Repository Layout

```
hospital-management-system/
├── backend/               # Java/Spring Boot - DDD modular monolith
│   ├── domain/            # JPA entities, enums, shared DTOs, domain exceptions
│   ├── infrastructure/    # Spring Data repositories, PostgreSQL adapters, Gmail client
│   ├── application/       # Use-case services, auth service, schedulers, seed data
│   ├── controller/        # REST controllers, security filters, API envelope, error handling
│   └── start/             # Composition root, application config, Flyway migrations, entry point
├── web/                   # Next.js App Router - canonical frontend (the only active frontend)
├── docs/                  # Product and technical documentation
├── infra/                 # Nginx config, observability configs (Grafana dashboards, Prometheus,
│                          #   Loki, Tempo, OpenTelemetry collector)
├── scripts/               # Utility scripts (release smoke test, etc.)
├── docker-compose.yml     # Production Compose (PostgreSQL + backend + frontend)
├── docker-compose.observability.yml  # Observability overlay (Prometheus, Grafana, Loki, Tempo, OTel)
└── .github/workflows/     # CI and CD pipeline definitions
```

### 3.1 Backend Module Dependency Flow

```
domain  <--  infrastructure  <--  application  <--  controller  <--  start
```

Dependencies flow inward. The `domain` module has zero knowledge of infrastructure, application, or controllers. Module boundaries are enforced at build time via `maven-enforcer-plugin`.

### 3.2 Frontend Route Groups

The `web/` frontend organizes its 70+ pages into four route groups:

| Route group | Entry point | Purpose |
|---|---|---|
| `(public)` | `/` | Home, departments, doctors, booking wizard, news, privacy, terms |
| `staff` | `/staff/login` | Doctor/nurse/receptionist/accountant workspaces |
| `admin` | `/admin/login` | Admin console: users, departments, rooms, schedule, content, monitoring |
| `portal` | `/portal/login` | Patient self-service: appointments, lab results, messages, profile |

The `frontend/` directory at the project root is **not canonical**. It contains archived design prototypes (HTML/PNG). All active development is in `web/`.

---

## 4. Domain Architecture

### 4.1 Bounded Contexts (Core Domain)

The domain layer is organized into bounded contexts under `com.hospital.core.*`:

| Context | Key entities | Purpose |
|---|---|---|
| `patient` | `PatientEntity` | Patient master data with encrypted identifiers |
| `user` | `UserEntity` | Staff accounts, roles, authentication |
| `department` | `DepartmentEntity` | Hospital departments and specializations |
| `appointment` | `AppointmentEntity`, `AppointmentVitalSignsEntity`, `FollowUpEntity` | Booking, check-in, queue lifecycle, vital signs, follow-ups |
| `timeslot` | `TimeSlotEntity` | Doctor availability slots with booking guard |
| `medicalrecord` | `MedicalRecordEntity` | Clinical documentation, diagnosis, prescriptions |
| `prescription` | `PrescriptionItemEntity` | Individual prescription line items |
| `inventory` | `InventoryItemEntity`, `InventoryLotEntity`, `InventoryMovementEntity` | Pharmacy stock, lot tracking, movement audit |
| `invoice` | `InvoiceEntity`, `ServicePricingEntity` | Patient billing, pricing catalog |
| `lab` | `LabResultEntity` | Lab test results |
| `content` | `HospitalContentSectionEntity`, `NewsArticleEntity` | Public-facing hospital info and announcements |
| `admin` | `RoomEntity`, `DoctorScheduleTemplateEntity`, `SpecialClosureEntity` | Operational data setup |
| `audit` | `AuditLogEntity` | Immutable audit trail for security events |
| `patientauth` | `PatientAccountEntity` | Patient portal accounts (claimed from appointments) |
| `patientportal` | `PatientMessageEntity`, `PatientMessageThreadEntity`, `LabResultEntity` | Portal-specific read models |
| `email` | `EmailDeliveryAttemptEntity` | Transactional email delivery tracking |

### 4.2 Enumerations (shared across modules)

- `AppointmentStatus` -- lifecycle states for appointments
- `Gender` -- patient gender
- `InvoiceStatus` -- billing lifecycle
- `RoomStatus` -- operational room state
- `SlotStatus` -- time slot availability
- `UserRole` -- DOCTOR, NURSE, RECEPTIONIST, PHARMACIST, ACCOUNTANT, ADMIN, PATIENT

### 4.3 Database

20 Flyway migrations (V1 through V20) define approximately 35 tables with 26 indexes. The schema is validated at startup (`ddl-auto: validate`). Key migrations:

- **V1**: Initial schema (users, patients, departments, time slots, appointments, invoices, audit logs, medical records, prescriptions, rooms, inventory, pricing)
- **V2-V4**: Clinical workflow expansion (follow-ups, patient email, identifier encryption)
- **V5-V6**: SRS booking / schedule templates / special closures / operational flags
- **V7**: Inventory management (lots, movements)
- **V8**: Patient portal tables
- **V9-V10**: Internal assistant (historical -- removed in V11)
- **V11**: Removes AI assistant features
- **V12-V15**: Clinical expansions (follow-ups, vital signs, metadata, lab results)
- **V16-V18**: RBAC constraints, domain constraints
- **V19**: Pharmacy dispense traceability
- **V20**: Email delivery attempts

### 4.4 Shared DTOs (in `com.hospital.shared.*`)

All API request/response DTOs live in the domain module under `shared/`, organized by consumer context: `auth`, `booking`, `appointment`, `department`, `doctor`, `finance`, `inventory`, `lab`, `medicalrecord`, `patientportal`, `queue`, `vitalsigns`, `publicsite`.

---

## 5. API Surface

**Base URL**: `/api/v1`

**118 REST API mappings** organized into endpoint families:

| Domain | Key endpoints |
|---|---|
| Staff auth | `/auth/login`, `/auth/refresh`, `/auth/logout` |
| Patient auth | `/patient-auth/claim`, `/patient-auth/login`, `/patient-auth/refresh`, `/patient-auth/logout` |
| Public content | `/content/home`, `/news`, `/departments`, `/doctors` |
| Booking | `/appointments` (POST), `/chatbot/messages` |
| Clinical | `/appointments`, `/queue`, `/medical-records`, `/patient-records`, `/patients`, `/vital-signs`, `/lab-results`, `/me/schedule` |
| Finance | `/invoices`, `/pricing`, `/reports/revenue/daily`, `/reports/revenue/monthly` |
| Inventory | `/inventory/items`, `/inventory/lots`, `/inventory/movements` |
| Patient portal | `/patient-portal/overview`, `/patient-portal/appointments`, `/patient-portal/lab-results`, `/patient-portal/messages`, `/patient-portal/profile` |
| Admin | `/admin/users`, `/admin/departments`, `/admin/rooms`, `/admin/schedule-templates`, `/admin/special-closures`, `/admin/slots`, `/admin/stats`, `/admin/monitoring`, `/admin/audit-logs`, `/admin/content/sections`, `/admin/public-content`, `/admin/news` |

### 5.1 Response Envelope

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

Errors return `success: false` with an `error` object containing `code`, `message`, and `timestamp`.

### 5.2 What Was Removed

AI-powered features have been stripped from the product:

| Removed feature | Reason |
|---|---|
| `/api/v1/ai/analyze-symptoms` | AI symptom analyzer removed |
| `/api/v1/internal-assistant/**` | Internal assistant API removed |
| `/api/v1/admin/knowledge-documents/**` | Knowledge document management removed |
| `/api/v1/admin/monitoring/internal-assistant` | Assistant monitoring removed |
| AI assistant database tables | Dropped in Flyway V11 migration |

A read-only `/api/v1/ai/**` integration layer (patient snapshots, timelines, change tracking) remains for external AI/ML integrations; it is not an internal AI feature.

The public chatbot at `/api/v1/chatbot/messages` is a deterministic, DB-backed information bot -- not an AI-powered assistant.

---

## 6. Security and Compliance

### 6.1 PHI (Protected Health Information) Protection

Designed for HIPAA-like security posture adapted to Vietnamese healthcare regulations:

- **Patient identifiers** (CCCD/CMND -- Vietnamese national ID cards) are encrypted at rest using **AES-GCM** with a 32-byte secret key configured via `PATIENT_IDENTIFIER_SECRET`
- **Unique lookup index** uses **SHA-256 hashing** of the identifier (`cccdHash` column), enabling efficient uniqueness checks without exposing the plaintext
- The `cccd` column uses `columnDefinition = "text"` to support encrypted output exceeding standard column length

### 6.2 Authentication and Authorization

| Layer | Mechanism |
|---|---|
| Password storage | BCrypt (Spring Security with configurable strength via default `PasswordEncoder` bean) |
| Session | Stateless JWT (access token in response body, refresh token in HTTP-only cookie) |
| Access token TTL | 15 minutes (`security.jwt.access-token-expiration-seconds: 900`) |
| Refresh token TTL | 7 days (`security.jwt.refresh-token-expiration-seconds: 604800`) |
| Authorization | `@PreAuthorize` annotations with 36 granular permissions |
| CORS | Whitelist-origin configuration (`allowed-origins`), credential support |
| Rate limiting | Configurable per-minute limit on public endpoints (default 30) |
| CSP | Content-Security-Policy header, `sameOrigin` frame options, `no-referrer` referrer policy |

### 6.3 Audit Trail

Every authorization denial is logged through `AuthorizationDenialAuditFilter`. The `AuditLogEntity` provides an immutable record of security-relevant events.

---

## 7. Observability

### 7.1 Production Monitoring Stack

An optional Docker Compose overlay (`docker-compose.observability.yml`) activates the full observability pipeline:

```
backend (Micrometer) --> OpenTelemetry Collector --> Prometheus (metrics)
                                                  --> Tempo (traces)
                                                  --> Loki + Promtail (logs)
                                                         |
                                                    Grafana (dashboards)
```

### 7.2 Grafana Dashboards

Seven pre-provisioned dashboards cover:

- **Release overview** -- deployment health at a glance
- **Backend API** -- endpoint latencies, error rates, throughput
- **Queue/clinical ops** -- appointment and queue metrics
- **Inventory/pharmacy** -- stock levels, movement rates
- **Frontend UX** -- client-side performance (via Playwright tracing)
- **Audit/security** -- auth denials, rate limit hits
- **Notifications** -- email delivery success/failure

### 7.3 Structured Logging

Logback configuration (logstash-logback-encoder) emits JSON-structured logs with a configurable `application` tag. Log levels are set to DEBUG for `com.hospital` and `org.springframework.security` in dev profile.

### 7.4 Metrics

Micrometer exposes: health probes (liveness/readiness), Prometheus-scrapable metrics, distributed tracing via OpenTelemetry, and percentile histograms for HTTP request latencies (p50, p95, p99).

---

## 8. Testing and Quality Gates

| Test type | Tool | Scope | Count |
|---|---|---|---|
| Backend integration | JUnit 5 + Testcontainers | API endpoints, DB operations, security configuration | ~148 tests |
| Frontend unit | Vitest | Components, utilities, hooks | 80.48% branch coverage |
| E2E | Playwright | RBAC, clinical flows, click-path, visual, SEO, security | ~183 scenarios |

All backends tests run against a real PostgreSQL container via Testcontainers. CI fails if integration tests or E2E suites do not pass.

---

## 9. CI/CD Pipeline

### 9.1 CI (GitHub Actions)

Path-based change detection gates builds:
- **Backend changes**: Maven `mvn verify` (unit + integration tests, JaCoCo coverage), Docker image build and push to GHCR
- **Frontend changes**: npm `npm run build`, Vitest unit tests, Playwright E2E tests, linting, Docker image build and push to GHCR
- **Infrastructure changes**: Docker Compose validation only
- **CodeQL**: Security analysis on every push

### 9.2 CD (GitHub Actions)

Deploys to VPS using Docker Compose:
- Pulls latest images from GHCR
- Runs `docker compose up -d` with the production Compose file
- Optional observability overlay

---

## 10. Design Decisions

### 10.1 Modular Monolith (Not Microservices)

**Choice**: DDD-aligned modular monolith with strict Maven module boundaries (banned dependencies enforced at build time).

**Rationale**: Team size is small (single-digit developers). A single deployment unit is sufficient. The DDD module boundary discipline preserves the option to extract services later if needed, without the operational overhead of distributed systems today.

### 10.2 Frontend Strategy

**Choice**: Next.js App Router as the sole canonical frontend; the `frontend/` directory holds only archived design prototypes.

**Rationale**: A single framework reduces context switching. The App Router provides both public SSR pages and authenticated client-side portals within a unified routing model.

### 10.3 Vietnamese Market Adaptation

**Choice**: Vietnamese for all business-facing documentation; English for technical documentation.

**Rationale**: The target users (hospital administrators, clinical staff, government auditors) work in Vietnamese. The development team operates bilingually. Code, API docs, and architecture records remain in English for global maintainability.

### 10.4 AI Feature Removal

**Choice**: Internal assistant (knowledge management, symptom analysis) removed from product scope; deterministic chatbot retained.

**Rationale**: The AI assistant introduced operational complexity (embedded model integration, knowledge sync, hallucination risk management) that outpaced the infrastructure available. The DB-backed chatbot continues to serve patient FAQ needs without external model dependencies.

---

## 11. Current Status and Roadmap

### 11.1 What Is Implemented

- All backend modules (domain, infrastructure, application, controller, start)
- All REST API endpoints across public, clinical, finance, inventory, admin, and portal domains
- Full RBAC with 6 roles and 36+ permissions
- JWT authentication with access/refresh token flow (staff and patient)
- Patient identifier AES-GCM encryption with SHA-256 hash indexing
- Flyway-managed schema (35 tables across 20 migrations)
- Seed data for departments, staff accounts, pricing, slots, inventory, portal demo
- Docker-based deployment (3 containers: PostgreSQL, backend, frontend)
- CI/CD with GitHub Actions (build, test, CodeQL, image push, deploy)
- Observability stack (Prometheus + Grafana + Loki + Tempo + OTel)
- Deterministic public chatbot
- Gmail API integration for transactional email (disabled by default)
- Frontend route tree: 70+ pages across public, staff, admin, and portal sections
- 148 backend integration tests, ~183 Playwright E2E scenarios, 80.48% branch coverage

### 11.2 Known Gaps

- Patient self-service: cancel/reschedule, message compose/reply, password change not implemented
- External payment gateway integration: not present
- Pharmacist and Receptionist seeded demo accounts: not yet persisted (roles exist in RBAC)
- Real-time room-board operations: queue assign-room is audited but not a standalone real-time feature
- Full production readiness for every frontend workflow: some pages lack backend integration

### 11.3 Release Label

**Release Candidate / Ship with fixes** (2026-06-14). The system is functionally complete for a UAT deployment. Known gaps are documented and prioritized for post-release iterations.

---

## 12. Key Files and Paths

| Purpose | Path |
|---|---|
| Backend entry point | `backend/start/src/main/java/com/hospital/api/HmsApiApplication.java` |
| Application configuration | `backend/start/src/main/resources/application.yml` |
| Security configuration | `backend/controller/src/main/java/com/hospital/api/config/SecurityConfig.java` |
| API response envelope | `backend/controller/src/main/java/com/hospital/shared/api/ApiResponse.java` |
| API contract (active endpoints) | `API_CONTRACT.md` |
| Product requirements | `docs/HMS_PRD.md` |
| Software requirements | `docs/HMS_SRS.md` |
| Frontend shared API client library | `web/src/lib/` |
| Frontend UI components | `web/src/components/` |
| Frontend E2E tests | `web/e2e/` |
| Frontend Vitest unit tests | Co-located in `__tests__/` directories alongside pages |
| Flyway migrations | `backend/start/src/main/resources/db/migration/` |
| Docker Compose (production) | `docker-compose.yml` |
| Docker Compose (observability) | `docker-compose.observability.yml` |
| CI pipeline | `.github/workflows/ci.yml` |
| CD pipeline | `.github/workflows/cd.yml` |
| Nginx reverse proxy config | `infra/nginx/default.conf` |
| Grafana dashboard definitions | `infra/observability/grafana/dashboards/` |
| Environment variable template | `.env.example` |

---

## 13. Getting Started (Quick Reference)

```bash
# 1. Start PostgreSQL
docker compose up -d postgres

# 2. Configure .env (from .env.example)
#    Set at minimum: POSTGRES_PASSWORD, JWT_SECRET, PATIENT_IDENTIFIER_SECRET

# 3. Run backend
.\backend\run.ps1
# Or: cd backend && mvn install -DskipTests && mvn spring-boot:run -f start/pom.xml

# 4. Run frontend (separate terminal)
cd web && npm install && npm run dev

# 5. Access
#    Frontend: http://localhost:3000
#    Backend health: http://localhost:8081/actuator/health
#    Swagger UI: http://localhost:8081/swagger-ui

# Demo accounts (seeded)
# Doctor:       doctor1@hospital.vn / Doctor@1234
# Pharmacist:   pharmacist@hospital.vn / Pharma@1234
# Receptionist: receptionist@hospital.vn / Reception@1234
# Admin:        admin@hospital.vn / Admin@1234
```
