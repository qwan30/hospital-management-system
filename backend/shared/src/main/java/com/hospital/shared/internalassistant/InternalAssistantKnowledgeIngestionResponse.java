package com.hospital.shared.internalassistant;

import java.time.Instant;
import java.util.UUID;

public record InternalAssistantKnowledgeIngestionResponse(
    UUID ingestionId,
    UUID documentId,
    KnowledgeIngestionStage stage,
    String errorMessage,
    Instant startedAt,
    Instant completedAt,
    Instant updatedAt
) {}
