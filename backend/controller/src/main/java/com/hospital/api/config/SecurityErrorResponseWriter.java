package com.hospital.api.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.shared.api.ApiResponse;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

@Component
public class SecurityErrorResponseWriter {
  private final ObjectMapper objectMapper;

  public SecurityErrorResponseWriter(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  public void write(HttpServletResponse response, int status, String code, String message) throws IOException {
    response.setStatus(status);
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    objectMapper.writeValue(response.getWriter(), ApiResponse.fail(code, message));
  }
}
