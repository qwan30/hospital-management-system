# Known Issues and Limitations

**Last Updated:** 2026-06-14
**Release Label:** Release Candidate / Ship with fixes

---

This document tracks known issues, limitations, and planned improvements for the Hospital Management System. Each item has a unique OPEN-ID for cross-referencing in commits and PRs.

---

## OPEN-001: Patient Message Send (Frontend)

**Severity:** Medium
**Area:** Frontend — Patient Portal
**Status:** Open

The patient portal includes a "Send Message" UI element, but the underlying API endpoint is not fully integrated. Messages entered in the text field are not delivered anywhere (no persistent storage, no notification). This was originally intended as a patient-to-staff messaging feature but was deferred.

**Impact:** Users can type messages but they disappear on page reload. No data is lost or corrupted — the feature simply does nothing.

**Suggested fix:** Either remove the dead UI element or implement the backend messaging endpoint and wire it to the frontend form.

---

## OPEN-002: Self-Cancel / Self-Reschedule Appointment

**Severity:** Medium
**Area:** Backend — Appointment Domain
**Status:** Open

The frontend booking wizard allows patients to create appointments, but the corresponding cancel and reschedule operations for self-service (patient-initiated) are not implemented. Patients who need to change or cancel an appointment must contact staff.

- Backend: No API endpoints for patient-initiated cancel/reschedule exist
- Frontend: No UI in the patient portal for these actions
- Staff can cancel/reschedule from the staff dashboard

**Workaround:** Staff can cancel or reschedule appointments on behalf of patients.

---

## OPEN-003: Payment Gateway Integration

**Severity:** Low
**Area:** Full Stack — Booking Flow
**Status:** Open

The appointment booking flow does not include payment processing. Appointments are created without any fee collection. The system tracks insurance information but does not process payments or generate invoices.

**Note:** This is a known gap for production readiness if paid appointments are required. The current architecture treats HMS as an appointment scheduling system without financial transaction processing.

---

## OPEN-004: Drug and Allergy Management

**Severity:** Medium
**Area:** Backend — Medical Records Domain
**Status:** Open

The system lacks comprehensive drug and allergy management:
- No drug-drug interaction checking
- No allergy recording on patient records
- No medication prescription workflow
- Pharmacy inventory exists but with basic stock tracking only

**Impact:** The system cannot be used for clinical decision support related to medications. Appropriate for administrative scheduling, but not for clinical treatment workflows.

---

## OPEN-005: OWASP Dependency Check CVSS Threshold

**Severity:** Low
**Area:** CI/CD — Security Scanning
**Status:** Open (Informational)

The `security-scan.yml` workflow runs OWASP Dependency Check with `-DfailBuildOnCVSS=7` but uses `continue-on-error: true`, so the job never actually fails. Vulnerability reports are generated and uploaded but do not block the pipeline.

**Suggested fix:** Either remove `continue-on-error: true` and fail the build at CVSS >= 7, or raise the threshold if false positives are common. Alternatively, move to a review-on-report model with scheduled manual triage.

---

## OPEN-006: TruffleHog Only-Verified Mode

**Severity:** Low
**Area:** CI/CD — Security Scanning
**Status:** Open (Informational)

The TruffleHog secret scan runs with `--only-verified` flag, which only flags secrets that have been verified as active (e.g., by making a test API call). This reduces false positives but may miss leaked secrets that cannot be automatically verified.

**Suggested fix:** Consider running a separate pass without `--only-verified` on a less frequent schedule (e.g., monthly) and reviewing results manually.

---

## OPEN-007: CD Pipeline Frontend Smoke Check

**Severity:** Low
**Area:** CI/CD — Deployment
**Status:** Open

The CD pipeline smoke check only verifies the backend health endpoint (`/api/v1/public/health`). The frontend is not checked after deployment. A frontend deployment failure (e.g., missing build artifact, broken API URL) would only be detected when a user visits the site.

**Suggested fix:** Add a frontend smoke check step that curls the frontend URL (port 3000) and verifies a 200 response after deployment.

---

## OPEN-008: Rollback Database Migration Handling

**Severity:** High
**Area:** CI/CD — Rollback
**Status:** Open

The rollback workflow (`rollback.yml`) redeploys older Docker images but does not revert database migrations. If a rollback targets a version before a Flyway migration was applied, the database schema may be incompatible with the older backend code.

**Workaround:** Database rollbacks must be handled manually by running `flyway undo` or restoring from a database backup prior to triggering the rollback workflow.

**Suggested fix:** Integrate Flyway undo or backup-restore into the rollback workflow.

---

## OPEN-009: Observability Stack Not Scaled for Production

**Severity:** Low
**Area:** Infrastructure
**Status:** Open (Informational)

The observability stack (`docker-compose.observability.yml`) uses default/single-instance configurations for Prometheus, Grafana, Loki, and Tempo. These are suitable for development and staging but lack:
- High availability configuration
- Long-term storage backend for Loki (uses local filesystem)
- Retention policies beyond Prometheus's built-in 2-day retention
- Authentication (Grafana defaults to admin/admin)

**Suggested fix:** For production observability, consider managed services (Grafana Cloud, AWS Managed Prometheus) or deploy with proper HA configuration and persistent authentication.

---

## OPEN-010: E2E Tests Depend on External Services

**Severity:** Medium
**Area:** Testing — E2E
**Status:** Open

Several Playwright E2E tests depend on a running backend and database. This means:
- E2E tests cannot run in isolation without the full stack
- Test data persists between runs (no automatic cleanup)
- CI runs E2E against the production build, not against a dedicated test instance

**Suggested fix:** Either (a) implement API mocking for E2E tests to run independently, or (b) add test database setup/teardown steps to the CI E2E job.

---

## OPEN-011: No Rate Limiting on Authenticated Endpoints

**Severity:** Medium
**Area:** Backend — Security
**Status:** Open

Rate limiting is configured only for public endpoints via `HMS_PUBLIC_RATE_LIMIT_PER_MINUTE`. Authenticated endpoints (including admin and staff APIs) have no rate limiting, making them potentially vulnerable to brute force or DoS attacks by authenticated users.

**Suggested fix:** Add configurable rate limiting to authenticated endpoints, potentially with different tiers per role.

---

## OPEN-012: Missing Password Reset Flow

**Severity:** Medium
**Area:** Full Stack — Authentication
**Status:** Open

The authentication system supports login and registration but lacks a password reset flow. Users who forget their password cannot reset it without administrator intervention.

**Workaround:** An admin can manually update the user's password from the admin panel.

---

## Issue Summary

| OPEN-ID | Description | Severity | Area |
|---------|-------------|----------|------|
| OPEN-001 | Patient message send not wired | Medium | Frontend |
| OPEN-002 | No self-cancel/reschedule for patients | Medium | Backend |
| OPEN-003 | No payment gateway integration | Low | Full Stack |
| OPEN-004 | No drug/allergy management | Medium | Backend |
| OPEN-005 | OWASP check never fails CI | Low | CI/CD |
| OPEN-006 | TruffleHog only-verified mode | Low | CI/CD |
| OPEN-007 | No frontend smoke check in CD | Low | CI/CD |
| OPEN-008 | Rollback does not revert DB migrations | High | CI/CD |
| OPEN-009 | Observability not production-scaled | Low | Infrastructure |
| OPEN-010 | E2E tests depend on full stack | Medium | Testing |
| OPEN-011 | No rate limiting on auth endpoints | Medium | Backend |
| OPEN-012 | No password reset flow | Medium | Auth |

**High Severity (must fix before production):** 1
**Medium Severity (should fix):** 6
**Low Severity (nice to have):** 5
