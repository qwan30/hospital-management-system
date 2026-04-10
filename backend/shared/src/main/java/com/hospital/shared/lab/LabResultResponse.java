package com.hospital.shared.lab;

import java.time.Instant;
import java.util.UUID;

public record LabResultResponse(
    UUID id,
    UUID appointmentId,
    String testName,
    String resultValue,
    String referenceRange,
    String status,
    String notes,
    boolean deleted,
    Instant createdAt
) {}
