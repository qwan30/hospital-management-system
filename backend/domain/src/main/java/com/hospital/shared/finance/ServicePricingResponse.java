package com.hospital.shared.finance;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ServicePricingResponse(
    UUID pricingId,
    UUID departmentId,
    String departmentName,
    String serviceName,
    BigDecimal amount,
    LocalDate effectiveDate
) {}
