package com.hospital.api;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.hospital.core.seed.InitialDemoSeedProperties;
import com.hospital.core.seed.ReleaseDemoSeedProperties;
import com.hospital.core.seed.ReleaseDemoSeedService;
import com.hospital.core.seed.SeedDataService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;

@SpringBootTest(properties = {
    "hms.seed.initial-demo.enabled=false",
    "hms.seed.release-demo.enabled=false"
})
@ActiveProfiles(profiles = "production", inheritProfiles = false)
class DemoSeedProfileIntegrationTest {
  private static final PostgreSQLContainer<?> POSTGRES =
      new PostgreSQLContainer<>("pgvector/pgvector:pg15");

  @DynamicPropertySource
  static void databaseProperties(DynamicPropertyRegistry registry) {
    if (!POSTGRES.isRunning()) {
      POSTGRES.start();
    }
    registry.add("spring.datasource.url", () ->
        "jdbc:postgresql://" + POSTGRES.getHost() + ":" + POSTGRES.getMappedPort(5432)
            + "/" + POSTGRES.getDatabaseName());
    registry.add("spring.datasource.username", POSTGRES::getUsername);
    registry.add("spring.datasource.password", POSTGRES::getPassword);
    registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
    registry.add("security.jwt.secret", () -> "test-jwt-secret-with-at-least-32-characters");
    registry.add("security.patient-identifier.secret", () -> "test-patient-identifier-secret");
  }

  @Autowired
  private InitialDemoSeedProperties initialDemoSeedProperties;

  @Autowired
  private ReleaseDemoSeedProperties releaseDemoSeedProperties;

  @Autowired
  private SeedDataService seedDataService;

  @Autowired
  private ReleaseDemoSeedService releaseDemoSeedService;

  @Test
  void productionProfileRejectsExplicitlyEnabledDemoSeeds() {
    initialDemoSeedProperties.setEnabled(true);
    releaseDemoSeedProperties.setEnabled(true);

    assertThatThrownBy(seedDataService::seedIfEmpty)
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("explicit demo or test Spring profile");
    assertThatThrownBy(releaseDemoSeedService::seedIfEnabled)
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("explicit demo or test Spring profile");
  }
}
