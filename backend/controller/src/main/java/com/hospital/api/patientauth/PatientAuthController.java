package com.hospital.api.patientauth;

import com.hospital.api.config.SecurityHttpProperties;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.auth.LoginRequest;
import com.hospital.shared.auth.RefreshRequest;
import com.hospital.shared.auth.TokenPair;
import com.hospital.shared.patientauth.PatientAuthLoginResponse;
import com.hospital.shared.patientauth.PatientClaimRequest;
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
import com.hospital.api.auth.JwtTokenService;

@RestController
@RequestMapping("/api/v1/patient-auth")
public class PatientAuthController {
  private final JwtTokenService jwtTokenService;
  private final PatientAuthService patientAuthService;
  private final SecurityHttpProperties securityHttpProperties;

  public PatientAuthController(
      JwtTokenService jwtTokenService,
      PatientAuthService patientAuthService,
      SecurityHttpProperties securityHttpProperties) {
    this.jwtTokenService = jwtTokenService;
    this.patientAuthService = patientAuthService;
    this.securityHttpProperties = securityHttpProperties;
  }

  @PostMapping("/claim")
  public ResponseEntity<ApiResponse<PatientAuthLoginResponse>> claim(
      @Valid @RequestBody PatientClaimRequest request,
      HttpServletResponse response) {
    var payload = patientAuthService.claim(request);
    response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie(payload.tokens().refreshToken()).toString());
    return ResponseEntity.ok(ApiResponse.ok(
        new PatientAuthLoginResponse(
            payload.userId(),
            payload.fullName(),
            payload.role(),
            new TokenPair(payload.tokens().accessToken(), null, payload.tokens().expiresInSeconds())),
        "Patient portal access activated"));
  }

  @PostMapping("/login")
  public ResponseEntity<ApiResponse<PatientAuthLoginResponse>> login(
      @Valid @RequestBody LoginRequest request,
      HttpServletResponse response) {
    var payload = patientAuthService.login(request);
    response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie(payload.tokens().refreshToken()).toString());
    return ResponseEntity.ok(ApiResponse.ok(
        new PatientAuthLoginResponse(
            payload.userId(),
            payload.fullName(),
            payload.role(),
            new TokenPair(payload.tokens().accessToken(), null, payload.tokens().expiresInSeconds())),
        "Authenticated successfully"));
  }

  @PostMapping("/refresh")
  public ResponseEntity<ApiResponse<TokenPair>> refresh(
      HttpServletRequest request,
      @RequestBody(required = false) RefreshRequest refreshRequest,
      HttpServletResponse response) {
    var cookieToken = readCookie(request);
    var rawRefreshToken = cookieToken != null && !cookieToken.isBlank()
        ? cookieToken
        : refreshRequest == null ? null : refreshRequest.refreshToken();
    var tokenPair = patientAuthService.refresh(rawRefreshToken);
    response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie(tokenPair.refreshToken()).toString());
    return ResponseEntity.ok(ApiResponse.ok(
        new TokenPair(tokenPair.accessToken(), null, tokenPair.expiresInSeconds()),
        "Access token refreshed"));
  }

  @PostMapping("/logout")
  public ResponseEntity<ApiResponse<String>> logout(HttpServletResponse response) {
    response.addHeader(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString());
    return ResponseEntity.ok(ApiResponse.ok("Logged out", "Logged out"));
  }

  private ResponseCookie refreshCookie(String value) {
    return ResponseCookie.from(jwtTokenService.patientRefreshCookieName(), value)
        .httpOnly(true)
        .secure(securityHttpProperties.secureCookies())
        .sameSite(securityHttpProperties.refreshCookieSameSite())
        .path("/api/v1/patient-auth")
        .maxAge(jwtTokenService.refreshTokenExpirationSeconds())
        .build();
  }

  private ResponseCookie clearRefreshCookie() {
    return ResponseCookie.from(jwtTokenService.patientRefreshCookieName(), "")
        .httpOnly(true)
        .secure(securityHttpProperties.secureCookies())
        .sameSite(securityHttpProperties.refreshCookieSameSite())
        .path("/api/v1/patient-auth")
        .maxAge(0)
        .build();
  }

  private String readCookie(HttpServletRequest request) {
    var cookies = request.getCookies();
    if (cookies == null) {
      return null;
    }

    for (Cookie cookie : cookies) {
      if (jwtTokenService.patientRefreshCookieName().equals(cookie.getName())) {
        return cookie.getValue();
      }
    }

    return null;
  }
}
