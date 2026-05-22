# Testing Documentation

This folder groups verification and testing documentation.

Primary documents:

- [HMS Test Plan](../HMS_TestPlan.md)
- [HMS A-to-Z Business Flow Test Document](business-flow-test-matrix.md) - canonical BA/QA flow, module, exception, test matrix, and button/action inspection reference.
- [Full HMS Verification Report - 2026-05-22 final pass](full-hms-verification-report-2026-05-21.md) - latest source, backend, frontend, Docker, Playwright, BF status, and release-readiness evidence.
- [Documentation Verification Checklist](../audits/verification-checklist.md)
- [Final Documentation Review Notes](../audits/final-documentation-review-notes.md)

Test claims should be verified against backend tests under `backend/application/src/test` and `backend/start/src/test`, frontend component tests under `web/src/**/__tests__`, and Playwright suites under `web/e2e`.
