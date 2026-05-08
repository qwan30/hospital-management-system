package com.hospital.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

/**
 * Tests for admin operations endpoints:
 * - GET /api/v1/admin/stats
 * - GET /api/v1/admin/monitoring
 * - GET /api/v1/admin/audit-logs
 * - GET /api/v1/admin/schedule-templates
 * - GET /api/v1/admin/slots
 * - GET /api/v1/admin/special-closures
 */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class AdminOperationsIntegrationTest extends AbstractIntegrationTest {

  // ── Stats & Monitoring ────────────────────────────────────────────────

  @Test
  void adminStatsRequiresAuthentication() throws Exception {
    mockMvc.perform(get("/api/v1/admin/stats"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void adminStatsReturnsDataForAdmin() throws Exception {
    mockMvc.perform(get("/api/v1/admin/stats")
            .header("Authorization", "Bearer " + adminToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data").exists());
  }

  @Test
  void adminStatsRejectsDoctor() throws Exception {
    mockMvc.perform(get("/api/v1/admin/stats")
            .header("Authorization", "Bearer " + doctorOneToken()))
        .andExpect(status().isForbidden());
  }

  @Test
  void monitoringEndpointReturnsData() throws Exception {
    mockMvc.perform(get("/api/v1/admin/monitoring")
            .header("Authorization", "Bearer " + adminToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true));
  }

  // ── Audit Logs ────────────────────────────────────────────────────────

  @Test
  void auditLogsReturnData() throws Exception {
    mockMvc.perform(get("/api/v1/admin/audit-logs")
            .header("Authorization", "Bearer " + adminToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data").isArray());
  }

  @Test
  void auditLogsRejectNonAdmin() throws Exception {
    mockMvc.perform(get("/api/v1/admin/audit-logs")
            .header("Authorization", "Bearer " + nurseToken()))
        .andExpect(status().isForbidden());
  }

  // ── Schedule Management ───────────────────────────────────────────────

  @Test
  void scheduleTemplatesReturnData() throws Exception {
    mockMvc.perform(get("/api/v1/admin/schedule-templates")
            .header("Authorization", "Bearer " + adminToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true));
  }

  @Test
  void timeSlotsReturnData() throws Exception {
    mockMvc.perform(get("/api/v1/admin/slots")
            .header("Authorization", "Bearer " + adminToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true));
  }

  @Test
  void specialClosuresReturnData() throws Exception {
    mockMvc.perform(get("/api/v1/admin/special-closures")
            .header("Authorization", "Bearer " + adminToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true));
  }

  @Test
  void scheduleEndpointsRejectNonAdmin() throws Exception {
    mockMvc.perform(get("/api/v1/admin/schedule-templates")
            .header("Authorization", "Bearer " + pharmacistToken()))
        .andExpect(status().isForbidden());
  }
}
