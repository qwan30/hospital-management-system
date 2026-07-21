package com.hospital.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class AiIntegrationControllerIntegrationTest extends AbstractIntegrationTest {

  @Test
  void healthCheckSucceeds() throws Exception {
    var token = doctorOneToken();

    mockMvc.perform(get("/api/v1/ai/health")
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.status").value("healthy"))
        .andExpect(jsonPath("$.data.hmsReachable").value(true));
  }

  @Test
  void searchPatientsSucceeds() throws Exception {
    var token = doctorOneToken();

    mockMvc.perform(get("/api/v1/ai/patients?query=")
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data").isArray());
  }

  @Test
  void getSnapshotSucceedsForValidPatient() throws Exception {
    var token = adminToken();
    UUID patientId = createScopedPatientForDoctorOne();

    mockMvc.perform(get("/api/v1/ai/patients/{patientId}/snapshot", patientId)
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.patientId").value(patientId.toString()))
        .andExpect(jsonPath("$.data.name").exists())
        .andExpect(jsonPath("$.data.allergies").isArray())
        .andExpect(jsonPath("$.data.currentMedications").isArray())
        .andExpect(jsonPath("$.data.recentLabs").isArray());
  }

  @Test
  void getTimelineSucceedsForValidPatient() throws Exception {
    var token = adminToken();
    UUID patientId = createScopedPatientForDoctorOne();

    mockMvc.perform(get("/api/v1/ai/patients/{patientId}/timeline", patientId)
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data").isArray());
  }

  @Test
  void getPermissionsSucceeds() throws Exception {
    var token = adminToken();
    UUID patientId = createScopedPatientForDoctorOne();

    mockMvc.perform(get("/api/v1/ai/patients/{patientId}/permissions", patientId)
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.patientId").value(patientId.toString()))
        .andExpect(jsonPath("$.data.hasAccess").value(true))
        .andExpect(jsonPath("$.data.scopeType").value("admin_role"))
        .andExpect(jsonPath("$.data.expiresAt").doesNotExist());
  }

  @Test
  void getChangesSucceeds() throws Exception {
    var token = adminToken();

    mockMvc.perform(get("/api/v1/ai/changes")
            .header("Authorization", "Bearer " + token)
            .param("since", "2026-06-07T00:00:00Z"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.lastTimestamp").exists())
        .andExpect(jsonPath("$.data.changes").isArray());
  }

  @Test
  void endpointsRequireAuthentication() throws Exception {
    mockMvc.perform(get("/api/v1/ai/health"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void unauthorizedUserIsBlocked() throws Exception {
    var pharmacistToken = pharmacistToken();

    mockMvc.perform(get("/api/v1/ai/health")
            .header("Authorization", "Bearer " + pharmacistToken))
        .andExpect(status().isForbidden());
  }

  private UUID createScopedPatientForDoctorOne() throws Exception {
    var suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
    var email = "ai-scope." + suffix + "@example.com";
    var cccd = "66" + String.format("%010d", Math.abs(suffix.hashCode()) % 10_000_000_000L);
    var slot = createSlot(doctorOneId(), LocalDate.of(2031, 2, 1), LocalTime.of(10, 0));

    var result = mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/appointments")
            .contentType("application/json")
            .content("""
                {
                  "doctorId": "%s",
                  "firstSlotId": "%s",
                  "aiDurationMinutes": 30,
                  "patientFullName": "AI Scoped Patient",
                  "patientCccd": "%s",
                  "patientEmail": "%s",
                  "patientPhone": "0901234567",
                  "patientDateOfBirth": "1990-05-15",
                  "patientGender": "FEMALE",
                  "patientAddress": {
                    "provinceOrCity": "Ho Chi Minh City",
                    "district": "District 1",
                    "streetAddress": "123 AI Scope Street"
                  },
                  "symptoms": "AI integration authorization fixture"
                }
                """.formatted(doctorOneId(), slot.getId(), cccd, email)))
        .andExpect(status().isCreated())
        .andReturn();

    var response = objectMapper.readTree(result.getResponse().getContentAsString()).path("data");
    var appointment = appointmentRepository.findById(UUID.fromString(response.path("id").asText())).orElseThrow();
    appointment.setStatus(com.hospital.shared.enums.AppointmentStatus.DONE);
    appointmentRepository.saveAndFlush(appointment);
    return UUID.fromString(response.path("patientId").asText());
  }
}
