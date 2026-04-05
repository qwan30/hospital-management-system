package com.hospital.shared.department;

import java.util.UUID;

public record DepartmentResponse(
    UUID id,
    String name,
    String description,
    String imageUrl,
    String phone
) {}
