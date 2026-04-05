package com.hospital.shared.finance;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ServicePricingUpsertRequest(
    UUID departmentId,
    @NotBlank String serviceName,
    @NotNull @DecimalMin("0.0") BigDecimal amount,
    @NotNull LocalDate effectiveDate
) {}
