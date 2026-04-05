package com.hospital.shared.admin;

import com.hospital.shared.enums.RoomStatus;
import java.util.UUID;

public record AdminRoomResponse(
    UUID roomId,
    String name,
    UUID departmentId,
    String departmentName,
    RoomStatus status,
    boolean active
) {}
