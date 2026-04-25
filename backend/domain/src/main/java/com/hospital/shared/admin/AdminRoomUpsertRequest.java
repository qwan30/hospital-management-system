package com.hospital.shared.admin;

import com.hospital.shared.enums.RoomStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record AdminRoomUpsertRequest(
    @NotBlank String name,
    UUID departmentId,
    @NotNull RoomStatus status,
    Boolean active
) {}
