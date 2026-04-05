# Discovery Report: Clinical Hardening

## Scope & Source Documents
- **Primary coverage:** `HMS_SRS.docx` clinical flows now live (public booking, nurse queue/check-in, doctor schedule/history/medical record). Hardening adds email-required booking, PDF download, reminders, security/test coverage.
- **System design:** `HMS_TDD.docx`, `HMS_UIUXSpec.docx` still apply; update Postman/README/history to align with implemented contracts.
- **Deployment/migrations/testing:** `HMS_ProjectPlan.docx`, `HMS_DBMigrationPlan.docx`, `HMS_IntegrationGuide.docx`, `HMS_DeploymentGuide.docx`, `HMS_TestPlan.docx`, `HMS_PostmanCollection.json` (synced in this wave).

## Key Modules
- **Backend (Spring Boot):** auth (JWT + RBAC), user/department/doctor/time slot/appointment/patient/medicalrecord/invoice/email/ai/chatbot/scheduler/shared packages aligned with doc tree and Flyway schema.
- **Frontend (React + Vite + Tailwind):** public pages (`/`, `/departments`, `/doctors`, `/booking`), public widgets (Hero, cards, booking steps), login + role-based dashboards, API client with Axios + token flow.
- **Infra:** Docker Compose with PostgreSQL 15, backend, frontend, seed data scripts, Swagger/OpenAPI surface, `.env.example`, Gmail/API keys placeholder.

## Constraints
- Clinical MVP exists; changes must preserve working flows while tightening contracts/security/tests.
- Target coverage ≥80% on touched areas; avoid destabilizing concurrency/perf until later wave.
- Multi-agent tracks must avoid file conflicts (docs/contracts vs backend vs frontend vs security).

## Immediate Deliverables
1. Updated `history/` artifacts for clinical hardening (this file, approach, execution plan, traceability).
2. Synced `docs/HMS_PostmanCollection.json` reflecting patientEmail booking, protected staff endpoints, PDF download.
3. README updates for backend-only login, seeded users, and E2E prerequisites.
