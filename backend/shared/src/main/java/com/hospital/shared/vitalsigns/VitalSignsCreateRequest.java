package com.hospital.shared.vitalsigns;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record VitalSignsCreateRequest(
    @NotNull UUID appointmentId,
    String bloodPressure,
    Double temperature,
    Double heartRate,
    Double height,
    Integer weight,
    Integer respiratoryRate,
    Double oxygenSaturation
) {}
