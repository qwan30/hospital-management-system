package com.hospital.api;

import static java.util.concurrent.TimeUnit.SECONDS;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.reset;

import com.hospital.api.auth.AuthService;
import com.hospital.api.auth.JwtTokenService;
import com.hospital.core.admin.AdminService;
import com.hospital.core.user.UserEntity;
import com.hospital.core.user.UserRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CancellationException;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.containers.PostgreSQLContainer;

@SpringBootTest
class AuthRefreshConcurrencyIntegrationTest {

  private static final PostgreSQLContainer<?> POSTGRES =
      new PostgreSQLContainer<>("pgvector/pgvector:pg15");

  @Autowired private AdminService adminService;
  @Autowired private AuthService authService;
  @Autowired private JdbcTemplate jdbcTemplate;
  @Autowired private PlatformTransactionManager transactionManager;
  @Autowired private UserRepository userRepository;

  @SpyBean private JwtTokenService jwtTokenService;

  @DynamicPropertySource
  static void databaseProperties(DynamicPropertyRegistry registry) {
    if (!POSTGRES.isRunning()) {
      POSTGRES.start();
    }
    registry.add("POSTGRES_HOST", POSTGRES::getHost);
    registry.add("POSTGRES_PORT", () -> POSTGRES.getMappedPort(5432));
    registry.add("POSTGRES_DB", POSTGRES::getDatabaseName);
    registry.add("POSTGRES_USER", POSTGRES::getUsername);
    registry.add("POSTGRES_PASSWORD", POSTGRES::getPassword);
    registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
    registry.add("spring.datasource.username", POSTGRES::getUsername);
    registry.add("spring.datasource.password", POSTGRES::getPassword);
    registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
    registry.add("security.jwt.secret", () -> "test-jwt-secret-with-at-least-32-characters");
    registry.add("security.patient-identifier.secret", () -> "test-patient-identifier-secret");
  }

  @Test
  void refreshHoldsUserRowUntilTokenIssuanceCompletes() throws Exception {
    var user = userRepository.findByEmailIgnoreCaseAndActiveTrue("doctor1@hospital.vn").orElseThrow();
    var userId = user.getId();
    var retainedRefreshToken = jwtTokenService.generateRefreshToken(userId, "staff");
    var accessTokenGenerationEntered = new CountDownLatch(1);
    var allowRefreshToComplete = new CountDownLatch(1);
    var deactivationReadyToFlush = new CountDownLatch(1);
    var deactivationPid = new AtomicInteger();
    var refreshBackendPid = new AtomicInteger();
    var executor = Executors.newFixedThreadPool(2);
    Future<?> refreshFuture = null;
    Future<?> deactivationFuture = null;

    doAnswer(invocation -> {
      refreshBackendPid.set(jdbcTemplate.queryForObject("select pg_backend_pid()", Integer.class));
      accessTokenGenerationEntered.countDown();
      assertThat(allowRefreshToComplete.await(10, SECONDS))
          .as("test must release paused refresh token generation")
          .isTrue();
      return invocation.callRealMethod();
    }).when(jwtTokenService).generateAccessToken(any(UserEntity.class));

    try {
      refreshFuture = executor.submit(() -> authService.refresh(retainedRefreshToken));
      assertThat(accessTokenGenerationEntered.await(10, SECONDS))
          .as("refresh reached token generation after reading the user row")
          .isTrue();

      var transactionTemplate = new TransactionTemplate(transactionManager);
      deactivationFuture = executor.submit(() -> transactionTemplate.executeWithoutResult(status -> {
        deactivationPid.set(jdbcTemplate.queryForObject("select pg_backend_pid()", Integer.class));
        adminService.deactivateUser(userId);
        deactivationReadyToFlush.countDown();
        userRepository.flush();
      }));

      assertThat(deactivationReadyToFlush.await(10, SECONDS))
          .as("deactivation transaction reached its flush boundary")
          .isTrue();

      var blockingPids = pollBlockingPids(deactivationPid.get(), Duration.ofSeconds(5));
      System.out.printf(
          "PG_BLOCKING_PIDS refreshPid=%d deactivationPid=%d blockingPids=%s%n",
          refreshBackendPid.get(), deactivationPid.get(), blockingPids);
      assertThat(refreshBackendPid.get())
          .as("refresh transaction backend PID captured from its transaction-bound connection")
          .isPositive();
      assertThat(blockingPids)
          .as("pg_blocking_pids(%s) must contain refresh PID %s",
              deactivationPid.get(), refreshBackendPid.get())
          .contains(refreshBackendPid.get());

      allowRefreshToComplete.countDown();
      refreshFuture.get(10, SECONDS);
      deactivationFuture.get(10, SECONDS);

      assertThatThrownBy(() -> authService.refresh(retainedRefreshToken))
          .isInstanceOf(BadCredentialsException.class)
          .hasMessage("Invalid refresh token");
    } finally {
      cleanup(
          allowRefreshToComplete,
          refreshFuture,
          deactivationFuture,
          executor,
          userId);
    }
  }

