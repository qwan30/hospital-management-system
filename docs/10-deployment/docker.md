# Docker Configuration

## Overview

The project uses Docker Compose to orchestrate three core services (PostgreSQL, Spring Boot backend, Next.js frontend) with an optional observability overlay. Images are published to the GitHub Container Registry under `ghcr.io/tranhquan099-commits/hospital-management-system`.

## File Structure

```
hospital-management-system/
├── docker-compose.yml               # Core services
├── docker-compose.observability.yml # Optional observability stack
├── backend/
│   └── Dockerfile                   # Multi-stage Spring Boot build
├── web/
│   └── Dockerfile                   # Multi-stage Next.js build
└── infra/
    └── observability/
        ├── prometheus.yml
        ├── tempo.yml
        ├── loki.yml
        ├── promtail.yml
        ├── otel-collector.yml
        └── grafana/
            ├── provisioning/
            └── dashboards/
```

## Docker Compose: Core Services

**File:** `docker-compose.yml`

### postgres

```yaml
postgres:
  image: pgvector/pgvector:pg15
  environment:
    POSTGRES_DB: ${POSTGRES_DB:-hospital_db}
    POSTGRES_USER: ${POSTGRES_USER:-hospital_user}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  ports:
    - "${HMS_POSTGRES_HOST_PORT:-5432}:5432"
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-hospital_user} -d ${POSTGRES_DB:-hospital_db}"]
    interval: 10s
    timeout: 5s
    retries: 10
  volumes:
    - postgres-data:/var/lib/postgresql/data
```

- Uses the `pgvector` extension image for vector similarity search support
- Health check uses `pg_isready` with 10-second intervals and 10 retries
- Data persists in the named volume `postgres-data`

### backend

```yaml
backend:
  image: ghcr.io/.../backend:latest
  build:
    context: ./backend
  depends_on:
    postgres:
      condition: service_healthy
  ports:
    - "${HMS_BACKEND_HOST_PORT:-8081}:8081"
```

- Depends on PostgreSQL being healthy (not just started)
- Exposes port 8081 internally, configurable host port via `HMS_BACKEND_HOST_PORT`
- All environment variables use `${VAR:-default}` syntax for safe defaults

### frontend

```yaml
frontend:
  image: ghcr.io/.../frontend:latest
  build:
    context: ./web
    dockerfile: Dockerfile
    args:
      NEXT_PUBLIC_API_BASE_URL: ${NEXT_PUBLIC_API_BASE_URL:-http://localhost:8081/api/v1}
  healthcheck:
    test: ["CMD-SHELL", "curl -sSf http://localhost:3000 > /dev/null || exit 1"]
    interval: 15s
    timeout: 5s
    retries: 5
    start_period: 30s
```

- Build arg `NEXT_PUBLIC_API_BASE_URL` passed at build time for the Next.js client
- Health check has a 30-second start period to account for cold starts

## Backend Dockerfile

**File:** `backend/Dockerfile`

Multi-stage build using Maven for compilation and a minimal JRE runtime.

### Stage 1: Build

```dockerfile
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /workspace

# Cache layer: copy POMs first to leverage Docker layer caching
COPY pom.xml pom.xml
COPY domain/pom.xml domain/pom.xml
COPY infrastructure/pom.xml infrastructure/pom.xml
COPY application/pom.xml application/pom.xml
COPY controller/pom.xml controller/pom.xml
COPY start/pom.xml start/pom.xml

# Copy source code
COPY domain/src domain/src
COPY infrastructure/src infrastructure/src
COPY application/src application/src
COPY controller/src controller/src
COPY start/src start/src

# Build (skip tests — tests run in CI before image build)
RUN mvn -q -pl start -am package -DskipTests
```

Dependency resolution order:
- Multi-module Maven project: domain, infrastructure, application, controller, start
- POMs copied first so dependency resolution is cached across builds
- Final artifact: `start/target/start-0.1.0-SNAPSHOT.jar`

### Stage 2: Runtime

```dockerfile
FROM eclipse-temurin:17-jre
WORKDIR /app

# Install fontconfig for PDF/image generation
RUN apt-get update \
    && apt-get install -y --no-install-recommends fontconfig fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /workspace/start/target/start-0.1.0-SNAPSHOT.jar app.jar

EXPOSE 8081 8082

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

- Exposes ports 8081 (API) and 8082 (management/actuator, used with observability)
- Includes fontconfig and DejaVu fonts for server-side PDF/image rendering

## Frontend Dockerfile

**File:** `web/Dockerfile`

Three-stage build for optimal image size and caching.

### Stage 1: Dependencies

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
```

Clean install using `npm ci` for deterministic builds.

### Stage 2: Build

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8081/api/v1
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
RUN npm prune --omit=dev
```

- Telemetry disabled for CI
- Build arg for API base URL (must match runtime environment)
- Dev dependencies pruned after build to reduce image size

### Stage 3: Runner

```dockerfile
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./next.config.ts

EXPOSE 3000
CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0", "--port", "3000"]
```

- Only production artifacts are copied to the final image
- Explicitly binds to `0.0.0.0` for container networking

## Health Check Configuration

| Service | Command | Interval | Timeout | Retries | Start Period |
|---------|---------|----------|---------|---------|--------------|
| postgres | `pg_isready -U hospital_user -d hospital_db` | 10s | 5s | 10 | — |
| frontend | `curl -sSf http://localhost:3000 > /dev/null` | 15s | 5s | 5 | 30s |

The backend does not define its own health check; its dependency on PostgreSQL is declared via `depends_on` with `condition: service_healthy`.

## Volume Management

### Core Volumes

| Volume Name | Container Mount | Service |
|-------------|-----------------|---------|
| `postgres-data` | `/var/lib/postgresql/data` | postgres |

### Observability Volumes

| Volume Name | Container Mount | Service |
|-------------|-----------------|---------|
| `prometheus-data` | `/prometheus` | prometheus |
| `grafana-data` | `/var/lib/grafana` | grafana |
| `tempo-data` | `/tmp/tempo` | tempo |
| `loki-data` | `/loki` | loki |

All volumes are declared as named volumes at the bottom of their respective compose files.

## Network Configuration

All services run on the default bridge network created by Docker Compose. Services communicate via service name:
- Backend connects to `postgres:5432`
- Frontend sends API requests to `backend:8081`
- Observability services connect via service names (e.g., `otel-collector`, `prometheus`)

## Image Tags

Images are tagged with both `:latest` and `:{sha}` (full commit SHA) when pushed:

```
ghcr.io/tranhquan099-commits/hospital-management-system/backend:latest
ghcr.io/tranhquan099-commits/hospital-management-system/backend:abc123def456...
ghcr.io/tranhquan099-commits/hospital-management-system/frontend:latest
ghcr.io/tranhquan099-commits/hospital-management-system/frontend:abc123def456...
```

The `:{sha}` tag enables precise rollbacks to any deployed version.
