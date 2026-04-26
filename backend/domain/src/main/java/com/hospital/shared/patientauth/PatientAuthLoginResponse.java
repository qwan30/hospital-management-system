package com.hospital.shared.patientauth;

import com.hospital.shared.auth.TokenPair;
import com.hospital.shared.enums.UserRole;
import java.util.UUID;

public record PatientAuthLoginResponse(
    UUID userId,
    String fullName,
    UserRole role,
    TokenPair tokens
) {}
