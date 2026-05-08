package com.hospital.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

/**
 * Tests for lab result management endpoints:
 * - POST   /api/v1/lab-results
 * - GET    /api/v1/lab-results/{resultId}
 * - GET    /api/v1/appointments/{appointmentId}/lab-results
 * - DELETE /api/v1/lab-results/{resultId}
 */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class LabResultIntegrationTest extends AbstractIntegrationTest {

  @Test
  void createLabResultRequiresAuthentication() throws Exception {
    mockMvc.perform(post("/api/v1/lab-results")
            .contentType("application/json")
            .content("{}"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void createLabResultSucceeds() throws Exception {
    var doctor = userRepository.findByEmailIgnoreCaseAndActiveTrue("doctor1@hospital.vn").orElseThrow();
    var slot = createSlot(doctor.getId(), LocalDate.of(2030, 7, 1), LocalTime.of(10, 0));
    var booking = createAppointment(doctor.getId().toString(), slot.getId().toString());
    var appointmentId = booking.get("data").get("id").asText();

    mockMvc.perform(post("/api/v1/lab-results")
            .header("Authorization", "Bearer " + doctorOneToken())
            .contentType("application/json")
            .content("""
                {
                  "appointmentId": "%s",
                  "testName": "Cholesterol Panel",
                  "resultValue": "Total: 200 mg/dL, LDL: 130, HDL: 55",
                  "referenceRange": "Desirable: <200 mg/dL total",
                  "notes": "Slightly elevated LDL",
                  "status": "COMPLETED"
                }
                """.formatted(appointmentId)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.data.testName").value("Cholesterol Panel"))
        .andExpect(jsonPath("$.data.status").value("COMPLETED"));
  }

  @Test
  void getLabResultById() throws Exception {
    var doctor = userRepository.findByEmailIgnoreCaseAndActiveTrue("doctor1@hospital.vn").orElseThrow();
    var slot = createSlot(doctor.getId(), LocalDate.of(2030, 7, 2), LocalTime.of(10, 0));
    var booking = createAppointment(doctor.getId().toString(), slot.getId().toString());
    var appointmentId = booking.get("data").get("id").asText();

    var createResult = mockMvc.perform(post("/api/v1/lab-results")
            .header("Authorization", "Bearer " + doctorOneToken())
            .contentType("application/json")
            .content("""
                {
                  "appointmentId": "%s",
                  "testName": "Urinalysis",
                  "resultValue": "Normal",
                  "referenceRange": "Normal parameters",
                  "status": "COMPLETED"
                }
                """.formatted(appointmentId)))
        .andExpect(status().isCreated())
        .andReturn();

    var labResultId = objectMapper.readTree(createResult.getResponse().getContentAsString())
        .get("data").get("id").asText();

    mockMvc.perform(get("/api/v1/lab-results/{resultId}", labResultId)
            .header("Authorization", "Bearer " + doctorOneToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.testName").value("Urinalysis"));
  }

  @Test
  void getLabResultsByAppointment() throws Exception {
    var doctor = userRepository.findByEmailIgnoreCaseAndActiveTrue("doctor1@hospital.vn").orElseThrow();
    var slot = createSlot(doctor.getId(), LocalDate.of(2030, 7, 3), LocalTime.of(10, 0));
    var booking = createAppointment(doctor.getId().toString(), slot.getId().toString());
    var appointmentId = booking.get("data").get("id").asText();

    mockMvc.perform(post("/api/v1/lab-results")
            .header("Authorization", "Bearer " + doctorOneToken())
            .contentType("application/json")
            .content("""
                {
                  "appointmentId": "%s",
                  "testName": "Blood Glucose",
                  "resultValue": "95 mg/dL",
                  "referenceRange": "Fasting: 70-100 mg/dL",
                  "status": "COMPLETED"
                }
                """.formatted(appointmentId)))
        .andExpect(status().isCreated());

    mockMvc.perform(get("/api/v1/appointments/{appointmentId}/lab-results", appointmentId)
            .header("Authorization", "Bearer " + doctorOneToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data").isArray())
        .andExpect(jsonPath("$.data[0].testName").value("Blood Glucose"));
  }

  @Test
  void getNonExistentLabResultReturns404() throws Exception {
    mockMvc.perform(get("/api/v1/lab-results/{resultId}", UUID.randomUUID())
            .header("Authorization", "Bearer " + doctorOneToken()))
        .andExpect(status().isNotFound());
  }

  @Test
  void deleteLabResult() throws Exception {
    var doctor = userRepository.findByEmailIgnoreCaseAndActiveTrue("doctor1@hospital.vn").orElseThrow();
    var slot = createSlot(doctor.getId(), LocalDate.of(2030, 7, 5), LocalTime.of(10, 0));
    var booking = createAppointment(doctor.getId().toString(), slot.getId().toString());
    var appointmentId = booking.get("data").get("id").asText();

    var createResult = mockMvc.perform(post("/api/v1/lab-results")
            .header("Authorization", "Bearer " + doctorOneToken())
            .contentType("application/json")
            .content("""
                {
                  "appointmentId": "%s",
                  "testName": "To Be Deleted",
                  "resultValue": "N/A",
                  "referenceRange": "N/A",
                  "status": "PENDING"
                }
                """.formatted(appointmentId)))
        .andExpect(status().isCreated())
        .andReturn();

    var labResultId = objectMapper.readTree(createResult.getResponse().getContentAsString())
        .get("data").get("id").asText();

    mockMvc.perform(delete("/api/v1/lab-results/{resultId}", labResultId)
            .header("Authorization", "Bearer " + doctorOneToken()))
        .andExpect(status().isNoContent());
  }

  @Test
  void createLabResultFailsWithMissingTestName() throws Exception {
    var doctor = userRepository.findByEmailIgnoreCaseAndActiveTrue("doctor1@hospital.vn").orElseThrow();
    var slot = createSlot(doctor.getId(), LocalDate.of(2030, 7, 6), LocalTime.of(10, 0));
    var booking = createAppointment(doctor.getId().toString(), slot.getId().toString());
    var appointmentId = booking.get("data").get("id").asText();

    mockMvc.perform(post("/api/v1/lab-results")
            .header("Authorization", "Bearer " + doctorOneToken())
            .contentType("application/json")
            .content("""
                {
                  "appointmentId": "%s",
                  "testName": "",
                  "resultValue": "Some value"
                }
                """.formatted(appointmentId)))
        .andExpect(status().isBadRequest());
  }

  @Test
  void accountantCannotCreateLabResults() throws Exception {
    mockMvc.perform(post("/api/v1/lab-results")
            .header("Authorization", "Bearer " + accountantToken())
            .contentType("application/json")
            .content("""
                {
                  "appointmentId": "%s",
                  "testName": "Unauthorized Test",
                  "resultValue": "N/A",
                  "status": "PENDING"
                }
                """.formatted(UUID.randomUUID())))
        .andExpect(status().isForbidden());
  }
}
