# Traceability Matrix: HMS Greenfield

| Document Section | Implementation Artifact | Tests/Verification |
| --- | --- | --- |
| SRS public site + booking | React public routes + booking components + backend departments/doctors/appointments services | Vitest unit tests for forms, Playwright public booking flow, backend integration tests for booking/AI/slot locking |
| Technical design modules | Spring Boot multi-module packages + DTO/envelope contracts + Flyway schema | Spring unit + integration tests per module, JaCoCo coverage report |
| UI/UX spec (routes, tokens) | Tailwind design tokens, layouts, responsive styles, protected routes | Frontend snapshot/unit tests, responsive checks, accessibility audit |
| DB migration plan | Flyway V1 script + repositories/entities for departments/users/time_slots/etc. | Migration validation, schema introspection tests |
| Integration guide (Claude/Gmail) | Claude adapter service + Gmail OAuth service + env config | Mocked integration tests, e2e email confirmation check |
| Test plan / Postman | Backend tests, Playwright, k6 booking perf, Postman collection synced | Playwright runs, k6 script results, Postman validation |
| Deployment guide | Docker Compose, `.env.example`, README instructions, Swagger UI | `docker compose up --build`, health checks, docs updates |
| Project plan phases | Track waves (foundation, booking, staff, finance, quality) + planning artifacts | Verification-loop per wave, documentation sign-off per phase |
