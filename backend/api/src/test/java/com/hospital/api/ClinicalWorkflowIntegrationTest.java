package com.hospital.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.core.appointment.AppointmentRepository;
import com.hospital.core.timeslot.TimeSlotEntity;
import com.hospital.core.timeslot.TimeSlotRepository;
import com.hospital.core.user.UserRepository;
import com.hospital.shared.enums.SlotStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ClinicalWorkflowIntegrationTest {
  @Container
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("pgvector/pgvector:pg15");

  static {
    postgres.start();
  }

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private TimeSlotRepository timeSlotRepository;

  @Autowired
  private AppointmentRepository appointmentRepository;

  @DynamicPropertySource
  static void databaseProperties(DynamicPropertyRegistry registry) {
    registry.add("POSTGRES_HOST", postgres::getHost);
    registry.add("POSTGRES_PORT", () -> postgres.getMappedPort(5432));
    registry.add("POSTGRES_DB", postgres::getDatabaseName);
    registry.add("POSTGRES_USER", postgres::getUsername);
    registry.add("POSTGRES_PASSWORD", postgres::getPassword);
  }

  @Test
  void rejectsUnauthenticatedAndWrongRoleAccessOnNurseEndpoints() throws Exception {
    mockMvc.perform(get("/api/v1/appointments/today").param("date", "2030-01-10"))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.error.code").value("unauthorized"));

    var doctorToken = loginAndGetAccessToken("doctor1@hospital.vn", "Doctor@1234");

    mockMvc.perform(get("/api/v1/appointments/today")
            .param("date", "2030-01-10")
            .header("Authorization", "Bearer " + doctorToken))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.error.code").value("forbidden"));
  }

  @Test
  void rejectsDoctorStatusUpdateForAnotherDoctorsAppointment() throws Exception {
    var doctorOne = userRepository.findByEmailIgnoreCaseAndActiveTrue("doctor1@hospital.vn").orElseThrow();
    var appointmentDate = LocalDate.of(2030, 1, 11);
    var slot = createSlot(doctorOne.getId(), appointmentDate, LocalTime.of(8, 0));
    var appointmentId = createAppointment(doctorOne.getId().toString(), slot.getId().toString()).get("data").get("id").asText();
    var doctorTwoToken = loginAndGetAccessToken("doctor2@hospital.vn", "Doctor@1234");

    mockMvc.perform(put("/api/v1/appointments/{appointmentId}/status", appointmentId)
            .header("Authorization", "Bearer " + doctorTwoToken)
            .contentType("application/json")
            .content("""
                {
                  "status": "IN_PROGRESS"
                }
                """))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.error.code").value("forbidden"));
  }

  @Test
  void returnsDoctorOwnedAppointmentDetail() throws Exception {
    var doctor = userRepository.findByEmailIgnoreCaseAndActiveTrue("doctor1@hospital.vn").orElseThrow();
    var appointmentDate = LocalDate.of(2030, 1, 13);
    var slot = createSlot(doctor.getId(), appointmentDate, LocalTime.of(10, 0));
    var appointmentId = createAppointment(doctor.getId().toString(), slot.getId().toString()).get("data").get("id").asText();
    var doctorToken = loginAndGetAccessToken("doctor1@hospital.vn", "Doctor@1234");

    mockMvc.perform(get("/api/v1/appointments/{appointmentId}", appointmentId)
            .header("Authorization", "Bearer " + doctorToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.appointmentId").value(appointmentId))
        .andExpect(jsonPath("$.data.confirmationCode").exists())
        .andExpect(jsonPath("$.data.aiDurationMinutes").value(30))
        .andExpect(jsonPath("$.data.symptoms").value("Mild headache and fatigue"))
        .andExpect(jsonPath("$.data.patientEmail").value("nguyen.van.clinical@example.com"));
  }

  @Test
  void rejectsDoctorAppointmentDetailForAnotherDoctorsAppointment() throws Exception {
    var doctor = userRepository.findByEmailIgnoreCaseAndActiveTrue("doctor1@hospital.vn").orElseThrow();
    var appointmentDate = LocalDate.of(2030, 1, 14);
    var slot = createSlot(doctor.getId(), appointmentDate, LocalTime.of(11, 0));
    var appointmentId = createAppointment(doctor.getId().toString(), slot.getId().toString()).get("data").get("id").asText();
    var doctorTwoToken = loginAndGetAccessToken("doctor2@hospital.vn", "Doctor@1234");

    mockMvc.perform(get("/api/v1/appointments/{appointmentId}", appointmentId)
            .header("Authorization", "Bearer " + doctorTwoToken))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.error.code").value("forbidden"));
  }

  @Test
  void rejectsMissingDoctorAppointmentDetail() throws Exception {
    var doctorToken = loginAndGetAccessToken("doctor1@hospital.vn", "Doctor@1234");

    mockMvc.perform(get("/api/v1/appointments/{appointmentId}", java.util.UUID.randomUUID())
            .header("Authorization", "Bearer " + doctorToken))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.error.code").value("not_found"));
  }

  @Test
  void rejectsBookingWithoutPatientEmail() throws Exception {
    var doctor = userRepository.findByEmailIgnoreCaseAndActiveTrue("doctor1@hospital.vn").orElseThrow();
    var appointmentDate = LocalDate.of(2030, 1, 10);
    var slot = createSlot(doctor.getId(), appointmentDate, LocalTime.of(8, 0));

    mockMvc.perform(post("/api/v1/appointments")
            .contentType("application/json")
            .content("""
                {
                  "doctorId": "%s",
                  "firstSlotId": "%s",
                  "aiDurationMinutes": 30,
                  "patientFullName": "Nguyen Van Clinical",
                  "patientCccd": "012345678901",
                  "patientPhone": "0901234567",
                  "patientDateOfBirth": "1990-05-15",
                  "patientGender": "MALE",
                  "patientAddress": {
                    "provinceOrCity": "Ho Chi Minh City",
                    "district": "District 1",
                    "streetAddress": "123 Example Street"
                  },
                  "symptoms": "Mild headache and fatigue"
                }
                """.formatted(doctor.getId(), slot.getId())))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error.code").value("validation_error"))
        .andExpect(jsonPath("$.error.message").value("patientEmail: must not be blank"));
  }

  @Test
  void rejectsDoctorStatusUpdateToDoneFromDashboardWorkflow() throws Exception {
    var doctor = userRepository.findByEmailIgnoreCaseAndActiveTrue("doctor1@hospital.vn").orElseThrow();
    var appointmentDate = LocalDate.of(2030, 1, 15);
    var slot = createSlot(doctor.getId(), appointmentDate, LocalTime.of(8, 0));
    var appointmentId = createAppointment(doctor.getId().toString(), slot.getId().toString()).get("data").get("id").asText();
    var nurseToken = loginAndGetAccessToken("nurse@hospital.vn", "Nurse@1234");
    var doctorToken = loginAndGetAccessToken("doctor1@hospital.vn", "Doctor@1234");

    mockMvc.perform(post("/api/v1/appointments/{appointmentId}/checkin", appointmentId)
            .header("Authorization", "Bearer " + nurseToken)
            .contentType("application/json")
            .content("""
                {
                  "checkedInAt": "2030-01-15T07:55:00"
                }
                """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.status").value("CHECKED_IN"));

    mockMvc.perform(put("/api/v1/appointments/{appointmentId}/status", appointmentId)
            .header("Authorization", "Bearer " + doctorToken)
            .contentType("application/json")
            .content("""
                {
                  "status": "IN_PROGRESS"
                }
                """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.status").value("IN_PROGRESS"));

    mockMvc.perform(put("/api/v1/appointments/{appointmentId}/status", appointmentId)
            .header("Authorization", "Bearer " + doctorToken)
            .contentType("application/json")
            .content("""
                {
                  "status": "DONE"
                }
                """))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.error.code").value("conflict"));
  }

  @Test
  void completesClinicalWorkflowFromPublicBookingToPatientHistory() throws Exception {
    var doctor = userRepository.findByEmailIgnoreCaseAndActiveTrue("doctor1@hospital.vn").orElseThrow();
    var appointmentDate = LocalDate.of(2030, 1, 12);
    var slot = createSlot(doctor.getId(), appointmentDate, LocalTime.of(9, 0));

    var bookingResponse = createAppointment(doctor.getId().toString(), slot.getId().toString());
    var appointmentId = bookingResponse.get("data").get("id").asText();
    var patientId = bookingResponse.get("data").get("patientId").asText();

    var nurseToken = loginAndGetAccessToken("nurse@hospital.vn", "Nurse@1234");
    mockMvc.perform(post("/api/v1/appointments/{appointmentId}/checkin", appointmentId)
            .header("Authorization", "Bearer " + nurseToken)
            .contentType("application/json")
            .content("""
                {
                  "checkedInAt": "2030-01-12T08:55:00"
                }
                """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.status").value("CHECKED_IN"));

    var doctorToken = loginAndGetAccessToken("doctor1@hospital.vn", "Doctor@1234");
    mockMvc.perform(get("/api/v1/me/schedule")
            .param("date", appointmentDate.toString())
            .header("Authorization", "Bearer " + doctorToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data[0].appointmentId").value(appointmentId));

    mockMvc.perform(put("/api/v1/appointments/{appointmentId}/status", appointmentId)
            .header("Authorization", "Bearer " + doctorToken)
            .contentType("application/json")
            .content("""
                {
                  "status": "IN_PROGRESS"
                }
                """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.status").value("IN_PROGRESS"));

    var medicalRecordResult = mockMvc.perform(post("/api/v1/medical-records")
            .header("Authorization", "Bearer " + doctorToken)
            .contentType("application/json")
            .content("""
                {
                  "appointmentId": "%s",
                  "diagnosis": "Upper respiratory infection",
                  "clinicalNotes": "Patient stable and responsive.",
                  "vitalSigns": {
                    "bloodPressure": "120/80",
                    "temperature": 37.2,
                    "weight": 65.0,
                    "height": 170.0
                  },
                  "followUpDate": "2030-01-19",
                  "prescriptionItems": [
                    {
                      "medicineName": "Cetirizine 10mg",
                      "dosage": "10mg",
                      "frequency": "1/day",
                      "durationDays": 7,
                      "instructions": "After dinner",
                      "sortOrder": 1
                    }
                  ]
                }
                """.formatted(appointmentId)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.data.recordId").exists())
        .andExpect(jsonPath("$.data.appointmentStatus").value("DONE"))
        .andReturn();

    assertThat(medicalRecordResult.getResponse().getContentAsString()).contains("Cetirizine 10mg");
    var recordId = objectMapper.readTree(medicalRecordResult.getResponse().getContentAsString())
        .get("data")
        .get("recordId")
        .asText();

    var patientCccd = appointmentRepository.findDetailedById(java.util.UUID.fromString(appointmentId))
        .orElseThrow()
        .getPatient()
        .getCccd();

    mockMvc.perform(get("/api/v1/patients/{cccd}/history", patientCccd)
            .header("Authorization", "Bearer " + doctorToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.patientId").value(patientId))
        .andExpect(jsonPath("$.data.appointments[0].appointmentId").value(appointmentId))
        .andExpect(jsonPath("$.data.appointments[0].medicalRecord.diagnosis").value("Upper respiratory infection"));

    mockMvc.perform(get("/api/v1/medical-records/{recordId}/prescription.pdf", recordId)
            .header("Authorization", "Bearer " + doctorToken))
        .andExpect(status().isOk())
        .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PDF))
        .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("prescription-")));
  }

  private TimeSlotEntity createSlot(java.util.UUID doctorId, LocalDate date, LocalTime startTime) {
    var doctor = userRepository.findById(doctorId).orElseThrow();
    var slot = new TimeSlotEntity();
    slot.setDoctor(doctor);
    slot.setSlotDate(date);
    slot.setStartTime(startTime);
    slot.setEndTime(startTime.plusMinutes(30));
    slot.setStatus(SlotStatus.AVAILABLE);
    return timeSlotRepository.save(slot);
  }

  private JsonNode createAppointment(String doctorId, String slotId) throws Exception {
    var result = mockMvc.perform(post("/api/v1/appointments")
            .contentType("application/json")
            .content("""
                {
                  "doctorId": "%s",
                  "firstSlotId": "%s",
                  "aiDurationMinutes": 30,
                  "patientFullName": "Nguyen Van Clinical",
                  "patientCccd": "012345678901",
                  "patientEmail": "nguyen.van.clinical@example.com",
                  "patientPhone": "0901234567",
                  "patientDateOfBirth": "1990-05-15",
                  "patientGender": "MALE",
                  "patientAddress": {
                    "provinceOrCity": "Ho Chi Minh City",
                    "district": "District 1",
                    "streetAddress": "123 Example Street"
                  },
                  "symptoms": "Mild headache and fatigue"
                }
                """.formatted(doctorId, slotId)))
        .andExpect(status().isCreated())
        .andReturn();

    return objectMapper.readTree(result.getResponse().getContentAsString());
  }

  private String loginAndGetAccessToken(String email, String password) throws Exception {
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
}
