package com.hospital.api.auth;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.hospital.api.config.RestExceptionHandler;
import com.hospital.api.config.SecurityHttpProperties;
import com.hospital.shared.auth.LoginRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class AuthControllerTest {

  private MockMvc mockMvc;
  private AuthService authService;
  private JwtTokenService jwtTokenService;

  @BeforeEach
  void setUp() {
    authService = mock(AuthService.class);
    jwtTokenService = mock(JwtTokenService.class);
    var securityHttpProperties = mock(SecurityHttpProperties.class);

    when(jwtTokenService.refreshCookieName()).thenReturn("refresh_token");
    when(jwtTokenService.refreshTokenExpirationSeconds()).thenReturn(86400L);
    when(securityHttpProperties.secureCookies()).thenReturn(false);
    when(securityHttpProperties.refreshCookieSameSite()).thenReturn("Lax");

    mockMvc = MockMvcBuilders.standaloneSetup(
            new AuthController(authService, jwtTokenService, securityHttpProperties))
        .setControllerAdvice(new RestExceptionHandler())
        .build();
  }

  @Nested
  class Login {

    @Test
    void emptyBodyReturns400() throws Exception {
      mockMvc.perform(post("/api/v1/auth/login")
              .contentType(MediaType.APPLICATION_JSON)
              .content(""))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("validation_error"));
    }

    @Test
    void malformedJsonReturns400() throws Exception {
      mockMvc.perform(post("/api/v1/auth/login")
              .contentType(MediaType.APPLICATION_JSON)
              .content("{invalid json"))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("validation_error"));
    }

    @Test
    void missingEmailFieldReturns400() throws Exception {
      mockMvc.perform(post("/api/v1/auth/login")
              .contentType(MediaType.APPLICATION_JSON)
              .content("""
                  {"password": "somePassword"}
                  """))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("validation_error"));
    }

    @Test
    void missingPasswordFieldReturns400() throws Exception {
      mockMvc.perform(post("/api/v1/auth/login")
              .contentType(MediaType.APPLICATION_JSON)
              .content("""
                  {"email": "user@hospital.vn"}
                  """))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("validation_error"));
    }

    @Test
    void invalidEmailFormatReturns400() throws Exception {
      mockMvc.perform(post("/api/v1/auth/login")
              .contentType(MediaType.APPLICATION_JSON)
              .content("""
                  {"email": "not-an-email", "password": "somePassword"}
                  """))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("validation_error"));
    }

    @Test
    void badCredentialsReturns401() throws Exception {
      when(authService.login(any(LoginRequest.class)))
          .thenThrow(new BadCredentialsException("Invalid email or password"));

      mockMvc.perform(post("/api/v1/auth/login")
              .contentType(MediaType.APPLICATION_JSON)
              .content("""
                  {"email": "wrong@hospital.vn", "password": "WrongPass1"}
                  """))
          .andExpect(status().isUnauthorized())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("unauthorized"));
    }
  }

  @Nested
  class Refresh {

    @Test
    void withoutCookieAndNullBodyReturns401() throws Exception {
      when(authService.refresh(any()))
          .thenThrow(new BadCredentialsException("Invalid refresh token"));

      mockMvc.perform(post("/api/v1/auth/refresh")
              .contentType(MediaType.APPLICATION_JSON)
              .content("{}"))
          .andExpect(status().isUnauthorized())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("unauthorized"));
    }

    @Test
    void blankTokenInBodyCallsRefreshAndReturns401() throws Exception {
      when(authService.refresh(any()))
          .thenThrow(new BadCredentialsException("Invalid refresh token"));

      mockMvc.perform(post("/api/v1/auth/refresh")
              .contentType(MediaType.APPLICATION_JSON)
              .content("""
                  {"refreshToken": ""}
                  """))
          .andExpect(status().isUnauthorized())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("unauthorized"));
    }
  }

  @Nested
  class Logout {

    @Test
    void logoutReturns200() throws Exception {
      mockMvc.perform(post("/api/v1/auth/logout"))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.success").value(true))
          .andExpect(jsonPath("$.data").value("Logged out"));
    }
  }
}
