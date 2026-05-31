package com.hospital.shared.inventory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record InventoryDispenseRequest(
    @NotNull UUID itemId,
    @NotNull UUID lotId,
    @NotNull UUID medicalRecordId,
    @NotBlank @Size(max = 255) String prescriptionItemName,
    @NotNull @Positive Integer quantity,
    @Size(max = 500) String note
) {}
