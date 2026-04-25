package com.hospital.shared.patientrecord;

import com.hospital.shared.medicalrecord.PatientHistoryAppointmentResponse;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record PatientRecordDetailResponse(
    UUID patientId,
    String fullName,
    String phone,
    String email,
    String cccd,
    LocalDate dateOfBirth,
    String occupation,
    String bloodType,
    String medicalHistory,
    String drugAllergies,
    String insuranceNumber,
    List<PatientHistoryAppointmentResponse> appointments
) {}
