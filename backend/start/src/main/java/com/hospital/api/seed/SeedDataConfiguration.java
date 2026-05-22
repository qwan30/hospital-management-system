package com.hospital.api.seed;

import com.hospital.core.seed.SeedDataService;
import com.hospital.core.seed.ReleaseDemoSeedService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SeedDataConfiguration {
  @Bean
  CommandLineRunner seedDataRunner(
      SeedDataService seedDataService,
      ReleaseDemoSeedService releaseDemoSeedService) {
    return args -> {
      seedDataService.seedIfEmpty();
      releaseDemoSeedService.seedIfEnabled();
    };
  }
}
