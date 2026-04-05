package com.hospital.shared.finance;

import com.hospital.shared.enums.InvoiceStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record InvoiceResponse(
    UUID invoiceId,
    UUID appointmentId,
    UUID patientId,
    String patientFullName,
    String doctorName,
    String departmentName,
    LocalDate appointmentDate,
    BigDecimal totalAmount,
    InvoiceStatus status,
    String paymentMethod,
    Instant paidAt
) {}
