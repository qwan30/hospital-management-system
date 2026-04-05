package com.hospital.shared.internalassistant;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record InternalAssistantFeedbackRequest(
    @NotNull InternalAssistantFeedbackValue value,
    @Size(max = 500) String note
) {}
