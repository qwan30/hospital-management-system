package com.hospital.shared.inventory;

import java.time.Instant;
import java.util.UUID;

public record InventoryMovementResponse(
    UUID movementId,
    UUID itemId,
    String itemName,
    String movementType,
    int quantityDelta,
    String note,
    Instant createdAt
) {}
