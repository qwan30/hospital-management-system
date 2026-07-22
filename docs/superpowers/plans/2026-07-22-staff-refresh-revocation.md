# Staff Refresh Revocation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent an inactive or deleted staff identity from exchanging an existing refresh token for new credentials.

**Architecture:** Keep JWT signature, type, and scope validation in `AuthService.refresh`, then enforce current account state using the authoritative user row before token generation. Return the existing non-enumerating authentication failure and never call either token generator when the user is missing or inactive.

**Tech Stack:** Java 21, Spring Boot Security, Spring Data JPA, JJWT, JUnit 5, Mockito, AssertJ, Maven.

## Global Constraints

- Work only on `codex/production-readiness-e2e-20260721-next`; do not create a Git worktree.
- Preserve all unrelated dirty and untracked files.
- GitNexus impact for `AuthService.refresh` is LOW: 3 direct dependants, 1 affected auth process, 1 affected module.
- Apply strict RED → GREEN → REFACTOR; no production edit before the failing test is observed.
- Authentication errors must not reveal whether a user exists or is inactive.
- The refresh path must not generate access or refresh tokens after account deactivation.

---

### Task 1: Enforce active staff identity during refresh

**Files:**
- Create: `backend/application/src/test/java/com/hospital/api/auth/AuthServiceTest.java`
- Modify: `backend/application/src/main/java/com/hospital/api/auth/AuthService.java:38-59`
- Test: `backend/application/src/test/java/com/hospital/api/auth/AuthServiceTest.java`

**Interfaces:**
- Consumes: `JwtTokenService.parseClaims(String)`, `UserRepository.findById(UUID)`, and `UserEntity.isActive()`.
- Produces: unchanged `AuthService.refresh(String): TokenPair`; inactive and missing users raise `BadCredentialsException("Invalid refresh token")` before either token generator is called.

- [x] **Step 1: Write the failing inactive-user test**

Create a Mockito test fixture with mocked `UserRepository`, `PasswordEncoder`, `JwtTokenService`, and `Claims`. Stub a valid staff refresh token whose subject is a UUID, return a `UserEntity` with `active=false`, call `authService.refresh("valid-refresh-token")`, assert `BadCredentialsException` with message `Invalid refresh token`, and verify `generateAccessToken` plus `generateRefreshToken` are never called.

- [x] **Step 2: Run the focused test and verify RED**

Run:

```powershell
cd backend
mvn.cmd -q -pl application -am "-Dtest=AuthServiceTest" "-Dsurefire.failIfNoSpecifiedTests=false" test
```

Expected: the inactive-user assertion fails because the current implementation returns a `TokenPair` and invokes both token generators.

- [x] **Step 3: Implement the minimal active-state guard**

In `AuthService.refresh`, retain the existing `findById` lookup and add an active-state filter before unwrapping:

```java
var user = userRepository.findById(UUID.fromString(claims.getSubject()))
    .filter(com.hospital.core.user.UserEntity::isActive)
    .orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));
```

Do not change token shape, expiry, controller cookies, or login behavior.

- [x] **Step 4: Add missing-user and active-user regression cases**

In the same test class:

- missing user: return `Optional.empty()`, expect the same `Invalid refresh token`, and verify no token generation;
- active user: return `active=true`, stub both generated tokens and expiration, and assert the exact `TokenPair` is returned.

- [x] **Step 5: Run focused and auth regression tests**

Run:

```powershell
cd backend
mvn.cmd -q -pl application -am "-Dtest=AuthServiceTest" "-Dsurefire.failIfNoSpecifiedTests=false" test
mvn.cmd -q -pl controller -am "-Dtest=AuthControllerTest" "-Dsurefire.failIfNoSpecifiedTests=false" test
mvn.cmd -q -pl start -am "-Dtest=AuthenticationIntegrationTest" "-Dsurefire.failIfNoSpecifiedTests=false" test
```

Expected: all commands exit 0; the integration command uses Docker-backed PostgreSQL.

- [x] **Step 6: Run full backend verification**

Run:

```powershell
cd backend
mvn.cmd -q verify
```

Expected: exit 0 with no test failures or errors.

- [x] **Step 7: Review and commit the isolated slice**

Run GitNexus `detect-changes --scope all --repo hospital-management-system`, secret scan the staged diff, obtain independent spec and code-quality approval, then commit only the auth production/test files:

```powershell
git commit -m "fix(auth): revoke refresh for inactive staff"
```

- [x] **Step 8: Reproduce the deactivation race with PostgreSQL**

Create `backend/start/src/test/java/com/hospital/api/AuthRefreshConcurrencyIntegrationTest.java`. Run refresh asynchronously against a real Testcontainers PostgreSQL database and block the `JwtTokenService.generateAccessToken(UserEntity)` spy with a latch after the account row has been read. In a second transaction, capture `pg_backend_pid()`, set the same user inactive, and flush. From a third connection, poll `pg_blocking_pids(deactivationPid)` without arbitrary sleeps.

Before the locking fix, the deactivation flush completes instead of appearing in `pg_blocking_pids`; the test must fail for that expected reason. Always release the latch and restore the user in `finally` so a failed RED run cannot poison later tests.

- [x] **Step 9: Serialize refresh issuance against account updates**

Add only this isolated method to `UserRepository`; do not change inherited `findById` or any existing repository method:

```java
@Lock(LockModeType.PESSIMISTIC_READ)
@Query("""
    select user from UserEntity user
    where user.id = :userId and user.active = true
    """)
Optional<UserEntity> findActiveByIdForRefresh(@Param("userId") UUID userId);
```

Annotate `AuthService.refresh` with ordinary `@Transactional` and replace its lookup with `findActiveByIdForRefresh`. The transaction must cover the locked lookup, both token-generation calls, and `TokenPair` construction. Keep `AdminService.deactivateUser` unchanged.

- [x] **Step 10: Strengthen unit and endpoint contracts**

Update `AuthServiceTest` stubs to use `findActiveByIdForRefresh`. For rejected refreshes verify all token-generator arguments broadly:

```java
verify(jwtTokenService, never()).generateAccessToken(any(UserEntity.class));
verify(jwtTokenService, never()).generateRefreshToken(any(UUID.class), anyString());
```

Extend `AuthenticationIntegrationTest` with the real lifecycle: login active staff, retain its refresh cookie, deactivate through the authoritative admin service or endpoint, submit the retained cookie, assert HTTP 401 with `error.code=unauthorized`, and assert no replacement refresh cookie. Reactivate the fixture in `finally`.

- [x] **Step 11: Verify GREEN and full regression**

Run the focused unit, controller, lifecycle integration, concurrency integration, and full backend verification commands with quoted PowerShell `-D` arguments. Expected: the concurrency test observes the deactivation transaction blocked by the refresh transaction; refresh completes first, deactivation commits second, and reuse after deactivation returns 401. Full `mvn.cmd -q verify` exits 0.

- [x] **Step 12: Re-review the complete task range**

Run GitNexus detection and secret/whitespace scans, then commit only the auth, repository, and integration-test fix files:

```powershell
git commit -m "fix(auth): serialize refresh with deactivation"
```

Regenerate the review package for the complete `716d56d..HEAD` range and require fresh spec, test, security, and orchestration approvals.
