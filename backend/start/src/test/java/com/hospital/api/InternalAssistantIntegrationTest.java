package com.hospital.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.core.audit.AuditLogRepository;
import com.hospital.core.appointment.AppointmentRepository;
import com.hospital.core.internalassistant.InternalAssistantFeedbackRepository;
import com.hospital.core.internalassistant.knowledge.KnowledgeDocumentRepository;
import com.hospital.core.patient.PatientRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
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
class InternalAssistantIntegrationTest {
  @Container
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("pgvector/pgvector:pg15");

  static {
    postgres.start();
  }

  @Autowired
  private AuditLogRepository auditLogRepository;

  @Autowired
  private AppointmentRepository appointmentRepository;

  @Autowired
  private InternalAssistantFeedbackRepository internalAssistantFeedbackRepository;

  @Autowired
  private KnowledgeDocumentRepository knowledgeDocumentRepository;

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  private PatientRepository patientRepository;

  @DynamicPropertySource
  static void databaseProperties(DynamicPropertyRegistry registry) {
    registry.add("POSTGRES_HOST", postgres::getHost);
    registry.add("POSTGRES_PORT", () -> postgres.getMappedPort(5432));
    registry.add("POSTGRES_DB", postgres::getDatabaseName);
    registry.add("POSTGRES_USER", postgres::getUsername);
    registry.add("POSTGRES_PASSWORD", postgres::getPassword);
  }

  @Test
  void doctorCanRetrievePatientDiagnosisWithinAuthorizedContext() throws Exception {
    var patientId = patientRepository.findFirstByEmailIgnoreCaseAndDateOfBirth(
            "patient@example.com",
            LocalDate.of(1992, 4, 15))
        .orElseThrow()
        .getId();
    var doctorToken = loginAndGetAccessToken("doctor1@hospital.vn", "Doctor@1234");

    mockMvc.perform(post("/api/v1/internal-assistant/messages")
            .header("Authorization", "Bearer " + doctorToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "message": "What is the latest diagnosis for this patient?",
                  "mode": "patient",
                  "patientId": "%s",
                  "conversation": []
                }
                """.formatted(patientId)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.sessionId").exists())
        .andExpect(jsonPath("$.data.messageId").exists())
        .andExpect(jsonPath("$.data.scope").value("patient"))
        .andExpect(jsonPath("$.data.answer").value(org.hamcrest.Matchers.containsString("Seasonal allergic rhinitis")))
        .andExpect(jsonPath("$.data.citations[0].sourceType").exists());
  }

  @Test
  void nurseCanRetrievePatientSummaryFromCheckedInQueueAppointment() throws Exception {
    var nurseToken = loginAndGetAccessToken("nurse@hospital.vn", "Nurse@1234");
    var appointmentId = appointmentRepository.findByConfirmationCode("HMS-PORTAL-001")
        .orElseThrow()
        .getId();

    mockMvc.perform(post("/api/v1/appointments/{appointmentId}/checkin", appointmentId)
            .header("Authorization", "Bearer " + nurseToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "checkedInAt": "%s"
                }
                """.formatted(LocalDateTime.now().withNano(0))))
        .andExpect(status().isOk());

