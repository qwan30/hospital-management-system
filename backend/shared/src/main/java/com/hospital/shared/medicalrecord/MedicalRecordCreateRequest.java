package com.hospital.shared.medicalrecord;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record MedicalRecordCreateRequest(
    @NotNull UUID appointmentId,
    @NotBlank String diagnosis,
    String clinicalNotes,
    @Valid VitalSignsPayload vitalSigns,
    LocalDate followUpDate,
    @Valid List<PrescriptionItemPayload> prescriptionItems
) {}
