package com.hospital.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;
import com.hospital.shared.enums.AppointmentStatus;
import com.hospital.api.ai.AiIntegrationController;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.junit.jupiter.api.Test;

class PatientRecordAuthorizationIntegrationTest extends AbstractIntegrationTest {

  @Test
  void aiPatientReadsHoldOneReadTransactionAcrossAuthorizationAndAssembly() throws Exception {
    var snapshot = AiIntegrationController.class.getMethod("getSnapshot", UUID.class, Authentication.class)
        .getAnnotation(Transactional.class);
    var timeline = AiIntegrationController.class.getMethod("getTimeline", UUID.class, Authentication.class)
        .getAnnotation(Transactional.class);

    assertThat(snapshot).isNotNull();
    assertThat(snapshot.readOnly()).isTrue();
    assertThat(timeline).isNotNull();
    assertThat(timeline.readOnly()).isTrue();
  }

  @Test
  void patientRecordEndpointsScopeDoctorsToTheirOwnTreatmentRelationships() throws Exception {
    var patient = createPatientForDoctorTwo();
    var patientId = patient.patientId();

    var doctorOneSearch = mockMvc.perform(get("/api/v1/patient-records")
            .queryParam("query", patient.email())
            .header("Authorization", "Bearer " + doctorOneToken()))
        .andExpect(status().isOk())
        .andReturn();

    var searchData = objectMapper.readTree(doctorOneSearch.getResponse().getContentAsString()).path("data");
    assertThat(searchData.findValuesAsText("patientId")).doesNotContain(patientId.toString());

    mockMvc.perform(get("/api/v1/patient-records/{patientId}", patientId)
            .header("Authorization", "Bearer " + doctorOneToken()))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.error.code").value("forbidden"));

    mockMvc.perform(get("/api/v1/patient-records/{patientId}", patientId)
            .header("Authorization", "Bearer " + doctorTwoToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.patientId").value(patientId.toString()));

    mockMvc.perform(get("/api/v1/patient-records/{patientId}", patientId)
            .header("Authorization", "Bearer " + adminToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.patientId").value(patientId.toString()));
  }

  @Test
  void aiPatientEndpointsUseAuthenticatedActorForEveryAuthorizationDecision() throws Exception {
    var patient = createPatientForDoctorTwo();
    var patientId = patient.patientId();
    var doctorOneId = doctorOneId();
    var doctorTwoId = doctorTwoId();

    var doctorOneSearch = mockMvc.perform(get("/api/v1/ai/patients")
            .queryParam("query", patient.email())
            .header("Authorization", "Bearer " + doctorOneToken()))
        .andExpect(status().isOk())
        .andReturn();
    assertThat(objectMapper.readTree(doctorOneSearch.getResponse().getContentAsString())
        .path("data").findValuesAsText("patientId")).doesNotContain(patientId.toString());

    mockMvc.perform(get("/api/v1/ai/patients/{patientId}/snapshot", patientId)
            .header("Authorization", "Bearer " + doctorOneToken()))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.error.code").value("forbidden"));

    mockMvc.perform(get("/api/v1/ai/patients/{patientId}/timeline", patientId)
            .header("Authorization", "Bearer " + doctorOneToken()))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.error.code").value("forbidden"));

    mockMvc.perform(get("/api/v1/ai/patients/{patientId}/permissions", patientId)
            .queryParam("userId", doctorTwoId.toString())
            .header("Authorization", "Bearer " + doctorOneToken()))
        .andExpect(status().isBadRequest());

    mockMvc.perform(get("/api/v1/ai/changes")
            .header("Authorization", "Bearer " + doctorOneToken()))
        .andExpect(status().isForbidden());

    mockMvc.perform(get("/api/v1/ai/patients/{patientId}/snapshot", patientId)
            .header("Authorization", "Bearer " + doctorTwoToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.patientId").value(patientId.toString()));

    mockMvc.perform(get("/api/v1/ai/patients/{patientId}/timeline", patientId)
            .header("Authorization", "Bearer " + doctorTwoToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data").isArray());

    mockMvc.perform(get("/api/v1/ai/patients/{patientId}/permissions", patientId)
            .header("Authorization", "Bearer " + doctorTwoToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.userId").value(doctorTwoId.toString()))
        .andExpect(jsonPath("$.data.hasAccess").value(true))
        .andExpect(jsonPath("$.data.scopeType").value("treatment_relationship"))
        .andExpect(jsonPath("$.data.expiresAt").doesNotExist());

    mockMvc.perform(get("/api/v1/ai/changes")
            .header("Authorization", "Bearer " + adminToken()))
        .andExpect(status().isOk());
  }

  @Test
  void doctorSearchSupportsBlankExactCccdAndTwentyRowLimitWhileAdminRemainsGlobal() throws Exception {
    ScopedPatient first = null;
    for (int index = 0; index < 21; index++) {
      var created = createPatientForDoctorTwo(index, true);
      if (first == null) {
        first = created;
      }
    }

    var doctorTwoBlank = mockMvc.perform(get("/api/v1/patient-records")
            .header("Authorization", "Bearer " + doctorTwoToken()))
        .andExpect(status().isOk())
        .andReturn();
    var doctorTwoData = objectMapper.readTree(doctorTwoBlank.getResponse().getContentAsString()).path("data");
    assertThat(doctorTwoData).hasSize(20);

    mockMvc.perform(get("/api/v1/patient-records")
            .queryParam("query", first.cccd())
            .header("Authorization", "Bearer " + doctorTwoToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data[0].patientId").value(first.patientId().toString()));

    mockMvc.perform(get("/api/v1/patient-records")
            .queryParam("query", first.email())
            .header("Authorization", "Bearer " + adminToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data[0].patientId").value(first.patientId().toString()));
  }

  @Test
  void confirmedFutureAppointmentDoesNotCreateTreatmentRelationship() throws Exception {
    var patient = createPatientForDoctorTwo(99, false);

    mockMvc.perform(get("/api/v1/patient-records/{patientId}", patient.patientId())
            .header("Authorization", "Bearer " + doctorTwoToken()))
        .andExpect(status().isForbidden());
  }

  private ScopedPatient createPatientForDoctorTwo() throws Exception {
    return createPatientForDoctorTwo(0, true);
  }

  private ScopedPatient createPatientForDoctorTwo(int sequence, boolean establishCare) throws Exception {
    var suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 10);
    var email = "scope." + suffix + "@example.com";
    var cccd = String.format("78%010d", sequence + 1);
    var slot = createSlot(doctorTwoId(), LocalDate.of(2032, 1, 1).plusDays(sequence), LocalTime.of(9, 0));

    var result = mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/appointments")
            .contentType("application/json")
            .content("""
                {
                  "doctorId": "%s",
                  "firstSlotId": "%s",
                  "aiDurationMinutes": 30,
                  "patientFullName": "Treatment Scope Patient",
                  "patientCccd": "%s",
                  "patientEmail": "%s",
                  "patientPhone": "0901234567",
                  "patientDateOfBirth": "1990-05-15",
                  "patientGender": "FEMALE",
                  "patientAddress": {
                    "provinceOrCity": "Ho Chi Minh City",
                    "district": "District 1",
                    "streetAddress": "123 Scope Street"
                  },
                  "symptoms": "Treatment scope authorization test"
                }
                """.formatted(doctorTwoId(), slot.getId(), cccd, email)))
        .andExpect(status().isCreated())
        .andReturn();

    var response = objectMapper.readTree(result.getResponse().getContentAsString()).path("data");
    var patientId = UUID.fromString(response.path("patientId").asText());
    if (establishCare) {
      var appointment = appointmentRepository.findById(UUID.fromString(response.path("id").asText())).orElseThrow();
      appointment.setStatus(AppointmentStatus.DONE);
      appointmentRepository.saveAndFlush(appointment);
    }
    return new ScopedPatient(patientId, email, cccd);
  }

  private record ScopedPatient(UUID patientId, String email, String cccd) {}
}
