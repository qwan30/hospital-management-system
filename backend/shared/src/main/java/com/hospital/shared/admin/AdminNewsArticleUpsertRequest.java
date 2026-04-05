package com.hospital.shared.admin;

import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

public record AdminNewsArticleUpsertRequest(
    @NotBlank String slug,
    @NotBlank String title,
    @NotBlank String summary,
    String content,
    String imageUrl,
    Instant publishedAt,
    Boolean active
) {}
