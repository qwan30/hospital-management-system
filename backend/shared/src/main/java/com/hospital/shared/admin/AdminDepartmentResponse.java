package com.hospital.shared.admin;

import java.util.UUID;

public record AdminDepartmentResponse(
    UUID departmentId,
    String name,
    String description,
    String imageUrl,
    String phone,
    boolean active
) {}
