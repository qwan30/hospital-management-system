package com.hospital.shared.patientportal;

import java.time.LocalDate;
import java.util.UUID;

public record PatientPortalProfileResponse(
    UUID patientId,
    String fullName,
    String email,
    String phone,
    LocalDate dateOfBirth,
    String occupation,
    String bloodType,
    String medicalHistory,
    String drugAllergies,
    String insuranceNumber
) {}
