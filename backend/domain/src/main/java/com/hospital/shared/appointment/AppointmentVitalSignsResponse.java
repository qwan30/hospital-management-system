package com.hospital.shared.appointment;

import java.time.Instant;
import java.util.UUID;

public record AppointmentVitalSignsResponse(
    UUID id,
    UUID appointmentId,
    String bloodPressure,
    Double temperature,
    Double weight,
    Double height,
    Integer heartRate,
    Integer respiratoryRate,
    Double oxygenSaturation,
    Instant recordedAt
) {}
