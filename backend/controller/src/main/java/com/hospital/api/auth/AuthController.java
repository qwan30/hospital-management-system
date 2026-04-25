package com.hospital.api.auth;

import com.hospital.api.config.SecurityHttpProperties;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.auth.LoginRequest;
import com.hospital.shared.auth.LoginResponse;
import com.hospital.shared.auth.RefreshRequest;
import com.hospital.shared.auth.TokenPair;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
  private final AuthService authService;
  private final JwtTokenService jwtTokenService;
  private final SecurityHttpProperties securityHttpProperties;

  public AuthController(
      AuthService authService,
      JwtTokenService jwtTokenService,
      SecurityHttpProperties securityHttpProperties) {
    this.authService = authService;
    this.jwtTokenService = jwtTokenService;
    this.securityHttpProperties = securityHttpProperties;
  }

  @PostMapping("/login")
  public ResponseEntity<ApiResponse<LoginResponse>> login(
      @Valid @RequestBody LoginRequest request,
      HttpServletResponse response) {
    var payload = authService.login(request);
    response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie(payload.tokens().refreshToken()).toString());
    var sanitizedPayload = new LoginResponse(
        payload.userId(),
        payload.fullName(),
        payload.role(),
        new TokenPair(payload.tokens().accessToken(), null, payload.tokens().expiresInSeconds()));
    return ResponseEntity.ok(ApiResponse.ok(sanitizedPayload, "Authenticated successfully"));
  }

  @PostMapping("/refresh")
  public ResponseEntity<ApiResponse<TokenPair>> refresh(
      HttpServletRequest httpServletRequest,
      @RequestBody(required = false) RefreshRequest request,
      HttpServletResponse response) {
    var cookieToken = readCookie(httpServletRequest);
    var rawRefreshToken = cookieToken != null && !cookieToken.isBlank()
        ? cookieToken
        : request == null ? null : request.refreshToken();
    var tokenPair = authService.refresh(rawRefreshToken);
    response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie(tokenPair.refreshToken()).toString());
    var sanitizedTokenPair = new TokenPair(tokenPair.accessToken(), null, tokenPair.expiresInSeconds());
    return ResponseEntity.ok(ApiResponse.ok(sanitizedTokenPair, "Access token refreshed"));
  }

  @PostMapping("/logout")
  public ResponseEntity<ApiResponse<String>> logout(HttpServletResponse response) {
    response.addHeader(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString());
    return ResponseEntity.ok(ApiResponse.ok("Logged out", "Logged out"));
  }

  private ResponseCookie refreshCookie(String value) {
    return ResponseCookie.from(jwtTokenService.refreshCookieName(), value)
        .httpOnly(true)
        .secure(securityHttpProperties.secureCookies())
        .sameSite(securityHttpProperties.refreshCookieSameSite())
        .path("/api/v1/auth")
        .maxAge(jwtTokenService.refreshTokenExpirationSeconds())
        .build();
  }

  private ResponseCookie clearRefreshCookie() {
    return ResponseCookie.from(jwtTokenService.refreshCookieName(), "")
        .httpOnly(true)
        .secure(securityHttpProperties.secureCookies())
        .sameSite(securityHttpProperties.refreshCookieSameSite())
        .path("/api/v1/auth")
        .maxAge(0)
        .build();
  }

  private String readCookie(HttpServletRequest request) {
    var cookies = request.getCookies();
    if (cookies == null) {
      return null;
    }

    for (Cookie cookie : cookies) {
      if (jwtTokenService.refreshCookieName().equals(cookie.getName())) {
        return cookie.getValue();
      }
    }

    return null;
  }
}
