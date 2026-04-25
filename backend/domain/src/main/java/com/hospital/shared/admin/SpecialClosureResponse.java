package com.hospital.shared.admin;

import java.time.LocalDate;
import java.util.UUID;

public record SpecialClosureResponse(
    UUID closureId,
    String title,
    LocalDate closureDate,
    UUID doctorId,
    String doctorName,
    UUID roomId,
    String roomName,
    String reason,
    boolean active
) {}
