package com.hospital.shared.internalassistant;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record InternalAssistantKnowledgeDocumentResponse(
    UUID documentId,
    String documentKey,
    String title,
    String category,
    KnowledgeDocumentStatus status,
    String version,
    String owner,
    LocalDate effectiveDate,
    List<String> tags,
    String sourceFilename,
    String sourcePath,
    String summary,
    Instant updatedAt,
    KnowledgeIngestionStage latestIngestionStage
) {}
