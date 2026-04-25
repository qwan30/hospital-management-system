package com.hospital.shared.admin;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record AdminSlotGenerateRequest(
    UUID doctorId,        // null = all doctors
    @NotNull LocalDate fromDate,
    @NotNull LocalDate toDate
) {}
