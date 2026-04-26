package com.hospital.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.hospital.api.config.JwtProperties;
import com.hospital.core.audit.AuditLogRepository;
import com.hospital.core.user.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class SecurityHardeningIntegrationTest {
  @Container
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("pgvector/pgvector:pg15");

  static {
    postgres.start();
  }

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private AuditLogRepository auditLogRepository;

  @Autowired
  private JwtProperties jwtProperties;

  @DynamicPropertySource
  static void databaseProperties(DynamicPropertyRegistry registry) {
    registry.add("POSTGRES_HOST", postgres::getHost);
    registry.add("POSTGRES_PORT", () -> postgres.getMappedPort(5432));
    registry.add("POSTGRES_DB", postgres::getDatabaseName);
    registry.add("POSTGRES_USER", postgres::getUsername);
    registry.add("POSTGRES_PASSWORD", postgres::getPassword);
  }

  @Test
  void rejectsMissingTokenWithUnauthorizedEnvelope() throws Exception {
    mockMvc.perform(get("/api/v1/me/schedule").param("date", "today"))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.success").value(false))
        .andExpect(jsonPath("$.error.code").value("unauthorized"))
        .andExpect(jsonPath("$.error.message").value("Authentication is required"));

    assertLatestSecurityDenial(401, "GET", "/api/v1/me/schedule");
  }

  @Test
  void rejectsMalformedBearerTokenWithUnauthorizedEnvelope() throws Exception {
    mockMvc.perform(get("/api/v1/me/schedule")
            .param("date", "today")
            .header(HttpHeaders.AUTHORIZATION, "Bearer definitely-not-a-jwt"))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.success").value(false))
        .andExpect(jsonPath("$.error.code").value("unauthorized"))
        .andExpect(jsonPath("$.error.message").value("Bearer token is malformed"));
  }

  @Test
  void rejectsExpiredBearerTokenWithUnauthorizedEnvelope() throws Exception {
    var expiredToken = expiredDoctorToken();

    mockMvc.perform(get("/api/v1/me/schedule")
            .param("date", "today")
            .header(HttpHeaders.AUTHORIZATION, "Bearer " + expiredToken))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.success").value(false))
        .andExpect(jsonPath("$.error.code").value("unauthorized"))
        .andExpect(jsonPath("$.error.message").value("Access token has expired"));
  }

  @Test
  void rejectsWrongRoleWithForbiddenEnvelope() throws Exception {
    var nurseToken = loginAndGetAccessToken("nurse@hospital.vn", "Nurse@1234");

    mockMvc.perform(get("/api/v1/me/schedule")
            .param("date", "today")
            .header(HttpHeaders.AUTHORIZATION, "Bearer " + nurseToken))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.success").value(false))
        .andExpect(jsonPath("$.error.code").value("forbidden"))
        .andExpect(jsonPath("$.error.message").value("Access is denied"));

    assertLatestSecurityDenial(403, "GET", "/api/v1/me/schedule");
  }

  @Test
  void returnsValidationEnvelopeForProtectedEndpointPayloadErrors() throws Exception {
    var doctorToken = loginAndGetAccessToken("doctor1@hospital.vn", "Doctor@1234");

    mockMvc.perform(put("/api/v1/appointments/{appointmentId}/status", UUID.randomUUID())
            .header(HttpHeaders.AUTHORIZATION, "Bearer " + doctorToken)
            .contentType("application/json")
            .content("{}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.success").value(false))
        .andExpect(jsonPath("$.error.code").value("validation_error"))
        .andExpect(jsonPath("$.error.message").value("status: must not be null"));
  }

  @Test
  void returnsValidationEnvelopeForProtectedEndpointQueryErrors() throws Exception {
    var doctorToken = loginAndGetAccessToken("doctor1@hospital.vn", "Doctor@1234");

    mockMvc.perform(get("/api/v1/me/schedule")
            .param("date", "today")
            .param("week", "2030-W03")
            .header(HttpHeaders.AUTHORIZATION, "Bearer " + doctorToken))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.success").value(false))
        .andExpect(jsonPath("$.error.code").value("validation_error"))
        .andExpect(jsonPath("$.error.message").value("Provide exactly one of date or week"));
  }

  @Test
  void returnsDomainEnvelopeForProtectedEndpointNotFound() throws Exception {
    var doctorToken = loginAndGetAccessToken("doctor1@hospital.vn", "Doctor@1234");

    mockMvc.perform(put("/api/v1/appointments/{appointmentId}/status", UUID.randomUUID())
            .header(HttpHeaders.AUTHORIZATION, "Bearer " + doctorToken)
            .contentType("application/json")
            .content("""
                {
                  "status": "IN_PROGRESS"
                }
                """))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.success").value(false))
        .andExpect(jsonPath("$.error.code").value("not_found"));
  }

  @Test
  void exposesCorsHeadersWithoutCredentialsForAllowedOrigins() throws Exception {
    mockMvc.perform(options("/api/v1/me/schedule")
            .header(HttpHeaders.ORIGIN, "http://localhost:4173")
            .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET")
            .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "Authorization,Content-Type"))
        .andExpect(status().isOk())
        .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:4173"))
        .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS));
  }

  private String loginAndGetAccessToken(String email, String password) throws Exception {
    var response = mockMvc.perform(post("/api/v1/auth/login")
            .contentType("application/json")
            .content("""
                {
                  "email": "%s",
                  "password": "%s"
                }
                """.formatted(email, password)))
        .andExpect(status().isOk())
        .andReturn()
        .getResponse()
        .getContentAsString();

    var tokenMarker = "\"accessToken\":\"";
    var tokenStart = response.indexOf(tokenMarker);
    var valueStart = tokenStart + tokenMarker.length();
    var valueEnd = response.indexOf('"', valueStart);
    return response.substring(valueStart, valueEnd);
  }

  private void assertLatestSecurityDenial(int status, String method, String path) {
    var latest = auditLogRepository.findAllByOrderByCreatedAtDesc().stream()
        .filter(entry -> "SECURITY_ACCESS_DENIED".equals(entry.getAction()))
        .findFirst()
        .orElseThrow();

    assert latest.getMetadata() != null;
    org.assertj.core.api.Assertions.assertThat(latest.getMetadata())
        .contains("\"status\":" + status)
        .contains("\"method\":\"" + method + "\"")
        .contains("\"path\":\"" + path + "\"")
        .doesNotContain("Bearer")
        .doesNotContain("password")
        .doesNotContain("accessToken")
        .doesNotContain("refreshToken");
  }

  private String expiredDoctorToken() {
    var doctor = userRepository.findByEmailIgnoreCaseAndActiveTrue("doctor1@hospital.vn").orElseThrow();
    return Jwts.builder()
        .subject(doctor.getId().toString())
        .claim("role", doctor.getRole().name())
        .claim("name", doctor.getFullName())
        .issuedAt(Date.from(Instant.now().minusSeconds(3600)))
        .expiration(Date.from(Instant.now().minusSeconds(60)))
        .signWith(signingKey())
        .compact();
  }

  private SecretKey signingKey() {
    var secret = jwtProperties.secret();
    if (secret == null || secret.isBlank()) {
      throw new IllegalStateException("JWT secret is required for security integration tests");
    }

    if (secret.length() >= 32) {
      return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
  }
}
