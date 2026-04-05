package com.hospital.shared.internalassistant;

import java.util.UUID;

public record InternalAssistantKnowledgeChunkResponse(
    UUID chunkId,
    String heading,
    String referenceKey,
    String content
) {}
