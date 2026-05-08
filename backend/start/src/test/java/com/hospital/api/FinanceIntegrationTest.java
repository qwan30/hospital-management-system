package com.hospital.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

/**
 * Tests for finance endpoints:
 * - GET    /api/v1/invoices
 * - POST   /api/v1/invoices
 * - POST   /api/v1/invoices/{invoiceId}/payments
 * - POST   /api/v1/invoices/{invoiceId}/void
 * - GET    /api/v1/pricing
 * - POST   /api/v1/pricing
 * - PUT    /api/v1/pricing/{pricingId}
 * - GET    /api/v1/reports/revenue/daily
 * - GET    /api/v1/reports/revenue/monthly
 */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class FinanceIntegrationTest extends AbstractIntegrationTest {

  // ── Invoices ──────────────────────────────────────────────────────────

  @Test
  void listInvoicesRequiresAuthentication() throws Exception {
    mockMvc.perform(get("/api/v1/invoices"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void listInvoicesAsAccountant() throws Exception {
    mockMvc.perform(get("/api/v1/invoices")
            .header("Authorization", "Bearer " + accountantToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data").isArray());
  }

  @Test
  void createInvoiceForCompletedAppointment() throws Exception {
    // First, create and complete an appointment
    var doctor = userRepository.findByEmailIgnoreCaseAndActiveTrue("doctor1@hospital.vn").orElseThrow();
    var appointmentDate = LocalDate.of(2030, 6, 1);
    var slot = createSlot(doctor.getId(), appointmentDate, LocalTime.of(8, 0));
    var booking = createAppointment(doctor.getId().toString(), slot.getId().toString());
    var appointmentId = booking.get("data").get("id").asText();

    // Check in
    var nurseToken = nurseToken();
    mockMvc.perform(post("/api/v1/appointments/{appointmentId}/checkin", appointmentId)
            .header("Authorization", "Bearer " + nurseToken)
            .contentType("application/json")
            .content("""
                {"checkedInAt": "2030-06-01T07:55:00"}
                """))
        .andExpect(status().isOk());

    // Move to IN_PROGRESS
    var doctorToken = doctorOneToken();
    mockMvc.perform(put("/api/v1/appointments/{appointmentId}/status", appointmentId)
            .header("Authorization", "Bearer " + doctorToken)
            .contentType("application/json")
            .content("""
                {"status": "IN_PROGRESS"}
                """))
        .andExpect(status().isOk());

    // Complete via medical record
    mockMvc.perform(post("/api/v1/medical-records")
            .header("Authorization", "Bearer " + doctorToken)
            .contentType("application/json")
            .content("""
                {
                  "appointmentId": "%s",
                  "diagnosis": "Common cold",
                  "clinicalNotes": "Mild symptoms, rest recommended.",
                  "vitalSigns": {
                    "bloodPressure": "120/80",
                    "temperature": 37.0,
                    "weight": 65.0,
                    "height": 170.0
                  },
                  "prescriptionItems": []
                }
                """.formatted(appointmentId)))
        .andExpect(status().isCreated());

    // Create invoice
    mockMvc.perform(post("/api/v1/invoices")
            .header("Authorization", "Bearer " + accountantToken())
            .contentType("application/json")
            .content("""
                {
                  "appointmentId": "%s"
                }
                """.formatted(appointmentId)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.invoiceId").exists());
  }

  @Test
  void createInvoiceForNonExistentAppointmentFails() throws Exception {
    mockMvc.perform(post("/api/v1/invoices")
            .header("Authorization", "Bearer " + accountantToken())
            .contentType("application/json")
            .content("""
                {
                  "appointmentId": "%s"
                }
                """.formatted(UUID.randomUUID())))
        .andExpect(status().isNotFound());
  }

  @Test
  void voidNonExistentInvoiceFails() throws Exception {
    mockMvc.perform(post("/api/v1/invoices/{invoiceId}/void", UUID.randomUUID())
            .header("Authorization", "Bearer " + accountantToken()))
        .andExpect(status().isNotFound());
  }

  @Test
  void doctorCannotCreateInvoice() throws Exception {
    mockMvc.perform(post("/api/v1/invoices")
            .header("Authorization", "Bearer " + doctorOneToken())
            .contentType("application/json")
            .content("""
                {"appointmentId": "%s"}
                """.formatted(UUID.randomUUID())))
        .andExpect(status().isForbidden());
  }

  // ── Pricing ───────────────────────────────────────────────────────────

  @Test
  void listPricingAsAdmin() throws Exception {
    mockMvc.perform(get("/api/v1/pricing")
            .header("Authorization", "Bearer " + adminToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data").isArray())
        .andExpect(jsonPath("$.data.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(3)));
  }

  @Test
  void createPricingSucceeds() throws Exception {
    var deptId = departmentRepository.findAllByOrderByNameAsc().get(0).getId();

    mockMvc.perform(post("/api/v1/pricing")
            .header("Authorization", "Bearer " + adminToken())
            .contentType("application/json")
            .content("""
                {
                  "departmentId": "%s",
                  "serviceName": "X-RAY",
                  "amount": 150000,
                  "effectiveDate": "2030-01-01"
                }
                """.formatted(deptId)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.data.serviceName").value("X-RAY"));
  }

  @Test
  void pricingEndpointRejectsNonAdmin() throws Exception {
    mockMvc.perform(get("/api/v1/pricing")
            .header("Authorization", "Bearer " + nurseToken()))
        .andExpect(status().isForbidden());
  }

  // ── Revenue Reports ───────────────────────────────────────────────────

  @Test
  void dailyRevenueReportReturnsData() throws Exception {
    mockMvc.perform(get("/api/v1/reports/revenue/daily")
            .param("date", LocalDate.now().toString())
            .header("Authorization", "Bearer " + accountantToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data").exists());
  }

  @Test
  void monthlyRevenueReportReturnsData() throws Exception {
    mockMvc.perform(get("/api/v1/reports/revenue/monthly")
            .param("month", YearMonth.now().toString())
            .header("Authorization", "Bearer " + accountantToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data").exists());
  }

  @Test
  void revenueReportsRejectNonFinanceRoles() throws Exception {
    mockMvc.perform(get("/api/v1/reports/revenue/daily")
            .param("date", LocalDate.now().toString())
            .header("Authorization", "Bearer " + doctorOneToken()))
        .andExpect(status().isForbidden());
  }

  @Test
  void revenueReportsRequireAuthentication() throws Exception {
    mockMvc.perform(get("/api/v1/reports/revenue/daily")
            .param("date", LocalDate.now().toString()))
        .andExpect(status().isUnauthorized());
  }
}
