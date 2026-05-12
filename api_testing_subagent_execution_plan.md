# API Testing Subagent Execution Plan

Source plan: `api_testing_plan.md.resolved`

## Objective

Finish the comprehensive Spring Boot API integration testing plan without duplicating existing suites. The current repository already contains the planned integration test classes, so execution starts with verification, then fixes only the concrete gaps found by the test run or review.

## Subagent Model

### Subagent 1: Execution Worker

Role: implement and repair API integration test coverage.

Owned paths:

- `backend/start/src/test/java/com/hospital/api/`
- `backend/start/src/test/resources/`
- test-only fixtures or helpers required by those tests

Responsibilities:

- Confirm the existing test files match the source plan phases.
- Run targeted Maven tests for `backend/start`.
- Fix compile failures, brittle test data, endpoint mismatch, security-token helper issues, and deterministic test isolation problems.
- Keep production code unchanged unless a test exposes a real defect that cannot be verified through test-only changes.
- Preserve existing user-owned worktree changes outside the owned paths.

Primary commands:

```powershell
npx.cmd gitnexus impact AbstractIntegrationTest -r hospital-management-system
mvn.cmd -pl start -am test -DskipTests=false
Push-Location backend/start
mvn.cmd "-Dtest=AuthenticationIntegrationTest,ClinicalWorkflowIntegrationTest,PublicEndpointIntegrationTest" test
Pop-Location
```

When running a targeted `-Dtest=...` command from `backend` with `-pl start -am`, add `"-Dsurefire.failIfNoSpecifiedTests=false"` so upstream modules without matching tests do not fail before the `start` module runs.

Done criteria:

- Planned API test classes compile.
- Relevant integration tests pass or any environmental blocker is documented with exact error output.
- Changed files are listed for review.

### Subagent 2: Review Agent

Role: review the execution result for correctness, security, and missing validation.

Owned paths:

- Read-only review of worker changes.
- No edits unless explicitly requested by the parent agent after findings are triaged.

Responsibilities:

- Check that tests assert behavior, authorization, and response envelopes instead of only status codes.
- Check that patient, admin, finance, inventory, lab, queue, and public endpoints have meaningful happy-path and negative-path coverage.
- Look for fragile data coupling, nondeterministic dates, shared mutable state, and role-token mistakes.
- Confirm no secrets, hardcoded production credentials, or broad production-code changes were introduced.
- Produce severity-ordered findings with file and line references.

Primary commands:

```powershell
npx.cmd gitnexus status
git -c safe.directory=D:/projects/hospital-management-system diff -- backend/start/src/test/java/com/hospital/api/
git -c safe.directory=D:/projects/hospital-management-system diff --check -- backend/start/src/test/java/com/hospital/api/
mvn.cmd -pl start -am test -DskipTests=false
Push-Location backend/start
mvn.cmd "-Dtest=AuthenticationIntegrationTest,ClinicalWorkflowIntegrationTest,PublicEndpointIntegrationTest" test
Pop-Location
# Optional only when `npx.cmd gitnexus --help` lists it:
# npx.cmd gitnexus detect_changes -r hospital-management-system
```

Done criteria:

- No unresolved critical or high review findings.
- GitNexus change detection matches the expected test-only scope when the installed CLI supports it; otherwise `gitnexus status` plus scoped `git diff` confirms the fallback scope.
- Final verification status is recorded in the parent response.

## Parent Agent Integration Steps

1. Preserve the dirty worktree and avoid touching unrelated files.
2. Spawn the execution worker with the owned test paths.
3. Run local verification after the worker reports back.
4. Spawn the review agent against the integrated diff.
5. Address any critical or high findings locally.
6. Run final Maven verification and GitNexus scope verification. If `gitnexus detect_changes` is unavailable in the installed CLI, record the limitation and use `gitnexus status`, `git diff --stat`, and scoped `git diff --check` as the fallback.

## Expected Scope

Expected edits are limited to this plan file and API integration tests under `backend/start/src/test/java/com/hospital/api/`. Any production-code change requires a GitNexus impact check first and must be justified by a failing test that proves a real application defect.
