package com.hospital.shared.publicsite;

import java.time.Instant;
import java.util.UUID;

public record NewsArticleResponse(
    UUID id,
    String slug,
    String title,
    String summary,
    String content,
    String imageUrl,
    Instant publishedAt
) {}
