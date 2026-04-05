package com.hospital.shared.admin;

import com.hospital.shared.enums.UserRole;
import java.util.UUID;

public record AdminUserResponse(
    UUID userId,
    String email,
    String fullName,
    String phone,
    UserRole role,
    UUID departmentId,
    String departmentName,
    String specialty,
    String qualification,
    Integer experienceYears,
    boolean active
) {}
