# HMS Intern Onboarding Pack

This folder is the implementation of the repo-verified onboarding blueprint for the Hospital Management System.

## Current Repo Truth
- Backend is the primary executable surface today. It is a Spring Boot multi-module project split into `backend/shared`, `backend/core`, and `backend/api`.
- Frontend exists as a Vite/React workspace with an intended stack, but `frontend/src/main.ts` is still starter content rather than a hospital UI.
- GitNexus is available and currently up to date for the indexed repo name `hospital-management-system`.
- Baseline verification is not fully green:
  - `mvn test` currently fails in `backend/core/src/test/java/com/hospital/core/vitalsigns/VitalSignsServiceTest.java`.
  - `npm run build` currently fails because `frontend/tsconfig.json` still uses the deprecated `baseUrl` option under TypeScript 6.
  - Docker runtime verification could not be completed in this environment because the Docker daemon was unavailable.

## Study Order
1. [00-baseline-reality-check.md](./00-baseline-reality-check.md)
2. [01-product-model-and-glossary.md](./01-product-model-and-glossary.md)
3. [02-architecture-and-repo-map.md](./02-architecture-and-repo-map.md)
4. [03-domain-cards.md](./03-domain-cards.md)
5. [04-runtime-golden-flows.md](./04-runtime-golden-flows.md)
6. [05-schema-timeline.md](./05-schema-timeline.md)
7. [06-security-and-ops-quick-reference.md](./06-security-and-ops-quick-reference.md)
8. [07-test-truth-map.md](./07-test-truth-map.md)
9. [08-frontend-integration-readiness.md](./08-frontend-integration-readiness.md)
10. [09-endpoint-role-matrix.md](./09-endpoint-role-matrix.md)
11. [10-troubleshooting-and-first-ticket-ladder.md](./10-troubleshooting-and-first-ticket-ladder.md)
12. [11-comprehension-check.md](./11-comprehension-check.md)

## What This Pack Covers
- Product model, actors, and bounded contexts.
- Backend module map, controller inventory, and GitNexus navigation workflow.
- Domain cards for every first-party surface that currently matters to system behavior.
- Eight golden flows traced from API entry to service/data side effects.
- Flyway migration timeline from `V1` through `V10`.
- Security, auth, patient identifier, and integration safeguards.
- Current test truth, baseline red items, and frontend integration readiness.
- Troubleshooting checklist, starter tickets, and a comprehension gate for mentor review.

## GitNexus Quick Start
- Check freshness: `npx gitnexus status`
- Search by concept: `npx gitnexus query -r hospital-management-system "<domain concept>"`
- Deep-dive a method: `npx gitnexus context -r hospital-management-system -f "<path/to/File.java>" "<methodName>"`

Always pass `-r hospital-management-system` in this local environment because more than one repo is indexed.
