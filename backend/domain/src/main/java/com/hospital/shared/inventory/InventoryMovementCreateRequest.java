package com.hospital.shared.inventory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record InventoryMovementCreateRequest(
    @NotNull UUID itemId,
    @NotBlank @Size(max = 30) String movementType,
    @NotNull Integer quantityDelta,
    @Size(max = 500) String note
) {}
