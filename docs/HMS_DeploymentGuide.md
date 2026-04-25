# Hospital Management System Deployment Guide

Status: aligned to the repository on 2026-04-25

Architecture diagrams: [HMS_ArchitectureDiagrams.html](HMS_ArchitectureDiagrams.html)

## 1. What This Guide Covers

This guide reflects the deployment shape that currently exists in the repository:

- PostgreSQL in Docker
- Spring Boot backend
- optional frontend dev server only

It does not assume a production frontend container because the repo does not include one yet.

## 2. Prerequisites

- Docker Desktop or compatible Docker runtime
- Java 17 or newer
- Maven 3.9 or newer
- Node.js 20 or newer if you want to start the frontend scaffold

## 3. Current Services

`docker-compose.yml` currently defines:

- `postgres`
- `backend`

Important note:

- there is no active frontend service in Docker Compose
- the old docs that described an `hms-frontend` container are obsolete

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
| `POSTGRES_PASSWORD` | `hospital_password` |

### 4.2 Security

| Variable | Default |
| --- | --- |
| `JWT_SECRET` | `replace-with-a-random-32-character-secret` |
| `HMS_ALLOWED_ORIGIN_PRIMARY` | `http://localhost:3000` |
| `HMS_ALLOWED_ORIGIN_SECONDARY` | `http://localhost:4173` |
| `HMS_ALLOW_CREDENTIALS` | `true` |
| `HMS_SECURE_COOKIES` | `false` |
| `HMS_REFRESH_COOKIE_SAME_SITE` | `Lax` |
| `HMS_PUBLIC_RATE_LIMIT_PER_MINUTE` | `30` |
| `HMS_INTERNAL_ASSISTANT_RATE_LIMIT_PER_MINUTE` | `12` |
| `PATIENT_IDENTIFIER_SECRET` | falls back to `JWT_SECRET` |

### 4.3 Integrations

| Variable | Default |
| --- | --- |
| `GEMINI_ENABLED` | `false` |
| `GEMINI_API_KEY` | empty |
| `GEMINI_MODEL` | `gemini-2.0-flash` |
| `GMAIL_ENABLED` | `false` |
| `GMAIL_CLIENT_ID` | empty |
| `GMAIL_CLIENT_SECRET` | empty |
| `GMAIL_REFRESH_TOKEN` | empty |
| `GMAIL_SENDER_EMAIL` | `demo@hospital.vn` |

### 4.4 Hospital profile

| Variable | Default |
| --- | --- |
| `HOSPITAL_NAME` | `Hospital Management System` |
| `HOSPITAL_ADDRESS` | `123 ABC Street, District 1, Ho Chi Minh City` |
| `HOSPITAL_PHONE` | `028 1234 5678` |
| `HOSPITAL_MAPS_EMBED_URL` | Google Maps embed URL |
| `HOSPITAL_PRIVACY_POLICY_URL` | `/privacy` |
| `HOSPITAL_FACEBOOK_URL` | `https://facebook.com` |
| `HOSPITAL_YOUTUBE_URL` | `https://youtube.com` |

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

- API root: `http://localhost:8080/api/v1`
- Swagger UI: `http://localhost:8080/swagger-ui`
- Health: `http://localhost:8080/actuator/health`

### 5.3 Optional: start the frontend scaffold

```bash
cd frontend
npm install
npm run dev
```

Important note:

- this starts the Vite scaffold only
- it does not start a hospital UI because that frontend has not been implemented yet

## 6. Docker Compose Notes

The active compose file currently:

- exposes PostgreSQL on `5432`
- exposes the backend on `8080`
- injects backend database and JWT settings

The commented frontend section in `docker-compose.yml` is not deployable as-is because:

- there is no frontend Dockerfile
- the frontend source is still starter content

## 7. Seed Data

On first backend startup with an empty database, the app seeds demo data automatically.

### 7.1 Staff accounts

| Email | Password | Role |
| --- | --- | --- |
| `doctor1@hospital.vn` | `Doctor@1234` | DOCTOR |
| `doctor2@hospital.vn` | `Doctor@1234` | DOCTOR |
| `nurse@hospital.vn` | `Nurse@1234` | NURSE |
| `accountant@hospital.vn` | `Acc@1234` | ACCOUNTANT |
| `admin@hospital.vn` | `Admin@1234` | ADMIN |

### 7.2 Patient portal demo account

| Email | Password |
| --- | --- |
| `patient@example.com` | `Patient@1234` |

## 8. Operational Warnings

- Older docs and the root `.env.example` still contain stale variables such as `ANTHROPIC_API_KEY`.
- The current backend reads Gemini settings, not Claude settings, for symptom analysis.
- The backend can run without Gemini and Gmail; both integrations degrade gracefully when disabled.

## 9. Troubleshooting

### Backend cannot connect to database

- confirm `docker compose up -d postgres` succeeded
- confirm the backend is using the same database credentials as Docker Compose
- confirm port `5432` is available

### Frontend shows starter page instead of hospital screens

- this is expected with the current repository
- the frontend app has not been implemented yet

### Swagger UI is empty or unavailable

- confirm the backend started successfully
- confirm the app is reachable on `http://localhost:8080`
- confirm `springdoc` is not blocked by local proxy or custom security settings

### Gmail does not send

- confirm `GMAIL_ENABLED=true`
- confirm all Gmail OAuth2 variables are set
- confirm the configured refresh token is valid

### Symptom analysis does not use Gemini

- confirm `GEMINI_ENABLED=true`
- confirm `GEMINI_API_KEY` is present
- if Gemini still fails, the app will fall back to heuristic estimates by design
