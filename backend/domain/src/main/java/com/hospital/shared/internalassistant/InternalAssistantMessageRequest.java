package com.hospital.shared.internalassistant;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public record InternalAssistantMessageRequest(
    @NotBlank String message,
    @NotNull InternalAssistantMode mode,
    UUID patientId,
    UUID appointmentId,
    UUID sessionId,
    @Valid List<InternalAssistantConversationMessage> conversation
) {}
