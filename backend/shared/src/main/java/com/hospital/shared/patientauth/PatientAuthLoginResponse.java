package com.hospital.shared.patientauth;

import com.hospital.shared.auth.TokenPair;
import java.util.UUID;

public record PatientAuthLoginResponse(
    UUID userId,
    String fullName,
    String role,
    TokenPair tokens
) {}
