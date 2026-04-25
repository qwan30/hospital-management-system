package com.hospital.core.internalassistant;

import com.hospital.core.appointment.AppointmentEntity;
import com.hospital.core.appointment.AppointmentRepository;
import com.hospital.core.audit.AuditLogService;
import com.hospital.core.common.NotFoundException;
import com.hospital.core.internalassistant.knowledge.KnowledgeChunkEntity;
import com.hospital.core.internalassistant.knowledge.KnowledgeChunkRepository;
import com.hospital.core.internalassistant.knowledge.KnowledgeEdgeEntity;
import com.hospital.core.internalassistant.knowledge.KnowledgeEdgeRepository;
import com.hospital.core.internalassistant.knowledge.KnowledgeNodeEntity;
import com.hospital.core.internalassistant.knowledge.KnowledgeNodeRepository;
import com.hospital.core.medicalrecord.MedicalRecordEntity;
import com.hospital.core.medicalrecord.MedicalRecordRepository;
import com.hospital.core.patient.PatientEntity;
import com.hospital.core.patient.PatientRepository;
import com.hospital.core.patientportal.LabResultEntity;
import com.hospital.core.patientportal.LabResultRepository;
import com.hospital.core.patientportal.PatientMessageEntity;
import com.hospital.core.patientportal.PatientMessageRepository;
import com.hospital.core.patientportal.PatientMessageThreadEntity;
import com.hospital.core.patientportal.PatientMessageThreadRepository;
import com.hospital.shared.enums.AppointmentStatus;
import com.hospital.shared.enums.UserRole;
import com.hospital.shared.internalassistant.InternalAssistantCitationResponse;
import com.hospital.shared.internalassistant.InternalAssistantFeedbackRequest;
import com.hospital.shared.internalassistant.InternalAssistantFeedbackResponse;
import com.hospital.shared.internalassistant.InternalAssistantMessageRequest;
import com.hospital.shared.internalassistant.InternalAssistantMessageResponse;
import com.hospital.shared.internalassistant.InternalAssistantMode;
import com.hospital.shared.internalassistant.InternalAssistantScope;
import com.hospital.shared.internalassistant.InternalAssistantSessionResponse;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InternalAssistantService {
  private static final List<AppointmentStatus> NURSE_ALLOWED_STATUSES = List.of(
      AppointmentStatus.CHECKED_IN,
      AppointmentStatus.IN_PROGRESS);

  private final AppointmentRepository appointmentRepository;
  private final AuditLogService auditLogService;
  private final InternalAssistantConversationService internalAssistantConversationService;
  private final InternalAssistantMetricsService internalAssistantMetricsService;
  private final KnowledgeChunkRepository knowledgeChunkRepository;
  private final KnowledgeEdgeRepository knowledgeEdgeRepository;
  private final KnowledgeNodeRepository knowledgeNodeRepository;
  private final LabResultRepository labResultRepository;
  private final MedicalRecordRepository medicalRecordRepository;
  private final PatientMessageRepository patientMessageRepository;
  private final PatientMessageThreadRepository patientMessageThreadRepository;
  private final PatientRepository patientRepository;

  public InternalAssistantService(
      AppointmentRepository appointmentRepository,
      AuditLogService auditLogService,
      InternalAssistantConversationService internalAssistantConversationService,
      InternalAssistantMetricsService internalAssistantMetricsService,
      KnowledgeChunkRepository knowledgeChunkRepository,
      KnowledgeEdgeRepository knowledgeEdgeRepository,
      KnowledgeNodeRepository knowledgeNodeRepository,
      LabResultRepository labResultRepository,
      MedicalRecordRepository medicalRecordRepository,
      PatientMessageRepository patientMessageRepository,
      PatientMessageThreadRepository patientMessageThreadRepository,
      PatientRepository patientRepository) {
    this.appointmentRepository = appointmentRepository;
    this.auditLogService = auditLogService;
    this.internalAssistantConversationService = internalAssistantConversationService;
    this.internalAssistantMetricsService = internalAssistantMetricsService;
    this.knowledgeChunkRepository = knowledgeChunkRepository;
    this.knowledgeEdgeRepository = knowledgeEdgeRepository;
    this.knowledgeNodeRepository = knowledgeNodeRepository;
    this.labResultRepository = labResultRepository;
    this.medicalRecordRepository = medicalRecordRepository;
    this.patientMessageRepository = patientMessageRepository;
    this.patientMessageThreadRepository = patientMessageThreadRepository;
    this.patientRepository = patientRepository;
  }

  @Transactional(readOnly = true)
  public InternalAssistantSessionResponse getCurrentSession(
      UUID actorId,
      UserRole actorRole,
      InternalAssistantMode mode,
      UUID patientId,
      UUID appointmentId,
      UUID sessionId) {
    validateRoleModeAccess(actorRole, mode);
    if (mode != InternalAssistantMode.DOCS && (patientId != null || appointmentId != null)) {
      authorizePatientContext(actorId, actorRole, patientId, appointmentId);
    }
    return internalAssistantConversationService.getCurrentSession(
        actorId,
        actorRole,
        mode,
        patientId,
        appointmentId,
        sessionId);
  }

  @Transactional
  public InternalAssistantFeedbackResponse submitFeedback(
      UUID actorId,
      UUID messageId,
      InternalAssistantFeedbackRequest request) {
    var value = internalAssistantConversationService.submitFeedback(actorId, messageId, request);
    internalAssistantMetricsService.recordFeedback(value);
    return new InternalAssistantFeedbackResponse(messageId, value, request.note());
  }

  @Transactional
  public InternalAssistantMessageResponse reply(
      UUID actorId,
      UserRole actorRole,
      InternalAssistantMessageRequest request) {
    var startedAt = System.nanoTime();
    try {
      validateRoleModeAccess(actorRole, request.mode());
    } catch (AccessDeniedException exception) {
      recordAudit(actorId, actorRole, request, InternalAssistantScope.REFUSED, List.of(), "admin_docs_only", null, null);
      internalAssistantMetricsService.recordQuery(request.mode(), "admin_docs_only", List.of(), elapsedMillis(startedAt));
      throw exception;
    }

    if (request.mode() != InternalAssistantMode.DOCS
        && request.patientId() == null
        && request.appointmentId() == null) {
      var session = internalAssistantConversationService.resolveSession(
          actorId,
          actorRole,
          request.mode(),
          null,
          null,
          request.sessionId());
      internalAssistantConversationService.recordUserMessage(session, request.message());
      return refusalResponse(
          actorId,
          actorRole,
          request,
          session,
          "Patient mode requires a selected patient or appointment context.",
          "missing_context",
          elapsedMillis(startedAt));
    }

    PatientContext patientContext = null;
    if (request.mode() != InternalAssistantMode.DOCS) {
      try {
        patientContext = authorizePatientContext(actorId, actorRole, request.patientId(), request.appointmentId());
      } catch (AccessDeniedException exception) {
        recordAudit(actorId, actorRole, request, InternalAssistantScope.REFUSED, List.of(), "forbidden", null, null);
        internalAssistantMetricsService.recordQuery(request.mode(), "forbidden", List.of(), elapsedMillis(startedAt));
        throw exception;
      }
    }

    var session = internalAssistantConversationService.resolveSession(
        actorId,
        actorRole,
        request.mode(),
        request.patientId(),
        request.appointmentId(),
        request.sessionId());
    internalAssistantConversationService.recordUserMessage(session, request.message());

    List<InternalAssistantCitationResponse> citations = new ArrayList<>();
    List<String> answerSections = new ArrayList<>();
    LinkedHashSet<String> suggestions = new LinkedHashSet<>();
    InternalAssistantScope resolvedScope = InternalAssistantScope.REFUSED;

    if (request.mode() != InternalAssistantMode.DOCS && patientContext != null) {
      var patientAnswer = buildPatientAnswer(request.message(), patientContext);
      if (!patientAnswer.citations().isEmpty()) {
        citations.addAll(patientAnswer.citations());
        answerSections.add(patientAnswer.answer());
        suggestions.addAll(patientAnswer.suggestions());
        resolvedScope = request.mode() == InternalAssistantMode.HYBRID
            ? InternalAssistantScope.HYBRID
            : InternalAssistantScope.PATIENT;
      }
    }

    if (request.mode() != InternalAssistantMode.PATIENT) {
      var docsAnswer = buildKnowledgeAnswer(request.message(), request.mode(), patientContext);
      if (!docsAnswer.citations().isEmpty()) {
        citations.addAll(docsAnswer.citations());
        answerSections.add(docsAnswer.answer());
        suggestions.addAll(docsAnswer.suggestions());
        resolvedScope = resolvedScope == InternalAssistantScope.PATIENT
            ? InternalAssistantScope.HYBRID
            : InternalAssistantScope.DOCS;
      }
    }

    if (citations.isEmpty()) {
      return refusalResponse(
          actorId,
          actorRole,
          request,
          session,
          "I do not have enough approved patient evidence or active internal documents to answer that safely.",
          "insufficient_evidence",
          elapsedMillis(startedAt));
    }

    var deduplicatedCitations = citations.stream()
        .collect(Collectors.collectingAndThen(
            Collectors.toMap(
                citation -> citation.referenceId() + "|" + citation.sourceType(),
                citation -> citation,
                (left, right) -> left,
                LinkedHashMap::new),
            map -> List.copyOf(map.values())));
    var deepLinks = deduplicatedCitations.stream()
        .map(InternalAssistantCitationResponse::deepLink)
        .filter(link -> link != null && !link.isBlank())
        .distinct()
        .toList();
    var answer = String.join("\n\n", answerSections);
    var assistantMessage = internalAssistantConversationService.recordAssistantMessage(session, answer, resolvedScope);
    var response = new InternalAssistantMessageResponse(
        session.getId(),
        assistantMessage.getId(),
        answer,
        deduplicatedCitations,
        deepLinks,
        suggestions.isEmpty()
            ? List.of("Ask a narrower follow-up", "Open the selected chart", "Ask about an active internal SOP")
            : List.copyOf(suggestions),
        resolvedScope);
    recordAudit(actorId, actorRole, request, response.scope(), response.citations(), "completed", session.getId(), assistantMessage.getId());
    internalAssistantMetricsService.recordQuery(request.mode(), "completed", response.citations(), elapsedMillis(startedAt));
    return response;
  }

  private InternalAssistantMessageResponse refusalResponse(
      UUID actorId,
      UserRole actorRole,
      InternalAssistantMessageRequest request,
      InternalAssistantSessionEntity session,
      String answer,
      String outcome,
      long durationMs) {
    var assistantMessage = internalAssistantConversationService.recordAssistantMessage(session, answer, InternalAssistantScope.REFUSED);
    var response = new InternalAssistantMessageResponse(
        session.getId(),
        assistantMessage.getId(),
        answer,
        List.of(),
        List.of(),
        List.of("Ask about the selected patient", "Ask about an active internal SOP", "Open a chart before using patient mode"),
        InternalAssistantScope.REFUSED);
    recordAudit(actorId, actorRole, request, response.scope(), List.of(), outcome, session.getId(), assistantMessage.getId());
    internalAssistantMetricsService.recordQuery(request.mode(), outcome, List.of(), durationMs);
    return response;
  }

  private void validateRoleModeAccess(UserRole actorRole, InternalAssistantMode mode) {
    if (actorRole == UserRole.ADMIN && mode != InternalAssistantMode.DOCS) {
      throw new AccessDeniedException("Admin accounts can only use document mode in the internal assistant");
    }
    if (actorRole != UserRole.DOCTOR && actorRole != UserRole.NURSE && actorRole != UserRole.ADMIN) {
      throw new AccessDeniedException("This role cannot access the internal assistant");
    }
  }

  private PatientContext authorizePatientContext(
      UUID actorId,
      UserRole actorRole,
      UUID patientId,
      UUID appointmentId) {
    return switch (actorRole) {
      case DOCTOR -> authorizeDoctorContext(actorId, patientId, appointmentId);
      case NURSE -> authorizeNurseContext(patientId, appointmentId);
      default -> throw new AccessDeniedException("Patient context is not available for this role");
    };
  }

  private PatientContext authorizeDoctorContext(UUID actorId, UUID patientId, UUID appointmentId) {
    if (appointmentId != null) {
      var appointment = appointmentRepository.findDetailedById(appointmentId)
          .orElseThrow(() -> new NotFoundException("Appointment not found"));
      if (!appointment.getDoctor().getId().equals(actorId)) {
        throw new AccessDeniedException("The selected appointment is not assigned to the current doctor");
      }
      return loadPatientContextForDoctor(appointment.getPatient().getId(), actorId, appointment);
    }

    if (patientId == null || !appointmentRepository.existsByDoctorIdAndPatientId(actorId, patientId)) {
      throw new AccessDeniedException("The selected patient is outside the current doctor's scope");
    }
    return loadPatientContextForDoctor(patientId, actorId, null);
  }

  private PatientContext authorizeNurseContext(UUID patientId, UUID appointmentId) {
    if (appointmentId != null) {
      var appointment = appointmentRepository.findByIdAndStatusIn(appointmentId, NURSE_ALLOWED_STATUSES)
          .orElseThrow(() -> new AccessDeniedException("Nurse patient access requires a selected queue appointment"));
      return loadPatientContextForNurse(appointment.getPatient().getId(), appointment);
    }

    if (patientId == null
        || !appointmentRepository.existsByPatientIdAndAppointmentDateAndStatusIn(patientId, LocalDate.now(), NURSE_ALLOWED_STATUSES)) {
      throw new AccessDeniedException("Nurse patient access requires a selected patient from the current queue");
    }
    return loadPatientContextForNurse(patientId, null);
  }

  private PatientContext loadPatientContextForDoctor(UUID patientId, UUID doctorId, AppointmentEntity requestedAppointment) {
    var patient = patientRepository.findById(patientId)
        .orElseThrow(() -> new NotFoundException("Patient not found"));
    var appointments = appointmentRepository.findByPatientIdAndDoctorIdOrderByAppointmentDateDescFirstSlotStartTimeDesc(patientId, doctorId);
    return buildPatientContext(patient, requestedAppointment, appointments);
  }

  private PatientContext loadPatientContextForNurse(UUID patientId, AppointmentEntity requestedAppointment) {
    var patient = patientRepository.findById(patientId)
        .orElseThrow(() -> new NotFoundException("Patient not found"));
    var appointments = appointmentRepository.findByPatientIdAndAppointmentDateAndStatusInOrderByCheckedInAtDescFirstSlotStartTimeDesc(
        patientId,
        LocalDate.now(),
        NURSE_ALLOWED_STATUSES);
    return buildPatientContext(patient, requestedAppointment, appointments);
  }

  private PatientContext buildPatientContext(
      PatientEntity patient,
      AppointmentEntity requestedAppointment,
      List<AppointmentEntity> appointments) {
    var appointmentIds = appointments.stream().map(AppointmentEntity::getId).toList();
    var records = appointmentIds.isEmpty()
        ? List.<MedicalRecordEntity>of()
        : medicalRecordRepository.findDetailedByAppointmentIds(appointmentIds);
    Map<UUID, MedicalRecordEntity> recordsByAppointmentId = new LinkedHashMap<>();
    records.forEach(record -> recordsByAppointmentId.put(record.getAppointment().getId(), record));
    var threads = patientMessageThreadRepository.findByPatientIdOrderByUpdatedAtDesc(patient.getId());
    Map<UUID, List<PatientMessageEntity>> messagesByThreadId = new LinkedHashMap<>();
    for (PatientMessageThreadEntity thread : threads) {
      messagesByThreadId.put(thread.getId(), patientMessageRepository.findByThreadIdOrderByCreatedAtAsc(thread.getId()));
    }
    return new PatientContext(
        patient,
        requestedAppointment,
        appointments,
        recordsByAppointmentId,
        labResultRepository.findByPatientIdOrderByCollectedAtDesc(patient.getId()),
        threads,
        messagesByThreadId);
  }

  private AssistantAnswer buildPatientAnswer(String message, PatientContext context) {
    var normalized = normalize(message);
    List<String> sections = new ArrayList<>();
    List<InternalAssistantCitationResponse> citations = new ArrayList<>();
    LinkedHashSet<String> suggestions = new LinkedHashSet<>();
    var patient = context.patient();
    var patientLink = "/patient-records-management?patientId=" + patient.getId();
    var latestAppointment = context.requestedAppointment() != null
        ? context.requestedAppointment()
        : context.appointments().stream().findFirst().orElse(null);
    var latestRecord = latestAppointment == null ? null : context.recordsByAppointmentId().get(latestAppointment.getId());

    if (mentionsAny(normalized, "summary", "overview", "patient", "chart")) {
      sections.add("Selected patient: " + patient.getFullName()
          + ", born " + patient.getDateOfBirth()
          + ", contact " + patient.getPhone()
          + (patient.getDrugAllergies() == null ? "" : ", allergies: " + patient.getDrugAllergies())
          + (patient.getMedicalHistory() == null ? "" : ", history: " + patient.getMedicalHistory()) + ".");
      citations.add(new InternalAssistantCitationResponse(
          "Patient profile",
          patient.getFullName() + " | " + patient.getPhone() + " | " + patient.getEmail(),
          "PATIENT_PROFILE",
          "patient:" + patient.getId(),
          patientLink));
      suggestions.add("Ask about the latest diagnosis");
    }

    if (latestAppointment != null && mentionsAny(normalized, "diagnosis", "record", "chart")) {
      if (latestRecord != null && latestRecord.getDiagnosis() != null && !latestRecord.getDiagnosis().isBlank()) {
        sections.add("Latest diagnosis in the selected context: " + latestRecord.getDiagnosis() + ".");
        citations.add(new InternalAssistantCitationResponse(
            "Latest medical record",
            latestRecord.getDiagnosis(),
            "MEDICAL_RECORD",
            "medical-record:" + latestRecord.getId(),
            "/medical-record-editor?appointmentId=" + latestAppointment.getId()));
        suggestions.add("Ask about prescription items");
      }
    }

    if (latestAppointment != null && mentionsAny(normalized, "appointment", "visit", "follow-up", "slot")) {
      sections.add("Selected appointment: " + latestAppointment.getAppointmentDate()
          + " at " + latestAppointment.getFirstSlot().getStartTime()
          + ", status " + latestAppointment.getStatus().name() + ".");
      citations.add(new InternalAssistantCitationResponse(
          "Selected appointment",
          latestAppointment.getAppointmentDate() + " " + latestAppointment.getFirstSlot().getStartTime(),
          "APPOINTMENT",
          "appointment:" + latestAppointment.getId(),
          "/doctor-dashboard?appointmentId=" + latestAppointment.getId()));
      suggestions.add("Ask about follow-up workflow");
    }

    if (mentionsAny(normalized, "allergy") && patient.getDrugAllergies() != null) {
      sections.add("Recorded allergies: " + patient.getDrugAllergies() + ".");
      citations.add(new InternalAssistantCitationResponse(
          "Recorded allergies",
          patient.getDrugAllergies(),
          "PATIENT_PROFILE",
          "patient:" + patient.getId() + ":allergies",
          patientLink));
    }

    if (mentionsAny(normalized, "history") && patient.getMedicalHistory() != null) {
      sections.add("Recorded medical history: " + patient.getMedicalHistory() + ".");
      citations.add(new InternalAssistantCitationResponse(
          "Recorded medical history",
          patient.getMedicalHistory(),
          "PATIENT_PROFILE",
          "patient:" + patient.getId() + ":history",
          patientLink));
    }

    if (mentionsAny(normalized, "lab") && !context.labResults().isEmpty()) {
      var latestLab = context.labResults().get(0);
      var summary = latestLab.getResultSummary() == null ? latestLab.getStatus() : latestLab.getResultSummary();
      sections.add("Latest lab result: " + latestLab.getTestName() + " - " + summary + ".");
      citations.add(new InternalAssistantCitationResponse(
          "Latest lab result",
          latestLab.getTestName() + " | " + summary,
          "LAB_RESULT",
          "lab-result:" + latestLab.getId(),
          patientLink));
      suggestions.add("Ask about patient portal messaging SOP");
    }

    if (mentionsAny(normalized, "message", "portal") && !context.threads().isEmpty()) {
      var thread = context.threads().get(0);
      sections.add("Latest patient portal thread: " + thread.getSubject()
          + " - " + (thread.getLastMessagePreview() == null ? "no preview" : thread.getLastMessagePreview()) + ".");
      citations.add(new InternalAssistantCitationResponse(
          "Latest patient message thread",
          thread.getSubject() + " | " + thread.getLastMessagePreview(),
          "PATIENT_MESSAGE_THREAD",
          "patient-thread:" + thread.getId(),
          patientLink));
    }

    if (mentionsAny(normalized, "prescription", "medicine") && latestRecord != null) {
      var medicineSummary = latestRecord.getPrescriptionItems().stream()
          .map(item -> item.getMedicineName() + " " + item.getDosage())
          .limit(3)
          .collect(Collectors.joining(", "));
      if (!medicineSummary.isBlank()) {
        sections.add("Latest prescription: " + medicineSummary + ".");
        citations.add(new InternalAssistantCitationResponse(
            "Latest prescription",
            medicineSummary,
            "PRESCRIPTION",
            "prescription:" + latestRecord.getId(),
            "/medical-record-editor?appointmentId=" + latestAppointment.getId()));
      }
    }

    if (sections.isEmpty() && latestAppointment != null) {
      sections.add("Selected patient context: " + patient.getFullName()
          + ", latest appointment " + latestAppointment.getAppointmentDate()
          + ", status " + latestAppointment.getStatus().name() + ".");
      citations.add(new InternalAssistantCitationResponse(
          "Patient context summary",
          patient.getFullName() + " | " + latestAppointment.getAppointmentDate(),
          "PATIENT_CONTEXT",
          "patient-context:" + patient.getId(),
          patientLink));
      suggestions.add("Ask about diagnosis");
      suggestions.add("Ask about lab results");
    }

    return new AssistantAnswer(String.join(" ", sections), citations, List.copyOf(suggestions));
  }

  private AssistantAnswer buildKnowledgeAnswer(
      String message,
      InternalAssistantMode requestedMode,
      PatientContext patientContext) {
    var normalized = normalize(message);
    var tokens = tokenize(normalized);
    var nodes = knowledgeNodeRepository.findAllByDocumentActiveTrueOrderByNodeKeyAsc();
    var edges = knowledgeEdgeRepository.findAllForActiveDocuments();
    var matchedNodes = nodes.stream()
        .filter(node -> matchesNode(node, normalized, tokens))
        .toList();

    Set<String> boostedDocumentKeys = new LinkedHashSet<>();
    for (KnowledgeNodeEntity matchedNode : matchedNodes) {
      if (matchedNode.getDocument() != null) {
        boostedDocumentKeys.add(matchedNode.getDocument().getDocumentKey());
      }
      for (KnowledgeEdgeEntity edge : edges) {
        if (edge.getSourceNode().getId().equals(matchedNode.getId())
            && edge.getTargetNode().getDocument() != null) {
          boostedDocumentKeys.add(edge.getTargetNode().getDocument().getDocumentKey());
        }
        if (edge.getTargetNode().getId().equals(matchedNode.getId())
            && edge.getSourceNode().getDocument() != null) {
          boostedDocumentKeys.add(edge.getSourceNode().getDocument().getDocumentKey());
        }
      }
    }

    var rankedChunks = knowledgeChunkRepository.findAllByDocumentActiveTrueOrderByReferenceKeyAsc().stream()
        .map(chunk -> new RankedChunk(chunk, scoreChunk(chunk, normalized, tokens, boostedDocumentKeys, patientContext)))
        .filter(ranked -> ranked.score() > 0)
        .sorted(Comparator.comparingInt(RankedChunk::score).reversed())
        .limit(requestedMode == InternalAssistantMode.DOCS ? 2 : 1)
        .toList();

    if (rankedChunks.isEmpty()) {
      return new AssistantAnswer("", List.of(), List.of());
    }

    var citations = rankedChunks.stream()
        .map(ranked -> new InternalAssistantCitationResponse(
            ranked.chunk().getCitationLabel(),
            summarize(ranked.chunk().getContent()),
            "KNOWLEDGE_DOC",
            ranked.chunk().getReferenceKey(),
            "/admin-monitoring?tab=knowledge&documentId="
                + ranked.chunk().getDocument().getId()
                + "&chunkRef="
                + ranked.chunk().getReferenceKey()))
        .toList();

    var answer = rankedChunks.stream()
        .map(ranked -> "Active internal document: "
            + ranked.chunk().getHeading()
            + " - "
            + summarize(ranked.chunk().getContent()))
        .collect(Collectors.joining(" "));
    var suggestions = rankedChunks.stream()
        .map(ranked -> "Open " + ranked.chunk().getDocument().getTitle())
        .distinct()
        .toList();
    return new AssistantAnswer(answer, citations, suggestions);
  }

  private int scoreChunk(
      KnowledgeChunkEntity chunk,
      String normalizedMessage,
      Set<String> tokens,
      Set<String> boostedDocumentKeys,
      PatientContext patientContext) {
    var searchable = normalize(chunk.getHeading() + " " + chunk.getContent() + " " + chunk.getDocument().getTitle());
    int score = 0;
    for (String token : tokens) {
      if (token.length() >= 3 && searchable.contains(token)) {
        score += 2;
      }
    }
    if (boostedDocumentKeys.contains(chunk.getDocument().getDocumentKey())) {
      score += 3;
    }
    if (patientContext != null && mentionsAny(normalizedMessage, "follow-up")
        && chunk.getDocument().getDocumentKey().contains("follow-up")) {
      score += 2;
    }
    if (mentionsAny(normalizedMessage, "record", "chart")
        && chunk.getDocument().getDocumentKey().contains("medical-record")) {
      score += 2;
    }
    return score;
  }

  private boolean matchesNode(KnowledgeNodeEntity node, String normalizedMessage, Set<String> tokens) {
    if (normalizedMessage.contains(normalize(node.getName()))) {
      return true;
    }
    if (node.getAliases() != null) {
      for (String alias : node.getAliases().split(",")) {
        var normalizedAlias = normalize(alias);
        if (!normalizedAlias.isBlank()
            && (normalizedMessage.contains(normalizedAlias) || tokens.contains(normalizedAlias))) {
          return true;
        }
      }
    }
    return false;
  }

  private void recordAudit(
      UUID actorId,
      UserRole actorRole,
      InternalAssistantMessageRequest request,
      InternalAssistantScope scope,
      Collection<InternalAssistantCitationResponse> citations,
      String outcome,
      UUID sessionId,
      UUID messageId) {
    Map<String, Object> metadata = new LinkedHashMap<>();
    metadata.put("mode", request.mode().name());
    metadata.put("scope", scope.name());
    metadata.put("actorRole", actorRole.name());
    metadata.put("appointmentId", request.appointmentId() == null ? "" : request.appointmentId().toString());
    metadata.put("patientId", request.patientId() == null ? "" : request.patientId().toString());
    metadata.put("citations", citations.stream().map(InternalAssistantCitationResponse::referenceId).toList());
    metadata.put("outcome", outcome);
    metadata.put("sessionId", sessionId == null ? "" : sessionId.toString());
    metadata.put("messageId", messageId == null ? "" : messageId.toString());

    auditLogService.record(actorId, "INTERNAL_ASSISTANT_QUERY", "INTERNAL_ASSISTANT", request.patientId(), metadata);
  }

  private boolean mentionsAny(String normalized, String... tokens) {
    for (String token : tokens) {
      if (normalized.contains(token)) {
        return true;
      }
    }
    return false;
  }

  private Set<String> tokenize(String normalized) {
    return java.util.Arrays.stream(normalized.split("[^\\p{L}\\p{Nd}]+"))
        .filter(token -> !token.isBlank())
        .collect(Collectors.toCollection(LinkedHashSet::new));
  }

  private String summarize(String text) {
    if (text == null) {
      return "";
    }
    var normalized = text.trim();
    if (normalized.length() <= 180) {
      return normalized;
    }
    return normalized.substring(0, 177) + "...";
  }

  private String normalize(String text) {
    return text == null ? "" : text.toLowerCase(Locale.ROOT);
  }

  private long elapsedMillis(long startedAt) {
    return (System.nanoTime() - startedAt) / 1_000_000L;
  }

  private record RankedChunk(KnowledgeChunkEntity chunk, int score) {}

  private record AssistantAnswer(
      String answer,
      List<InternalAssistantCitationResponse> citations,
      List<String> suggestions
  ) {}

  private record PatientContext(
      PatientEntity patient,
      AppointmentEntity requestedAppointment,
      List<AppointmentEntity> appointments,
      Map<UUID, MedicalRecordEntity> recordsByAppointmentId,
      List<LabResultEntity> labResults,
      List<PatientMessageThreadEntity> threads,
      Map<UUID, List<PatientMessageEntity>> messagesByThreadId
  ) {}
}
