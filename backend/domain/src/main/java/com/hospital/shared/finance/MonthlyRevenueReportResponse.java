package com.hospital.shared.finance;

import java.math.BigDecimal;

public record MonthlyRevenueReportResponse(
    String month,
    BigDecimal totalRevenue,
    long paidInvoiceCount
) {}
