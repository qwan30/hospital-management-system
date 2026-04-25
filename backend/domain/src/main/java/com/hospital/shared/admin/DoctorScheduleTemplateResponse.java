package com.hospital.shared.admin;

import java.time.LocalTime;
import java.util.UUID;

public record DoctorScheduleTemplateResponse(
    UUID templateId,
    UUID doctorId,
    String doctorName,
    int weekday,
    LocalTime startTime,
    LocalTime endTime,
    int slotDurationMinutes,
    boolean active
) {}
