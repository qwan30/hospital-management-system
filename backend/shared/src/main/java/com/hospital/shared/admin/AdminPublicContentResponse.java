package com.hospital.shared.admin;

import java.time.Instant;
import java.util.UUID;

public record AdminPublicContentResponse(
    UUID contentId,
    String slug,
    String title,
    String summary,
    String body,
    String imageUrl,
    Instant publishedAt,
    boolean active
) {}
