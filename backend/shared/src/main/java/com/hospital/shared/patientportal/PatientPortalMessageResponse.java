package com.hospital.shared.patientportal;

import java.time.Instant;
import java.util.UUID;

public record PatientPortalMessageResponse(
    UUID messageId,
    String senderRole,
    String body,
    Instant createdAt
) {}
