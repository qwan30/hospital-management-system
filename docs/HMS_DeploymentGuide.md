# Hospital Management System Deployment Guide

Status: aligned with the repository on 2026-05-13.

Architecture diagrams: [HMS_ArchitectureDiagrams.html](HMS_ArchitectureDiagrams.html)
Documentation map: [README.md](README.md)

## 1. What This Guide Covers

This guide reflects the deployment shape that currently exists in the repository:

- PostgreSQL in Docker
- Spring Boot backend
- Next.js frontend dev server or Dockerized production frontend service

## 2. Prerequisites

- Docker Desktop or compatible Docker runtime
- Java 17 or newer
- Maven 3.9 or newer
- Node.js 20 or newer if you want to start the frontend app

## 3. Current Services

`docker-compose.yml` currently defines:

- `postgres`
- `backend`
- `frontend`

### 3.1 Backend Build Modules

The backend service is built from the `backend/start` Maven module. The active backend reactor is:

| Module | Deployment role |
| --- | --- |
| `domain` | compiled into downstream modules as entities, enums, and request/response contracts |
| `infrastructure` | provides repositories and external integration adapters |
| `application` | provides use-case services and orchestration |
| `controller` | provides REST endpoints, API DTO usage, security filters, and web error handling |
| `start` | packages the executable Spring Boot application, declares the composition root, and provides runtime resources |

Use `mvn -pl start -am ...` for backend build, test, package, and run commands.

## 4. Environment Configuration

The authoritative backend config currently lives in `backend/start/src/main/resources/application.yml`.

### 4.1 Database

| Variable | Default |
| --- | --- |
| `POSTGRES_HOST` | `localhost` |
| `POSTGRES_PORT` | `5432` |
| `POSTGRES_DB` | `hospital_db` |
| `POSTGRES_USER` | `hospital_user` |
| `POSTGRES_PASSWORD` | required, no default |

### 4.2 Security

| Variable | Default |
| --- | --- |
| `JWT_SECRET` | required, no default |
| `HMS_ALLOWED_ORIGIN_PRIMARY` | `http://localhost:3000` |
| `HMS_ALLOWED_ORIGIN_SECONDARY` | `http://localhost:4173` |
| `HMS_ALLOW_CREDENTIALS` | `true` |
| `HMS_SECURE_COOKIES` | `false` |
| `HMS_REFRESH_COOKIE_SAME_SITE` | `Lax` |
| `HMS_PUBLIC_RATE_LIMIT_PER_MINUTE` | `30` |
| `PATIENT_IDENTIFIER_SECRET` | required, no default; must be distinct from `JWT_SECRET` |

### 4.3 Integrations

| Variable | Default |
| --- | --- |
| `GMAIL_ENABLED` | `false` |
| `GMAIL_CLIENT_ID` | empty |
| `GMAIL_CLIENT_SECRET` | empty |
| `GMAIL_REFRESH_TOKEN` | empty |
| `GMAIL_SENDER_EMAIL` | `demo@hospital.vn` |

### 4.4 Synthetic UAT seed data

| Variable | Default |
| --- | --- |
| `HMS_RELEASE_DEMO_SEED_ENABLED` | `false` |
| `HMS_RELEASE_DEMO_FUTURE_SLOT_DAYS` | `14` |
| `HMS_RELEASE_DEMO_TARGET_PATIENTS` | `8` |
| `HMS_RELEASE_DEMO_TARGET_APPOINTMENTS` | `12` |
| `HMS_RELEASE_DEMO_TARGET_INVENTORY_ITEMS` | `8` |
| `HMS_RELEASE_DEMO_TARGET_AUDIT_LOGS` | `16` |

Set `HMS_RELEASE_DEMO_SEED_ENABLED=true` only for synthetic UAT or release-demo environments. Do not use this toggle for production data import.

### 4.5 Hospital profile

| Variable | Default |
| --- | --- |
| `HOSPITAL_NAME` | `Hospital Management System` |
| `HOSPITAL_ADDRESS` | `123 ABC Street, District 1, Ho Chi Minh City` |
| `HOSPITAL_PHONE` | `028 1234 5678` |
| `HOSPITAL_MAPS_EMBED_URL` | Google Maps embed URL |
| `HOSPITAL_PRIVACY_POLICY_URL` | `/privacy` |
| `HOSPITAL_FACEBOOK_URL` | `https://facebook.com` |
| `HOSPITAL_YOUTUBE_URL` | `https://youtube.com` |

