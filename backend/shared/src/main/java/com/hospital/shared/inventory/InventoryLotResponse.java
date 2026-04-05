package com.hospital.shared.inventory;

import java.time.LocalDate;
import java.util.UUID;

public record InventoryLotResponse(
    UUID lotId,
    UUID itemId,
    String itemName,
    String lotCode,
    String supplierName,
    int quantityReceived,
    int quantityRemaining,
    LocalDate expiresOn
) {}
