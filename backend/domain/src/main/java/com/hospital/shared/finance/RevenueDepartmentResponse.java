package com.hospital.shared.finance;

import java.math.BigDecimal;

public record RevenueDepartmentResponse(
    String departmentName,
    BigDecimal totalRevenue,
    long invoiceCount
) {}
