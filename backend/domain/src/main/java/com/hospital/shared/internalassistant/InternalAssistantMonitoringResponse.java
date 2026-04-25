package com.hospital.shared.internalassistant;

import java.time.Instant;
import java.util.List;

public record InternalAssistantMonitoringResponse(
    Instant generatedAt,
    List<InternalAssistantModeMetricsResponse> modeMetrics,
    double refusalRate,
    long authFailureCount,
    double feedbackHelpfulRate,
    List<String> topCitedDocuments
) {}
