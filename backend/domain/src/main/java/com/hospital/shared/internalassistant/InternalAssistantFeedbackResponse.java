package com.hospital.shared.internalassistant;

import java.util.UUID;

public record InternalAssistantFeedbackResponse(
    UUID messageId,
    InternalAssistantFeedbackValue value,
    String note
) {}
