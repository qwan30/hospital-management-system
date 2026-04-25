package com.hospital.shared.inventory;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;

public record InventoryLotCreateRequest(
    @NotNull UUID itemId,
    @NotBlank @Size(max = 100) String lotCode,
    @Size(max = 200) String supplierName,
    @NotNull @Min(1) Integer quantityReceived,
    LocalDate expiresOn
) {}
