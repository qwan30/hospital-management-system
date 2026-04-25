package com.hospital.shared.medicalrecord;

import com.hospital.shared.enums.AppointmentStatus;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record MedicalRecordResponse(
    UUID recordId,
    UUID appointmentId,
    String diagnosis,
    String clinicalNotes,
    VitalSignsPayload vitalSigns,
    LocalDate followUpDate,
    List<PrescriptionItemPayload> prescriptionItems,
    AppointmentStatus appointmentStatus
) {}
