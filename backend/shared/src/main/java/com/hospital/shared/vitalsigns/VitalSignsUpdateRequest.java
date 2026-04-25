package com.hospital.shared.vitalsigns;

import java.util.UUID;

public record VitalSignsUpdateRequest(
    String bloodPressure,
    Double temperature,
    Double heartRate,
    Double height,
    Integer weight,
    Integer respiratoryRate,
    Double oxygenSaturation
) {}
