package com.hospital.shared.patientauth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record PatientClaimRequest(
    @NotBlank String fullName,
    @NotBlank @Email String email,
    @NotBlank @Pattern(regexp = "^[0-9]{12}$") String cccd,
    @NotBlank String dateOfBirth,
    @NotBlank String password
) {}
