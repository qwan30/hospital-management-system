package com.hospital.shared.inventory;

import jakarta.validation.constraints.Size;

public record InventoryLotUpdateRequest(
    @Size(max = 200) String supplierName,
    Integer quantityRemaining
) {}
