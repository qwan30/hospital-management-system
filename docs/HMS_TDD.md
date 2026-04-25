# Hospital Management System TDD

Status: aligned to the repository on 2026-04-25

Architecture diagrams: [HMS_ArchitectureDiagrams.html](HMS_ArchitectureDiagrams.html)

## 1. Purpose

This document is the technical design baseline for the current codebase.
It replaces earlier technical notes that assumed a finished React application and older AI provider choices.

## 2. Current Stack

### 2.1 Backend

| Area | Current implementation |
| --- | --- |
| Language | Java 17 |
| Framework | Spring Boot 3.3.5 |
| Modules | `domain`, `infrastructure`, `application`, `controller`, `start` |
| API layer | Spring Web + SpringDoc |
| Validation | Jakarta Validation |
| Security | Spring Security + JJWT |
| Persistence | Spring Data JPA |
| Database migration | Flyway |
| Database | PostgreSQL 15 |
| Extra DB image | `pgvector/pgvector:pg15` in Docker Compose |
| PDF generation | Apache PDFBox 3.0.4 |
| Tests | JUnit 5, Mockito, Spring Boot Test, Testcontainers |

### 2.2 Frontend

The `frontend/` folder contains dependencies for a React application, but the implemented source is still a starter scaffold.

Installed dependencies indicate the intended frontend stack:

| Area | Installed package |
| --- | --- |
| Runtime | React 19 |
| Build tool | Vite 8 |
| Type system | TypeScript 6 |
| Routing | React Router 6 |
| Server state | TanStack Query 5 |
| Forms | React Hook Form 7 |
| Validation | Zod 4 |
| Client state | Zustand 5 |
| Charts | Recharts 3 |
| Styling | Tailwind CSS 4.2 |
| HTTP client | Axios 1.15 |

Current frontend code reality:

- `src/main.ts` is still starter content
- there is no route tree, auth store, API layer, or hospital UI
- there is no frontend Dockerfile

## 3. Repository Topology

```text
backend/
  domain/          JPA entities, enums, request/response DTOs, domain exceptions
  infrastructure/  Spring Data repositories and external integration adapters
  application/     use-case services, auth services, orchestration, seed/backfill jobs
  controller/      REST controllers, API envelope, security filters, web error handling
  start/           Spring Boot entry point, runtime config, Flyway migrations, integration tests
frontend/
  src/      starter Vite TypeScript files only
docs/
  product, system, deployment, and design reference documents
docker-compose.yml
```

## 4. Backend Module Breakdown

The backend is organized as a DDD-oriented Maven reactor. Java package names still use the existing `com.hospital.core`, `com.hospital.api`, and `com.hospital.shared` namespaces, but the Maven module folders are the current source layout and dependency boundary.

| Module | Responsibility | Direct project dependencies |
| --- | --- | --- |
| `domain` | persistent domain entities, enums, request/response DTOs, domain exceptions | none |
| `infrastructure` | Spring Data repositories, Gemini/Gmail adapters, PDF and hospital-profile infrastructure | `domain` |
| `application` | use-case services, auth/token services, orchestration, seed/backfill jobs | `domain`, `infrastructure` |
| `controller` | REST controllers, API response envelope, security filters, web exception handling | `domain`, `application` |
| `start` | Spring Boot launcher, runtime config, Flyway migrations, knowledge seed resources, integration tests | `domain`, `infrastructure`, `application`, `controller` |

Runtime bootstrapping starts from `backend/start` and scans the `com.hospital` package tree so Spring can compose beans across the modules. `start` is the composition root and intentionally declares every backend module it boots. Boundary checks live in the Maven enforcer rules and `ModuleBoundaryTest`, including a source-import guard that prevents lower layers from importing higher layers.

### 4.1 Public and booking capabilities

- public content
- news
- departments
- doctors and slots
- booking
- chatbot
- symptom analysis

### 4.2 Staff and clinical operations capabilities

- staff auth
- appointment list and detail
- patient record summaries
- medical record creation
- prescription PDF preview and download
- queue and check-in
- vital signs
- follow-up

