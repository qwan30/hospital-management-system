package com.hospital.shared.patientportal;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PatientPortalMessageThreadResponse(
    UUID threadId,
    String subject,
    String channel,
    int unreadCount,
    String lastMessagePreview,
    Instant updatedAt,
    List<PatientPortalMessageResponse> messages
) {}
