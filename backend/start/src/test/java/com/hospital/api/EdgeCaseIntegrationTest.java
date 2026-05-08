package com.hospital.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

/**
 * Comprehensive edge-case tests covering cross-domain concerns:
 * - Invalid UUIDs
 * - Missing/empty required fields
 * - SQL injection attempts
 * - Duplicate creation
 * - Invalid status transitions
 * - Booking conflicts
 * - Malformed JSON
 * - Empty body
 */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class EdgeCaseIntegrationTest extends AbstractIntegrationTest {

  // ── Invalid UUIDs ─────────────────────────────────────────────────────

  @Test
  void malformedUuidReturns400() throws Exception {
    mockMvc.perform(get("/api/v1/admin/users/not-a-uuid")
            .header("Authorization", "Bearer " + adminToken()))
        .andExpect(status().isBadRequest());
  }

  @Test
  void nonExistentAppointmentReturns404() throws Exception {
    mockMvc.perform(put("/api/v1/appointments/{appointmentId}/status", UUID.randomUUID())
            .header("Authorization", "Bearer " + doctorOneToken())
            .contentType("application/json")
            .content("""
                {"status": "IN_PROGRESS"}
                """))
        .andExpect(status().isNotFound());
  }

  // ── Duplicate Booking ─────────────────────────────────────────────────

  @Test
  void duplicateBookingSameSlotIsRejected() throws Exception {
    var doctor = userRepository.findByEmailIgnoreCaseAndActiveTrue("doctor1@hospital.vn").orElseThrow();
    var slot = createSlot(doctor.getId(), LocalDate.of(2030, 9, 1), LocalTime.of(9, 0));

    // First booking succeeds
    createAppointment(doctor.getId().toString(), slot.getId().toString());

    // Second booking same slot should fail
    mockMvc.perform(post("/api/v1/appointments")
            .contentType("application/json")
            .content("""
                {
                  "doctorId": "%s",
                  "firstSlotId": "%s",
                  "aiDurationMinutes": 30,
                  "patientFullName": "Second Patient",
                  "patientCccd": "098765432102",
                  "patientEmail": "second.patient@example.com",
                  "patientPhone": "0902345678",
                  "patientDateOfBirth": "1985-01-01",
                  "patientGender": "FEMALE",
                  "patientAddress": {
                    "provinceOrCity": "Ho Chi Minh City",
                    "district": "District 2",
                    "streetAddress": "456 Another Street"
                  },
                  "symptoms": "Headache"
                }
                """.formatted(doctor.getId(), slot.getId())))
        .andExpect(status().isConflict());
  }

  // ── Invalid Status Transitions ────────────────────────────────────────

  @Test
  void appointmentCannotSkipFromConfirmedToInProgress() throws Exception {
    var doctor = userRepository.findByEmailIgnoreCaseAndActiveTrue("doctor1@hospital.vn").orElseThrow();
    var slot = createSlot(doctor.getId(), LocalDate.of(2030, 9, 2), LocalTime.of(10, 0));
    var booking = createAppointment(doctor.getId().toString(), slot.getId().toString());
    var appointmentId = booking.get("data").get("id").asText();

    // Try to set IN_PROGRESS without checking in first
    mockMvc.perform(put("/api/v1/appointments/{appointmentId}/status", appointmentId)
            .header("Authorization", "Bearer " + doctorOneToken())
            .contentType("application/json")
            .content("""
                {"status": "IN_PROGRESS"}
                """))
        .andExpect(status().is4xxClientError());
  }

  // ── Malformed JSON ────────────────────────────────────────────────────

  @Test
  void malformedJsonBodyReturns400() throws Exception {
    mockMvc.perform(post("/api/v1/auth/login")
            .contentType("application/json")
            .content("{ invalid json"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void emptyBodyOnRequiredFieldEndpointReturns400() throws Exception {
    mockMvc.perform(post("/api/v1/auth/login")
            .contentType("application/json")
            .content("{}"))
        .andExpect(status().isBadRequest());
  }

  // ── SQL Injection Attempts ────────────────────────────────────────────

  @Test
  void sqlInjectionInLoginEmailIsRejected() throws Exception {
    mockMvc.perform(post("/api/v1/auth/login")
            .contentType("application/json")
            .content("""
                {
                  "email": "admin@hospital.vn' OR '1'='1",
                  "password": "anything"
                }
                """))
        .andExpect(status().is4xxClientError());
  }

  @Test
  void sqlInjectionInSearchParamsIsHarmless() throws Exception {
    mockMvc.perform(get("/api/v1/doctors")
            .param("search", "' OR 1=1; DROP TABLE users; --"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data").isArray());
  }

  // ── Missing Content-Type ──────────────────────────────────────────────

  @Test
  void postWithoutContentTypeReturns415() throws Exception {
    mockMvc.perform(post("/api/v1/auth/login")
            .content("""
                {"email": "admin@hospital.vn", "password": "Admin@1234"}
                """))
        .andExpect(status().isUnsupportedMediaType());
  }

  // ── Authorization Edge Cases ──────────────────────────────────────────

  @Test
  void expiredTokenReturns401() throws Exception {
    // Use a clearly invalid/expired token
    mockMvc.perform(get("/api/v1/admin/users")
            .header("Authorization", "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjoxfQ.invalid"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void malformedBearerTokenReturns401() throws Exception {
    mockMvc.perform(get("/api/v1/admin/users")
            .header("Authorization", "Bearer not-a-jwt-at-all"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void missingBearerPrefixReturns401() throws Exception {
    var token = adminToken();
    mockMvc.perform(get("/api/v1/admin/users")
            .header("Authorization", token))
        .andExpect(status().isUnauthorized());
  }

  // ── Appointment Edge Cases ────────────────────────────────────────────

  @Test
  void bookingWithNonExistentDoctorFails() throws Exception {
    mockMvc.perform(post("/api/v1/appointments")
            .contentType("application/json")
            .content("""
                {
                  "doctorId": "%s",
                  "firstSlotId": "%s",
                  "aiDurationMinutes": 30,
                  "patientFullName": "Test Patient",
                  "patientCccd": "098765432199",
                  "patientEmail": "edge.test@example.com",
                  "patientPhone": "0909999999",
                  "patientDateOfBirth": "1990-01-01",
                  "patientGender": "MALE",
                  "patientAddress": {
                    "provinceOrCity": "Ho Chi Minh City",
                    "district": "District 1",
                    "streetAddress": "Test"
                  },
                  "symptoms": "Edge case test"
                }
                """.formatted(UUID.randomUUID(), UUID.randomUUID())))
        .andExpect(status().isNotFound());
  }

  @Test
  void bookingWithMissingPatientNameFails() throws Exception {
    var doctor = userRepository.findByEmailIgnoreCaseAndActiveTrue("doctor1@hospital.vn").orElseThrow();
    var slot = createSlot(doctor.getId(), LocalDate.of(2030, 9, 10), LocalTime.of(11, 0));

    mockMvc.perform(post("/api/v1/appointments")
            .contentType("application/json")
            .content("""
                {
                  "doctorId": "%s",
                  "firstSlotId": "%s",
                  "aiDurationMinutes": 30,
                  "patientFullName": "",
                  "patientCccd": "098765432103",
                  "patientEmail": "empty.name@example.com",
                  "patientPhone": "0903456789",
                  "patientDateOfBirth": "1990-01-01",
                  "patientGender": "MALE",
                  "patientAddress": {
                    "provinceOrCity": "Ho Chi Minh City",
                    "district": "District 1",
                    "streetAddress": "Test"
                  },
                  "symptoms": "Test"
                }
                """.formatted(doctor.getId(), slot.getId())))
        .andExpect(status().isBadRequest());
  }

  // ── Consistent Error Envelope ─────────────────────────────────────────

  @Test
  void allErrorsFollowStandardEnvelope() throws Exception {
    // 401 Unauthorized
    var result401 = mockMvc.perform(get("/api/v1/admin/users"))
        .andExpect(status().isUnauthorized())
        .andReturn();
    var body401 = objectMapper.readTree(result401.getResponse().getContentAsString());
    assert body401.has("success") && !body401.get("success").asBoolean();
    assert body401.has("error");

    // 400 Bad Request
    var result400 = mockMvc.perform(post("/api/v1/auth/login")
            .contentType("application/json")
            .content("{}"))
        .andExpect(status().isBadRequest())
        .andReturn();
    var body400 = objectMapper.readTree(result400.getResponse().getContentAsString());
    assert body400.has("success") && !body400.get("success").asBoolean();
  }
}
