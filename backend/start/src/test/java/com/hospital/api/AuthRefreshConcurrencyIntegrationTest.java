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
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
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
    var executor = Executors.newFixedThreadPool(2);
    Future<?> refreshFuture = null;
    Future<?> deactivationFuture = null;

    doAnswer(invocation -> {
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
          "PG_BLOCKING_PIDS deactivationPid=%d blockingPids=%s%n",
          deactivationPid.get(), blockingPids);
      assertThat(blockingPids)
          .as("pg_blocking_pids(%s) must identify the refresh transaction", deactivationPid.get())
          .isNotEmpty();

      allowRefreshToComplete.countDown();
      refreshFuture.get(10, SECONDS);
      deactivationFuture.get(10, SECONDS);

      assertThatThrownBy(() -> authService.refresh(retainedRefreshToken))
          .isInstanceOf(BadCredentialsException.class)
          .hasMessage("Invalid refresh token");
    } finally {
      allowRefreshToComplete.countDown();
      awaitQuietly(refreshFuture);
      awaitQuietly(deactivationFuture);
      reset(jwtTokenService);
      restoreActiveUser(userId);
      executor.shutdownNow();
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
      Thread.onSpinWait();
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

  private void awaitQuietly(Future<?> future) {
    if (future == null) {
      return;
    }
    try {
      future.get(10, SECONDS);
    } catch (Exception ignored) {
      future.cancel(true);
    }
  }
}
