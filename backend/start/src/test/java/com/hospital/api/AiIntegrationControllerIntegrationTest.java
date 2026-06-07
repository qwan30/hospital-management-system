package com.hospital.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.hospital.core.patient.PatientRepository;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class AiIntegrationControllerIntegrationTest extends AbstractIntegrationTest {

  @Autowired
  private PatientRepository patientRepository;

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
    var token = doctorOneToken();
    var patients = patientRepository.findAll();
    if (patients.isEmpty()) return;
    UUID patientId = patients.get(0).getId();

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
    var token = doctorOneToken();
    var patients = patientRepository.findAll();
    if (patients.isEmpty()) return;
    UUID patientId = patients.get(0).getId();

    mockMvc.perform(get("/api/v1/ai/patients/{patientId}/timeline", patientId)
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data").isArray());
  }

  @Test
  void getPermissionsSucceeds() throws Exception {
    var token = doctorOneToken();
    var patients = patientRepository.findAll();
    if (patients.isEmpty()) return;
    UUID patientId = patients.get(0).getId();
    UUID userUuid = doctorOneId();

    mockMvc.perform(get("/api/v1/ai/patients/{patientId}/permissions", patientId)
            .header("Authorization", "Bearer " + token)
            .param("userId", userUuid.toString()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.userId").value(userUuid.toString()))
        .andExpect(jsonPath("$.data.patientId").value(patientId.toString()))
        .andExpect(jsonPath("$.data.hasAccess").exists())
        .andExpect(jsonPath("$.data.scopeType").exists());
  }

  @Test
  void getChangesSucceeds() throws Exception {
    var token = doctorOneToken();

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
}
