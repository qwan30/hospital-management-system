package com.hospital.api.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "security.http")
public record SecurityHttpProperties(
    List<String> allowedOrigins,
    boolean allowCredentials,
    boolean secureCookies,
    String refreshCookieSameSite,
    int publicRateLimitPerMinute
) {}
