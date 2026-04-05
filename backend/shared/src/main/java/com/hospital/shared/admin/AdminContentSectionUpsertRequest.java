package com.hospital.shared.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AdminContentSectionUpsertRequest(
    @NotBlank String slug,
    @NotBlank String title,
    String body,
    String imageUrl,
    String ctaLabel,
    String ctaHref,
    @NotNull Integer sortOrder,
    Boolean active
) {}
