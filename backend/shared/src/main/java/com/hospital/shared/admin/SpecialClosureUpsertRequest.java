package com.hospital.shared.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record SpecialClosureUpsertRequest(
    @NotBlank String title,
    @NotNull LocalDate closureDate,
    UUID doctorId,
    UUID roomId,
    String reason,
    Boolean active
) {}
