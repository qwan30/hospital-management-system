package com.hospital.shared.admin;

public record AdminSlotGenerateResult(
    int slotsCreated,
    int slotsSkipped,
    String summary
) {}
