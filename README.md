# 🏥 Enterprise Hospital Management System (HMS)

[![Java 17](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot 3.3](https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL 15](https://img.shields.io/badge/PostgreSQL-15-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![CI](https://github.com/qwan30/hospital-management-system/actions/workflows/ci.yml/badge.svg)](https://github.com/qwan30/hospital-management-system/actions/workflows/ci.yml)
[![Release](https://img.shields.io/badge/Release-RC_1.0-0d7c4b?style=for-the-badge)](https://github.com/qwan30/hospital-management-system)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=qwan30_hospital-management-system&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=qwan30_hospital-management-system)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=qwan30_hospital-management-system&metric=coverage)](https://sonarcloud.io/summary/new_code?id=qwan30_hospital-management-system)

**A full-stack healthcare ERP system** supporting end-to-end hospital clinical workflows — from public appointment booking, patient intake & queue triage, electronic health records (EHR), pharmacy dispensing with lot-level traceability, to billing & revenue reporting. Built with **Domain-Driven Design (DDD)** principles and strict **PHI (Protected Health Information)** compliance — AES-GCM encryption, SHA-256 hashed indexing, JWT-based RBAC with 34 granular permissions.

> **🟢 Production Status: Release Candidate 1.0 — June 15, 2026**
> All 7 clinical workflows implemented and verified. ~408 backend tests (service + controller + repository + integration) + 641 frontend unit tests + 2,045 Playwright E2E tests across 31 specs (930 in the CI gate). Coverage thresholds enforced at build time. Comprehensive edge/bad case coverage across all layers.
>
> 📚 **[Interactive Documentation Portal →](docs/HMS_DOCUMENTATION.html)** | 📂 **[Documentation Index →](docs/README.md)** | 📋 **[API Contract →](docs/05-api/api-contract.md)** | 📝 **[Changelog →](CHANGELOG.md)**

---

## Why This Project Exists

Healthcare digitization in emerging markets faces a critical gap: existing ERP systems are either too expensive or lack PHI compliance. This project demonstrates a production-grade hospital ERP built entirely with open-source technology while meeting strict healthcare data protection standards.

## Key Architecture Decisions

| Decision | Rationale | ADR |
|----------|-----------|-----|
| **Modular Monolith** (not microservices) | Healthcare workflows are tightly coupled (booking → queue → EHR → billing). DDD bounded contexts prevent coupling within a single deployable. No distributed transaction overhead. | [ADR-001](docs/04-architecture/adr/ADR-001-modular-monolith.md) |
| **JWT + httpOnly Refresh Cookies** | Stateless auth avoids server-side session storage. httpOnly cookies prevent XSS token theft. 15-min access token TTL limits blast radius. | [ADR-003](docs/04-architecture/adr/ADR-003-jwt-auth.md) |
| **AES-GCM PHI Encryption** | Patient identifiers encrypted at rest, indexed by SHA-256 hash for lookup without decryption. Plaintext never stored. | [ADR-004](docs/04-architecture/adr/ADR-004-phi-encryption.md) |
| **Repositories in Domain Layer** | Domain owns data access contracts — infrastructure implements them. Strict Dependency Inversion prevents infrastructure concerns from leaking into business logic. | [ADR-002](docs/04-architecture/adr/ADR-002-repositories-in-domain.md) |

## Technical Challenges Solved

| Challenge | Solution | Implementation |
|-----------|----------|----------------|
| **Double-booking prevention** | Transactional slot locking with optimistic concurrency control | `AppointmentWriteService` in `appointment` bounded context |
| **PHI compliance** | AES-GCM encrypt at rest + SHA-256 hash for indexing + TLS in transit | `PatientIdentifierProtector` in `patient` bounded context |
| **Fine-grained RBAC** | 34 method-level `@PreAuthorize` permissions across 7 roles | `RbacAuthorizationService` in `security` bounded context |
| **Queue state integrity** | Strict state machine: CHECKED_IN → IN_CONSULTATION → COMPLETED. Invalid transitions rejected at domain level. | `AppointmentWorkflowService` in `appointment` bounded context |

---

## 🎯 System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        A["🏥 Staff Dashboard<br/><i>Doctors, Nurses, Receptionists</i>"]
        B["⚙️ Admin Panel<br/><i>Administrators</i>"]
        C["🏠 Patient Portal<br/><i>Self-service</i>"]
        D["🌐 Public Website<br/><i>Booking & Information</i>"]
    end

    subgraph "Infrastructure"
        N["🔀 Nginx<br/><i>Reverse Proxy</i>"]
        F["⚛️ Next.js 16<br/><i>App Router</i>"]
    end

    subgraph "API Gateway"
        G["🔐 Spring Security + JWT<br/><i>RBAC · Rate Limiting · CORS</i>"]
        H["🔌 REST Controllers<br/><i>118 endpoints · 32 controllers</i>"]
    end

    subgraph "Application Core — DDD Modular Monolith"
        direction TB
        I["📦 Application Services<br/><i>Use Cases · Workflows · Auth</i>"]
        J["🏛️ Domain Model<br/><i>Entities · Value Objects · Aggregates<br/>17 bounded contexts</i>"]
        K["🗄️ Infrastructure<br/><i>Spring Data JPA · Gmail Client<br/>PostgreSQL Adapters</i>"]
    end

    subgraph "Data & Observability"
        L[("🐘 PostgreSQL 15<br/><i>pgvector · 35 tables</i>")]
        M["📊 Prometheus → Grafana<br/><i>Metrics & Dashboards</i>"]
        O["📝 Loki → Tempo<br/><i>Logs & Traces</i>"]
    end

    A --> N
    B --> N
    C --> N
    D --> N
    N --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
    K --> L
    H -.-> M
    H -.-> O

    style A fill:#1e40af,stroke:#3b82f6,color:#fff
    style B fill:#7c3aed,stroke:#a78bfa,color:#fff
    style C fill:#059669,stroke:#34d399,color:#fff
    style D fill:#0891b2,stroke:#22d3ee,color:#fff
    style N fill:#ea580c,stroke:#fb923c,color:#fff
    style F fill:#000,stroke:#666,color:#fff
    style G fill:#dc2626,stroke:#f87171,color:#fff
    style H fill:#b91c1c,stroke:#ef4444,color:#fff
    style I fill:#1d4ed8,stroke:#60a5fa,color:#fff
    style J fill:#1e3a5f,stroke:#3b82f6,color:#fff
    style K fill:#4b5563,stroke:#9ca3af,color:#fff
    style L fill:#1e40af,stroke:#60a5fa,color:#fff
    style M fill:#eab308,stroke:#facc15,color:#000
    style O fill:#eab308,stroke:#facc15,color:#000
```

---

## 🏥 End-to-End Clinical Workflow

```mermaid
graph LR
    subgraph "1️⃣ Booking"
        P["🧑 Patient<br/><i>Books online</i>"]
    end

    subgraph "2️⃣ Intake & Queue"
        R["👩‍💼 Receptionist<br/><i>Check-in · Register Queue</i>"]
        N1["👩‍⚕️ Nurse<br/><i>Vital Signs · Room Assignment</i>"]
    end

    subgraph "3️⃣ Consultation"
        D1["👨‍⚕️ Doctor<br/><i>Examination · Diagnosis<br/>E-Prescription · PDF Export</i>"]
    end

    subgraph "4️⃣ Pharmacy"
        PH["💊 Pharmacist<br/><i>Dispense · Lot Tracking<br/>Inventory Movement</i>"]
    end

    subgraph "5️⃣ Billing"
        AC["💰 Accountant<br/><i>Invoice · Payment<br/>Revenue Report</i>"]
    end

    subgraph "6️⃣ Completion"
        OUT["✅ Patient<br/><i>Receives medication<br/>& invoice</i>"]
    end

    P -->|"1. Book Appointment"| R
    R -->|"2. Check-in"| N1
    N1 -->|"3. Vital Signs Recorded"| D1
    D1 -->|"4. E-Prescription"| PH
    D1 -->|"5. Services Billed"| AC
    PH -->|"6. Medication Dispensed"| OUT
    AC -->|"7. Payment Collected"| OUT

    classDef patient fill:#059669,stroke:#34d399,color:#fff,stroke-width:2px
    classDef staff fill:#1e40af,stroke:#3b82f6,color:#fff,stroke-width:2px
    classDef doctor fill:#7c3aed,stroke:#a78bfa,color:#fff,stroke-width:2px
    classDef pharma fill:#ea580c,stroke:#fb923c,color:#fff,stroke-width:2px
    classDef finance fill:#b91c1c,stroke:#ef4444,color:#fff,stroke-width:2px
    classDef done fill:#22c55e,stroke:#4ade80,color:#fff,stroke-width:2px

    class P,OUT patient
    class R,N1 staff
    class D1 doctor
    class PH pharma
    class AC finance
```

---

## 📸 System Screenshots

<div align="center">

### 🌐 Public Homepage
<img src="docs/screenshots/home-page.png" alt="Public Homepage" width="800">

*Modern patient landing page with department search, doctor list, and appointment booking entrance*

### 🏥 Staff Login Portal
<img src="docs/screenshots/staff-login.png" alt="Staff Login Portal" width="800">

*Secure gateway for clinical and administrative staff*

### 🩺 Nurse & Clinical Workflows
| 📋 Nurse Overview | 📅 Nurse Appointment Booking |
|:-----------------:|:---------------------------:|
| <img src="docs/screenshots/nurse-overview.png" alt="Nurse Overview" width="400"> | <img src="docs/screenshots/nurse-appointment.png" alt="Nurse Appointment" width="400"> |
| *Real-time patient schedule, clinical status & queue triage* | *Vitals check-in, clinical task updates & slots scheduler* |

### 💊 Pharmacy & Inventory
<img src="docs/screenshots/pharmacy-inventory.png" alt="Pharmacy Inventory" width="800">

*Lot-controlled, FIFO-managed drug inventory with low-stock alerts*

### 🧑 Patient Portal
<img src="docs/screenshots/portal-overview.png" alt="Patient Portal" width="800">

*Self-service patient overview showing upcoming appointments, medical records, and care team messages*

### ⚙️ Enterprise Administration
| 📊 Admin Dashboard | 🔄 Queue Triage Panel |
|:-----------------:|:---------------------:|
| <img src="docs/screenshots/10-admin-dashboard.png" alt="Admin Dashboard" width="400"> | <img src="docs/screenshots/admin-queue.png" alt="Admin Queue" width="400"> |
| *Enterprise KPI tracking (revenue, appointments, bed occupancy)* | *Live queue monitoring and wait time analytics* |

</div>

<details>
<summary><b>🔍 View Full Visual Walkthrough Tour</b></summary>

### 🌐 Public-Facing Experience
1. **Homepage**: [home-page.png](docs/screenshots/home-page.png) — Public booking landing page
2. **Patient Portal**: [portal-overview.png](docs/screenshots/portal-overview.png) — Self-service appointments, messages, and lab summaries

### 🏥 Clinical & Triage Workflows
3. **Staff Login**: [staff-login.png](docs/screenshots/staff-login.png) — Secure entrance for clinical and administrative staff
4. **Staff Login Background**: [staff-login-background.png](docs/screenshots/staff-login-background.png) — Background doctor image asset
5. **Nurse Overview**: [nurse-overview.png](docs/screenshots/nurse-overview.png) — Clinical schedule and triage indicators
6. **Nurse Appointment Booking**: [nurse-appointment.png](docs/screenshots/nurse-appointment.png) — Check-in, vitals tracking & slots booking

### 💊 Pharmacy & Inventory
7. **Pharmacy Inventory**: [pharmacy-inventory.png](docs/screenshots/pharmacy-inventory.png) — Expiry-safe, lot-controlled drug stocks

### ⚙️ System Administration
8. **Admin Dashboard**: [10-admin-dashboard.png](docs/screenshots/10-admin-dashboard.png) — Enterprise statistics and operational trends
9. **Admin Queue**: [admin-queue.png](docs/screenshots/admin-queue.png) — Live queue monitoring and wait time analytics

</details>

---

## 🎯 Key Features & Business Value

| # | Clinical Domain | Technical Implementation | Business Impact |
|---|---------------|-------------------------|-----------------|
| 🏥 | **Appointment Booking** | Transactional slot locking prevents double-booking; AES-GCM encrypted patient identity (CCCD/CMND) with SHA-256 hashed indexing | Guarantees scheduling consistency; PHI-compliant identity protection |
| 🔄 | **Patient Intake & Queue** | Full lifecycle state machine: `CHECKED_IN → VITAL_SIGNS → ASSIGNED → IN_CONSULTATION → COMPLETED` | Streamlined patient flow; optimized doctor utilization; reduced wait times |
| 📋 | **Electronic Health Records (EHR)** | Digital medical records with diagnosis, prescriptions; automated PDF generation; Gmail API reminder integration | Paperless clinical workflow; prescription accuracy; patient follow-up |
| 💊 | **Pharmacy Dispensing** | Lot-level inventory tracking with FIFO expiration management; dispense operations cross-referenced to medical record IDs | Full drug traceability; prevented stockouts via low-stock alerts; audit compliance |
| 💰 | **Billing & Revenue** | Automated invoice generation from service pricing rules; daily/monthly revenue reports with filtering | Cash flow automation; financial transparency for accounting department |
| 🔐 | **RBAC Security** | Spring Security + JWT with 34 granular permissions; `@PreAuthorize` method-level protection; httpOnly refresh cookies with rotation | Enforced separation of duties across 7 roles; HIPAA-aligned access control |

---

## 📊 Verified Project Metrics

```mermaid
xychart-beta
    title "Quality Gates — HMS v1.0 RC"
    x-axis ["Backend Tests", "E2E Scenarios", "Branch Coverage %", "API Endpoints", "DB Tables", "Pages"]
    y-axis "Count / Percentage" 0 --> 350
    bar [148, 183, 80.48, 118, 35, 72]
```

| Metric | Value | Status |
|--------|-------|--------|
| **Backend Integration Tests** | 174 across 23 classes (Spring Boot + Testcontainers) | ✅ Green in CI via `mvn verify` |
| **E2E Playwright (CI gate)** | 930 tests across 12 specs — mock-driven, no backend required | ✅ Green in CI |
| **E2E requiring a live backend** | 1,115 tests across 19 specs — run manually | ⚠️ Not in the CI gate |
| **Frontend Branch Coverage** | 80.48% (Vitest) | ✅ Above 80% Target |
| **REST API Endpoints** | 118 mappings across 32 controllers | ✅ Verified |
| **Database Schema** | 35 tables, 26 indexes, 20 Flyway migrations | ✅ Migrated |
| **RBAC Permissions** | 34 granular permissions covering 7 roles | ✅ Enforced |
| **CI/CD Pipelines** | Build → Test → Docker → Deploy → Rollback | ✅ Automated |

---

## 🏗️ DDD Architecture — Modular Monolith

```text
┌─────────────────────────────────────────────────────────────┐
│ 🚀 start — Composition Root                                 │
│   [ Flyway Migrations ]    [ App Config ]    [ Bootstrap ]  │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼ (depends on)
┌─────────────────────────────────────────────────────────────┐
│ 🌐 controller — REST Layer (32 controllers)                 │
│   [ Auth ]    [ Admin ]    [ Clinical ]    [ PatientPortal ]│
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼ (depends on)
┌─────────────────────────────────────────────────────────────┐
│ ⚡ application — Orchestration Layer                         │
│   [ Workflow Services ]            [ Read Services ]        │
│   [ Write Services ]               [ Auth/Security ]        │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼ (depends on)
┌─────────────────────────────────────────────────────────────┐
│ 🗄️ infrastructure — Adapters Layer                          │
│   [ Spring Data JPA ]   [ Gmail Client ]   [ PDF Generator ]│
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼ (depends on / implements contracts)
┌─────────────────────────────────────────────────────────────┐
│ 🏛️ domain — Business Core (17 Bounded Contexts)              │
│   [ Patient ]      [ Appt ]         [ Queue ]      [ MedRec ]│
│   [ Inven ]        [ Invoice ]      [ Admin ]      [ Lab ]   │
│   [ Rx ]           [ User ]         [ Audit ]      [ Dept ]  │
│   [ Timeslot ]     [ Content ]      [ Email ]      [ PtAuth ]│
│   [ PtPortal ]                                              │
└─────────────────────────────────────────────────────────────┘

                  ⬆️  Dependency Rule:
  domain ← infrastructure ← application ← controller ← start
  (Outer layers depend inward. Domain has zero outward dependencies.)
```

**17 Bounded Contexts:** `admin` · `appointment` · `audit` · `common` · `content` · `department` · `email` · `inventory` · `invoice` · `lab` · `medicalrecord` · `patient` · `patientauth` · `patientportal` · `prescription` · `timeslot` · `user`

---

## 🚀 Quick Start

### Prerequisites
- **Java 17+** · **Node.js 22+** · **Docker Desktop**

### 1. Start PostgreSQL
```bash
docker compose -f infra/docker-compose.yml up -d postgres
```

### 2. Configure Environment

**To run the seeded demo** (the walkthrough below, with the accounts in the table):
```bash
cp .env.demo.example .env
```

**For a clean install with no synthetic data:**
```bash
cp .env.example .env
```

Then set the three required secrets — the application refuses to start without them, by design:
```env
POSTGRES_PASSWORD=hospital_pass
JWT_SECRET=your-jwt-secret-at-least-32-chars
PATIENT_IDENTIFIER_SECRET=your-patient-secret-32-chars
```

> **On the demo seed:** `HMS_RELEASE_DEMO_SEED_ENABLED=true` alone is not enough. The seed fails
> closed, so all seven `HMS_RELEASE_DEMO_SEED_PASSWORD_*` values must be present or startup aborts
> with `Refusing release-demo seed: explicit passwords are required for …`. `.env.demo.example` ships
> them already filled in. The seed additionally requires an active Spring profile of
> `dev`, `test`, `demo`, or `release-demo`.

### 3. Start Backend (Spring Boot)
```powershell
.\backend\run.ps1                    # PowerShell — auto-loads .env
```
```bash
cd backend && mvn install -DskipTests && mvn spring-boot:run -f start/pom.xml
```
Health check: `http://localhost:8081/actuator/health` | Swagger UI: `http://localhost:8081/swagger-ui.html`

### 4. Start Frontend (Next.js)
```bash
cd frontend && npm install && npm run dev
```
Open: `http://localhost:3000`

### 5. Full Stack (Docker Compose)
```bash
docker compose -f infra/docker-compose.yml up -d --build    # Backend + Frontend + PostgreSQL
docker compose -f infra/docker-compose.yml -f infra/docker-compose.observability.yml up -d   # + Monitoring
```

### Demo Accounts (seeded by `.env.demo.example`)

All 9 staff accounts and 6 patient accounts come from `ReleaseDemoSeedCatalog`. Passwords are
configured **per role**, so every doctor shares the `DOCTOR` value.

| Role | Email | Password |
|------|-------|----------|
| 👨‍⚕️ Doctor (Internal Medicine) | `doctor1@hospital.vn` | `Doctor@1234` |
| 👨‍⚕️ Doctor (Cardiology) | `doctor2@hospital.vn` | `Doctor@1234` |
| 👨‍⚕️ Doctor (Radiology) | `doctor3@hospital.vn` | `Doctor@1234` |
| 👨‍⚕️ Doctor (Pediatrics) | `doctor4@hospital.vn` | `Doctor@1234` |
| 👩‍⚕️ Nurse | `nurse@hospital.vn` | `Nurse@1234` |
| 👩‍💼 Receptionist | `receptionist@hospital.vn` | `Reception@1234` |
| 💊 Pharmacist | `pharmacist@hospital.vn` | `Pharma@1234` |
| 💰 Accountant | `accountant@hospital.vn` | `Acc@1234` |
| ⚙️ Admin | `admin@hospital.vn` | `Admin@1234` |
| 🧑 Patient (Portal) | `patient@example.com` | `Patient@1234` |

---

## 🧪 Testing & Quality

```bash
# Backend — 148 integration tests
cd backend && mvn verify

# Frontend — unit tests (Vitest)
cd frontend && npm run test:unit

# Frontend — E2E tests (Playwright)
cd frontend && npm run test:e2e:ci       # CI gate: 12 of 31 specs, mock-driven
cd frontend && npm run test:e2e:ui       # UI smoke & accessibility
cd frontend && npm run test:e2e:integrated  # Backend-integrated auth & booking
```

---

## 📈 CI/CD & Observability

| Pipeline | Trigger | Actions |
|----------|---------|---------|
| **CI** (`ci.yml`) | Push / PR | Java build · Testcontainers · Vitest · Playwright · Docker build → GHCR |
| **CD** (`cd.yml`) | Release tag | Deploy to VPS · Smoke tests · Slack notification |
| **Rollback** (`rollback.yml`) | Manual | Automated rollback with health check gate |
| **Security** (`security-scan.yml`) | Schedule / Push | OWASP DC · TruffleHog · Trivy container scan |

**Observability Stack:** `Nginx → Frontend → Backend → Prometheus → Grafana + Loki → Tempo`

Configurations in [`infra/observability/`](infra/observability/) — Prometheus metrics, Grafana dashboards, Loki log aggregation, Tempo distributed tracing.

---

## 📚 Documentation

| Section | Content | Primary Doc |
|---------|---------|-------------|
| **00-overview** | Project foundation, conventions, onboarding | [`project-foundation.md`](docs/00-overview/project-foundation.md) |
| **01-business** | Business rules, glossary, scope | [`business-rules.md`](docs/01-business/business-rules.md) |
| **02-product** | PRD, feature list, release plan | [`prd.md`](docs/02-product/prd.md) |
| **03-requirements** | SRS, permissions, use cases | [`srs.md`](docs/03-requirements/srs.md) |
| **04-architecture** | DDD, security, coding standards | [`architecture.md`](docs/04-architecture/architecture.md) |
| **05-api** | API contract, auth, error codes | [`api-contract.md`](docs/05-api/api-contract.md) |
| **06-database** | Schema, migrations, seed data | [`db-schema.md`](docs/06-database/db-schema.md) |
| **07-flows** | Business flows, state machines | [`end-to-end-business-flow.md`](docs/07-flows/end-to-end-business-flow.md) |
| **08-ui-ux** | Design system, screen specs | [`design-system.md`](docs/08-ui-ux/02_design-system/design-system.md) |
| **09-testing** | Test strategy, plan, RTM | [`test-strategy.md`](docs/09-testing/test-strategy.md) |
| **10-deployment** | CI/CD, Docker, env variables | [`deployment-guide.md`](docs/10-deployment/deployment-guide.md) |
| **11-operations** | Admin guide, troubleshooting | [`admin-guide.md`](docs/11-operations/admin-guide.md) |
| **12-handover** | Handover, onboarding, known issues | [`handover-document.md`](docs/12-handover/handover-document.md) |

> 📄 **[Interactive Documentation Portal →](docs/HMS_DOCUMENTATION.html)** | 📂 **[Full Documentation Index →](docs/README.md)**

---

## 🔒 Security & Compliance

- **PHI Protection:** Patient identifiers (CCCD/CMND) encrypted with AES-GCM, indexed by SHA-256 hash — plaintext never stored
- **Authentication:** JWT access tokens (15min TTL) + httpOnly refresh cookies (7-day rotation)
- **Authorization:** 34 RBAC permissions at method-level via `@PreAuthorize`
- **Rate Limiting:** Sliding-window rate limit on public endpoints (configurable, default 30/min)
- **CORS:** Configurable allowed origins via environment variables
- **Audit Trail:** Full audit logging for all state-changing operations

---

*Built with ❤️ following Domain-Driven Design, Clean Architecture principles, and healthcare industry compliance standards.*
