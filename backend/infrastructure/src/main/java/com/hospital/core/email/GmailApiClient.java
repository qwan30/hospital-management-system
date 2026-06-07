package com.hospital.core.email;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.mail.Message;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import jakarta.mail.util.ByteArrayDataSource;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.Properties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class GmailApiClient {
  private static final Logger LOGGER = LoggerFactory.getLogger(GmailApiClient.class);

  private final HttpClient httpClient;
  private final ObjectMapper objectMapper;
  private final GmailProperties properties;

  public GmailApiClient(ObjectMapper objectMapper, GmailProperties properties) {
    this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    this.objectMapper = objectMapper;
    this.properties = properties;
  }

  public boolean sendHtmlEmail(
      String recipient,
      String subject,
      String htmlBody,
      byte[] attachmentBytes,
      String attachmentFileName,
      String attachmentMimeType) {
    if (!isConfigured()) {
      LOGGER.warn("gmail_send_skipped reason=not_configured");
      return false;
    }

    try {
      var accessToken = fetchAccessToken();
      var rawMessage = buildRawMessage(recipient, subject, htmlBody, attachmentBytes, attachmentFileName, attachmentMimeType);
      var request = HttpRequest.newBuilder()
          .uri(URI.create(properties.resolvedApiBaseUrl() + "/gmail/v1/users/me/messages/send"))
          .header("Authorization", "Bearer " + accessToken)
          .header("Content-Type", "application/json")
          .timeout(Duration.ofSeconds(20))
          .POST(HttpRequest.BodyPublishers.ofString(
              objectMapper.writeValueAsString(java.util.Map.of("raw", rawMessage)),
              StandardCharsets.UTF_8))
          .build();

      var response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
      if (response.statusCode() < 200 || response.statusCode() >= 300) {
        throw new IllegalStateException("Gmail API returned status " + response.statusCode());
      }
      return true;
    } catch (Exception exception) {
      LOGGER.warn("gmail_send_failed", exception);
      return false;
    }
  }

  public boolean isReadyForExternalDelivery() {
    return isConfigured();
  }

  private boolean isConfigured() {
    return properties.enabled()
        && isPresent(properties.clientId())
        && isPresent(properties.clientSecret())
        && isPresent(properties.refreshToken())
        && isPresent(properties.senderEmail());
  }

  private String fetchAccessToken() throws IOException, InterruptedException {
    var body = "client_id=" + encode(properties.clientId())
        + "&client_secret=" + encode(properties.clientSecret())
        + "&refresh_token=" + encode(properties.refreshToken())
        + "&grant_type=refresh_token";

    var request = HttpRequest.newBuilder()
        .uri(URI.create(properties.resolvedTokenUrl()))
        .header("Content-Type", "application/x-www-form-urlencoded")
        .timeout(Duration.ofSeconds(20))
        .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
        .build();

    var response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
    if (response.statusCode() < 200 || response.statusCode() >= 300) {
      throw new IllegalStateException("OAuth token request failed with status " + response.statusCode());
    }

    JsonNode root = objectMapper.readTree(response.body());
    var accessToken = root.path("access_token").asText();
    if (accessToken == null || accessToken.isBlank()) {
      throw new IllegalStateException("OAuth token response did not include access_token");
    }
    return accessToken;
  }

  private String buildRawMessage(
      String recipient,
      String subject,
      String htmlBody,
      byte[] attachmentBytes,
      String attachmentFileName,
      String attachmentMimeType) throws Exception {
    var session = Session.getInstance(new Properties());
    var message = new MimeMessage(session);
    message.setFrom(new InternetAddress(properties.senderEmail()));
    message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(recipient));
    message.setSubject(subject, StandardCharsets.UTF_8.name());

    var bodyPart = new MimeBodyPart();
    bodyPart.setContent(htmlBody, "text/html; charset=UTF-8");

    var multipart = new MimeMultipart("mixed");
    multipart.addBodyPart(bodyPart);

    if (attachmentBytes != null && attachmentBytes.length > 0 && attachmentFileName != null && !attachmentFileName.isBlank()) {
      var attachmentPart = new MimeBodyPart();
      attachmentPart.setFileName(attachmentFileName);
      attachmentPart.setDataHandler(new jakarta.activation.DataHandler(
          new ByteArrayDataSource(attachmentBytes, attachmentMimeType == null || attachmentMimeType.isBlank()
              ? "application/octet-stream"
              : attachmentMimeType)));
      multipart.addBodyPart(attachmentPart);
    }

    message.setContent(multipart);
    message.saveChanges();

    try (var output = new ByteArrayOutputStream()) {
      message.writeTo(output);
      return Base64.getUrlEncoder().withoutPadding().encodeToString(output.toByteArray());
    }
  }

  private String encode(String value) {
    return URLEncoder.encode(value, StandardCharsets.UTF_8);
  }

  private boolean isPresent(String value) {
    return value != null && !value.isBlank();
  }
}
