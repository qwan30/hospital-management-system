# Baseline Reality Check

## Environment Snapshot
- Audit date: `2026-04-19`
- Repo root: `D:\projects\hospital-management-system`
- Indexed GitNexus repo name: `hospital-management-system`
- Backend stack: Java 17, Spring Boot 3.3, Maven multi-module project
- Database target: PostgreSQL 15 with `pgvector`
- Frontend stack target: React 19 + Vite 8 + TypeScript 6 + Tailwind 4

## Command Outcomes

| Check | Command | Result | Notes |
| --- | --- | --- | --- |
| GitNexus freshness | `npx gitnexus status` | Pass | Indexed commit and current commit both matched `5e14f5b`. |
| Backend tests | `mvn test` from `backend/` | Fail | Fails during test compilation in `backend/core/src/test/java/com/hospital/core/vitalsigns/VitalSignsServiceTest.java`. |
| Frontend build | `npm run build` from `frontend/` | Fail | TypeScript 6 rejects `baseUrl` in `frontend/tsconfig.json` unless the repo is updated or the deprecation is silenced. |
| Docker bring-up | `docker compose up -d postgres backend` | Blocked | Docker Desktop daemon was not available in this environment. |
| Backend artifact-only package | `mvn -q -pl api -am package '-Dmaven.test.skip=true'` | Pass | This is the current workaround when a local backend artifact is needed before test debt is fixed. |

## Observed Baseline Gaps
- `VitalSignsServiceTest` is out of sync with the current `AppointmentVitalSignsEntity` shape:
  - test calls package-private `prePersist()`
  - test uses outdated field types
  - test expects `createdAt` and `updatedAt` setters that the entity no longer exposes
- `frontend/src/main.ts` is still the Vite starter page, so frontend learning should be contract-first rather than runtime-first.
- `frontend/tsconfig.json` still uses:
  - `"baseUrl": "."`
  - `"paths": { "@/*": ["./src/*"] }`
  This still works conceptually for Vite aliasing, but TypeScript 6 flags the configuration as deprecated.
- A direct text scan of `backend/api/src/main/resources/db/migration/V1...V10` did not find a migration for the table `appointment_vital_signs`, even though:
  - `backend/core/src/main/java/com/hospital/core/appointment/AppointmentVitalSignsEntity.java`
  - `backend/core/src/main/java/com/hospital/core/appointment/AppointmentVitalSignsRepository.java`
  - `backend/core/src/main/java/com/hospital/core/vitalsigns/VitalSignsService.java`
  all expect it to exist.

## Safe Setup Checklist For An Intern
- Install Java 17 or newer.
- Install Maven 3.9 or newer.
- Install Docker Desktop and confirm the daemon is running.
- Keep Node and npm available for the frontend workspace even though the real UI is not implemented yet.
- Confirm GitNexus is installed and the repo remains indexed.

## Recommended Bring-Up Procedure
1. Check GitNexus freshness:
   - `npx gitnexus status`
2. Start Docker Desktop and verify the daemon is healthy.
3. Start PostgreSQL:
   - `docker compose up -d postgres`
4. Build the backend module graph:
   - `cd backend`
   - `mvn -q -pl api -am package '-Dmaven.test.skip=true'`
5. Run the backend:
   - `mvn spring-boot:run -pl api -DskipTests`
6. Open:
   - Swagger UI: `http://localhost:8080/swagger-ui/index.html`
   - Health endpoint: `http://localhost:8080/actuator/health`
7. Treat the frontend as optional until real app code exists.

## Known Working Seeded Accounts
- `doctor1@hospital.vn` / `Doctor@1234`
- `doctor2@hospital.vn` / `Doctor@1234`
- `nurse@hospital.vn` / `Nurse@1234`
- `accountant@hospital.vn` / `Acc@1234`
- `admin@hospital.vn` / `Admin@1234`
- Patient portal seed:
  - email: `patient@example.com`
  - password: `Patient@1234`

## What To Trust vs What To Verify
- Trust:
  - controller and service code
  - shared DTO contracts
  - current GitNexus index
  - integration and unit tests that still compile
- Verify before relying on it:
  - any runtime assumption that depends on Docker
  - vital-signs persistence schema until the table mismatch is resolved
  - frontend deliverability claims in docs that assume more UI implementation than the repo currently contains
