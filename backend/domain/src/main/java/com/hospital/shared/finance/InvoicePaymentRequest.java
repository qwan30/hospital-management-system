package com.hospital.shared.finance;

import jakarta.validation.constraints.NotBlank;

public record InvoicePaymentRequest(@NotBlank String paymentMethod) {}