### 4.5 Frontend API URLs

| Variable | Default / local value |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8081/api/v1` when using the current backend default port |
| `API_BASE_URL_SERVER` | `http://localhost:8081/api/v1` when using the current backend default port |
| Compose `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8081/api/v1` |

### 4.6 Docker Compose host ports

| Variable | Default |
| --- | --- |
| `HMS_BACKEND_HOST_PORT` | `8081` |
| `HMS_FRONTEND_HOST_PORT` | `3000` |
| `HMS_POSTGRES_HOST_PORT` | `5432` |

When changing `HMS_BACKEND_HOST_PORT`, also set `NEXT_PUBLIC_API_BASE_URL` to the same host port before building the frontend image.

## 5. Quick Start

### 5.1 Start PostgreSQL

```bash
docker compose up -d postgres
```

### 5.2 Start the backend

```bash
cd backend
mvn spring-boot:run -pl start
```

Backend endpoints:

- API root: `http://localhost:8081/api/v1`
- Swagger UI: `http://localhost:8081/swagger-ui`
- Health: `http://localhost:8081/actuator/health`

### 5.3 Start the frontend app in development

```bash
cd web
npm install
npm run dev
```

This starts the canonical Next.js frontend app from `web/`.

## 6. Docker Compose Notes

The active compose file currently:

- exposes PostgreSQL on `${HMS_POSTGRES_HOST_PORT:-5432}`
- exposes the backend on `${HMS_BACKEND_HOST_PORT:-8081}`
- builds the canonical frontend from `web/Dockerfile`
- exposes the frontend on `${HMS_FRONTEND_HOST_PORT:-3000}`
- injects backend database, JWT, and frontend API URL settings

## 7. Seed Data

On first backend startup with an empty database, the app seeds demo data automatically.

Canonical seed-data reference: [reference/demo-accounts-and-seed-data.md](reference/demo-accounts-and-seed-data.md).

For a Docker/VPS UAT release demo, set `HMS_RELEASE_DEMO_SEED_ENABLED=true` before starting the backend. The release demo seed safely tops up existing rows by natural keys and covers public, staff, patient portal, admin, inventory, finance, and audit flows.

### 7.1 Staff accounts

| Email | Password | Role |
| --- | --- | --- |
| `doctor1@hospital.vn` | `Doctor@1234` | DOCTOR |
| `doctor2@hospital.vn` | `Doctor@1234` | DOCTOR |
| `nurse@hospital.vn` | `Nurse@1234` | NURSE |
| `receptionist@hospital.vn` | `Reception@1234` | RECEPTIONIST |
| `pharmacist@hospital.vn` | `Pharma@1234` | PHARMACIST |
| `accountant@hospital.vn` | `Acc@1234` | ACCOUNTANT |
| `admin@hospital.vn` | `Admin@1234` | ADMIN |

### 7.2 Patient portal demo account

| Email | Password |
| --- | --- |
| `patient@example.com` | `Patient@1234` |
| `nguyen.van.clinical@example.com` | `Patient@1234` |

The second patient account is created only when `HMS_RELEASE_DEMO_SEED_ENABLED=true`.

## 8. Operational Warnings

- The backend can run without Gmail; email delivery degrades gracefully when disabled.
- Gemini, Anthropic, and internal-assistant settings are no longer used by the active backend.

## 9. Troubleshooting

### Backend cannot connect to database

- confirm `docker compose up -d postgres` succeeded
- confirm the backend is using the same database credentials as Docker Compose
- confirm port `5432` is available

### Frontend screens do not show live backend data

- confirm the backend is running on `http://localhost:8081`
- confirm the screen has backend data-access integration; some current screens are static or locally composed

### Swagger UI is empty or unavailable

- confirm the backend started successfully
- confirm the app is reachable on `http://localhost:8081`
- confirm `springdoc` is not blocked by local proxy or custom security settings

### Gmail does not send

- confirm `GMAIL_ENABLED=true`
- confirm all Gmail OAuth2 variables are set
- confirm the configured refresh token is valid
