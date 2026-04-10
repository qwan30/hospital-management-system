package com.hospital.shared.admin;

import com.hospital.shared.enums.SlotStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record AdminSlotResponse(
    UUID id,
    UUID doctorId,
    String doctorName,
    LocalDate slotDate,
    LocalTime startTime,
    LocalTime endTime,
    SlotStatus status
) {}
