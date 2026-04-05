# Discovery Report: HMS Greenfield

## Scope & Source Documents
- **Primary coverage:** `HMS_SRS.docx` (functional scope, stakeholders, UX flows) → public site, booking flow, dashboards, integrations.
- **System design:** `HMS_TDD.docx` and `HMS_UIUXSpec.docx` (stack, module layout, route map, design tokens).
- **Deployment/migrations/testing:** `HMS_ProjectPlan.docx`, `HMS_DBMigrationPlan.docx`, `HMS_IntegrationGuide.docx`, `HMS_DeploymentGuide.docx`, `HMS_TestPlan.docx`, `HMS_PostmanCollection.json`.

## Key Modules
- **Backend (Spring Boot):** auth (JWT + RBAC), user/department/doctor/time slot/appointment/patient/medicalrecord/invoice/email/ai/chatbot/scheduler/shared packages aligned with doc tree and Flyway schema.
- **Frontend (React + Vite + Tailwind):** public pages (`/`, `/departments`, `/doctors`, `/booking`), public widgets (Hero, cards, booking steps), login + role-based dashboards, API client with Axios + token flow.
- **Infra:** Docker Compose with PostgreSQL 15, backend, frontend, seed data scripts, Swagger/OpenAPI surface, `.env.example`, Gmail/API keys placeholder.

## Constraints
- No existing code; must bootstrap entire repo while keeping docs as source of truth (stack, feature order, tests, deployment).
- Target coverage ≥80% despite doc referencing 70%.
- Must maintain multi-agent plan (foundation, booking, staff, finance, quality) even though tooling (bd/bv/dmux) absent locally.

## Immediate Deliverables
1. Planning artifacts in `history/` to feed orchestrator: discovery, approach, execution plan, traceability matrix.
2. Foundation wave scaffolds for backend, frontend, infra before moving into feature waves.
3. Traceable mapping from docs → implementation → tests.
