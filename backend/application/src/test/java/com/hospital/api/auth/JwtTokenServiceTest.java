package com.hospital.api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.hospital.api.config.JwtProperties;
import com.hospital.core.user.UserEntity;
import com.hospital.shared.enums.UserRole;
import io.jsonwebtoken.Claims;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class JwtTokenServiceTest {

  private JwtProperties jwtProperties;
  private JwtTokenService jwtTokenService;
  private final String secretBase64 = "dGVzdC1zZWNyZXQtMTIzNDU2Nzg5MDEyMzQ1Njc4OTA=";
  private final String secretPlain = "my-secret-key-12345678901234567890-very-long";

  @BeforeEach
  void setUp() {
    jwtProperties = new JwtProperties(
        secretPlain,
        3600L,
        86400L,
        "refresh_token"
    );
    jwtTokenService = new JwtTokenService(jwtProperties);
  }

  @Test
  void testPropertiesGetters() {
    assertThat(jwtTokenService.accessTokenExpirationSeconds()).isEqualTo(3600L);
    assertThat(jwtTokenService.refreshTokenExpirationSeconds()).isEqualTo(86400L);
    assertThat(jwtTokenService.refreshCookieName()).isEqualTo("refresh_token");
    assertThat(jwtTokenService.patientRefreshCookieName()).isEqualTo("refresh_token_patient");
  }

  @Test
  void testGenerateAndParseAccessToken_withUserEntity() {
    var user = new UserEntity();
    var id = UUID.randomUUID();
    user.setId(id);
    user.setFullName("John Doe");
    user.setRole(UserRole.DOCTOR);

    String token = jwtTokenService.generateAccessToken(user);
    assertThat(token).isNotEmpty();

    Claims claims = jwtTokenService.parseClaims(token);
    assertThat(claims.getSubject()).isEqualTo(id.toString());
    assertThat(claims.get("role", String.class)).isEqualTo("DOCTOR");
    assertThat(claims.get("name", String.class)).isEqualTo("John Doe");
  }

  @Test
  void testGenerateAndParseAccessToken_withRawParams() {
    var id = UUID.randomUUID();
    String token = jwtTokenService.generateAccessToken(id, "Jane Doe", "ADMIN");
    assertThat(token).isNotEmpty();

    Claims claims = jwtTokenService.parseClaims(token);
    assertThat(claims.getSubject()).isEqualTo(id.toString());
    assertThat(claims.get("role", String.class)).isEqualTo("ADMIN");
    assertThat(claims.get("name", String.class)).isEqualTo("Jane Doe");
  }

  @Test
  void testGenerateAndParseRefreshToken_withUserEntity() {
    var user = new UserEntity();
    var id = UUID.randomUUID();
    user.setId(id);

    String token = jwtTokenService.generateRefreshToken(user);
    assertThat(token).isNotEmpty();

    Claims claims = jwtTokenService.parseClaims(token);
    assertThat(claims.getSubject()).isEqualTo(id.toString());
    assertThat(claims.get("type", String.class)).isEqualTo("refresh");
    assertThat(claims.get("scope", String.class)).isEqualTo("staff");
  }

  @Test
  void testGenerateAndParseRefreshToken_withRawParams() {
    var id = UUID.randomUUID();
    String token = jwtTokenService.generateRefreshToken(id, "patient");
    assertThat(token).isNotEmpty();

    Claims claims = jwtTokenService.parseClaims(token);
    assertThat(claims.getSubject()).isEqualTo(id.toString());
    assertThat(claims.get("type", String.class)).isEqualTo("refresh");
    assertThat(claims.get("scope", String.class)).isEqualTo("patient");
  }

  @Test
  void testSigningKey_withBase64Secret() {
    var props = new JwtProperties(
        secretBase64,
        3600L,
        86400L,
        "refresh_token"
    );
    var tokenService = new JwtTokenService(props);
    var id = UUID.randomUUID();
    String token = tokenService.generateAccessToken(id, "Base64 Test", "NURSE");
    assertThat(token).isNotEmpty();

    Claims claims = tokenService.parseClaims(token);
    assertThat(claims.get("name", String.class)).isEqualTo("Base64 Test");
  }

  @Test
  void testSigningKey_missingSecretThrowsException() {
    var props = new JwtProperties(
        null,
        3600L,
        86400L,
        "refresh_token"
    );
    var tokenService = new JwtTokenService(props);
    var id = UUID.randomUUID();

    assertThatThrownBy(() -> tokenService.generateAccessToken(id, "Test", "DOCTOR"))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("JWT secret is not configured");

    var propsBlank = new JwtProperties(
        "   ",
        3600L,
        86400L,
        "refresh_token"
    );
    var tokenServiceBlank = new JwtTokenService(propsBlank);
    assertThatThrownBy(() -> tokenServiceBlank.generateAccessToken(id, "Test", "DOCTOR"))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("JWT secret is not configured");
  }

  @Test
  void testSigningKey_withShortSecretThrowsException() {
    var props = new JwtProperties(
        "c2hvcnQ=",
        3600L,
        86400L,
        "refresh_token"
    );
    var tokenService = new JwtTokenService(props);
    var id = UUID.randomUUID();
    assertThatThrownBy(() -> tokenService.generateAccessToken(id, "Test", "DOCTOR"))
        .isInstanceOf(io.jsonwebtoken.security.WeakKeyException.class);
  }
}
