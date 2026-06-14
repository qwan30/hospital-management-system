# Environment Variables Reference

## Overview

All configuration is managed through environment variables. Copy `.env.example` to `.env` in the project root and fill in the values. The Docker Compose files reference these variables with safe defaults where applicable.

## Required Variables

These variables have no default and will cause the application to fail if not set:

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_PASSWORD` | PostgreSQL database password | `my-secure-password` |
| `JWT_SECRET` | JWT signing key (minimum 32 characters) | `replace-with-a-random-32-character-secret` |
| `PATIENT_IDENTIFIER_SECRET` | Encryption key for PHI (minimum 32 characters) | `replace-with-a-different-random-32-character-secret` |

## Database

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_DB` | `hospital_db` | PostgreSQL database name |
| `POSTGRES_USER` | `hospital_user` | PostgreSQL database user |

## JWT Authentication

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | — | JWT signing key (min 32 chars, **required**) |
| `JWT_EXPIRATION_MS` | `900000` | Access token expiry in milliseconds (15 min) |
| `JWT_REFRESH_EXPIRATION_MS` | `604800000` | Refresh token expiry in milliseconds (7 days) |

## Port Configuration

Change these only when local ports are already in use.

### Core Services

| Variable | Default | Description |
|----------|---------|-------------|
| `HMS_BACKEND_HOST_HOST_PORT` | `8081` | Host port for the Spring Boot backend |
| `HMS_FRONTEND_HOST_PORT` | `3000` | Host port for the Next.js frontend |
| `HMS_POSTGRES_HOST_PORT` | `5432` | Host port for PostgreSQL |

### Observability Ports

| Variable | Default | Description |
|----------|---------|-------------|
| `HMS_PROMETHEUS_HOST_PORT` | `9090` | Host port for Prometheus |
| `HMS_GRAFANA_HOST_PORT` | `3001` | Host port for Grafana |
| `HMS_TEMPO_HOST_PORT` | `3200` | Host port for Tempo (distributed tracing) |
| `HMS_LOKI_HOST_PORT` | `3100` | Host port for Loki (log aggregation) |
| `HMS_OTEL_GRPC_HOST_PORT` | `4317` | Host port for OpenTelemetry gRPC |
| `HMS_OTEL_HTTP_HOST_PORT` | `4318` | Host port for OpenTelemetry HTTP |
| `HMS_OTEL_METRICS_HOST_PORT` | `8889` | Host port for OpenTelemetry metrics |

## Security

| Variable | Default | Description |
|----------|---------|-------------|
| `HMS_ALLOW_CREDENTIALS` | `true` | Whether to allow credentials in CORS |
| `HMS_ALLOWED_ORIGIN_PRIMARY` | `http://localhost:3000` | Primary allowed CORS origin |
| `HMS_ALLOWED_ORIGIN_SECONDARY` | `http://127.0.0.1:3000` | Secondary allowed CORS origin |
| `HMS_PUBLIC_RATE_LIMIT_PER_MINUTE` | `30` | Rate limit for public endpoints (requests/min) |

## API Base URL

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8081/api/v1` | Frontend client-side API base URL |
| `API_BASE_URL_SERVER` | `http://localhost:8081/api/v1` | Frontend server-side API base URL (SSR) |

## Demo Seed Data

Optional synthetic data for UAT and development environments. Disabled by default for production.

| Variable | Default | Description |
|----------|---------|-------------|
| `HMS_RELEASE_DEMO_SEED_ENABLED` | `false` | Enable demo data seeding on startup |
| `HMS_RELEASE_DEMO_FUTURE_SLOT_DAYS` | `14` | Number of days ahead for future appointment slots |
| `HMS_RELEASE_DEMO_TARGET_PATIENTS` | `8` | Number of demo patients to seed |
| `HMS_RELEASE_DEMO_TARGET_APPOINTMENTS` | `12` | Number of demo appointments to seed |
| `HMS_RELEASE_DEMO_TARGET_INVENTORY_ITEMS` | `8` | Number of demo inventory items to seed |
| `HMS_RELEASE_DEMO_TARGET_AUDIT_LOGS` | `16` | Number of demo audit log entries to seed |

## Gmail Integration

Used for sending appointment confirmations and notifications. Disabled by default.

| Variable | Default | Description |
|----------|---------|-------------|
| `GMAIL_CLIENT_ID` | — | Google OAuth 2.0 client ID |
| `GMAIL_CLIENT_SECRET` | — | Google OAuth 2.0 client secret |
| `GMAIL_REFRESH_TOKEN` | — | Google OAuth 2.0 refresh token |
| `GMAIL_SENDER_EMAIL` | `demo@hospital.vn` | From address for outgoing emails |
| `GMAIL_ENABLED` | `false` | Enable/disable email sending |

## Hospital Information

Displayed on public pages, appointment confirmations, and PDF invoices.

