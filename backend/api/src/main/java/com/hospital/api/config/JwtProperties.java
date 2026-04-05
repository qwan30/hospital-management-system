package com.hospital.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "security.jwt")
public record JwtProperties(
    String secret,
    long accessTokenExpirationSeconds,
    long refreshTokenExpirationSeconds,
    String refreshCookieName
) {}
