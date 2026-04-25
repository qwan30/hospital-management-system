package com.hospital.api.ai;

import com.hospital.core.ai.AiAnalysisService;
import com.hospital.shared.ai.AiAnalyzeRequest;
import com.hospital.shared.ai.AiAnalyzeResponse;
import com.hospital.shared.api.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai")
public class AiController {
  private final AiAnalysisService aiAnalysisService;

  public AiController(AiAnalysisService aiAnalysisService) {
    this.aiAnalysisService = aiAnalysisService;
  }

  @PostMapping("/analyze-symptoms")
  public ApiResponse<AiAnalyzeResponse> analyzeSymptoms(@Valid @RequestBody AiAnalyzeRequest request) {
    return ApiResponse.ok(aiAnalysisService.analyze(request));
  }
}