  private List<Integer> pollBlockingPids(int blockedPid, Duration timeout) {
    var deadline = Instant.now().plus(timeout);
    List<Integer> blockingPids;
    do {
      blockingPids = jdbcTemplate.queryForList(
          "select unnest(pg_blocking_pids(?))", Integer.class, blockedPid);
      if (!blockingPids.isEmpty()) {
        return blockingPids;
      }
      try {
        Thread.sleep(25);
      } catch (InterruptedException exception) {
        Thread.currentThread().interrupt();
        throw new AssertionError("Interrupted while polling pg_blocking_pids", exception);
      }
    } while (Instant.now().isBefore(deadline));
    return blockingPids;
  }

  private void restoreActiveUser(java.util.UUID userId) {
    new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
      var user = userRepository.findById(userId).orElseThrow();
      user.setActive(true);
      userRepository.flush();
    });
  }

  private void cleanup(
      CountDownLatch allowRefreshToComplete,
      Future<?> refreshFuture,
      Future<?> deactivationFuture,
      ExecutorService executor,
      java.util.UUID userId) {
    var failures = new ArrayList<Throwable>();
    var interrupted = new AtomicBoolean(false);

    allowRefreshToComplete.countDown();
    awaitOrCancel(refreshFuture, "refresh", failures, interrupted);
    awaitOrCancel(deactivationFuture, "deactivation", failures, interrupted);

    executor.shutdownNow();
    var workersTerminated = awaitExecutorTermination(executor, failures, interrupted);
    if (workersTerminated) {
      try {
        restoreActiveUser(userId);
      } catch (Throwable failure) {
        failures.add(new AssertionError("Failed to restore active user fixture", failure));
      }
    } else {
      failures.add(new AssertionError(
          "Active user fixture was not restored because worker/JDBC activity did not terminate"));
    }

    try {
      reset(jwtTokenService);
    } catch (Throwable failure) {
      failures.add(new AssertionError("Failed to reset JwtTokenService spy", failure));
    } finally {
      if (interrupted.get()) {
        Thread.currentThread().interrupt();
      }
    }

    if (!failures.isEmpty()) {
      var cleanupFailure = new AssertionError("Concurrency test cleanup failed");
      failures.forEach(cleanupFailure::addSuppressed);
      throw cleanupFailure;
    }
  }

  private void awaitOrCancel(
      Future<?> future,
      String workerName,
      List<Throwable> failures,
      AtomicBoolean interrupted) {
    if (future == null) {
      return;
    }

    try {
      future.get(10, SECONDS);
    } catch (InterruptedException exception) {
      interrupted.set(true);
      future.cancel(true);
      failures.add(new AssertionError("Interrupted while awaiting " + workerName + " worker", exception));
    } catch (TimeoutException exception) {
      future.cancel(true);
      failures.add(new AssertionError("Timed out awaiting " + workerName + " worker", exception));
    } catch (ExecutionException exception) {
      failures.add(new AssertionError(workerName + " worker failed", exception.getCause()));
    } catch (CancellationException exception) {
      failures.add(new AssertionError(workerName + " worker was cancelled", exception));
    }
  }

  private boolean awaitExecutorTermination(
      ExecutorService executor,
      List<Throwable> failures,
      AtomicBoolean interrupted) {
    try {
      var terminated = executor.awaitTermination(10, SECONDS);
      if (!terminated) {
        failures.add(new AssertionError("Executor did not terminate within 10 seconds"));
      }
      return terminated;
    } catch (InterruptedException exception) {
      interrupted.set(true);
      failures.add(new AssertionError("Interrupted while awaiting executor termination", exception));
      return false;
    }
  }
}
