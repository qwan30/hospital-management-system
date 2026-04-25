package com.hospital.shared.appointment;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record AppointmentVitalSignsRequest(
    @Size(max = 32) String bloodPressure,
    Double temperature,
    Double weight,
    Double height,
    Integer heartRate,
    Integer respiratoryRate,
    Double oxygenSaturation
) {}
