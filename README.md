# Hospital Management System

A comprehensive hospital management platform with intelligent appointment scheduling, clinical workflow automation, and AI-powered diagnostics.

## Stack

- **Backend**: Java 17 / Spring Boot 3.3, multi-module Maven project (`domain`, `infrastructure`, `application`, `controller`, `start`)
- **Database**: PostgreSQL 15 with pgvector extension, managed by Flyway (10 migrations)
- **AI Integration**: Gemini API for symptom analysis (graceful fallback when disabled)
- **Email**: Gmail API for transactional emails (confirmation, prescriptions, reminders)
- **API Docs**: SpringDoc OpenAPI, with roughly 122 route handlers exposed through Swagger UI
- **Frontend**: ⚠️ **Not yet implemented** — planned as React + TypeScript (Vite)

## Current Status

The backend API is fully functional with roughly 122 mapped route handlers covering:
- Authentication (Staff JWT + Patient portal)
- Smart Reservation System (booking, AI duration estimation)
- Clinical Workflow (medical records, prescriptions, PDF generation)
- Administration (users, departments, rooms, schedules, content)
- Finance (invoices, payments, revenue reports)
- Inventory Management (items, lots, movements)
- AI Internal Assistant (knowledge base, RAG, feedback)
- Patient Portal (profile, appointments, messages, lab results)

## Local Setup

### Prerequisites
- Java 17+ (tested with Java 21)
- Maven 3.9+
- Docker Desktop (for PostgreSQL)

### Quick Start

```bash
# 1. Start PostgreSQL
docker compose up -d postgres

# 2. Build all modules
cd backend
mvn install -DskipTests

# 3. Run the backend (from the backend directory)
mvn spring-boot:run -pl start -DskipTests

# 4. Open Swagger UI
# http://localhost:8080/swagger-ui/index.html

# 5. Health check
# http://localhost:8080/actuator/health
```

### Demo Users (seeded on first startup)

| Email | Password | Role |
|:------|:---------|:-----|
| `doctor1@hospital.vn` | `Doctor@1234` | DOCTOR |
| `nurse@hospital.vn` | `Nurse@1234` | NURSE |
| `admin@hospital.vn` | `Admin@1234` | ADMIN |
| `accountant@hospital.vn` | `Acc@1234` | ACCOUNTANT |

### Environment Variables (optional)

External integrations are disabled by default and degrade gracefully:

| Variable | Default | Purpose |
|:---------|:--------|:--------|
| `GEMINI_ENABLED` | `false` | Enable AI symptom analysis |
| `GEMINI_API_KEY` | unset | Google Gemini API key |
| `GMAIL_ENABLED` | `false` | Enable email notifications |
| `JWT_SECRET` | dev default | JWT signing secret |

## Project Structure

```
backend/
|-- domain/          # JPA entities, enums, request/response contracts, domain exceptions
|-- infrastructure/  # Spring Data repositories and external integration adapters
|-- application/     # Use-case services, auth services, orchestration, seed/backfill jobs
|-- controller/      # REST controllers, API envelope, security filters, web error handling
`-- start/           # Spring Boot app, runtime config, Flyway migrations, integration tests
docs/           # PRD, Project Plan, architecture documents
docker-compose.yml  # PostgreSQL + backend services
```

## Backend Architecture

The backend is now a DDD-oriented Maven reactor:

```text
domain <- infrastructure <- application <- controller <- start
```

`application` also depends directly on `domain` for contract and entity types. Java package names still use the existing `com.hospital.core`, `com.hospital.api`, and `com.hospital.shared` namespaces; the Maven module folders above are the current architectural boundaries.

## Source of Truth

1. `docs/HMS_PRD.md` — Product Requirements Document
2. `docs/HMS_ProjectPlan.md` — Phase-based development plan

## Quality Gates

- 80%+ test coverage target (backend integration tests with Testcontainers)
- Double-booking prevention via transactional slot locking
- RBAC enforcement on all protected endpoints
- Rate limiting on public API routes
- Audit logging for admin operations
