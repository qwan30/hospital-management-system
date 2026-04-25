package com.hospital.shared.ai;

import jakarta.validation.constraints.NotBlank;

public record AiAnalyzeRequest(
    @NotBlank String department,
    @NotBlank String symptoms
) {}
