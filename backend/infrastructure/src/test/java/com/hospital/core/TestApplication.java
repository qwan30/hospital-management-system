package com.hospital.core;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Minimal {@link SpringBootApplication} for {@code @DataJpaTest} slice tests
 * in the infrastructure module. Serves as the {@code @SpringBootConfiguration}
 * that Spring Boot test auto-detection requires, and explicitly scans the
 * {@code com.hospital.core} package where domain entities and JPA repositories
 * reside (in the sibling {@code domain} module).
 */
@SpringBootApplication
@EntityScan(basePackages = "com.hospital.core")
@EnableJpaRepositories(basePackages = "com.hospital.core")
public class TestApplication {
  /* marker class -- no additional beans needed */
}
