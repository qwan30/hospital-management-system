# Testing Documentation

This folder groups verification and testing documentation.

Primary documents:

- [HMS Test Plan](../HMS_TestPlan.md)
- [HMS A-to-Z Business Flow Test Document](business-flow-test-matrix.md) - canonical BA/QA flow, module, exception, test matrix, and button/action inspection reference.
- [Release Observability Gate - 2026-06-06](release-observability-gate-2026-06-06.md) - local Prometheus/Grafana/OTel/Tempo/Loki gate and smoke evidence lane.
- [Full HMS Production Readiness Report - 2026-05-22](full-hms-production-readiness-report-2026-05-22.md) - current release-readiness verdict, executable gate evidence, waiver list, and next actions.
- [Full HMS Verification Report - 2026-05-21](full-hms-verification-report-2026-05-21.md) - earlier source, backend, frontend, Docker, Playwright, and BF status evidence retained for traceability.
- [Documentation Verification Checklist](../audits/verification-checklist.md)
- [Final Documentation Review Notes](../audits/final-documentation-review-notes.md)

Test claims should be verified against backend tests under `backend/application/src/test` and `backend/start/src/test`, frontend component tests under `frontend/src/**/__tests__`, and Playwright suites under `frontend/e2e`.
