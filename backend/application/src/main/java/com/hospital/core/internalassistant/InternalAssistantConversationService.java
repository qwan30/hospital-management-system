package com.hospital.core.internalassistant;

import com.hospital.core.common.NotFoundException;
import com.hospital.core.user.UserRepository;
import com.hospital.shared.enums.UserRole;
import com.hospital.shared.internalassistant.InternalAssistantFeedbackRequest;
import com.hospital.shared.internalassistant.InternalAssistantFeedbackValue;
import com.hospital.shared.internalassistant.InternalAssistantMode;
import com.hospital.shared.internalassistant.InternalAssistantScope;
import com.hospital.shared.internalassistant.InternalAssistantSessionMessageResponse;
import com.hospital.shared.internalassistant.InternalAssistantSessionResponse;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InternalAssistantConversationService {
  private final InternalAssistantFeedbackRepository internalAssistantFeedbackRepository;
  private final InternalAssistantMessageRepository internalAssistantMessageRepository;
  private final InternalAssistantSessionRepository internalAssistantSessionRepository;
  private final UserRepository userRepository;

  public InternalAssistantConversationService(
      InternalAssistantFeedbackRepository internalAssistantFeedbackRepository,
      InternalAssistantMessageRepository internalAssistantMessageRepository,
      InternalAssistantSessionRepository internalAssistantSessionRepository,
      UserRepository userRepository) {
    this.internalAssistantFeedbackRepository = internalAssistantFeedbackRepository;
    this.internalAssistantMessageRepository = internalAssistantMessageRepository;
    this.internalAssistantSessionRepository = internalAssistantSessionRepository;
    this.userRepository = userRepository;
  }

  @Transactional
  public InternalAssistantSessionEntity resolveSession(
      UUID actorId,
      UserRole actorRole,
      InternalAssistantMode mode,
      UUID patientId,
      UUID appointmentId,
      UUID requestedSessionId) {
    var sessionKey = sessionKey(actorId, actorRole, mode, patientId, appointmentId);
    if (requestedSessionId != null) {
      var requestedSession = internalAssistantSessionRepository.findByIdAndActorId(requestedSessionId, actorId)
          .orElseThrow(() -> new NotFoundException("Assistant session not found"));
      if (!requestedSession.getSessionKey().equals(sessionKey)) {
        throw new IllegalArgumentException("Assistant session does not match the current context");
      }
      return requestedSession;
    }

    return internalAssistantSessionRepository.findBySessionKey(sessionKey)
        .orElseGet(() -> createSession(actorId, actorRole, mode, patientId, appointmentId, sessionKey));
  }

  @Transactional(readOnly = true)
  public InternalAssistantSessionResponse getCurrentSession(
      UUID actorId,
      UserRole actorRole,
      InternalAssistantMode mode,
      UUID patientId,
      UUID appointmentId,
      UUID requestedSessionId) {
    InternalAssistantSessionEntity session = null;
    if (requestedSessionId != null) {
      session = internalAssistantSessionRepository.findByIdAndActorId(requestedSessionId, actorId)
          .orElseThrow(() -> new NotFoundException("Assistant session not found"));
    } else {
      session = internalAssistantSessionRepository.findBySessionKey(sessionKey(actorId, actorRole, mode, patientId, appointmentId))
          .orElse(null);
    }

    if (session == null) {
      return new InternalAssistantSessionResponse(null, mode, patientId, appointmentId, List.of());
    }

    return new InternalAssistantSessionResponse(
        session.getId(),
        session.getMode(),
        session.getPatientId(),
        session.getAppointmentId(),
        internalAssistantMessageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId()).stream()
            .map(message -> new InternalAssistantSessionMessageResponse(
                message.getId(),
                message.getRole(),
                message.getContent(),
                message.getCreatedAt(),
                message.getScope(),
                internalAssistantFeedbackRepository.findByMessageId(message.getId())
                    .map(InternalAssistantFeedbackEntity::getValue)
                    .orElse(null)))
            .toList());
  }

  @Transactional
  public void recordUserMessage(InternalAssistantSessionEntity session, String message) {
    var entity = new InternalAssistantMessageEntity();
    entity.setSession(session);
    entity.setRole("user");
    entity.setContent(message);
    internalAssistantMessageRepository.save(entity);
  }

  @Transactional
  public InternalAssistantMessageEntity recordAssistantMessage(
      InternalAssistantSessionEntity session,
      String answer,
      InternalAssistantScope scope) {
    var entity = new InternalAssistantMessageEntity();
    entity.setSession(session);
    entity.setRole("assistant");
    entity.setContent(answer);
    entity.setScope(scope);
    return internalAssistantMessageRepository.save(entity);
  }

  @Transactional
  public InternalAssistantFeedbackValue submitFeedback(
      UUID actorId,
      UUID messageId,
      InternalAssistantFeedbackRequest request) {
    var message = internalAssistantMessageRepository.findById(messageId)
        .orElseThrow(() -> new NotFoundException("Assistant message not found"));

    if (!"assistant".equalsIgnoreCase(message.getRole())) {
      throw new IllegalArgumentException("Feedback can be submitted only for assistant messages");
    }
    if (!message.getSession().getActor().getId().equals(actorId)) {
      throw new AccessDeniedException("Cannot submit feedback for another user's assistant message");
    }

    var feedback = internalAssistantFeedbackRepository.findByMessageId(messageId)
        .orElseGet(InternalAssistantFeedbackEntity::new);
    feedback.setMessage(message);
    feedback.setActor(message.getSession().getActor());
    feedback.setValue(request.value());
    feedback.setNote(request.note() == null || request.note().isBlank() ? null : request.note().trim());
    internalAssistantFeedbackRepository.save(feedback);
    return feedback.getValue();
  }

  private InternalAssistantSessionEntity createSession(
      UUID actorId,
      UserRole actorRole,
      InternalAssistantMode mode,
      UUID patientId,
      UUID appointmentId,
      String sessionKey) {
    var session = new InternalAssistantSessionEntity();
    session.setActor(userRepository.findById(actorId)
        .orElseThrow(() -> new NotFoundException("Assistant actor not found")));
    session.setActorRole(actorRole);
    session.setMode(mode);
    session.setPatientId(patientId);
    session.setAppointmentId(appointmentId);
    session.setSessionKey(sessionKey);
    return internalAssistantSessionRepository.save(session);
  }

  private String sessionKey(
      UUID actorId,
      UserRole actorRole,
      InternalAssistantMode mode,
      UUID patientId,
      UUID appointmentId) {
    return String.join("|",
        actorId.toString(),
        actorRole.name().toLowerCase(Locale.ROOT),
        mode.name().toLowerCase(Locale.ROOT),
        patientId == null ? "-" : patientId.toString(),
        appointmentId == null ? "-" : appointmentId.toString());
  }
}
