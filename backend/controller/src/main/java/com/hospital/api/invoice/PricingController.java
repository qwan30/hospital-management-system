package com.hospital.api.invoice;

import com.hospital.core.invoice.InvoiceService;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.finance.ServicePricingResponse;
import com.hospital.shared.finance.ServicePricingUpsertRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/pricing")
@PreAuthorize("hasAnyRole('ACCOUNTANT','ADMIN')")
public class PricingController {
  private final InvoiceService invoiceService;

  public PricingController(InvoiceService invoiceService) {
    this.invoiceService = invoiceService;
  }

  @GetMapping
  public ApiResponse<List<ServicePricingResponse>> listPricing() {
    return ApiResponse.ok(invoiceService.listPricing());
  }

  @PostMapping
  public ResponseEntity<ApiResponse<ServicePricingResponse>> createPricing(
      @Valid @RequestBody ServicePricingUpsertRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.ok(invoiceService.createPricing(request), "Pricing rule created"));
  }

  @PutMapping("/{pricingId}")
  public ApiResponse<ServicePricingResponse> updatePricing(
      @PathVariable UUID pricingId,
      @Valid @RequestBody ServicePricingUpsertRequest request) {
    return ApiResponse.ok(invoiceService.updatePricing(pricingId, request), "Pricing rule updated");
  }
}
