package com.hospital.core.ai;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "integration.gemini")
public record GeminiProperties(
    boolean enabled,
    String apiKey,
    String model,
    String apiBaseUrl
) {
  public String resolvedModel() {
    return model == null || model.isBlank() ? "gemini-2.0-flash" : model;
  }

  public String resolvedApiBaseUrl() {
    return apiBaseUrl == null || apiBaseUrl.isBlank()
        ? "https://generativelanguage.googleapis.com/v1beta"
        : apiBaseUrl;
  }
}
