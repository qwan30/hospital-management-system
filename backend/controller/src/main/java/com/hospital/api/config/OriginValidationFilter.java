package com.hospital.api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;
import java.util.List;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class OriginValidationFilter extends OncePerRequestFilter {
  private final SecurityHttpProperties securityHttpProperties;
  private final SecurityErrorResponseWriter securityErrorResponseWriter;

  public OriginValidationFilter(
      SecurityHttpProperties securityHttpProperties,
      SecurityErrorResponseWriter securityErrorResponseWriter) {
    this.securityHttpProperties = securityHttpProperties;
    this.securityErrorResponseWriter = securityErrorResponseWriter;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {

    // Cookie-backed auth endpoints rely on browser ambient credentials, so Origin/Referer must match CORS.
    String path = request.getRequestURI();
    if (isProtectedPath(path)) {
      String origin = request.getHeader("Origin");
      String referer = request.getHeader("Referer");

      String targetOrigin = null;
      if (origin != null && !origin.isBlank()) {
        targetOrigin = origin;
      } else if (referer != null && !referer.isBlank()) {
        try {
          URI uri = new URI(referer);
          targetOrigin = uri.getScheme() + "://" + uri.getAuthority();
        } catch (Exception e) {
          securityErrorResponseWriter.write(request, response, 403, "forbidden", "Origin or Referer not allowed");
          return;
        }
      }

      if (targetOrigin != null) {
        List<String> allowed = securityHttpProperties.allowedOrigins();
        if (allowed == null || allowed.isEmpty()) {
          allowed = List.of("http://localhost:3000", "http://localhost:4173");
        }

        boolean matched = false;
        for (String allowedOrigin : allowed) {
          if (allowedOrigin.equalsIgnoreCase(targetOrigin)) {
            matched = true;
            break;
          }
        }

        if (!matched) {
          securityErrorResponseWriter.write(request, response, 403, "forbidden", "Origin or Referer not allowed");
          return;
        }
      }
    }

    filterChain.doFilter(request, response);
  }

  private boolean isProtectedPath(String path) {
    return path.equals("/api/v1/auth/refresh")
        || path.equals("/api/v1/auth/logout")
        || path.equals("/api/v1/patient-auth/refresh")
        || path.equals("/api/v1/patient-auth/logout")
        || path.equals("/api/v1/patient-auth/claim");
  }
}
