package com.hospital.shared.booking;

import com.hospital.shared.enums.AppointmentStatus;
import java.time.LocalDate;
import java.util.UUID;

public record AppointmentResponse(
    UUID id,
    UUID patientId,
    UUID doctorId,
    UUID firstSlotId,
    String confirmationCode,
    AppointmentStatus status,
    LocalDate appointmentDate
) {}
