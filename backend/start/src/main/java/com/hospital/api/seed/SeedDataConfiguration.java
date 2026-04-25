package com.hospital.api.seed;

import com.hospital.core.seed.SeedDataService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SeedDataConfiguration {
  @Bean
  CommandLineRunner seedDataRunner(SeedDataService seedDataService) {
    return args -> seedDataService.seedIfEmpty();
  }
}
