package com.hospital.api.invoice;

import com.hospital.core.invoice.InvoiceService;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.enums.InvoiceStatus;
import com.hospital.shared.finance.InvoiceCreateRequest;
import com.hospital.shared.finance.InvoicePaymentRequest;
import com.hospital.shared.finance.InvoiceResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/invoices")
public class InvoiceController {
  private final InvoiceService invoiceService;

  public InvoiceController(InvoiceService invoiceService) {
    this.invoiceService = invoiceService;
  }

  @GetMapping
  @PreAuthorize("@rbac.hasPermission(authentication, 'INVOICE_READ')")
  public ApiResponse<List<InvoiceResponse>> listInvoices(@RequestParam(required = false) InvoiceStatus status) {
    return ApiResponse.ok(invoiceService.listInvoices(status));
  }

  @PostMapping
  @PreAuthorize("@rbac.hasPermission(authentication, 'INVOICE_WRITE')")
  public ResponseEntity<ApiResponse<InvoiceResponse>> createInvoice(@Valid @RequestBody InvoiceCreateRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.ok(invoiceService.createInvoice(request.appointmentId()), "Invoice created"));
  }

  @PostMapping("/{invoiceId}/payments")
  @PreAuthorize("@rbac.hasPermission(authentication, 'INVOICE_WRITE')")
  public ApiResponse<InvoiceResponse> recordPayment(
      @PathVariable UUID invoiceId,
      @Valid @RequestBody InvoicePaymentRequest request) {
    return ApiResponse.ok(invoiceService.recordPayment(invoiceId, request.paymentMethod()), "Payment captured");
  }

  @PostMapping("/{invoiceId}/void")
  @PreAuthorize("@rbac.hasPermission(authentication, 'INVOICE_WRITE')")
  public ApiResponse<InvoiceResponse> voidInvoice(@PathVariable UUID invoiceId) {
    return ApiResponse.ok(invoiceService.voidInvoice(invoiceId), "Invoice voided");
  }
}
