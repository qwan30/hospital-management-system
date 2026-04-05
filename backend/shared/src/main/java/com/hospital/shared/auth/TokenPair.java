package com.hospital.shared.auth;

public record TokenPair(
    String accessToken,
    String refreshToken,
    long expiresInSeconds
) {}
