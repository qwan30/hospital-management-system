package com.hospital.shared.internalassistant;

public record InternalAssistantCitationResponse(
    String title,
    String excerpt,
    String sourceType,
    String referenceId,
    String deepLink
) {}
