package com.hospital.shared.admin;

import com.hospital.shared.enums.UserRole;
import jakarta.validation.constraints.NotNull;

public record AdminUserRoleRequest(@NotNull UserRole role) {}
