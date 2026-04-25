package com.hospital.shared.appointment;

import com.hospital.shared.enums.AppointmentStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record AppointmentListResponse(
    UUID appointmentId,
    String confirmationCode,
    AppointmentStatus status,
    LocalDate appointmentDate,
    LocalTime startTime,
    LocalTime endTime,
    UUID doctorId,
    String doctorName,
    UUID patientId,
    String patientName,
    String patientPhone,
    String symptoms,
    Instant createdAt
) {}
