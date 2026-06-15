# Changelog

All notable changes to the Hospital Management System.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [RC 1.0] — 2026-06-14

### Added
- 7 end-to-end clinical workflows: booking, intake/queue, consultation, pharmacy, billing, patient portal, administration
- 36 RBAC permissions across 7 user roles (ADMIN, DOCTOR, NURSE, RECEPTIONIST, PHARMACIST, ACCOUNTANT, PATIENT)
- AES-GCM encryption for patient identifiers (CCCD/CMND) with SHA-256 hashed indexing
- JWT authentication with httpOnly refresh cookie rotation (15-min access, 7-day refresh)
- Lot-level pharmacy inventory tracking with FIFO expiration management
- Automated invoice generation from service pricing rules
- E-prescription PDF generation via Apache PDFBox 3.0.4
- Patient portal with claim-based access, appointments, lab results, and messages
- Gmail API integration for appointment reminders
- Prometheus metrics, Grafana dashboards, Loki log aggregation, Tempo distributed tracing (optional overlay)
- Release demo seed data for cross-role UAT validation
- Interactive real-user E2E test suite with API-based auth + addInitScript session injection

### Testing
- 148 backend integration tests (JUnit 5 + Testcontainers)
- 184 Playwright E2E CI scenarios covering RBAC, clinical workflows, and click-path safety
- 68 interactive real-user E2E checks across 9 staff roles and 6 patient accounts (100% pass)
- 80.48% frontend branch coverage via Vitest
- 25 Playwright spec files with page object models
- 4 CI/CD GitHub Actions workflows (CI, CD, rollback, security scan)

### Fixed
- Demo account credentials documented: nurse is `nurse@hospital.vn` (not `nurse1@`), patient portal uses `@example.com` domain
- Session storage injection format aligned with `persistSession` (separate keys, not JSON blob)
- CSS selectors widened in interactive tests to match design-token based UI components

### Security
- PHI encryption at rest with AES-GCM ([ADR-004](docs/04-architecture/adr/ADR-004-phi-encryption.md))
- JWT stateless auth with httpOnly refresh cookies ([ADR-003](docs/04-architecture/adr/ADR-003-jwt-auth.md))
- Method-level @PreAuthorize RBAC with 36 granular permissions
- Sliding-window rate limiting on public endpoints (configurable, default 30/min)
- CORS configuration via environment variables
- Full audit trail logging for all state-changing operations
- Authorization denial monitoring with Prometheus metrics
- OWASP Dependency Check + TruffleHog + Trivy container scanning

### Architecture
- Domain-Driven Design modular monolith with 17 bounded contexts ([ADR-001](docs/04-architecture/adr/ADR-001-modular-monolith.md))
- Repository interfaces in domain layer enforcing Dependency Inversion ([ADR-002](docs/04-architecture/adr/ADR-002-repositories-in-domain.md))
- 5 Maven modules: domain → infrastructure → application → controller → start
- Next.js 16 App Router with 72 page files across staff, admin, patient portal, and public routes
- PostgreSQL 15 with pgvector, 35 tables, 26 indexes, 20 Flyway migrations
