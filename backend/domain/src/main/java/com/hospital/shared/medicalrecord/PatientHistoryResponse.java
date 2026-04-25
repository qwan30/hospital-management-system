package com.hospital.shared.medicalrecord;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record PatientHistoryResponse(
    UUID patientId,
    String fullName,
    String phone,
    String cccd,
    LocalDate dateOfBirth,
    List<PatientHistoryAppointmentResponse> appointments
) {}
