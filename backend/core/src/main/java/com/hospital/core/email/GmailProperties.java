package com.hospital.core.email;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "integration.gmail")
public record GmailProperties(
    boolean enabled,
    String clientId,
    String clientSecret,
    String refreshToken,
    String senderEmail,
    String tokenUrl,
    String apiBaseUrl
) {
  public String resolvedTokenUrl() {
    return tokenUrl == null || tokenUrl.isBlank()
        ? "https://oauth2.googleapis.com/token"
        : tokenUrl;
  }

  public String resolvedApiBaseUrl() {
    return apiBaseUrl == null || apiBaseUrl.isBlank()
        ? "https://gmail.googleapis.com"
        : apiBaseUrl;
  }
}