### 4.3 Finance and operations capabilities

- invoices
- payments
- pricing
- revenue reports
- inventory items, lots, and movements

### 4.4 Admin platform capabilities

- users
- departments
- rooms
- schedule templates
- special closures
- slot generation
- stats
- monitoring
- audit logs
- public content admin
- news admin
- knowledge document admin

### 4.5 Patient-facing secured capabilities

- patient claim and login
- portal overview
- appointments
- lab results
- messages
- profile

### 4.6 Internal clinical assistant capabilities

- current session lookup
- reply generation
- feedback capture
- monitoring snapshot
- knowledge document upload, activation, revocation, and reindex

## 5. API Surface Summary

The API is organized around `/api/v1`.
The current controller source contains roughly 122 mapped route handlers.

Important route groups:

- `/api/v1/auth`
- `/api/v1/patient-auth`
- `/api/v1/patient-portal`
- `/api/v1/appointments`
- `/api/v1/medical-records`
- `/api/v1/invoices`
- `/api/v1/pricing`
- `/api/v1/inventory`
- `/api/v1/internal-assistant`
- `/api/v1/admin/*`

Swagger UI is exposed at `/swagger-ui`.

## 6. Authentication And Security Design

- Staff and patient authentication are separate flows.
- Both flows return an access token in the response body.
- Both flows store the refresh token in an HTTP-only cookie.
- Cookie options are controlled by `security.http.*` properties.
- Role checks are applied with `@PreAuthorize`.
- Public routes and internal assistant messages are rate-limited.
- Patient identifiers are protected through dedicated patient identifier services and configuration.

## 7. Database Migration Inventory

| Migration | Purpose |
| --- | --- |
| `V1` | initial hospital schema for departments, users, slots, patients, appointments, medical records, prescriptions, invoices, pricing |
| `V2` | clinical workflow columns |
| `V3` | patient email and follow-up scheduling |
| `V4` | patient identifier and security expansion |
| `V5` | public content, operations foundation, and broader SRS support |
| `V6` | room, schedule, and closure operational flags |
| `V7` | inventory tables |
| `V8` | patient portal and lab result tables |
| `V9` | internal assistant knowledge tables |
| `V10` | internal assistant safe rollout tables for sessions, messages, feedback, and ingestions |

## 8. Integration Design

### 8.1 Symptom analysis

- Provider: Gemini
- Entry point: `POST /api/v1/ai/analyze-symptoms`
- Fallback: heuristic scoring if the Gemini client throws an error or is disabled

### 8.2 Email delivery

- Provider style: Gmail API OAuth2 configuration
- Configuration namespace: `integration.gmail.*`
- Default behavior: disabled unless configured

### 8.3 Public chatbot

- No external AI provider is used
- Responses are rule-based and built from departments, doctors, and slot availability

### 8.4 Internal clinical assistant

- No external model call is present in the current implementation
- Answers are built from patient context plus active internal knowledge documents
- Every supported answer is citation-first

## 9. Seed Data And Demo Environment

On startup, the backend seeds:

- three departments
- two doctors, one nurse, one accountant, one admin
- service pricing
- doctor time slots
- inventory items, lots, and movements
- one demo patient portal account with appointments, a medical record, a lab result, and message thread
- starter internal assistant knowledge documents from `backend/start/src/main/resources/knowledge`

## 10. Local Development

### 10.1 Backend

```bash
docker compose up -d postgres
cd backend
mvn spring-boot:run -pl start
```

### 10.2 Frontend

```bash
cd frontend
npm install
npm run dev
```

Note: the frontend dev server will start, but it does not yet provide hospital screens.

## 11. Frontend Design Handoff

The current repository is ready for frontend design and implementation, but not for frontend usage.
A production frontend should introduce:

- route groups for public, patient portal, and staff roles
- Axios client with refresh handling for staff and patient auth
- TanStack Query data access layer
- form schemas based on contract DTOs in `backend/domain`
- role-aware navigation and permission guards
- PDF preview/download flows
- assistant drawer with citations and suggestions

Until that work exists, backend DTOs and controllers are the technical contract.
