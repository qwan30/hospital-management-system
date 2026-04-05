package com.hospital.shared.admin;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;
import java.util.UUID;

public record DoctorScheduleTemplateUpsertRequest(
    @NotNull UUID doctorId,
    @Min(1) @Max(7) int weekday,
    @NotNull LocalTime startTime,
    @NotNull LocalTime endTime,
    @Min(15) int slotDurationMinutes,
    Boolean active
) {}
