package com.hospital.core.audit;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.core.user.UserRepository;
import com.hospital.shared.admin.AuditLogResponse;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import io.micrometer.core.instrument.Metrics;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;

@Service
public class AuditLogService {
  private final AuditLogRepository auditLogRepository;
  private final ObjectMapper objectMapper;
  private final UserRepository userRepository;

  public AuditLogService(
      AuditLogRepository auditLogRepository,
      ObjectMapper objectMapper,
      UserRepository userRepository) {
    this.auditLogRepository = auditLogRepository;
    this.objectMapper = objectMapper;
    this.userRepository = userRepository;
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void record(String action, String entityType, UUID entityId, Map<String, Object> metadata) {
    record(null, action, entityType, entityId, metadata);
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void record(UUID actorId, String action, String entityType, UUID entityId, Map<String, Object> metadata) {
    try {
      var entity = new AuditLogEntity();
      if (actorId != null) {
        userRepository.findById(actorId).ifPresent(entity::setActor);
      }
      entity.setAction(action);
      entity.setEntityType(entityType);
      entity.setEntityId(entityId);
      entity.setMetadata(serialize(metadata));
      auditLogRepository.save(entity);
    } catch (RuntimeException exception) {
      Metrics.counter(
              "hms.audit_log.write.failures",
              "action", safeTag(action),
              "entityType", safeTag(entityType))
          .increment();
      throw exception;
    }
  }

  @Transactional(readOnly = true)
  public List<AuditLogResponse> list(String entityType, String action, int limit) {
    return auditLogRepository.findAllByOrderByCreatedAtDesc().stream()
        .filter(entry -> entityType == null || entityType.isBlank() || entry.getEntityType().equalsIgnoreCase(entityType))
        .filter(entry -> action == null || action.isBlank() || entry.getAction().equalsIgnoreCase(action))
        .limit(limit <= 0 ? 50 : limit)
        .map(entry -> new AuditLogResponse(
            entry.getId(),
            entry.getActor() == null ? null : entry.getActor().getFullName(),
            entry.getActor() == null ? null : entry.getActor().getRole().name(),
            entry.getAction(),
            entry.getEntityType(),
            entry.getEntityId(),
            deserialize(entry.getMetadata()),
            entry.getCreatedAt()))
        .toList();
  }

  private String serialize(Map<String, Object> metadata) {
    if (metadata == null || metadata.isEmpty()) {
      return null;
    }
    try {
      return objectMapper.writeValueAsString(metadata);
    } catch (Exception exception) {
      throw new IllegalStateException("Unable to serialize audit metadata", exception);
    }
  }

  private Map<String, Object> deserialize(String metadata) {
    if (metadata == null || metadata.isBlank()) {
      return null;
    }
    try {
      return objectMapper.readValue(metadata, new TypeReference<>() {});
    } catch (Exception exception) {
      return Map.of("raw", metadata);
    }
  }

  private String safeTag(String value) {
    if (value == null || value.isBlank()) {
      return "UNKNOWN";
    }
    return value.trim()
        .replaceAll("[^A-Za-z0-9_.-]", "_")
        .toUpperCase(Locale.ROOT);
  }
}
