package com.hospital.shared.inventory;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record InventoryLotUpdateRequest(
    @Size(max = 200) String supplierName,
    @Min(0) Integer quantityRemaining
) {}
