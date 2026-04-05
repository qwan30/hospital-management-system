package com.hospital.shared.internalassistant;

public record InternalAssistantModeMetricsResponse(
    InternalAssistantMode mode,
    long p95LatencyMs
) {}
