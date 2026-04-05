package com.hospital.core.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.shared.ai.AiAnalyzeRequest;
import com.hospital.shared.ai.AiAnalyzeResponse;
import com.hospital.shared.enums.AiComplexity;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class GeminiSymptomAnalyzerClient {
  private final HttpClient httpClient;
  private final ObjectMapper objectMapper;
  private final GeminiProperties properties;

  public GeminiSymptomAnalyzerClient(ObjectMapper objectMapper, GeminiProperties properties) {
    this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    this.objectMapper = objectMapper;
    this.properties = properties;
  }

  public AiAnalyzeResponse analyzeSymptoms(AiAnalyzeRequest request) {
    if (!properties.enabled() || properties.apiKey() == null || properties.apiKey().isBlank()) {
      throw new IllegalStateException("Gemini integration is not configured");
    }

    try {
      var payload = buildPayload(request);
      var httpRequest = HttpRequest.newBuilder()
          .uri(URI.create(properties.resolvedApiBaseUrl()
              + "/models/" + properties.resolvedModel()
              + ":generateContent?key=" + properties.apiKey()))
          .header("Content-Type", "application/json")
          .timeout(Duration.ofSeconds(20))
          .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload), StandardCharsets.UTF_8))
          .build();

      var response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
      if (response.statusCode() < 200 || response.statusCode() >= 300) {
        throw new IllegalStateException("Gemini request failed with status " + response.statusCode());
      }

      var text = extractText(response.body());
      return parseStructuredResult(text);
    } catch (IOException | InterruptedException exception) {
      if (exception instanceof InterruptedException) {
        Thread.currentThread().interrupt();
      }
      throw new IllegalStateException("Gemini request failed", exception);
    }
  }

  private Map<String, Object> buildPayload(AiAnalyzeRequest request) {
    var prompt = """
        You are a hospital triage assistant.
        Analyze the symptoms and return strict JSON with fields:
        durationMinutes (one of 30,45,60,90),
        complexity (one of SIMPLE,MEDIUM,COMPLEX,VERY_COMPLEX),
        reasoning (short plain-English explanation).
        Department: %s
        Symptoms: %s
        """.formatted(request.department(), request.symptoms());

    Map<String, Object> generationConfig = new LinkedHashMap<>();
    generationConfig.put("temperature", 0.2);
    generationConfig.put("responseMimeType", "application/json");

    Map<String, Object> payload = new LinkedHashMap<>();
    payload.put("contents", List.of(Map.of("role", "user", "parts", List.of(Map.of("text", prompt)))));
    payload.put("generationConfig", generationConfig);
    return payload;
  }

  private String extractText(String body) throws IOException {
    JsonNode root = objectMapper.readTree(body);
    JsonNode candidates = root.path("candidates");
    if (!candidates.isArray() || candidates.isEmpty()) {
      throw new IllegalStateException("Gemini response did not include candidates");
    }

    JsonNode parts = candidates.get(0).path("content").path("parts");
    if (!parts.isArray() || parts.isEmpty()) {
      throw new IllegalStateException("Gemini response did not include content parts");
    }

    var text = parts.get(0).path("text").asText();
    if (text == null || text.isBlank()) {
      throw new IllegalStateException("Gemini response text was empty");
    }
    return sanitizeJson(text);
  }

  private AiAnalyzeResponse parseStructuredResult(String text) throws IOException {
    JsonNode root = objectMapper.readTree(text);
    var durationMinutes = normalizeDuration(root.path("durationMinutes").asInt(30));
    var complexity = AiComplexity.valueOf(root.path("complexity").asText("SIMPLE"));
    var reasoning = root.path("reasoning").asText("Gemini triage completed successfully.");
    return new AiAnalyzeResponse(durationMinutes, complexity, reasoning);
  }

  private String sanitizeJson(String text) {
    var sanitized = text.trim();
    if (sanitized.startsWith("```")) {
      sanitized = sanitized.replaceFirst("^```json\\s*", "");
      sanitized = sanitized.replaceFirst("^```\\s*", "");
      sanitized = sanitized.replaceFirst("\\s*```$", "");
    }
    return sanitized.trim();
  }

  private int normalizeDuration(int durationMinutes) {
    if (durationMinutes <= 30) {
      return 30;
    }
    if (durationMinutes <= 45) {
      return 45;
    }
    if (durationMinutes <= 60) {
      return 60;
    }
    return 90;
  }
}
