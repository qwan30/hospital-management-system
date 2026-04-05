# Execution Plan: HMS Greenfield

## Objectives
- Deliver a runnable HMS stack (React + Spring Boot + PostgreSQL + Docker) covering docs-defined features.
- Maintain multi-agent workflow: Planner (history), Track A–E aligned with plan.
- Keep documentation/test artifacts updated in sync with implementation.

## Tracks & Ownership
1. **Track A – Foundation** (`backend/`, `frontend/`, `infra/` root files): set up scaffolds, JWT auth, RBAC, `.env.example`, Docker Compose, Swagger, shared tokens/styles. Start with `planning` artifacts, then implement first public APIs.
2. **Track B – Public/Booking** (`backend/{department,doctor,timeslot,appointment,ai}`, `frontend/public routes`): implement booking flow, AI symptom analysis, Gmail confirmation, slot locking, booking success page.
3. **Track C – Clinical Staff** (`backend/{medicalrecord,email,scheduler}`, `frontend/doctor,nurse dashboards`): doctor schedule calendar, nurse queue/check-in, medical record persistence, prescription PDF, follow-up job.
4. **Track D – Finance/Admin** (`backend/{invoice,service_pricing,user/admin,stats}`, `frontend/accountant/admin dashboards`): invoices/reports/pricing, staff management, admin stats.
5. **Track E – Quality/Integrations** (`tests/`, docs sync, chatbot, Postman): verification-loop, Playwright flows, load tests, chatbot read models, docs updates.

## Milestones
- **Milestone 1:** Planning artifacts + foundation scaffolds up (history/…) and base backend/frontend modules in place.
- **Milestone 2:** First API contract stable (auth + public endpoints) with tests + Postman references.
- **Milestone 3:** Booking + staff demos wired and UI flows instrumented.
- **Milestone 4:** Finance/admin flows implemented + dashboards.
- **Milestone 5:** Chatbot/integration/test/performance wave complete, `docker compose up` verified, docs aligned.

## Verification
- Enforce TDD: tests before implementation, coverage ≥80%.
- Run backend unit/integration tests (Spring Boot + Testcontainers) per wave.
- Run frontend unit and Playwright E2E suites for critical flows.
- Performance test booking API targeting `p95 < 500ms` for 50 concurrent users.
- Document every assumption/conflict in `traceability-matrix.md`.