    mockMvc.perform(post("/api/v1/internal-assistant/messages")
            .header("Authorization", "Bearer " + nurseToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "message": "Give me a summary for the selected patient",
                  "mode": "patient",
                  "appointmentId": "%s",
                  "conversation": []
                }
                """.formatted(appointmentId)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.scope").value("patient"))
        .andExpect(jsonPath("$.data.answer").value(org.hamcrest.Matchers.containsString("Selected patient")))
        .andExpect(jsonPath("$.data.citations[0].sourceType").exists());
  }

  @Test
  void doctorIsForbiddenFromAccessingAnotherDoctorsPatientContext() throws Exception {
    var patientId = patientRepository.findFirstByEmailIgnoreCaseAndDateOfBirth(
            "patient@example.com",
            LocalDate.of(1992, 4, 15))
        .orElseThrow()
        .getId();
    var doctorToken = loginAndGetAccessToken("doctor2@hospital.vn", "Doctor@1234");

    mockMvc.perform(post("/api/v1/internal-assistant/messages")
            .header("Authorization", "Bearer " + doctorToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "message": "Show the latest diagnosis for this patient",
                  "mode": "patient",
                  "patientId": "%s",
                  "conversation": []
                }
                """.formatted(patientId)))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.error.code").value("forbidden"));
  }

  @Test
  void adminCanUseDocumentModeAndAuditIsRecorded() throws Exception {
    var adminToken = loginAndGetAccessToken("admin@hospital.vn", "Admin@1234");

    var result = mockMvc.perform(post("/api/v1/internal-assistant/messages")
            .header("Authorization", "Bearer " + adminToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "message": "When should follow-up reminders be sent?",
                  "mode": "docs",
                  "conversation": []
                }
                """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.sessionId").exists())
        .andExpect(jsonPath("$.data.messageId").exists())
        .andExpect(jsonPath("$.data.scope").value("docs"))
        .andExpect(jsonPath("$.data.answer").value(org.hamcrest.Matchers.containsString("one day before")))
        .andExpect(jsonPath("$.data.citations[0].sourceType").value("KNOWLEDGE_DOC"))
        .andReturn();

    var logs = auditLogRepository.findAllByOrderByCreatedAtDesc();
    assertThat(logs)
        .anyMatch(entry -> "INTERNAL_ASSISTANT_QUERY".equals(entry.getAction())
            && entry.getActor() != null
            && "System Admin".equals(entry.getActor().getFullName()));

    var data = objectMapper.readTree(result.getResponse().getContentAsString()).get("data");
    var sessionId = data.get("sessionId").asText();

    mockMvc.perform(get("/api/v1/internal-assistant/sessions/current")
            .header("Authorization", "Bearer " + adminToken)
            .param("mode", "docs")
            .param("sessionId", sessionId))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.messages.length()").value(2));
  }

  @Test
  void adminIsForbiddenFromPatientMode() throws Exception {
    var adminToken = loginAndGetAccessToken("admin@hospital.vn", "Admin@1234");
    var patientId = patientRepository.findFirstByEmailIgnoreCaseAndDateOfBirth(
            "patient@example.com",
            LocalDate.of(1992, 4, 15))
        .orElseThrow()
        .getId();

    mockMvc.perform(post("/api/v1/internal-assistant/messages")
            .header("Authorization", "Bearer " + adminToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "message": "Show the patient chart",
                  "mode": "patient",
                  "patientId": "%s",
                  "conversation": []
                }
                """.formatted(patientId)))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.error.code").value("forbidden"));
  }

  @Test
  void missingPatientContextReturnsRefusedResponse() throws Exception {
    var doctorToken = loginAndGetAccessToken("doctor1@hospital.vn", "Doctor@1234");

    mockMvc.perform(post("/api/v1/internal-assistant/messages")
            .header("Authorization", "Bearer " + doctorToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "message": "Summarize the selected patient",
                  "mode": "patient",
                  "conversation": []
                }
                """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.scope").value("refused"))
        .andExpect(jsonPath("$.data.answer").value(org.hamcrest.Matchers.containsString("selected patient or appointment context")));
  }

  @Test
  void feedbackCanBeSubmittedForAssistantMessage() throws Exception {
    var adminToken = loginAndGetAccessToken("admin@hospital.vn", "Admin@1234");
    var assistantResult = mockMvc.perform(post("/api/v1/internal-assistant/messages")
            .header("Authorization", "Bearer " + adminToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "message": "When should follow-up reminders be sent?",
                  "mode": "docs",
                  "conversation": []
                }
                """))
        .andExpect(status().isOk())
        .andReturn();

    var messageId = objectMapper.readTree(assistantResult.getResponse().getContentAsString())
        .get("data")
        .get("messageId")
        .asText();

    mockMvc.perform(post("/api/v1/internal-assistant/messages/{messageId}/feedback", messageId)
            .header("Authorization", "Bearer " + adminToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "value": "helpful",
                  "note": "Grounded and concise"
                }
                """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.value").value("helpful"))
        .andExpect(jsonPath("$.data.messageId").value(messageId));

    assertThat(internalAssistantFeedbackRepository.findByMessageId(java.util.UUID.fromString(messageId)))
        .isPresent();
  }

  @Test
  void uploadedKnowledgeDocumentCanBeActivatedAndThenRevokedFromRetrieval() throws Exception {
    var adminToken = loginAndGetAccessToken("admin@hospital.vn", "Admin@1234");
    var uploadResult = mockMvc.perform(multipart("/api/v1/admin/knowledge-documents")
            .file(new MockMultipartFile(
                "file",
                "crimson-otter.md",
                MediaType.TEXT_PLAIN_VALUE,
                """
                # Crimson Otter Escalation

                ## Trigger
                Use crimson-otter-code when nurse handoff needs immediate supervisor review.
                """.getBytes()))
            .param("title", "Crimson Otter Escalation")
            .param("category", "policy")
            .param("summary", "Unique escalation document for assistant revoke coverage.")
            .param("version", "1.0")
            .param("owner", "Operations")
            .param("tags", "crimson otter, escalation")
            .header("Authorization", "Bearer " + adminToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.status").value("DRAFT"))
        .andReturn();

    var documentId = objectMapper.readTree(uploadResult.getResponse().getContentAsString())
        .get("data")
        .get("documentId")
        .asText();

    mockMvc.perform(post("/api/v1/admin/knowledge-documents/{documentId}/activate", documentId)
            .header("Authorization", "Bearer " + adminToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.status").value("ACTIVE"));

    mockMvc.perform(post("/api/v1/internal-assistant/messages")
            .header("Authorization", "Bearer " + adminToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "message": "What is crimson otter code?",
                  "mode": "docs",
                  "conversation": []
                }
                """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.scope").value("docs"))
        .andExpect(jsonPath("$.data.answer").value(org.hamcrest.Matchers.containsString("crimson-otter-code")));

    mockMvc.perform(post("/api/v1/admin/knowledge-documents/{documentId}/revoke", documentId)
            .header("Authorization", "Bearer " + adminToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.status").value("REVOKED"));

    mockMvc.perform(post("/api/v1/internal-assistant/messages")
            .header("Authorization", "Bearer " + adminToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "message": "What is crimson otter code?",
                  "mode": "docs",
                  "conversation": []
                }
                """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.scope").value("refused"));

    assertThat(knowledgeDocumentRepository.findById(java.util.UUID.fromString(documentId)))
        .isPresent()
        .get()
        .extracting(document -> document.getStatus().name())
        .isEqualTo("REVOKED");
  }

  private String loginAndGetAccessToken(String email, String password) throws Exception {
    var result = mockMvc.perform(post("/api/v1/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
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
