package com.hospital.shared.appointment;

import jakarta.validation.constraints.Size;

public record AppointmentUpdateRequest(
    @Size(max = 500) String notes,
    @Size(max = 500) String reason
) {}
