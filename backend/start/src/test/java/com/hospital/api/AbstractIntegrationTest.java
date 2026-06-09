package com.hospital.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.core.appointment.AppointmentRepository;
import com.hospital.core.department.DepartmentRepository;
import com.hospital.core.inventory.InventoryItemRepository;
import com.hospital.core.inventory.InventoryLotRepository;
import com.hospital.core.timeslot.TimeSlotEntity;
import com.hospital.core.timeslot.TimeSlotRepository;
import com.hospital.core.user.UserRepository;
import com.hospital.shared.enums.SlotStatus;
import jakarta.servlet.http.Cookie;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.springframework.transaction.annotation.Transactional;

/**
 * Shared base class for all integration tests. Provides:
 * - Testcontainers PostgreSQL lifecycle
 * - MockMvc and ObjectMapper autowiring
 * - Common helper methods: login, create slot, create appointment
 */
@SpringBootTest(properties = {
    "management.endpoints.web.exposure.include=*",
    "management.endpoint.prometheus.enabled=true",
    "management.prometheus.metrics.export.enabled=true"
})
@AutoConfigureMockMvc
@Transactional
@Testcontainers(disabledWithoutDocker = true)
abstract class AbstractIntegrationTest {

  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("pgvector/pgvector:pg15");

  /** Cache tokens per email to avoid hitting login repeatedly. */
  private static final Map<String, String> TOKEN_CACHE = new ConcurrentHashMap<>();

  @Autowired
  protected MockMvc mockMvc;

  @Autowired
  protected ObjectMapper objectMapper;

  @Autowired
  protected UserRepository userRepository;

  @Autowired
  protected TimeSlotRepository timeSlotRepository;

  @Autowired
  protected AppointmentRepository appointmentRepository;

  @Autowired
  protected DepartmentRepository departmentRepository;

  @Autowired
  protected InventoryItemRepository inventoryItemRepository;

  @Autowired
  protected InventoryLotRepository inventoryLotRepository;

  @DynamicPropertySource
  static void databaseProperties(DynamicPropertyRegistry registry) {
    if (!postgres.isRunning()) {
      postgres.start();
    }
    registry.add("POSTGRES_HOST", postgres::getHost);
    registry.add("POSTGRES_PORT", () -> postgres.getMappedPort(5432));
    registry.add("POSTGRES_DB", postgres::getDatabaseName);
    registry.add("POSTGRES_USER", postgres::getUsername);
    registry.add("POSTGRES_PASSWORD", postgres::getPassword);
    registry.add("security.jwt.secret", () -> "test-jwt-secret-with-at-least-32-characters");
    registry.add("security.patient-identifier.secret", () -> "test-patient-identifier-secret");
    // Disable rate limiting for integration tests
    registry.add("security.http.public-rate-limit-per-minute", () -> "0");
    registry.add("security.http.allow-credentials", () -> "true");
  }

  // ── Auth helpers ──────────────────────────────────────────────────────

  protected String loginAndGetAccessToken(String email, String password) throws Exception {
    MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
            .contentType("application/json")
            .content("""
                {
                  "email": "%s",
                  "password": "%s"
                }
                """.formatted(email, password)))
        .andExpect(status().isOk())
        .andReturn();

    return objectMapper.readTree(result.getResponse().getContentAsString())
        .get("data")
        .get("tokens")
        .get("accessToken")
        .asText();
  }

  protected String adminToken() throws Exception {
    return loginAndGetAccessToken("admin@hospital.vn", "Admin@1234");
  }

  protected String doctorOneToken() throws Exception {
    return loginAndGetAccessToken("doctor1@hospital.vn", "Doctor@1234");
  }

  protected String doctorTwoToken() throws Exception {
    return loginAndGetAccessToken("doctor2@hospital.vn", "Doctor@1234");
  }

  protected String nurseToken() throws Exception {
    return loginAndGetAccessToken("nurse@hospital.vn", "Nurse@1234");
  }

  protected String pharmacistToken() throws Exception {
    return loginAndGetAccessToken("pharmacist@hospital.vn", "Pharma@1234");
  }

  protected String accountantToken() throws Exception {
    return loginAndGetAccessToken("accountant@hospital.vn", "Acc@1234");
  }

  protected String receptionistToken() throws Exception {
    return loginAndGetAccessToken("receptionist@hospital.vn", "Reception@1234");
  }

  protected Cookie loginAndGetRefreshCookie(String email, String password) throws Exception {
    MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
            .contentType("application/json")
            .content("""
                {
                  "email": "%s",
                  "password": "%s"
                }
                """.formatted(email, password)))
        .andExpect(status().isOk())
        .andReturn();

    return result.getResponse().getCookie("hms_refresh_token");
  }

  // ── Patient auth helpers ──────────────────────────────────────────────

  protected String patientLoginAndGetAccessToken(String email, String password) throws Exception {
    MvcResult result = mockMvc.perform(post("/api/v1/patient-auth/login")
            .contentType("application/json")
            .content("""
                {
                  "email": "%s",
                  "password": "%s"
                }
                """.formatted(email, password)))
        .andExpect(status().isOk())
        .andReturn();

    return objectMapper.readTree(result.getResponse().getContentAsString())
        .get("data")
        .get("tokens")
        .get("accessToken")
        .asText();
  }

  protected Cookie patientLoginAndGetRefreshCookie(String email, String password) throws Exception {
    MvcResult result = mockMvc.perform(post("/api/v1/patient-auth/login")
            .contentType("application/json")
            .content("""
                {
                  "email": "%s",
                  "password": "%s"
                }
                """.formatted(email, password)))
        .andExpect(status().isOk())
        .andReturn();

    return result.getResponse().getCookie("hms_patient_refresh_token");
  }

  // ── Appointment helpers ───────────────────────────────────────────────

  protected TimeSlotEntity createSlot(UUID doctorId, LocalDate date, LocalTime startTime) {
    var doctor = userRepository.findById(doctorId).orElseThrow();
    var slot = new TimeSlotEntity();
    slot.setDoctor(doctor);
    slot.setSlotDate(date);
    slot.setStartTime(startTime);
    slot.setEndTime(startTime.plusMinutes(30));
    slot.setStatus(SlotStatus.AVAILABLE);
    return timeSlotRepository.save(slot);
  }

  protected JsonNode createAppointment(String doctorId, String slotId) throws Exception {
    var result = mockMvc.perform(post("/api/v1/appointments")
            .contentType("application/json")
            .content("""
                {
                  "doctorId": "%s",
                  "firstSlotId": "%s",
                  "aiDurationMinutes": 30,
                  "patientFullName": "Test Patient",
                  "patientCccd": "098765432101",
                  "patientEmail": "test.patient@example.com",
                  "patientPhone": "0901234567",
                  "patientDateOfBirth": "1990-05-15",
                  "patientGender": "MALE",
                  "patientAddress": {
                    "provinceOrCity": "Ho Chi Minh City",
                    "district": "District 1",
                    "streetAddress": "123 Example Street"
                  },
                  "symptoms": "Test symptoms for integration testing"
                }
                """.formatted(doctorId, slotId)))
        .andExpect(status().isCreated())
        .andReturn();

    return objectMapper.readTree(result.getResponse().getContentAsString());
  }

  protected UUID doctorOneId() {
    return userRepository.findByEmailIgnoreCaseAndActiveTrue("doctor1@hospital.vn")
        .orElseThrow()
        .getId();
  }

  protected UUID doctorTwoId() {
    return userRepository.findByEmailIgnoreCaseAndActiveTrue("doctor2@hospital.vn")
        .orElseThrow()
        .getId();
  }
}
