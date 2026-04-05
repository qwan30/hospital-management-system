package com.hospital.shared.internalassistant;

import java.time.Instant;
import java.util.UUID;

public record InternalAssistantSessionMessageResponse(
    UUID messageId,
    String role,
    String content,
    Instant createdAt,
    InternalAssistantScope scope,
    InternalAssistantFeedbackValue feedbackValue
) {}
