package com.hospital.shared.lab;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record LabResultCreateRequest(
    @NotNull UUID appointmentId,
    @NotBlank @Size(max = 200) String testName,
    @NotBlank String resultValue,
    @Size(max = 200) String referenceRange,
    @Size(max = 50) String status,
    @Size(max = 500) String notes
) {}
