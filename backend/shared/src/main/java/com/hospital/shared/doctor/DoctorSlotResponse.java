package com.hospital.shared.doctor;

import com.hospital.shared.enums.SlotStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record DoctorSlotResponse(
    UUID id,
    UUID doctorId,
    LocalDate slotDate,
    LocalTime startTime,
    LocalTime endTime,
    SlotStatus status
) {}
