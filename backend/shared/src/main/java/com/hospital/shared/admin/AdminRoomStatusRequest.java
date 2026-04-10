package com.hospital.shared.admin;

import com.hospital.shared.enums.RoomStatus;
import jakarta.validation.constraints.NotNull;

public record AdminRoomStatusRequest(@NotNull RoomStatus status) {}
