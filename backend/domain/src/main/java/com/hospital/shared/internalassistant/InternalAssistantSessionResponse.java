package com.hospital.shared.internalassistant;

import java.util.List;
import java.util.UUID;

public record InternalAssistantSessionResponse(
    UUID sessionId,
    InternalAssistantMode mode,
    UUID patientId,
    UUID appointmentId,
    List<InternalAssistantSessionMessageResponse> messages
) {}
