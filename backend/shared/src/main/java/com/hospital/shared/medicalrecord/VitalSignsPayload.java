package com.hospital.shared.medicalrecord;

public record VitalSignsPayload(
    String bloodPressure,
    Double temperature,
    Double weight,
    Double height
) {}
