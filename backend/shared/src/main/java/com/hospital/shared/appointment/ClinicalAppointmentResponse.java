package com.hospital.shared.appointment;

import com.hospital.shared.enums.AppointmentStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public record ClinicalAppointmentResponse(
    UUID appointmentId,
    String confirmationCode,
    AppointmentStatus status,
    LocalDate appointmentDate,
    LocalTime startTime,
    LocalTime endTime,
    LocalDateTime checkedInAt,
    UUID doctorId,
    String doctorName,
    UUID patientId,
    String patientFullName,
    String patientPhone,
    String patientCccd
) {}
