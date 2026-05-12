package com.hospital.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers(disabledWithoutDocker = true)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class AuthenticationIntegrationTest {

  @Container
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("pgvector/pgvector:pg15");

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @DynamicPropertySource
  static void databaseProperties(DynamicPropertyRegistry registry) {
    if (!postgres.isRunning()) {
      postgres.start();
    }
    registry.add("POSTGRES_HOST", postgres::getHost);
    registry.add("POSTGRES_PORT", () -> postgres.getMappedPort(5432));
    registry.add("POSTGRES_DB", postgres::getDatabaseName);
    registry.add("POSTGRES_USER", postgres::getUsername);
    registry.add("POSTGRES_PASSWORD", postgres::getPassword);
    registry.add("security.jwt.secret", () -> "test-jwt-secret-with-at-least-32-characters");
    registry.add("security.patient-identifier.secret", () -> "test-patient-identifier-secret");
  }

  @Test
  void loginSuccessfullyWithValidCredentials() throws Exception {
    mockMvc.perform(post("/api/v1/auth/login")
            .contentType("application/json")
            .content("""
                {
                  "email": "admin@hospital.vn",
                  "password": "Admin@1234"
                }
                """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.fullName").value("System Admin"))
        .andExpect(jsonPath("$.data.role").value("ADMIN"))
        .andExpect(jsonPath("$.data.tokens.accessToken").exists())
        .andExpect(cookie().exists("hms_refresh_token"));
  }

  @Test
  void loginFailsWithInvalidCredentials() throws Exception {
    mockMvc.perform(post("/api/v1/auth/login")
            .contentType("application/json")
            .content("""
                {
                  "email": "admin@hospital.vn",
                  "password": "wrongpassword"
                }
                """))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.error.code").value("unauthorized"));
  }

  @Test
  void refreshTokensSuccessfully() throws Exception {
    MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
            .contentType("application/json")
            .content("""
                {
                  "email": "doctor1@hospital.vn",
                  "password": "Doctor@1234"
                }
                """))
        .andExpect(status().isOk())
        .andReturn();

    Cookie refreshTokenCookie = loginResult.getResponse().getCookie("hms_refresh_token");

    mockMvc.perform(post("/api/v1/auth/refresh")
            .cookie(refreshTokenCookie))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.accessToken").exists())
        .andExpect(cookie().exists("hms_refresh_token"));
  }
}
