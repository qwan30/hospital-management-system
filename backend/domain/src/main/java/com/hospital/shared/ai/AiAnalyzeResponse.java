package com.hospital.shared.ai;

import com.hospital.shared.enums.AiComplexity;

public record AiAnalyzeResponse(
    int durationMinutes,
    AiComplexity complexity,
    String reasoning
) {}
