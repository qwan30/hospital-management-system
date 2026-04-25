package com.hospital.shared.inventory;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record InventoryItemUpdateRequest(
    @Size(max = 255) String itemName,
    @Size(max = 120) String category,
    @Size(max = 40) String unit,
    @Min(0) Integer reorderLevel,
    UUID departmentId
) {}
