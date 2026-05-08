package com.hospital.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

/**
 * Tests for patient portal endpoints:
 * - GET /api/v1/patient-portal/overview
 * - GET /api/v1/patient-portal/appointments
 * - GET /api/v1/patient-portal/lab-results
 * - GET /api/v1/patient-portal/messages
 * - GET /api/v1/patient-portal/profile
 * - PUT /api/v1/patient-portal/profile
 */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class PatientPortalIntegrationTest extends AbstractIntegrationTest {

  private String patientToken() throws Exception {
    return patientLoginAndGetAccessToken("patient@example.com", "Patient@1234");
  }

  @Test
  void overviewReturnsPatientDashboard() throws Exception {
    var token = patientToken();

    mockMvc.perform(get("/api/v1/patient-portal/overview")
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data").exists());
  }

  @Test
  void overviewRequiresAuthentication() throws Exception {
    mockMvc.perform(get("/api/v1/patient-portal/overview"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void appointmentListReturnsPatientAppointments() throws Exception {
    var token = patientToken();

    mockMvc.perform(get("/api/v1/patient-portal/appointments")
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data").isArray());
  }

  @Test
  void labResultListReturnsPatientLabResults() throws Exception {
    var token = patientToken();

    mockMvc.perform(get("/api/v1/patient-portal/lab-results")
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data").isArray());
  }

  @Test
  void messageListReturnsPatientMessages() throws Exception {
    var token = patientToken();

    mockMvc.perform(get("/api/v1/patient-portal/messages")
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data").isArray());
  }

  @Test
  void profileReturnsPatientProfile() throws Exception {
    var token = patientToken();

    mockMvc.perform(get("/api/v1/patient-portal/profile")
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.fullName").value("Nguyen Thi Hoa"))
        .andExpect(jsonPath("$.data.email").value("patient@example.com"));
  }

  @Test
  void updateProfileSucceedsWithValidData() throws Exception {
    var token = patientToken();

    mockMvc.perform(put("/api/v1/patient-portal/profile")
            .header("Authorization", "Bearer " + token)
            .contentType("application/json")
            .content("""
                {
                  "fullName": "Nguyen Thi Hoa",
                  "email": "patient@example.com",
                  "phone": "0998877665",
                  "occupation": "Software Engineer",
                  "bloodType": "A+",
                  "medicalHistory": "Seasonal allergies and mild asthma. Updated.",
                  "drugAllergies": "Penicillin"
                }
                """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.phone").value("0998877665"));
  }

  @Test
  void staffTokenCannotAccessPatientPortalOverview() throws Exception {
    var nurseToken = nurseToken();

    mockMvc.perform(get("/api/v1/patient-portal/overview")
            .header("Authorization", "Bearer " + nurseToken))
        .andExpect(status().isForbidden());
  }

  @Test
  void staffTokenCannotAccessPatientPortalProfile() throws Exception {
    var adminToken = adminToken();

    mockMvc.perform(get("/api/v1/patient-portal/profile")
            .header("Authorization", "Bearer " + adminToken))
        .andExpect(status().isForbidden());
  }

  @Test
  void patientTokenCannotAccessStaffEndpoints() throws Exception {
    var token = patientToken();

    mockMvc.perform(get("/api/v1/admin/users")
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isForbidden());
  }

  @Test
  void labResultsContainSeededData() throws Exception {
    var token = patientToken();

    mockMvc.perform(get("/api/v1/patient-portal/lab-results")
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data[0].testName").value("Complete Blood Count"));
  }

  @Test
  void messagesContainSeededThreads() throws Exception {
    var token = patientToken();

    mockMvc.perform(get("/api/v1/patient-portal/messages")
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data[0].subject").value("Follow-up visit preparation"));
  }
}
