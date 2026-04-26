package com.hospital.shared.inventory;

import java.time.LocalDate;
import java.util.UUID;

public record InventoryAlertResponse(
    String alertType,
    String severity,
    UUID itemId,
    String itemName,
    UUID lotId,
    String lotCode,
    int quantityOnHand,
    int reorderLevel,
    LocalDate expiresOn,
    Integer daysUntilExpiry,
    String message
) {}
