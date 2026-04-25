package com.hospital.shared.internalassistant;

import java.util.List;

public record InternalAssistantKnowledgeDocumentDetailResponse(
    InternalAssistantKnowledgeDocumentResponse document,
    List<InternalAssistantKnowledgeChunkResponse> chunks
) {}
