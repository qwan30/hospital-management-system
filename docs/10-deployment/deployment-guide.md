# Deployment Guide

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Quick Start (Docker Compose)](#2-quick-start-docker-compose)
3. [Development Setup](#3-development-setup)
4. [Docker Services](#4-docker-services)
5. [Environment Variables](#5-environment-variables)
6. [Demo Seed Data](#6-demo-seed-data)
7. [Observability Stack](#7-observability-stack)
8. [Backup and Restore](#8-backup-and-restore)
9. [Deployment to a VPS](#9-deployment-to-a-vps)
10. [CI/CD Pipeline](#10-cicd-pipeline)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Prerequisites

| Dependency | Minimum Version | Notes |
|------------|-----------------|-------|
| Java | 17+ | Temurin JDK recommended; required for backend development |
| Node.js | 22+ | Required for frontend development; older versions may work but are not tested |
| Docker Desktop | Latest | Required for Docker Compose deployment on Windows / macOS |
| Docker Engine + Compose | Latest | Required for Docker Compose deployment on Linux |
| Maven | 3.9+ | Bundled in the project; used via `mvn` commands |

**Optional:**

| Tool | Purpose |
|------|---------|
| PowerShell 5.1+ | Running `backend/run.ps1` on Windows |
| Git | Cloning the repository |

---

## 2. Quick Start (Docker Compose)

The fastest way to run the full HMS stack is with Docker Compose.

### Step 1 -- Clone the repository

```bash
git clone https://github.com/tranhquan099-commits/hospital-management-system.git
cd hospital-management-system
```

### Step 2 -- Create the environment file

```bash
cp .env.example .env
```

Edit the `.env` file and set the three required secrets (see [Section 5.1](#51-required-variables)):

- `POSTGRES_PASSWORD` -- database password
- `JWT_SECRET` -- JWT signing key (minimum 32 characters)
- `PATIENT_IDENTIFIER_SECRET` -- PHI encryption key (minimum 32 characters, distinct from `JWT_SECRET`)

### Step 3 -- Start all services

```bash
docker compose up -d
```

This starts three services in order:

1. **postgres** -- database with health check (10-second polling, 10 retries)
2. **backend** -- Spring Boot API on port 8081 (waits for postgres to be healthy)
3. **frontend** -- Next.js production server on port 3000 (waits for backend)

### Step 4 -- Verify health

```bash
curl http://localhost:8081/api/v1/public/health
```

Expected response: `{"status":"UP"}` or a similar health envelope.

### Step 5 -- Access the application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8081/api/v1 |
| Swagger UI | http://localhost:8081/swagger-ui |
| Actuator Health | http://localhost:8081/actuator/health |

### Step 6 -- Log in with demo accounts

See the full reference at [demo-accounts-and-seed-data.md](../reference/demo-accounts-and-seed-data.md). Accounts created on first startup:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@hospital.vn` | `Admin@1234` |
| Doctor | `doctor1@hospital.vn` | `Doctor@1234` |
| Nurse | `nurse@hospital.vn` | `Nurse@1234` |
| Receptionist | `receptionist@hospital.vn` | `Reception@1234` |
| Patient Portal | `patient@example.com` | `Patient@1234` |

### Step 7 -- Stop all services

```bash
docker compose down
```

To also remove persistent volumes (deletes all data):

```bash
docker compose down -v
```

---

## 3. Development Setup

For active development, run the services natively instead of inside Docker containers.

### 3.1 Backend

**Option A -- PowerShell launcher (recommended on Windows):**

```powershell
cd backend
.\run.ps1
```

The `run.ps1` script loads `.env` from the project root, verifies the three required secrets, sets `SPRING_PROFILES_ACTIVE=dev`, auto-enables the non-billing demo seed, and launches the `start` Maven module with `mvn spring-boot:run`.

**Option B -- Maven directly:**

```bash
cd backend
mvn spring-boot:run -f start\pom.xml
```

**Option C -- Maven from project root:**

```bash
cd backend
mvn -pl start -am spring-boot:run
```

The backend starts on port `8081` with the `dev` Spring profile by default.

**Important:** The backend needs a running PostgreSQL instance. When developing natively, either:
- Use Docker for just the database: `docker compose up -d postgres` (from the project root), or
- Point the backend at a local PostgreSQL installation via environment variables.

### 3.2 Frontend

```bash
cd frontend
npm install       # or: npm ci for deterministic installs
npm run dev
```

The frontend starts on port `3000` with hot-reload enabled. API calls go to `http://localhost:8081/api/v1` as configured by `NEXT_PUBLIC_API_BASE_URL`.

### 3.3 Running Tests

**Backend tests (unit + integration with JaCoCo coverage):**

```bash
cd backend
mvn verify
```

**Frontend unit tests:**

```bash
cd frontend
npm run test:unit
npm run test:unit:coverage   # with coverage report
```

**Frontend E2E tests (Playwright):**

```bash
npm run test:e2e:ci          # CI suite (headless)
npm run test:e2e:ui          # UI-specific tests
npm run test:e2e:integrated  # Integrated flow tests
npm run test:e2e:headed      # Run with browser visible
```

---

## 4. Docker Services

### 4.1 Core Services

| Service | Image | Internal Port | Default Host Port | Health Check |
|---------|-------|---------------|-------------------|--------------|
| `postgres` | pgvector/pgvector:pg15 | 5432 | 5432 | `pg_isready` (10s interval, 5s timeout, 10 retries) |
| `backend` | ghcr.io/.../backend:latest | 8081 | 8081 | Depends on postgres healthy |
| `frontend` | ghcr.io/.../frontend:latest | 3000 | 3000 | `curl localhost:3000` (15s interval, 5 retries, 30s start period) |

### 4.2 Service Dependency Chain

```
postgres (healthy) ---> backend ---> frontend
```

Docker Compose enforces this via `depends_on` with `condition: service_healthy` for the postgres-to-backend link.

### 4.3 Volumes

| Volume Name | Container Mount | Service | Purpose |
|-------------|-----------------|---------|---------|
| `postgres-data` | `/var/lib/postgresql/data` | postgres | Persistent database storage |

The volume is a named Docker volume declared at the bottom of `docker-compose.yml`. It survives container restarts and `docker compose down` (without `-v`).

### 4.4 Image Tags

Images are published to `ghcr.io/tranhquan099-commits/hospital-management-system` with two tags:

- `:latest` -- most recent CI build on the default branch
- `:{sha}` -- full commit SHA for precise rollbacks

```bash
# Pull specific versions
docker pull ghcr.io/tranhquan099-commits/hospital-management-system/backend:abc123def...
docker pull ghcr.io/tranhquan099-commits/hospital-management-system/frontend:abc123def...
```

### 4.5 Host Port Mapping

All host ports are configurable via `.env` variables with safe defaults:

| Variable | Default | Maps To |
|----------|---------|---------|
| `HMS_POSTGRES_HOST_PORT` | 5432 | PostgreSQL |
| `HMS_BACKEND_HOST_PORT` | 8081 | Backend API |
| `HMS_FRONTEND_HOST_PORT` | 3000 | Frontend |

When changing `HMS_BACKEND_HOST_PORT`, also update `NEXT_PUBLIC_API_BASE_URL` to reflect the new port before building the frontend image.

### 4.6 Backend Dockerfile

**File:** `backend/Dockerfile`

Multi-stage build:
- **Stage 1 (build):** Uses `maven:3.9.9-eclipse-temurin-17`. POMs are copied first to leverage Docker layer caching, then source code. Produces `start/target/start-0.1.0-SNAPSHOT.jar`.
- **Stage 2 (runtime):** Uses `eclipse-temurin:17-jre`. Installs `fontconfig` and `fonts-dejavu-core` for server-side PDF/image generation. Exposes ports 8081 (API) and 8082 (management/actuator for observability).

### 4.7 Frontend Dockerfile

**File:** `frontend/Dockerfile`

Three-stage build:
- **Stage 1 (deps):** `node:22-alpine`, runs `npm ci` on `package.json` and `package-lock.json`.
- **Stage 2 (build):** Copies node_modules, builds with `npm run build`, prunes dev dependencies. Build arg `NEXT_PUBLIC_API_BASE_URL` is baked into the client bundle.
- **Stage 3 (runner):** Only production artifacts (.next, node_modules, public, config). Binds to `0.0.0.0:3000`.

For complete Dockerfile details, see [docker.md](./docker.md).

---

## 5. Environment Variables

The authoritative source of environment variable defaults is `.env.example` in the project root. Copy it to `.env` and edit the values for your environment.

A full reference is available in [env-variables.md](./env-variables.md). This section summarizes the key groups.

### 5.1 Required Variables

These have no defaults. The backend refuses to start if they are missing:

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_PASSWORD` | PostgreSQL database password | `my-secure-password` |
| `JWT_SECRET` | JWT signing key (minimum 32 characters) | `replace-with-a-random-32-character-secret` |
| `PATIENT_IDENTIFIER_SECRET` | Encryption key for PHI (minimum 32 characters, must differ from `JWT_SECRET`) | `replace-with-a-different-random-32-character-secret` |

### 5.2 Database

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_DB` | `hospital_db` | Database name |
| `POSTGRES_USER` | `hospital_user` | Database user |

### 5.3 JWT Authentication

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_EXPIRATION_MS` | `900000` | Access token lifetime (15 minutes) |
| `JWT_REFRESH_EXPIRATION_MS` | `604800000` | Refresh token lifetime (7 days) |

### 5.4 CORS and Security

| Variable | Default | Description |
|----------|---------|-------------|
| `HMS_ALLOW_CREDENTIALS` | `true` | Allow credentials in CORS |
| `HMS_ALLOWED_ORIGIN_PRIMARY` | `http://localhost:3000` | Primary CORS origin |
| `HMS_ALLOWED_ORIGIN_SECONDARY` | `http://127.0.0.1:3000` | Secondary CORS origin |
| `HMS_PUBLIC_RATE_LIMIT_PER_MINUTE` | `30` | Rate limit on public endpoints (requests/minute) |

### 5.5 API Base URL

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8081/api/v1` | Client-side API URL (baked into the frontend build) |
| `API_BASE_URL_SERVER` | `http://localhost:8081/api/v1` | Server-side API URL (SSR/Next.js) |

### 5.6 Gmail Integration

Optional -- emails degrade gracefully when disabled:

| Variable | Default | Description |
|----------|---------|-------------|
| `GMAIL_ENABLED` | `false` | Enable/disable email sending |
| `GMAIL_CLIENT_ID` | -- | Google OAuth 2.0 client ID |
| `GMAIL_CLIENT_SECRET` | -- | Google OAuth 2.0 client secret |
| `GMAIL_REFRESH_TOKEN` | -- | Google OAuth 2.0 refresh token |
| `GMAIL_SENDER_EMAIL` | `demo@hospital.vn` | From address for outgoing emails |

### 5.7 Hospital Information

Displayed on public pages, appointment confirmations, and PDF invoices:

| Variable | Default |
|----------|---------|
| `HOSPITAL_NAME` | `Hospital Management System` |
| `HOSPITAL_ADDRESS` | `123 ABC Street, District 1, Ho Chi Minh City` |
| `HOSPITAL_PHONE` | `028 1234 5678` |
| `HOSPITAL_MAPS_EMBED_URL` | Google Maps embed for Ho Chi Minh City |
| `HOSPITAL_PRIVACY_POLICY_URL` | `/privacy` |
| `HOSPITAL_FACEBOOK_URL` | `https://facebook.com` |
| `HOSPITAL_YOUTUBE_URL` | `https://youtube.com` |

### 5.8 Spring Boot and Observability

| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_PROFILES_ACTIVE` | `dev` | Active Spring profiles (dev, staging, prod, migrate) |
| `SERVER_PORT` | `8081` | Backend server port (inside container) |
| `MANAGEMENT_PORT` | `8081` | Management/actuator port |
| `MANAGEMENT_TRACING_ENABLED` | `true` | Enable OpenTelemetry tracing |
| `MANAGEMENT_TRACING_SAMPLING_PROBABILITY` | `1.0` | Trace sampling rate |
| `MANAGEMENT_OTLP_TRACING_ENDPOINT` | `http://localhost:4318/v1/traces` | OTLP HTTP endpoint |
| `HMS_STRUCTURED_LOGGING_ENABLED` | `true` | Enable structured JSON logging |

### 5.9 Host Ports

Change these only when local ports are already in use:

| Variable | Default | Service |
|----------|---------|---------|
| `HMS_BACKEND_HOST_PORT` | 8081 | Backend |
| `HMS_FRONTEND_HOST_PORT` | 3000 | Frontend |
| `HMS_POSTGRES_HOST_PORT` | 5432 | PostgreSQL |
| `HMS_PROMETHEUS_HOST_PORT` | 9090 | Prometheus |
| `HMS_GRAFANA_HOST_PORT` | 3001 | Grafana |
| `HMS_TEMPO_HOST_PORT` | 3200 | Tempo |
| `HMS_LOKI_HOST_PORT` | 3100 | Loki |
| `HMS_OTEL_GRPC_HOST_PORT` | 4317 | OpenTelemetry gRPC |
| `HMS_OTEL_HTTP_HOST_PORT` | 4318 | OpenTelemetry HTTP |
| `HMS_OTEL_METRICS_HOST_PORT` | 8889 | OpenTelemetry metrics |

### 5.10 Demo Seed Data

See [Section 6](#6-demo-seed-data) for details.

---

## 6. Demo Seed Data

The backend has two seed layers:

1. **Baseline seed** -- always runs on first startup when core tables are empty. Creates demo accounts, departments, rooms, and a baseline patient.
2. **Release demo seed** -- optional synthetic UAT top-up, disabled by default.

### 6.1 Enabling the Release Demo Seed

Set this variable in `.env` before starting the backend:

```bash
HMS_RELEASE_DEMO_SEED_ENABLED=true
```

The seed is idempotent: it upserts by natural keys (email, department name, room name, etc.) and will not duplicate data on subsequent starts.

### 6.2 Seed Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `HMS_RELEASE_DEMO_FUTURE_SLOT_DAYS` | 14 | Available public booking slots per doctor |
| `HMS_RELEASE_DEMO_TARGET_PATIENTS` | 8 | Synthetic patient records |
| `HMS_RELEASE_DEMO_TARGET_APPOINTMENTS` | 12 | Cross-status appointment records |
| `HMS_RELEASE_DEMO_TARGET_INVENTORY_ITEMS` | 8 | Inventory items with lots, movements, and alerts |
| `HMS_RELEASE_DEMO_TARGET_AUDIT_LOGS` | 16 | Audit log entries for admin monitoring |

### 6.3 Seeded Flow Coverage

| Flow | Content |
|------|---------|
| Public | Departments, doctors, homepage sections, news, available slots |
| Booking | Future slots on real doctors |
| Queue | Today appointments in CONFIRMED, CHECKED_IN, IN_PROGRESS states |
| Clinical | Completed appointments, vitals, medical records, prescriptions, follow-ups |
| Patient Portal | Second patient account `nguyen.van.clinical@example.com` (password `Patient@1234`) |
| Admin | Rooms, schedule templates, special closures, content/news, audit logs |
| Inventory | Medication, consumable, equipment, lab supply records with low-stock examples |
| Finance | Paid and unpaid invoices linked to synthetic appointments |

### 6.4 Verification

```bash
# Backend unit tests for seed properties and catalog
cd backend
mvn -pl application -Dtest=ReleaseDemoSeedPropertiesTest,ReleaseDemoSeedCatalogTest test

# E2E release data smoke tests (requires seeded backend)
cd frontend
$env:HMS_EXPECT_RELEASE_DEMO_SEED = "true"
npm run test:e2e:release-data
```

Full account reference: [demo-accounts-and-seed-data.md](../reference/demo-accounts-and-seed-data.md).

---

## 7. Observability Stack

An optional observability overlay adds metrics, tracing, and log aggregation. Configuration files live under `infra/observability/`.

### 7.1 Enabling Observability

```bash
docker compose -f docker-compose.yml -f docker-compose.observability.yml up -d
```

### 7.2 Services

| Service | Image | Default Port | Purpose |
|---------|-------|-------------|---------|
| `otel-collector` | otel/opentelemetry-collector-contrib:latest | 4317 (gRPC), 4318 (HTTP) | OpenTelemetry trace collection and export |
| `prometheus` | prom/prometheus:latest | 9090 | Metrics storage and querying |
| `grafana` | grafana/grafana:latest | 3001 | Dashboards and visualization |
| `tempo` | grafana/tempo:latest | 3200 | Distributed tracing backend (Grafana Tempo) |
| `loki` | grafana/loki:latest | 3100 | Log aggregation (Grafana Loki) |
| `promtail` | grafana/promtail:latest | -- | Docker log collection via Docker socket |

**Grafana defaults:** user `admin`, password `admin`.

### 7.3 Grafana Dashboards

Pre-provisioned dashboards in `infra/observability/grafana/dashboards/`:

| Dashboard | Focus |
|-----------|-------|
| `release-overview.json` | System-wide health and release status |
| `backend-api.json` | API request rates, latencies, error rates |
| `frontend-ux.json` | Frontend performance and errors |
| `audit-security.json` | Authentication, authorization, audit events |
| `queue-clinical-ops.json` | Queue and clinical operations metrics |
| `inventory-pharmacy.json` | Inventory and pharmacy metrics |
| `notifications.json` | Notification delivery metrics |

### 7.4 Datasource Configuration

Grafana is pre-configured with three datasources (`infra/observability/grafana/provisioning/datasources/datasources.yml`):

| Datasource | URL (internal) |
|------------|----------------|
| Prometheus | http://prometheus:9090 |
| Loki | http://loki:3100 |
| Tempo | http://tempo:3200 |

### 7.5 Observability Volumes

| Volume | Service | Mount |
|--------|---------|-------|
| `prometheus-data` | prometheus | `/prometheus` |
| `grafana-data` | grafana | `/var/lib/grafana` |
| `tempo-data` | tempo | `/tmp/tempo` |
| `loki-data` | loki | `/loki` |

### 7.6 Backend Changes with Observability

When the observability overlay is active, the backend:
- Exposes management endpoints on port 8082 (separated from the API port)
- Sends OpenTelemetry traces to `otel-collector:4318/v1/traces`
- Enables structured JSON logging
- Reports metrics to Prometheus via the OpenTelemetry collector

---

## 8. Backup and Restore

### 8.1 Database Backup

PostgreSQL data persists in the `postgres-data` Docker volume.

**Manual backup:**

```bash
docker compose exec postgres pg_dump -U hospital_user hospital_db > backup_$(date +%Y%m%d).sql
```

**Scheduled backup (Linux cron example):**

```cron
0 2 * * * cd /path/to/hospital-management-system && docker compose exec -T postgres pg_dump -U hospital_user hospital_db > /backups/hms_$(date +\%Y\%m\%d).sql
```

**Restore:**

```bash
docker compose exec -T postgres psql -U hospital_user hospital_db < backup_20260614.sql
```

### 8.2 Production Backup Recommendations

- Automate `pg_dump` to an off-server or cloud storage location (S3, Azure Blob, etc.)
- Configure PostgreSQL WAL archiving for point-in-time recovery (PITR) in critical environments
- Use cloud provider volume snapshots for the `postgres-data` Docker volume when running on a supported platform
- Keep at least 7 days of daily backups and 4 weekly backups

### 8.3 Configuration Backup

All deploy-time configuration is version-controlled in the repository:

| File | Content |
|------|---------|
| `docker-compose.yml` | Core service definitions |
| `docker-compose.observability.yml` | Observability service definitions |
| `.env` (NOT committed) | Environment-specific secrets and overrides |
| `infra/observability/` | Monitoring configuration, dashboards, provisioning |

The `.env` file is the only untracked configuration. Back it up separately or use a secret manager.

---

## 9. Deployment to a VPS

### 9.1 Manual Deployment

```bash
# On the VPS
mkdir -p ~/apps/hospital-management
cd ~/apps/hospital-management

# Copy docker-compose files and .env from your local machine
# scp docker-compose.yml user@host:~/apps/hospital-management/
# scp .env user@host:~/apps/hospital-management/

# Log in to GitHub Container Registry
echo $GHCR_PAT | docker login ghcr.io -u <username> --password-stdin

# Pull the latest images
docker compose pull

# Start all services
docker compose up -d

# Verify health
curl http://localhost:8081/api/v1/public/health
```

### 9.2 Using a Reverse Proxy (Nginx)

An Nginx configuration is provided at `infra/nginx/default.conf` for use as a reverse proxy:

```nginx
server {
  listen 80;
  server_name _;

  location /api/ {
    proxy_pass http://backend:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
  }
}
```

Adjust the `proxy_pass` target to match the actual backend port and add TLS termination with Certbot or a similar tool for production.

### 9.3 Database Migrations on Deployment

The CD pipeline uses the `migrate` Spring profile to run database migrations before starting the application. To run manually:

```bash
docker compose run --rm -e SPRING_PROFILES_ACTIVE=migrate backend
```

---

## 10. CI/CD Pipeline

The project uses GitHub Actions with four workflows. Full details are in [ci-cd.md](./ci-cd.md).

### 10.1 Continuous Integration (`ci.yml`)

**Triggers:** Push to `main`/`master`, pull requests (excluding documentation-only changes), manual dispatch.

**Key jobs:**
- **CodeQL** -- Static security analysis for Java/Kotlin and JavaScript/TypeScript
- **Backend test** -- Maven verify with Testcontainers (pgvector), JaCoCo coverage
- **Frontend test** -- ESLint, Vitest unit tests, Next.js build, Playwright E2E
- **Docker push** (non-PR only) -- Build, Trivy-scan, and push `:latest` and `:{sha}` tags to GHCR
- **CI summary** -- Generates a job summary with links to artifacts

### 10.2 Continuous Deployment (`cd.yml`)

**Triggers:** Automatic on CI workflow success (main/master), manual dispatch.

**Pipeline:**
1. Deploy to staging VPS (SCP compose files, pull images, run migrations, restart, 12-attempt smoke check)
2. Deploy to production VPS (same process, 15-attempt smoke check)
3. Notify via Slack

### 10.3 Rollback (`rollback.yml`)

**Triggers:** Manual dispatch only.

**Parameters:** environment (staging/production), backend tag, frontend tag, confirmation string `ROLLBACK`.

### 10.4 Security Scan (`security-scan.yml`)

**Triggers:** Weekly schedule (Monday 06:00 UTC), manual dispatch.

**Tools:** npm audit, OWASP Dependency Check, TruffleHog, Trivy.

---

## 11. Troubleshooting

### Backend cannot connect to the database

```
- Confirm docker compose up -d postgres succeeded and the container is running
- Confirm the backend uses the same credentials as defined in .env
- Confirm port 5432 is not already in use on the host
- Check backend logs: docker compose logs backend
```

### Frontend shows no live data

```
- Confirm the backend is running on http://localhost:8081
- Confirm NEXT_PUBLIC_API_BASE_URL matches the actual backend URL
- If using a non-default backend port, rebuild the frontend image with the corrected API URL
- Check frontend logs: docker compose logs frontend
- Open browser developer tools (F12) and check the Network tab for API request failures
```

### Swagger UI is empty or unavailable

```
- Confirm the backend started without errors
- Confirm the backend is reachable at http://localhost:8081
- Verify springdoc is not blocked by a local proxy or custom security configuration
```

### Gmail does not send

```
- Confirm GMAIL_ENABLED=true in .env
- Confirm all Gmail OAuth2 variables are set correctly
- Confirm the configured refresh token is still valid (OAuth tokens expire)
- The application handles email failures gracefully; no startup failure occurs
```

### Docker Compose fails on port conflict

```
- Check if another process is using the default port (5432, 8081, or 3000)
- Change the host port mapping in .env:
  HMS_BACKEND_HOST_PORT=8082
  HMS_FRONTEND_HOST_PORT=3001
- Also update NEXT_PUBLIC_API_BASE_URL if changing the backend port
```

### Grafana shows no data

```
- Confirm the observability overlay is started:
  docker compose -f docker-compose.yml -f docker-compose.observability.yml ps
- Check that the backend has traces and metrics flowing:
  docker compose logs backend | grep -i telemetry
- Verify Prometheus targets are up at http://localhost:9090/targets
- Grafana datasources should auto-connect to prometheus/loki/tempo by service name
```

### Rollback to a previous version

```bash
# On the VPS, with specific image tags
docker compose pull
docker compose up -d
```

For automated rollback through CI/CD, use the `rollback.yml` workflow (see [Section 10.3](#103-rollback)).
