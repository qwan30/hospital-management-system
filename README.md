# Hospital Management System

Clinical workflow MVP is shipped; this repository is now in the full-SRS release-ready execution wave, and the earlier `hms-greenfield` / clinical-hardening-only scope is superseded.

## Stack

- Frontend: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS
- Backend: Java 17 / Spring Boot 3.3 multi-module layout
- Database: PostgreSQL 15 with Flyway migrations
- Deployment: Docker Compose demo stack

## Source of Truth

Implementation follows the documentation priority below:

1. `HMS_SRS.docx`
2. `HMS_TDD.docx`
3. `HMS_ProjectPlan.docx`
4. `HMS_UIUXSpec.docx`
5. `HMS_DBMigrationPlan.docx`
6. `HMS_IntegrationGuide.docx`
7. `HMS_DeploymentGuide.docx`
8. `HMS_TestPlan.docx`
9. `HMS_PostmanCollection.json`
10. `HMS_UserManual.docx`

## Current Structure

- `docs/`: product, architecture, migration, integration, testing, and deployment documents
- `history/`: planning artifacts for the active full-SRS release-ready wave
- `frontend/`: Next.js frontend with `app/` routes and `features/` domain modules
- `backend/`: Spring Boot multi-module application
- `infra/`: container, reverse proxy, and deployment support files

## Local Setup

1. Copy `.env.example` to `.env`.
2. Populate database, JWT, Gemini, Gmail, and hospital profile values. Gemini/Gmail degrade gracefully in local dev when secrets are absent, but they are part of the active production path.
3. Start the stack with Docker Compose (`docker compose up --build`) and wait for backend health at `http://localhost:8080/actuator/health`.
4. Use backend-backed login only. Seeded demo users (email/password): `doctor1@hospital.vn` / `Doctor@1234`, `nurse@hospital.vn` / `Nurse@1234`, `admin@hospital.vn` / `Admin@1234`, `accountant@hospital.vn` / `Acc@1234`.
5. E2E prerequisites: frontend at `http://localhost:3000`, backend at `http://localhost:8080`, Playwright logs in via the backend only.

## Quality Gates

- 80%+ coverage across backend and frontend
- Booking flow prevents double-booking, requires patient email, and uses the expanded patient/contact booking contract
- Role-based access for doctor, nurse, accountant, and admin; protected endpoints reject missing/invalid/wrong-role tokens
- Gemini symptom analysis and Gmail delivery are active integration paths for the release-ready wave
- Docs and API contract stay synchronized (Postman + history updated per wave)
