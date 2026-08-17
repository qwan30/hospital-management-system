package com.hospital.api.seed;

import com.hospital.core.seed.SeedDataService;
import com.hospital.core.seed.ReleaseDemoSeedService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SeedDataConfiguration {
  private static final Logger LOGGER = LoggerFactory.getLogger(SeedDataConfiguration.class);

  @Bean
  CommandLineRunner seedDataRunner(
      SeedDataService seedDataService,
      ReleaseDemoSeedService releaseDemoSeedService) {
    return args -> {
      runSeedingStep("initial-demo", seedDataService::seedInitialDemoIfEnabled);
      runSeedingStep("non-billing-demo", seedDataService::seedNonBillingDemoIfEnabled);
      runSeedingStep("release-demo", releaseDemoSeedService::seedIfEnabled);
    };
  }

  private void runSeedingStep(String stepName, Runnable step) {
    try {
      step.run();
    } catch (RuntimeException ex) {
      // Demo seeding is optional enrichment; a failure must not take the API down
      // or the service crash-loops on every startup.
      LOGGER.error("Demo seeding step '{}' failed; continuing startup so the API remains available.",
          stepName, ex);
    }
  }
}
