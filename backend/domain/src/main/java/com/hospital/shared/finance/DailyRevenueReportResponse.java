package com.hospital.shared.finance;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record DailyRevenueReportResponse(
    LocalDate date,
    BigDecimal totalRevenue,
    long paidInvoiceCount,
    List<RevenueDepartmentResponse> departmentBreakdown
) {}
