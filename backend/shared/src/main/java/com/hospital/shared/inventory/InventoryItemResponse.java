package com.hospital.shared.inventory;

import java.time.Instant;
import java.util.UUID;

public record InventoryItemResponse(
    UUID itemId,
    String sku,
    String itemName,
    String category,
    String unit,
    int reorderLevel,
    int quantityOnHand,
    String status,
    String departmentName,
    Instant lastRestockedAt
) {}
