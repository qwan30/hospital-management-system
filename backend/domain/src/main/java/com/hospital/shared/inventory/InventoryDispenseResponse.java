package com.hospital.shared.inventory;

import java.time.Instant;
import java.util.UUID;

public record InventoryDispenseResponse(
    UUID movementId,
    UUID itemId,
    String itemName,
    UUID lotId,
    String lotCode,
    UUID medicalRecordId,
    String prescriptionItemName,
    int quantityDispensed,
    int itemQuantityOnHand,
    int lotQuantityRemaining,
    String note,
    Instant createdAt
) {}
