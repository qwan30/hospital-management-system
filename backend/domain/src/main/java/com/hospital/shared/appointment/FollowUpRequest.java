package com.hospital.shared.appointment;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record FollowUpRequest(
    @NotNull @Future LocalDate followUpDate,
    @Size(max = 500) String reason
) {}
