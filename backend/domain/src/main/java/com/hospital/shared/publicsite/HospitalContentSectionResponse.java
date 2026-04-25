package com.hospital.shared.publicsite;

import java.util.UUID;

public record HospitalContentSectionResponse(
    UUID id,
    String slug,
    String title,
    String body,
    String imageUrl,
    String ctaLabel,
    String ctaHref,
    int sortOrder
) {}
