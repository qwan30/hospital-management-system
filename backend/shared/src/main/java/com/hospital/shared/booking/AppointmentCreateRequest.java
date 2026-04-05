package com.hospital.shared.booking;

import com.hospital.shared.enums.Gender;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;
import java.util.UUID;

public record AppointmentCreateRequest(
    @NotNull UUID doctorId,
    @NotNull UUID firstSlotId,
    @Min(30) int aiDurationMinutes,
    @NotBlank String patientFullName,
    @Pattern(regexp = "^[0-9]{12}$", message = "must be 12 digits") String patientCccd,
    @Email @NotBlank String patientEmail,
    @Pattern(regexp = "^[0-9+\\-\\s]{8,20}$", message = "must be a valid phone number") String patientPhone,
    @NotNull LocalDate patientDateOfBirth,
    @NotNull Gender patientGender,
    @Valid @NotNull PatientAddressRequest patientAddress,
    String patientOccupation,
    String patientBloodType,
    String patientMedicalHistory,
    String patientDrugAllergies,
    String patientInsuranceNumber,
    @Valid BookingContactRequest bookingContact,
    String symptoms
) {}