| Variable | Default | Description |
|----------|---------|-------------|
| `HOSPITAL_NAME` | `Hospital Management System` | Hospital display name |
| `HOSPITAL_ADDRESS` | `123 ABC Street, District 1, Ho Chi Minh City` | Hospital address |
| `HOSPITAL_PHONE` | `028 1234 5678` | Hospital phone number |
| `HOSPITAL_MAPS_EMBED_URL` | Google Maps embed URL | Embedded map URL for contact page |
| `HOSPITAL_PRIVACY_POLICY_URL` | `/privacy` | Privacy policy page URL |
| `HOSPITAL_FACEBOOK_URL` | `https://facebook.com` | Facebook page URL |
| `HOSPITAL_YOUTUBE_URL` | `https://youtube.com` | YouTube channel URL |

## Spring Boot

| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_PROFILES_ACTIVE` | `dev` | Active Spring profiles (dev, staging, prod, migrate) |
| `SERVER_PORT` | `8081` | Backend server port (inside container) |
| `MANAGEMENT_PORT` | `8081` | Management/actuator server port |

## Tracing and Observability

| Variable | Default | Description |
|----------|---------|-------------|
| `MANAGEMENT_TRACING_ENABLED` | `true` | Enable/disable OpenTelemetry tracing |
| `MANAGEMENT_TRACING_SAMPLING_PROBABILITY` | `1.0` | Trace sampling rate (1.0 = all traces) |
| `MANAGEMENT_OTLP_TRACING_ENDPOINT` | `http://localhost:4318/v1/traces` | OTLP HTTP endpoint for trace export |
| `HMS_STRUCTURED_LOGGING_ENABLED` | `true` | Enable structured JSON logging |

## Full .env.example

```
# ── Database ──────────────────────────────────────────
POSTGRES_DB=hospital_db
POSTGRES_USER=hospital_user
POSTGRES_PASSWORD=replace-with-secure-postgres-password

# ── Authentication ────────────────────────────────────
JWT_SECRET=replace-with-a-random-32-character-secret
PATIENT_IDENTIFIER_SECRET=replace-with-a-different-random-32-character-secret
JWT_EXPIRATION_MS=900000
JWT_REFRESH_EXPIRATION_MS=604800000

# ── Gmail (optional) ──────────────────────────────────
GMAIL_CLIENT_ID=replace-with-google-client-id
GMAIL_CLIENT_SECRET=replace-with-google-client-secret
GMAIL_REFRESH_TOKEN=replace-with-google-refresh-token
GMAIL_SENDER_EMAIL=demo@hospital.vn
GMAIL_ENABLED=false

# ── Hospital Info ─────────────────────────────────────
HOSPITAL_NAME=Hospital Management System
HOSPITAL_ADDRESS=123 ABC Street, District 1, Ho Chi Minh City
HOSPITAL_PHONE=028 1234 5678
HOSPITAL_MAPS_EMBED_URL=https://www.google.com/maps?q=10.7769,106.7009&z=15&output=embed
HOSPITAL_PRIVACY_POLICY_URL=/privacy
HOSPITAL_FACEBOOK_URL=https://facebook.com
HOSPITAL_YOUTUBE_URL=https://youtube.com

# ── Spring ────────────────────────────────────────────
SPRING_PROFILES_ACTIVE=dev
SERVER_PORT=8081
MANAGEMENT_PORT=8081
MANAGEMENT_TRACING_ENABLED=true
MANAGEMENT_TRACING_SAMPLING_PROBABILITY=1.0
MANAGEMENT_OTLP_TRACING_ENDPOINT=http://localhost:4318/v1/traces
HMS_STRUCTURED_LOGGING_ENABLED=true

# ── Docker Host Ports ─────────────────────────────────
HMS_BACKEND_HOST_PORT=8081
HMS_FRONTEND_HOST_PORT=3000
HMS_POSTGRES_HOST_PORT=5432
HMS_PROMETHEUS_HOST_PORT=9090
HMS_GRAFANA_HOST_PORT=3001
HMS_TEMPO_HOST_PORT=3200
HMS_LOKI_HOST_PORT=3100
HMS_OTEL_GRPC_HOST_PORT=4317
HMS_OTEL_HTTP_HOST_PORT=4318
HMS_OTEL_METRICS_HOST_PORT=8889

# ── CORS & Security ───────────────────────────────────
HMS_ALLOW_CREDENTIALS=true
HMS_ALLOWED_ORIGIN_PRIMARY=http://localhost:3000
HMS_ALLOWED_ORIGIN_SECONDARY=http://127.0.0.1:3000
HMS_PUBLIC_RATE_LIMIT_PER_MINUTE=30

# ── API URLs ──────────────────────────────────────────
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081/api/v1
API_BASE_URL_SERVER=http://localhost:8081/api/v1

# ── Demo Seed Data ────────────────────────────────────
HMS_RELEASE_DEMO_SEED_ENABLED=false
HMS_RELEASE_DEMO_FUTURE_SLOT_DAYS=14
HMS_RELEASE_DEMO_TARGET_PATIENTS=8
HMS_RELEASE_DEMO_TARGET_APPOINTMENTS=12
HMS_RELEASE_DEMO_TARGET_INVENTORY_ITEMS=8
HMS_RELEASE_DEMO_TARGET_AUDIT_LOGS=16
```
