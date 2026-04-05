package com.hospital.shared.patientrecord;

import java.time.LocalDate;
import java.util.UUID;

public record PatientRecordListItemResponse(
    UUID patientId,
    String fullName,
    String phone,
    String email,
    LocalDate dateOfBirth,
    LocalDate latestAppointmentDate,
    long totalAppointments
) {}
