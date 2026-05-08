package com.hospital.api;

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
 * Tests for the queue workflow endpoints:
 * - GET  /api/v1/queue/today
 * - POST /api/v1/queue/{appointmentId}/call
 * - POST /api/v1/queue/{appointmentId}/skip
 * - POST /api/v1/queue/{appointmentId}/assign-room
 * - POST /api/v1/queue/{appointmentId}/start-consultation
 * - POST /api/v1/queue/{appointmentId}/complete
 */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class QueueWorkflowIntegrationTest extends AbstractIntegrationTest {

  @Test
  void todayQueueRequiresAuthentication() throws Exception {
    mockMvc.perform(get("/api/v1/queue/today"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void todayQueueReturnsListForDate() throws Exception {
    mockMvc.perform(get("/api/v1/queue/today")
            .header("Authorization", "Bearer " + nurseToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data").isArray());
  }

  @Test
  void todayQueueAcceptsOptionalDateParam() throws Exception {
    mockMvc.perform(get("/api/v1/queue/today")
            .param("date", LocalDate.now().toString())
            .header("Authorization", "Bearer " + nurseToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data").isArray());
  }

  @Test
  void callPatientFailsForNonExistentAppointment() throws Exception {
    mockMvc.perform(post("/api/v1/queue/{appointmentId}/call", UUID.randomUUID())
            .header("Authorization", "Bearer " + nurseToken()))
        .andExpect(status().isNotFound());
  }

  @Test
  void skipPatientFailsForNonExistentAppointment() throws Exception {
    mockMvc.perform(post("/api/v1/queue/{appointmentId}/skip", UUID.randomUUID())
            .header("Authorization", "Bearer " + nurseToken()))
        .andExpect(status().isNotFound());
  }

  @Test
  void assignRoomFailsForNonExistentAppointment() throws Exception {
    mockMvc.perform(post("/api/v1/queue/{appointmentId}/assign-room", UUID.randomUUID())
            .header("Authorization", "Bearer " + nurseToken())
            .contentType("application/json")
            .content("""
                {"roomName": "Room A1"}
                """))
        .andExpect(status().isNotFound());
  }

  @Test
  void queueOperationsRejectUnauthorizedRoles() throws Exception {
    mockMvc.perform(post("/api/v1/queue/{appointmentId}/call", UUID.randomUUID())
            .header("Authorization", "Bearer " + accountantToken()))
        .andExpect(status().isForbidden());
  }

  @Test
  void fullQueueWorkflow_call_assignRoom_startConsultation_complete() throws Exception {
    // Create a same-day appointment so it appears in the queue
    var doctor = userRepository.findByEmailIgnoreCaseAndActiveTrue("doctor1@hospital.vn").orElseThrow();
    var today = LocalDate.now();
    var slot = createSlot(doctor.getId(), today, LocalTime.of(14, 0));
    var booking = createAppointment(doctor.getId().toString(), slot.getId().toString());
    var appointmentId = booking.get("data").get("id").asText();

    var nurseToken = nurseToken();

    // Check in
    mockMvc.perform(post("/api/v1/appointments/{appointmentId}/checkin", appointmentId)
            .header("Authorization", "Bearer " + nurseToken)
            .contentType("application/json")
            .content("""
                {"checkedInAt": "%sT13:55:00"}
                """.formatted(today)))
        .andExpect(status().isOk());

    // Call patient
    mockMvc.perform(post("/api/v1/queue/{appointmentId}/call", appointmentId)
            .header("Authorization", "Bearer " + nurseToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("Patient called"));

    // Assign room
    mockMvc.perform(post("/api/v1/queue/{appointmentId}/assign-room", appointmentId)
            .header("Authorization", "Bearer " + nurseToken)
            .contentType("application/json")
            .content("""
                {"roomName": "Room B2"}
                """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("Room assigned"));

    // Start consultation
    mockMvc.perform(post("/api/v1/queue/{appointmentId}/start-consultation", appointmentId)
            .header("Authorization", "Bearer " + nurseToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("Consultation started"));

    // Complete visit
    mockMvc.perform(post("/api/v1/queue/{appointmentId}/complete", appointmentId)
            .header("Authorization", "Bearer " + nurseToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("Queue visit completed"));
  }

  @Test
  void skipAndRequeue() throws Exception {
    var doctor = userRepository.findByEmailIgnoreCaseAndActiveTrue("doctor1@hospital.vn").orElseThrow();
    var today = LocalDate.now();
    var slot = createSlot(doctor.getId(), today, LocalTime.of(15, 0));
    var booking = createAppointment(doctor.getId().toString(), slot.getId().toString());
    var appointmentId = booking.get("data").get("id").asText();

    var nurseToken = nurseToken();

    // Check in
    mockMvc.perform(post("/api/v1/appointments/{appointmentId}/checkin", appointmentId)
            .header("Authorization", "Bearer " + nurseToken)
            .contentType("application/json")
            .content("""
                {"checkedInAt": "%sT14:55:00"}
                """.formatted(today)))
        .andExpect(status().isOk());

    // Call
    mockMvc.perform(post("/api/v1/queue/{appointmentId}/call", appointmentId)
            .header("Authorization", "Bearer " + nurseToken))
        .andExpect(status().isOk());

    // Skip patient (they didn't respond)
    mockMvc.perform(post("/api/v1/queue/{appointmentId}/skip", appointmentId)
            .header("Authorization", "Bearer " + nurseToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("Patient moved to back of ready queue"));
  }
}
