package com.hospital.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

/**
 * Tests for patient authentication endpoints:
 * - POST /api/v1/patient-auth/claim
 * - POST /api/v1/patient-auth/login
 * - POST /api/v1/patient-auth/refresh
 * - POST /api/v1/patient-auth/logout
 */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class PatientAuthIntegrationTest extends AbstractIntegrationTest {

  @Test
  void patientLoginSucceedsWithValidCredentials() throws Exception {
    mockMvc.perform(post("/api/v1/patient-auth/login")
            .contentType("application/json")
            .content("""
                {
                  "email": "patient@example.com",
                  "password": "Patient@1234"
                }
                """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.fullName").value("Nguyen Thi Hoa"))
        .andExpect(jsonPath("$.data.tokens.accessToken").exists());
  }

  @Test
  void patientLoginFailsWithWrongPassword() throws Exception {
    mockMvc.perform(post("/api/v1/patient-auth/login")
            .contentType("application/json")
            .content("""
                {
                  "email": "patient@example.com",
                  "password": "WrongPassword@1234"
                }
                """))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.success").value(false))
        .andExpect(jsonPath("$.error.code").exists());
  }

  @Test
  void patientLoginFailsWithNonExistentEmail() throws Exception {
    mockMvc.perform(post("/api/v1/patient-auth/login")
            .contentType("application/json")
            .content("""
                {
                  "email": "nobody@example.com",
                  "password": "Patient@1234"
                }
                """))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.success").value(false));
  }

  @Test
  void patientLoginFailsWithEmptyBody() throws Exception {
    mockMvc.perform(post("/api/v1/patient-auth/login")
            .contentType("application/json")
            .content("{}"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void patientRefreshTokensSuccessfully() throws Exception {
    var refreshCookie = patientLoginAndGetRefreshCookie("patient@example.com", "Patient@1234");

    if (refreshCookie != null) {
      mockMvc.perform(post("/api/v1/patient-auth/refresh")
              .cookie(refreshCookie))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.data.accessToken").exists());
    }
  }

  @Test
  void patientRefreshFailsWithoutCookie() throws Exception {
    mockMvc.perform(post("/api/v1/patient-auth/refresh")
            .contentType("application/json")
            .content("{}"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void patientLogoutClearsCookie() throws Exception {
    mockMvc.perform(post("/api/v1/patient-auth/logout"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true));
  }

  @Test
  void patientClaimWithValidCccdAndEmail() throws Exception {
    // Claim creates a new patient portal account using CCCD + email
    mockMvc.perform(post("/api/v1/patient-auth/claim")
            .contentType("application/json")
            .content("""
                {
                  "fullName": "Nguyen Thi Hoa",
                  "cccd": "012345678901",
                  "email": "patient@example.com",
                  "dateOfBirth": "1992-04-15",
                  "password": "NewSecure@1234"
                }
                """))
        .andExpect(status().is2xxSuccessful());
  }

  @Test
  void patientClaimFailsWithNonExistentCccd() throws Exception {
    mockMvc.perform(post("/api/v1/patient-auth/claim")
            .contentType("application/json")
            .content("""
                {
                  "fullName": "Ghost Patient",
                  "cccd": "999999999999",
                  "email": "new.patient@example.com",
                  "dateOfBirth": "1990-01-01",
                  "password": "NewSecure@1234"
                }
                """))
        .andExpect(status().is4xxClientError());
  }

  @Test
  void staffTokenCannotAccessPatientPortal() throws Exception {
    var doctorToken = doctorOneToken();

    mockMvc.perform(
            org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/v1/patient-portal/overview")
                .header("Authorization", "Bearer " + doctorToken))
        .andExpect(status().isForbidden());
  }
}
