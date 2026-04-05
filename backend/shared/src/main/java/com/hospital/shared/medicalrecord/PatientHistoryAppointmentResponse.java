package com.hospital.shared.medicalrecord;

import com.hospital.shared.enums.AppointmentStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record PatientHistoryAppointmentResponse(
    UUID appointmentId,
    LocalDate appointmentDate,
    LocalTime startTime,
    LocalTime endTime,
    AppointmentStatus status,
    UUID doctorId,
    String doctorName,
    MedicalRecordResponse medicalRecord
) {}
