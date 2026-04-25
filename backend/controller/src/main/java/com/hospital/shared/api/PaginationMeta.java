package com.hospital.shared.api;

public record PaginationMeta(
    long total,
    int page,
    int perPage,
    int totalPages
) {}
