package com.hospital.shared.patientportal;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record PatientPortalAppointmentResponse(
    UUID appointmentId,
    String confirmationCode,
    LocalDate appointmentDate,
    LocalTime startTime,
    LocalTime endTime,
    String doctorName,
    String status
) {}
