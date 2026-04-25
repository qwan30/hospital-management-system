package com.hospital.shared.admin;

import jakarta.validation.constraints.NotBlank;

public record AdminDepartmentUpsertRequest(
    @NotBlank String name,
    String description,
    String imageUrl,
    String phone,
    Boolean active
) {}
