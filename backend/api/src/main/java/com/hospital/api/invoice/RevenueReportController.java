package com.hospital.api.invoice;

import com.hospital.core.invoice.InvoiceService;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.finance.DailyRevenueReportResponse;
import com.hospital.shared.finance.MonthlyRevenueReportResponse;
import java.time.LocalDate;
import java.time.YearMonth;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports/revenue")
@PreAuthorize("hasAnyRole('ACCOUNTANT','ADMIN')")
public class RevenueReportController {
  private final InvoiceService invoiceService;

  public RevenueReportController(InvoiceService invoiceService) {
    this.invoiceService = invoiceService;
  }

  @GetMapping("/daily")
  public ApiResponse<DailyRevenueReportResponse> getDailyRevenue(@RequestParam LocalDate date) {
    return ApiResponse.ok(invoiceService.getDailyRevenue(date));
  }

  @GetMapping("/monthly")
  public ApiResponse<MonthlyRevenueReportResponse> getMonthlyRevenue(@RequestParam String month) {
    return ApiResponse.ok(invoiceService.getMonthlyRevenue(YearMonth.parse(month)));
  }
}
