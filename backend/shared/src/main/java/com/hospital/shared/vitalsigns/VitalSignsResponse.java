package com.hospital.shared.vitalsigns;

import java.time.Instant;
import java.util.UUID;

public record VitalSignsResponse(
    UUID id,
    UUID appointmentId,
    String bloodPressure,
    Double temperature,
    Double heartRate,
    Double height,
    Integer weight,
    Integer respiratoryRate,
    Double oxygenSaturation,
    Instant createdAt
) {}
