package com.hospital.shared.finance;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record InvoiceCreateRequest(@NotNull UUID appointmentId) {}
