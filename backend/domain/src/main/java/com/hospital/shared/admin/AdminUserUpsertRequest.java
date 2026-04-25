package com.hospital.shared.admin;

import com.hospital.shared.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record AdminUserUpsertRequest(
    @NotBlank @Email String email,
    @Size(min = 8, max = 100) String password,
    @NotBlank String fullName,
    String phone,
    @NotNull UserRole role,
    UUID departmentId,
    String specialty,
    String qualification,
    Integer experienceYears,
    Boolean active
) {}
