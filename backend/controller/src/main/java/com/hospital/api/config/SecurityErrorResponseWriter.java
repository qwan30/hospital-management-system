package com.hospital.api.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.shared.api.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

@Component
public class SecurityErrorResponseWriter {
  public static final String DENIAL_REASON_ATTRIBUTE = "hms.security.denial.reason";
  public static final String DENIAL_CODE_ATTRIBUTE = "hms.security.denial.code";

  private final ObjectMapper objectMapper;

  public SecurityErrorResponseWriter(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  public void write(HttpServletResponse response, int status, String code, String message) throws IOException {
    write(null, response, status, code, message);
  }

  public void write(
      HttpServletRequest request,
      HttpServletResponse response,
      int status,
      String code,
      String message) throws IOException {
    if (request != null) {
      request.setAttribute(DENIAL_CODE_ATTRIBUTE, code);
      request.setAttribute(DENIAL_REASON_ATTRIBUTE, message);
    }
    response.setStatus(status);
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    objectMapper.writeValue(response.getWriter(), ApiResponse.fail(code, message));
  }
}
