package com.hospital.shared.finance;

import java.math.BigDecimal;
import java.util.UUID;

public record InvoiceLineItemResponse(
    UUID id,
    String description,
    BigDecimal amount
) {}
