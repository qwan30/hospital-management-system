# Tech Stack

## Backend

| Component | Technology | Version |
|-----------|-----------|---------|
| Language | Java (LTS) | 17 |
| Framework | Spring Boot | 3.3.5 |
| Build Tool | Maven (multi-module) | -- |
| Modules | domain, infrastructure, application, controller, start | -- |
| REST API | Spring Web | -- |
| API Documentation | SpringDoc OpenAPI (springdoc-openapi-starter-webmvc-ui) | 2.6.0 |
| Security | Spring Security + JJWT | 0.12.6 |
| ORM / Persistence | Spring Data JPA (Hibernate) | -- |
| Database | PostgreSQL (pgvector/pgvector:pg15 image) | 15 |
| Migrations | Flyway | V1 -- V20 (20 migrations) |
| Validation | Jakarta Validation (spring-boot-starter-validation) | -- |
| PDF Generation | Apache PDFBox | 3.0.4 |
| Email | Spring Boot Mail Starter (Gmail API, optional, disabled by default) | -- |
| JSON | Jackson | -- |
| Code Generation | Lombok | -- |
| Structured Logging | Logstash Logback Encoder | 8.0 |
| Testing | JUnit 5 + Mockito + Spring Boot Test + Testcontainers | 1.20.4 |
| Code Coverage | JaCoCo Maven Plugin | 0.8.12 |
| Metrics | Micrometer (Prometheus registry) | -- |
| Distributed Tracing | Micrometer Tracing Bridge (OpenTelemetry), OpenTelemetry OTLP Exporter (optional) | -- |

## Frontend

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | React | 19.2.4 |
| Framework | Next.js (App Router) | 16.2.6 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | 4 |
| CSS Animation | tw-animate-css | ^1.4.0 |
| UI Primitives | Base UI (@base-ui/react) | ^1.4.0 |
| Icons | Lucide React | ^1.8.0 |
| Utilities | class-variance-authority + clsx + tailwind-merge | 0.7.1 / 2.1.1 / 3.5.0 |
| AI Integration | @google/generative-ai | ^0.24.1 |
| Component Library | shadcn (via CLI) | ^4.3.0 |
| Unit Testing | Vitest | ^4.1.5 |
| E2E Testing | Playwright | ^1.59 |
| Component Testing | @testing-library/react | ^16.3.2 |
| Accessibility Audit | @axe-core/playwright | ^4.11.2 |
| Linting | ESLint (eslint-config-next) | ^9 |
| DOM Environment (tests) | jsdom | ^29.1.1 |

## Infrastructure

| Component | Technology | Details |
|-----------|-----------|---------|
| Container Runtime | Docker | -- |
| Orchestration | Docker Compose | 3 services (postgres, backend, frontend) |
| Container Registry | GitHub Container Registry (GHCR) | `ghcr.io/tranhquan099-commits/hospital-management-system/backend` / `.../frontend` |
| CI | GitHub Actions | ci.yml |
| CD | GitHub Actions | cd.yml |
| Rollback | GitHub Actions | rollback.yml |
| Security Scan | GitHub Actions | security-scan.yml |

## Observability (optional)

| Component | Technology | Details |
|-----------|-----------|---------|
| Metrics | Prometheus | via `docker-compose.observability.yml` |
| Dashboards | Grafana | via `docker-compose.observability.yml` |
| Log Aggregation | Loki + Promtail | via `docker-compose.observability.yml` |
| Distributed Tracing | Tempo | via `docker-compose.observability.yml` |
| Trace Collection | OpenTelemetry Collector | via `docker-compose.observability.yml` |

## Development Tools

| Tool | Purpose |
|------|---------|
| VS Code / IntelliJ IDEA | IDE |
| GitNexus | Code intelligence (call graph, impact analysis, refactoring) |
| CodeGraph | Code intelligence (knowledge graph, symbol search) |
| Claude Code (ECC) | AI-assisted development with agent infrastructure (`.agents/`) |
