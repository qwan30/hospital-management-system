package com.hospital.core.internalassistant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.hospital.core.appointment.AppointmentRepository;
import com.hospital.core.audit.AuditLogService;
import com.hospital.core.internalassistant.knowledge.KnowledgeChunkRepository;
import com.hospital.core.internalassistant.knowledge.KnowledgeEdgeRepository;
import com.hospital.core.internalassistant.knowledge.KnowledgeNodeRepository;
import com.hospital.core.medicalrecord.MedicalRecordRepository;
import com.hospital.core.patient.PatientRepository;
import com.hospital.core.patientportal.LabResultRepository;
import com.hospital.core.patientportal.PatientMessageRepository;
import com.hospital.core.patientportal.PatientMessageThreadRepository;
import com.hospital.shared.enums.UserRole;
import com.hospital.shared.internalassistant.InternalAssistantMessageRequest;
import com.hospital.shared.internalassistant.InternalAssistantMode;
import com.hospital.shared.internalassistant.InternalAssistantScope;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

@ExtendWith(MockitoExtension.class)
class InternalAssistantServiceTest {
  @Mock
  private AppointmentRepository appointmentRepository;

  @Mock
  private AuditLogService auditLogService;

  @Mock
  private InternalAssistantConversationService internalAssistantConversationService;

  @Mock
  private InternalAssistantMetricsService internalAssistantMetricsService;

  @Mock
  private KnowledgeChunkRepository knowledgeChunkRepository;

  @Mock
  private KnowledgeEdgeRepository knowledgeEdgeRepository;

  @Mock
  private KnowledgeNodeRepository knowledgeNodeRepository;

  @Mock
  private LabResultRepository labResultRepository;

  @Mock
  private MedicalRecordRepository medicalRecordRepository;

  @Mock
  private PatientMessageRepository patientMessageRepository;

  @Mock
  private PatientMessageThreadRepository patientMessageThreadRepository;

  @Mock
  private PatientRepository patientRepository;

  @InjectMocks
  private InternalAssistantService internalAssistantService;

  @Test
  void rejectsAdminPatientMode() {
    var request = new InternalAssistantMessageRequest(
        "Show the patient diagnosis",
        InternalAssistantMode.PATIENT,
        UUID.randomUUID(),
        null,
        null,
        List.of());

    assertThatThrownBy(() -> internalAssistantService.reply(UUID.randomUUID(), UserRole.ADMIN, request))
        .isInstanceOf(AccessDeniedException.class)
        .hasMessageContaining("Admin accounts can only use document mode");
  }

  @Test
  void rejectsDoctorOutsidePatientScope() {
    var doctorId = UUID.randomUUID();
    var patientId = UUID.randomUUID();
    var request = new InternalAssistantMessageRequest(
        "Show this patient summary",
        InternalAssistantMode.PATIENT,
        patientId,
        null,
        null,
        List.of());

    when(appointmentRepository.existsByDoctorIdAndPatientId(doctorId, patientId)).thenReturn(false);

    assertThatThrownBy(() -> internalAssistantService.reply(doctorId, UserRole.DOCTOR, request))
        .isInstanceOf(AccessDeniedException.class)
        .hasMessageContaining("outside the current doctor's scope");
  }

  @Test
  void returnsRefusedScopeWhenNoApprovedEvidenceMatches() {
    var request = new InternalAssistantMessageRequest(
        "Explain an unknown policy",
        InternalAssistantMode.DOCS,
        null,
        null,
        null,
        List.of());

    when(knowledgeNodeRepository.findAllByDocumentActiveTrueOrderByNodeKeyAsc()).thenReturn(List.of());
    when(knowledgeEdgeRepository.findAllForActiveDocuments()).thenReturn(List.of());
    when(knowledgeChunkRepository.findAllByDocumentActiveTrueOrderByReferenceKeyAsc()).thenReturn(List.of());
    var session = session();
    var assistantMessage = assistantMessage(session);
    when(internalAssistantConversationService.resolveSession(
        org.mockito.ArgumentMatchers.any(UUID.class),
        org.mockito.ArgumentMatchers.eq(UserRole.ADMIN),
        org.mockito.ArgumentMatchers.eq(InternalAssistantMode.DOCS),
        org.mockito.ArgumentMatchers.isNull(),
        org.mockito.ArgumentMatchers.isNull(),
        org.mockito.ArgumentMatchers.isNull())).thenReturn(session);
    when(internalAssistantConversationService.recordAssistantMessage(
        org.mockito.ArgumentMatchers.eq(session),
        org.mockito.ArgumentMatchers.anyString(),
        org.mockito.ArgumentMatchers.eq(InternalAssistantScope.REFUSED))).thenReturn(assistantMessage);

    var response = internalAssistantService.reply(UUID.randomUUID(), UserRole.ADMIN, request);

    assertThat(response.scope()).isEqualTo(InternalAssistantScope.REFUSED);
    assertThat(response.citations()).isEmpty();
    assertThat(response.sessionId()).isEqualTo(session.getId());
    assertThat(response.messageId()).isEqualTo(assistantMessage.getId());
    verify(auditLogService).record(
        org.mockito.ArgumentMatchers.any(UUID.class),
        org.mockito.ArgumentMatchers.eq("INTERNAL_ASSISTANT_QUERY"),
        org.mockito.ArgumentMatchers.eq("INTERNAL_ASSISTANT"),
        org.mockito.ArgumentMatchers.isNull(),
        org.mockito.ArgumentMatchers.anyMap());
  }

  @Test
  void returnsRefusalWhenPatientModeHasNoSelectedContext() {
    var request = new InternalAssistantMessageRequest(
        "Show the selected patient",
        InternalAssistantMode.PATIENT,
        null,
        null,
        null,
        List.of());
    var session = session();
    var assistantMessage = assistantMessage(session);

    when(internalAssistantConversationService.resolveSession(
        org.mockito.ArgumentMatchers.any(UUID.class),
        org.mockito.ArgumentMatchers.eq(UserRole.DOCTOR),
        org.mockito.ArgumentMatchers.eq(InternalAssistantMode.PATIENT),
        org.mockito.ArgumentMatchers.isNull(),
        org.mockito.ArgumentMatchers.isNull(),
        org.mockito.ArgumentMatchers.isNull())).thenReturn(session);
    when(internalAssistantConversationService.recordAssistantMessage(
        org.mockito.ArgumentMatchers.eq(session),
        org.mockito.ArgumentMatchers.anyString(),
        org.mockito.ArgumentMatchers.eq(InternalAssistantScope.REFUSED))).thenReturn(assistantMessage);

    var response = internalAssistantService.reply(UUID.randomUUID(), UserRole.DOCTOR, request);

    assertThat(response.scope()).isEqualTo(InternalAssistantScope.REFUSED);
    assertThat(response.answer()).contains("selected patient or appointment context");
  }

  private InternalAssistantSessionEntity session() {
    var session = new InternalAssistantSessionEntity();
    session.setId(UUID.randomUUID());
    session.setMode(InternalAssistantMode.DOCS);
    session.setCreatedAt(Instant.now());
    session.setUpdatedAt(Instant.now());
    return session;
  }

  private InternalAssistantMessageEntity assistantMessage(InternalAssistantSessionEntity session) {
    var message = new InternalAssistantMessageEntity();
    message.setId(UUID.randomUUID());
    message.setSession(session);
    message.setRole("assistant");
    message.setContent("refused");
    message.setScope(InternalAssistantScope.REFUSED);
    return message;
  }
}
