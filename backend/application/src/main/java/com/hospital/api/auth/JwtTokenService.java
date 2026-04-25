package com.hospital.api.auth;

import com.hospital.api.config.JwtProperties;
import com.hospital.core.user.UserEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtTokenService {
  private final JwtProperties jwtProperties;

  public JwtTokenService(JwtProperties jwtProperties) {
    this.jwtProperties = jwtProperties;
  }

  public String generateAccessToken(UserEntity user) {
    return generateAccessToken(user.getId(), user.getFullName(), user.getRole().name());
  }

  public String generateAccessToken(UUID subjectId, String fullName, String role) {
    return Jwts.builder()
        .subject(subjectId.toString())
        .claim("role", role)
        .claim("name", fullName)
        .issuedAt(now())
        .expiration(expiration(jwtProperties.accessTokenExpirationSeconds()))
        .signWith(signingKey())
        .compact();
  }

  public String generateRefreshToken(UserEntity user) {
    return generateRefreshToken(user.getId(), "staff");
  }

  public String generateRefreshToken(UUID subjectId, String scope) {
    return Jwts.builder()
        .subject(subjectId.toString())
        .claim("type", "refresh")
        .claim("scope", scope)
        .issuedAt(now())
        .expiration(expiration(jwtProperties.refreshTokenExpirationSeconds()))
        .signWith(signingKey())
        .compact();
  }

  public Claims parseClaims(String token) {
    return Jwts.parser().verifyWith(signingKey()).build()
        .parseSignedClaims(token)
        .getPayload();
  }

  public long accessTokenExpirationSeconds() {
    return jwtProperties.accessTokenExpirationSeconds();
  }

  public String refreshCookieName() {
    return jwtProperties.refreshCookieName();
  }

  public String patientRefreshCookieName() {
    return jwtProperties.refreshCookieName() + "_patient";
  }

  public long refreshTokenExpirationSeconds() {
    return jwtProperties.refreshTokenExpirationSeconds();
  }

  private Date now() {
    return Date.from(Instant.now());
  }

  private Date expiration(long seconds) {
    return Date.from(Instant.now().plusSeconds(seconds));
  }

  private SecretKey signingKey() {
    var secret = jwtProperties.secret();
    if (secret == null || secret.isBlank()) {
      throw new IllegalArgumentException("JWT secret is not configured");
    }

    if (secret.length() >= 32) {
      return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
  }
}
