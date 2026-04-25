package com.hospital.core.shared;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "hospital.profile")
public record HospitalProfileProperties(
    String name,
    String address,
    String phone,
    String mapsEmbedUrl,
    String privacyPolicyUrl,
    String facebookUrl,
    String youtubeUrl
) {}
