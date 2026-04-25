package com.hospital.core.ai;

import com.hospital.shared.ai.AiAnalyzeRequest;
import com.hospital.shared.ai.AiAnalyzeResponse;
import com.hospital.shared.enums.AiComplexity;
import java.util.Locale;
import org.springframework.stereotype.Service;

@Service
public class AiAnalysisService {
  private final GeminiSymptomAnalyzerClient geminiSymptomAnalyzerClient;

  public AiAnalysisService(GeminiSymptomAnalyzerClient geminiSymptomAnalyzerClient) {
    this.geminiSymptomAnalyzerClient = geminiSymptomAnalyzerClient;
  }

  public AiAnalyzeResponse analyze(AiAnalyzeRequest request) {
    try {
      return geminiSymptomAnalyzerClient.analyzeSymptoms(request);
    } catch (RuntimeException ignored) {
      return fallbackHeuristic(request);
    }
  }

  private AiAnalyzeResponse fallbackHeuristic(AiAnalyzeRequest request) {
    var normalized = request.symptoms().toLowerCase(Locale.ROOT);

    if (normalized.contains("shortness of breath")
        || normalized.contains("chest pain")
        || normalized.contains("seizure")
        || normalized.contains("kho tho")
        || normalized.contains("dau nguc")
        || normalized.contains("co giat")) {
      return new AiAnalyzeResponse(90, AiComplexity.VERY_COMPLEX, "Escalate to a longer visit window.");
    }

    if (normalized.contains("fever")
        || normalized.contains("headache")
        || normalized.contains("vomit")
        || normalized.contains("sot")
        || normalized.contains("dau dau")
        || normalized.contains("non")) {
      return new AiAnalyzeResponse(60, AiComplexity.COMPLEX, "Requires a deeper consultation.");
    }

    if (normalized.contains("cough")
        || normalized.contains("sore throat")
        || normalized.contains("allergy")
        || normalized.contains("ho")
        || normalized.contains("dau hong")
        || normalized.contains("di ung")) {
      return new AiAnalyzeResponse(45, AiComplexity.MEDIUM, "Requires a standard consultation and intake review.");
    }

    return new AiAnalyzeResponse(30, AiComplexity.SIMPLE, "Symptoms fit a standard consultation window.");
  }
}
