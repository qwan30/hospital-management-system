package com.hospital.shared.appointment;

import com.hospital.shared.enums.AppointmentStatus;
import java.time.LocalDate;
import java.util.UUID;

public record FollowUpResponse(
    UUID followUpId,
    UUID parentAppointmentId,
    LocalDate followUpDate,
    String reason,
    AppointmentStatus status
) {}
