package com.hospital.shared.queue;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record QueueRoomAssignmentRequest(
    @NotBlank @Size(max = 120) String roomName
) {}
