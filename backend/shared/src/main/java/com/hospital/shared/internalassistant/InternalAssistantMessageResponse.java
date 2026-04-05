package com.hospital.shared.internalassistant;

import java.util.List;

import java.util.UUID;

public record InternalAssistantMessageResponse(
    UUID sessionId,
    UUID messageId,
    String answer,
    List<InternalAssistantCitationResponse> citations,
    List<String> deepLinks,
    List<String> suggestions,
    InternalAssistantScope scope
) {}
