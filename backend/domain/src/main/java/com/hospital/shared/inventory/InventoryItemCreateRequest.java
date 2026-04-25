package com.hospital.shared.inventory;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record InventoryItemCreateRequest(
    @NotBlank @Size(max = 64) String sku,
    @NotBlank @Size(max = 255) String itemName,
    @NotBlank @Size(max = 120) String category,
    @NotBlank @Size(max = 40) String unit,
    @NotNull @Min(0) Integer reorderLevel,
    @Min(0) int quantityOnHand,
    UUID departmentId
) {}
