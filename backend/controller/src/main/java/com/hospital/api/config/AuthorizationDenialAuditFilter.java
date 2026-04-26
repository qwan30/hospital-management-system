package com.hospital.api.config;

import com.hospital.core.audit.AuditLogService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class AuthorizationDenialAuditFilter extends OncePerRequestFilter {
  private static final Logger LOGGER = LoggerFactory.getLogger(AuthorizationDenialAuditFilter.class);

  private final AuditLogService auditLogService;

  public AuthorizationDenialAuditFilter(AuditLogService auditLogService) {
    this.auditLogService = auditLogService;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {
    try {
      filterChain.doFilter(request, response);
    } finally {
      recordProtectedDenial(request, response);
    }
  }

  private void recordProtectedDenial(HttpServletRequest request, HttpServletResponse response) {
    var status = response.getStatus();
    if (!isProtectedApiRequest(request) || (status != 401 && status != 403)) {
      return;
    }

    try {
      auditLogService.record(
          actorId().orElse(null),
          "SECURITY_ACCESS_DENIED",
          "PROTECTED_API",
          null,
          denialMetadata(request, status));
    } catch (RuntimeException exception) {
      LOGGER.warn("Unable to record protected API authorization denial", exception);
    }
  }

  private boolean isProtectedApiRequest(HttpServletRequest request) {
    return request.getRequestURI() != null && request.getRequestURI().startsWith("/api/v1/");
  }

  private Map<String, Object> denialMetadata(HttpServletRequest request, int status) {
    var metadata = new LinkedHashMap<String, Object>();
    metadata.put("method", request.getMethod());
    metadata.put("path", sanitizedPath(request.getRequestURI()));
    metadata.put("status", status);
    metadata.put("reason", reason(request, status));
    role().ifPresent(value -> metadata.put("role", value));
    actorId().ifPresent(value -> metadata.put("actorId", value.toString()));
    var requestId = request.getHeader("X-Request-Id");
    if (requestId != null && !requestId.isBlank()) {
      metadata.put("requestId", requestId);
    }
    return metadata;
  }

  private String sanitizedPath(String path) {
    if (path == null || path.isBlank()) {
      return "/";
    }
    return path
        .replaceAll("/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(?=/|$)", "/{id}")
        .replaceAll("/\\d{6,}(?=/|$)", "/{id}");
  }

  private String reason(HttpServletRequest request, int status) {
    var reason = request.getAttribute(SecurityErrorResponseWriter.DENIAL_REASON_ATTRIBUTE);
    if (reason instanceof String value && !value.isBlank()) {
      return value;
    }
    return status == 401 ? "Authentication is required" : "Access is denied";
  }

  private java.util.Optional<UUID> actorId() {
    var authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || authentication.getName() == null) {
      return java.util.Optional.empty();
    }
    try {
      return java.util.Optional.of(UUID.fromString(authentication.getName()));
    } catch (IllegalArgumentException exception) {
      return java.util.Optional.empty();
    }
  }

  private java.util.Optional<String> role() {
    var authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null) {
      return java.util.Optional.empty();
    }
    return authentication.getAuthorities().stream()
        .map(authority -> authority.getAuthority().replaceFirst("^ROLE_", ""))
        .filter(value -> !value.equalsIgnoreCase("ANONYMOUS"))
        .findFirst();
  }
}
