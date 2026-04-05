# Traceability Matrix: Full SRS Release-Ready Wave

`history/hms-greenfield` is archived; this table tracks the active full-SRS release-ready wave.

| Document Section | Implementation Artifact | Tests/Verification |
| --- | --- | --- |
| SRS public site + booking | React public booking with query-prefill, expanded patient/contact form, live public content/news endpoints, chatbot widget, backend appointment API with nested address/contact contract | Vitest booking/public tests; Playwright booking happy path; backend booking/core tests |
| AI slot allocation | Gemini-backed symptom analysis with a local fallback heuristic | Backend unit tests for AI service; integration path verified via compile/runtime config |
| Email automation | Gmail-backed confirmation/result delivery and reminder scheduling at 08:00 Asia/Saigon on `followUpDate` | Backend core tests for reminder timing and email-triggering services |
| Clinical staff flows | Nurse check-in/queue baseline, doctor schedule/history, medical record creation, PDF preview endpoint, prescription PDF download | Frontend Vitest for nurse/doctor error paths; backend core tests for preview/finalize services |
| Accountant/Admin operations | Expanded admin UI/backend foundation for rooms, schedule templates, special closures, monitoring, public-content management; accountant UI prepared for exports/audit | Frontend Vitest for new admin/accountant surfaces; backend compile and service tests pending expansion |
| Security & auth | JWT filter + CORS config + RBAC-protected endpoints | Negative-path integration tests (missing/malformed/expired token, wrong role); envelope consistency assertions |
| DB migration plan | Flyway V1-V6 now include expanded booking, content/news, rooms, schedule templates, special closures, and operational flags | Migration validation and repository/entity coverage |
| Test plan / Postman | Postman refresh remains pending while code and history have moved to the full-SRS release-ready wave | Frontend unit + coverage runs; backend core tests; API integration still blocked by local Docker/Testcontainers |
| Deployment guide | Docker Compose, `.env.example`, README with seeded credentials and E2E prerequisites | `docker compose up --build`, health checks, README alignment |
| Project plan phases | Tracks now cover booking/AI/email, public site, clinical completion, accountant/admin operations, and verification/docs | Verification-loop per wave; history artifacts updated per milestone |
