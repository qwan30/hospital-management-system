package com.hospital.shared.appointment;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record AppointmentCheckInRequest(
    @NotNull LocalDateTime checkedInAt
) {}
