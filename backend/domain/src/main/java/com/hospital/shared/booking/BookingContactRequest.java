package com.hospital.shared.booking;

import com.hospital.shared.enums.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;

public record BookingContactRequest(
    @NotBlank String fullName,
    @NotBlank String relationship,
    @Pattern(regexp = "^[0-9+\\-\\s]{8,20}$", message = "must be a valid phone number") String phone,
    @Email @NotBlank String email,
    @Pattern(regexp = "^$|^[0-9]{12}$", message = "must be 12 digits") String cccd,
    LocalDate dateOfBirth,
    @NotNull Gender gender
) {}
