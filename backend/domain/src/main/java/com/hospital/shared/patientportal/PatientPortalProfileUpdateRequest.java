package com.hospital.shared.patientportal;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record PatientPortalProfileUpdateRequest(
    @NotBlank String fullName,
    @NotBlank @Email String email,
    @NotBlank String phone,
    String occupation,
    String bloodType,
    String medicalHistory,
    String drugAllergies,
    String insuranceNumber
) {}
