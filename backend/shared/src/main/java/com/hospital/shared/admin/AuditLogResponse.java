package com.hospital.shared.admin;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record AuditLogResponse(
    UUID auditLogId,
    String actorName,
    String actorRole,
    String action,
    String entityType,
    UUID entityId,
    Map<String, Object> metadata,
    Instant createdAt
) {}
