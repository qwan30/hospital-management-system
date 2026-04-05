# Execution Plan: Full SRS Release-Ready Wave

This plan supersedes the archived `history/hms-greenfield` materials and the earlier clinical-hardening-only scope.

## Objectives
- Complete the remaining SRS surface: expanded booking, Gemini analysis, Gmail automation, public content/news, chatbot widget, nurse/doctor completion, accountant/admin operations, and release hardening.
- Maintain multi-agent workflow with clear file scopes; prioritize security and test coverage.
- Keep documentation/Postman/history artifacts synced to the live contract.

## Tracks & Ownership
1. **Track 1 - Booking, AI, Email Backend** (`backend/core/{ai,appointment,patient,email,scheduler}`, `backend/shared/{ai,booking}`, `backend/api/{ai,appointment}`): expanded patient/contact contract, Gemini triage, Gmail confirmation/result/reminder delivery, reminder timing at 08:00 Asia/Saigon.
2. **Track 2 - Public Site & Booking Frontend** (`frontend/src/pages/public`, `frontend/src/components/public`, `frontend/src/lib/api.ts`): live public content/news, maps/social/privacy, chatbot widget, booking prefill, expanded booking form, preview/confirmation UX.
3. **Track 3 - Clinical Completion** (`backend/core/{medicalrecord,appointment,prescription}`, `backend/api/{medicalrecord,queue,schedule}`, `frontend/src/pages/{DoctorDashboardPage,NurseDashboardPage}.tsx`): doctor preview/finalize flow, nurse room/triage flow, notifications, clinical release hardening.
4. **Track 4 - Accountant/Admin Operations** (`backend/core/{invoice,admin,audit,content}`, `backend/api/{invoice,admin,content}`, `frontend/src/pages/{accountant,admin}/**`): export/report/audit coverage, rooms, schedule templates, special closures, system monitoring, content management.
5. **Track 5 - Verification & Docs** (`docs/**`, `history/**`, `README.md`, `frontend/e2e/**`, `backend/api/src/test/**`, `frontend/src/**/*.test.tsx`): Postman sync, traceability refresh, coverage ramp to 80%+, Playwright and integration verification.

## Milestones
- **Milestone 1 (DONE):** Clinical Workflow MVP shipped.
- **Milestone 2 (IN PROGRESS):** Full-SRS foundation opened: expanded booking contract, Gemini/Gmail integration path, public content/news APIs, admin operations foundation, doctor preview endpoint.
- **Milestone 3 (TARGET):** Full release-ready SRS completion with accountant/admin exports/audit, nurse room flow, chatbot production behavior, 80%+ coverage, and green E2E/integration gates.

## Verification
- Enforce TDD: tests before implementation, coverage >=80% per touched package.
- Backend: unit/integration tests for expanded booking, Gemini/Gmail integration seams, preview/finalize PDF behavior, reminders, exports, audit logs, and 401/403/error-envelope cases.
- Frontend: Vitest for public pages, chatbot, booking validation/prefill, staff flows, accountant/admin pages; Playwright happy-path and role-negative flows.
- Document assumptions/conflicts in `traceability-matrix.md` as the release-ready wave progresses.
