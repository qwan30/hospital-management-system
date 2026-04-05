package com.hospital.shared.booking;

import jakarta.validation.constraints.NotBlank;

public record PatientAddressRequest(
    @NotBlank String provinceOrCity,
    @NotBlank String district,
    @NotBlank String streetAddress
) {}
