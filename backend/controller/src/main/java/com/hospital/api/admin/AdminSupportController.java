package com.hospital.api.admin;

import com.hospital.core.support.SupportTicketService;
import com.hospital.shared.admin.SupportTicketResponse;
import com.hospital.shared.api.ApiResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/support/tickets")
public class AdminSupportController {
  private final SupportTicketService supportTicketService;

  public AdminSupportController(SupportTicketService supportTicketService) {
    this.supportTicketService = supportTicketService;
  }

  @GetMapping
  public ApiResponse<Page<SupportTicketResponse>> listTickets(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return ApiResponse.ok(supportTicketService.listTickets(page, size));
  }

  @GetMapping(value = "/export", produces = "text/csv")
  public ResponseEntity<String> exportCsv() {
    String csv = supportTicketService.exportToCsv();
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"support_tickets.csv\"")
        .contentType(MediaType.parseMediaType("text/csv"))
        .body(csv);
  }
}
