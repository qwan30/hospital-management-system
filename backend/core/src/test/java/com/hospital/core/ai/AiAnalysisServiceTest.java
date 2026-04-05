package com.hospital.core.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.hospital.shared.ai.AiAnalyzeRequest;
import com.hospital.shared.ai.AiAnalyzeResponse;
import com.hospital.shared.enums.AiComplexity;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AiAnalysisServiceTest {
  @Mock
  private GeminiSymptomAnalyzerClient geminiSymptomAnalyzerClient;

  @InjectMocks
  private AiAnalysisService aiAnalysisService;

  @Test
  void usesGeminiResponseWhenAvailable() {
    var request = new AiAnalyzeRequest("Cardiology", "Chest pain and shortness of breath");
    when(geminiSymptomAnalyzerClient.analyzeSymptoms(request))
        .thenReturn(new AiAnalyzeResponse(90, AiComplexity.VERY_COMPLEX, "Gemini response"));

    var response = aiAnalysisService.analyze(request);

    assertThat(response.durationMinutes()).isEqualTo(90);
    assertThat(response.complexity()).isEqualTo(AiComplexity.VERY_COMPLEX);
    assertThat(response.reasoning()).isEqualTo("Gemini response");
  }

  @Test
  void fallsBackToHeuristicWhenGeminiFails() {
    var request = new AiAnalyzeRequest("General", "di ung nhe");
    when(geminiSymptomAnalyzerClient.analyzeSymptoms(request))
        .thenThrow(new IllegalStateException("Gemini unavailable"));

    var response = aiAnalysisService.analyze(request);

    assertThat(response.durationMinutes()).isEqualTo(45);
    assertThat(response.complexity()).isEqualTo(AiComplexity.MEDIUM);
  }
}
