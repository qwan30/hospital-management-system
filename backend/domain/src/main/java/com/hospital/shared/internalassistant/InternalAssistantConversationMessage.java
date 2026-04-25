package com.hospital.shared.internalassistant;

import jakarta.validation.constraints.NotBlank;

public record InternalAssistantConversationMessage(
    @NotBlank String role,
    @NotBlank String content
) {}
