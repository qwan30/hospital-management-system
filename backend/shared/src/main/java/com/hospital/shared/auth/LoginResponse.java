package com.hospital.shared.auth;

import com.hospital.shared.enums.UserRole;
import java.util.UUID;

public record LoginResponse(
    UUID userId,
    String fullName,
    UserRole role,
    TokenPair tokens
) {}
