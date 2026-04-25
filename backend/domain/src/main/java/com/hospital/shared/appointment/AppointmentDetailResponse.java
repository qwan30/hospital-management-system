package com.hospital.shared.appointment;

import com.hospital.shared.enums.AppointmentStatus;
import com.hospital.shared.enums.Gender;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public record AppointmentDetailResponse(
    UUID appointmentId,
    String confirmationCode,
    AppointmentStatus status,
    LocalDate appointmentDate,
    LocalTime startTime,
    LocalTime endTime,
    LocalDateTime checkedInAt,
    int aiDurationMinutes,
    String symptoms,
    UUID doctorId,
    String doctorName,
    UUID patientId,
    String patientFullName,
    String patientPhone,
    String patientCccd,
    String patientEmail,
    LocalDate patientDateOfBirth,
    Gender patientGender
) {}
