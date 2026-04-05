package com.hospital.shared.medicalrecord;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record PrescriptionItemPayload(
    @NotBlank String medicineName,
    @NotBlank String dosage,
    String frequency,
    @Min(1) Integer durationDays,
    String instructions,
    @Min(0) Integer sortOrder
) {}
