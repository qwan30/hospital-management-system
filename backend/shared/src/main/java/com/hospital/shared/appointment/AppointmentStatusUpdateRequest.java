package com.hospital.shared.appointment;

import com.hospital.shared.enums.AppointmentStatus;
import jakarta.validation.constraints.NotNull;

public record AppointmentStatusUpdateRequest(
    @NotNull AppointmentStatus status
) {}
