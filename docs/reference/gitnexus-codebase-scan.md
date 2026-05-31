# GitNexus Codebase Scan

**Status:** code-intelligence snapshot for committed `HEAD` plus source metrics refreshed on 2026-05-31.
**Primary source:** GitNexus index for `hospital-management-system`, verified with source, config, and test inventories.

## 1. GitNexus Index

| Field | Current value |
| --- | --- |
| Repository | `D:\projects\hospital-management-system` |
| Indexed commit | `c2552311544ac16441e8a7d3af4f62d35dbb8a86` |
| Index freshness | up to date with the current commit |
| Indexed files | 705 |
| Graph nodes | 5,380 |
| Graph edges | 12,297 |
| Communities | 240 |
| Execution flows | 300 |
| Embeddings | 0 |

At refresh time, `master` was ahead of `origin/master` by 36 commits and the working tree contained the uncommitted W-01 lab-result creation slice. Treat the GitNexus graph as committed-HEAD evidence and the source metrics below as current local working-tree evidence, not a release tag.

## 2. Current Architecture Shape

The backend remains a five-module Maven reactor:

```text
domain <- infrastructure <- application
domain + application <- controller
domain + infrastructure + application + controller <- start
```

Key runtime boundaries:

| Area | Current source of truth |
| --- | --- |
| Spring Boot composition root | `backend/start` |
| Domain entities, enums, and DTO contracts | `backend/domain` |
| Repositories and infrastructure adapters | `backend/infrastructure` |
| Use-case services and orchestration | `backend/application` |
| REST controllers, filters, and web error handling | `backend/controller` |
| Canonical frontend | `web` |
| Prototype/reference frontend assets | `frontend` |

## 3. Graph Findings

GitNexus query and context passes show these central surfaces:

| Surface | Evidence |
| --- | --- |
| Staff authentication | `AuthController` exposes login, refresh, logout, refresh-cookie, clear-cookie, and cookie-read flows. |
| Patient authentication | `PatientAuthController` exposes claim, login, refresh, logout, refresh-cookie, clear-cookie, and cookie-read flows. |
| Security filters | `SecurityConfig` wires JWT authentication, rate limiting, authorization-denial audit logging, and shared security error responses. |
| Appointment and queue workflow | `AppointmentWorkflowService` is imported by `AppointmentController`, `QueueController`, and `ScheduleController`; GitNexus impact analysis reports 3 direct upstream dependents and LOW risk for the class-level blast radius. |
| Patient portal | `PatientPortalController` exposes overview, appointments, lab results, messages, profile read, and profile update surfaces. |
| Medical records | `MedicalRecordController` exposes create-record plus prescription PDF preview/download surfaces. |
| Inventory | `InventoryController` exposes item, lot, movement, alert, and movement-recording surfaces through read and write services. |
| Finance | `InvoiceController` exposes invoice list/create, payment recording, and voiding surfaces. |
| Seed data | `SeedDataService` owns default demo bootstrap data; `ReleaseDemoSeedService` and `ReleaseDemoSeedCatalog` own optional synthetic UAT/release-demo top-up data. |

## 4. Current Source Metrics

| Metric | Current value | Source |
| --- | --- | --- |
| Backend Maven modules | 5 | `backend/pom.xml` |
| Controller Java files | 41 | `backend/controller/src/main/java/com/hospital/api` |
| Method-level controller mappings | 117 | `@GetMapping`, `@PostMapping`, `@PutMapping`, `@PatchMapping`, `@DeleteMapping` annotations |
| Total controller mapping annotations | 148 | method-level mappings plus `@RequestMapping` annotations |
| Flyway migrations | 18, `V1` through `V18` | `backend/start/src/main/resources/db/migration` |
| Frontend page files | 72 | `web/src/app/**/page.tsx` |
| Frontend page/layout/route files | 78 | `web/src/app` |
| Backend test classes | 32 | `backend/application/src/test`, `backend/start/src/test` |
| Tracked Playwright specs | 24 | `git ls-files web/e2e/specs/*.ts` |
| Current working-tree Playwright specs | 24 | `web/e2e/specs/*.ts` |

## 5. Verification Commands

```powershell
npx.cmd gitnexus status
npx.cmd gitnexus query "production readiness verification repository status documentation" -r hospital-management-system
npx.cmd gitnexus query "release demo smoke test business flow test matrix" -r hospital-management-system
npx.cmd gitnexus context -r hospital-management-system AuthController
npx.cmd gitnexus context -r hospital-management-system PatientAuthController
npx.cmd gitnexus context -r hospital-management-system AppointmentWorkflowService
npx.cmd gitnexus context -r hospital-management-system InventoryController
npx.cmd gitnexus context ReleaseDemoSeedCatalog -r hospital-management-system
npx.cmd gitnexus context ReleaseDemoSeedIntegrationTest -r hospital-management-system
npx.cmd gitnexus impact -r hospital-management-system AppointmentWorkflowService
```

Use `npx.cmd gitnexus analyze` after committing code changes so the index continues to match the repository.
