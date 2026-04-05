# Approach: HMS Greenfield

## Gap Analysis
| Area | Have | Need | Gap |
| --- | --- | --- | --- |
| Public booking | Docs (SRS, UI spec) | React/Vite pages + API clients | missing frontend scaffold |
| Backend core | Docs (TDD, DB Migration) | Spring Boot modules, Flyway, JWT, services | no repository or code |
| Integrations | Gmail/Claude guides | secure wrappers + test doubles | no implementation |
| QA & docs | Postman/Test plan | tests, verification loops, docs sync | absent automation artifacts |

## Recommended Approach
1. Build planning artifacts first to capture scope, risk, and traceability.
2. Foundation wave: scaffold backend (multi-module Spring Boot), frontend (Vite + Tailwind), and infra (Docker Compose, env files, Swagger, Flyway) using docs as blueprint.
3. Feature waves: booking, clinical staff, finance/admin, followed by quality/integration/hardening; each wave follows TDD, includes required tests, and updates docs/Postman.
4. Maintain a traceability matrix so every doc section triggers deliverables/tests.

## Alternatives
- **Incremental docs-to-code per module** – risk: lacks unified foundation and verification artifacts; would delay cross-cutting (tokens, Docker, tests).
- **Strict documentation review before coding** – risk: stalls implementation; instead align plan + execution w/ doc artifacts already created.

## Risk Map
| Item | Risk | Mitigation |
| --- | --- | --- |
| Full-stack bootstrap | HIGH | Build scaffold first (Plan/Approach), ensure docs capture requirements |
| Authentication + RBAC | MEDIUM | Apply springboot-security patterns, write JWT tests, enforce policy filters |
| AI/Mail integrations | MEDIUM | Plan test doubles, document env var expectations, include integration tests |
| Coverage mandate | MEDIUM | TDD workflow, verification-loop, JaCoCo/c8 |
