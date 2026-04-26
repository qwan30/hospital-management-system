package com.hospital.api;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;

class SecurityConfigurationDefaultsTest {
  @Test
  void applicationConfigurationRequiresExplicitJwtAndPatientIdentifierSecrets() throws IOException {
    var applicationYaml = Files.readString(
        Path.of("src", "main", "resources", "application.yml"),
        StandardCharsets.UTF_8);

    assertThat(applicationYaml).doesNotContain("${JWT_SECRET:");
    assertThat(applicationYaml).contains("secret: ${JWT_SECRET}");
    assertThat(applicationYaml).doesNotContain("${PATIENT_IDENTIFIER_SECRET:");
    assertThat(applicationYaml).contains("secret: ${PATIENT_IDENTIFIER_SECRET}");
    assertThat(applicationYaml).doesNotContain("${POSTGRES_PASSWORD:");
    assertThat(applicationYaml).contains("password: ${POSTGRES_PASSWORD}");
  }

  @Test
  void dockerComposeDoesNotProvideProductionSecretFallbacks() throws IOException {
    var dockerCompose = Files.readString(findRepositoryRoot().resolve("docker-compose.yml"), StandardCharsets.UTF_8);

    assertThat(dockerCompose).doesNotContain("JWT_SECRET:-");
    assertThat(dockerCompose).contains("JWT_SECRET: ${JWT_SECRET}");
    assertThat(dockerCompose).contains("PATIENT_IDENTIFIER_SECRET: ${PATIENT_IDENTIFIER_SECRET}");
    assertThat(dockerCompose).doesNotContain("POSTGRES_PASSWORD:-");
    assertThat(dockerCompose).contains("POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}");
  }

  private Path findRepositoryRoot() {
    var current = Path.of(System.getProperty("user.dir")).toAbsolutePath();
    while (current != null) {
      if (Files.exists(current.resolve("docker-compose.yml"))) {
        return current;
      }
      current = current.getParent();
    }
    throw new IllegalStateException("Repository root not found");
  }
}
