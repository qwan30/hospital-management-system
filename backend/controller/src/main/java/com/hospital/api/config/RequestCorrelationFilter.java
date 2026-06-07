package com.hospital.api.config;

import io.micrometer.core.instrument.Metrics;
import io.micrometer.tracing.Span;
import io.micrometer.tracing.Tracer;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestCorrelationFilter extends OncePerRequestFilter {
  public static final String REQUEST_ID_HEADER = "X-Request-Id";
  public static final String REQUEST_ID_ATTRIBUTE = "hms.request.id";

  private static final Logger LOGGER = LoggerFactory.getLogger(RequestCorrelationFilter.class);
  private static final Pattern SAFE_REQUEST_ID = Pattern.compile("[A-Za-z0-9._:-]{8,128}");
  private static final Pattern UUID_PATH_SEGMENT = Pattern.compile(
      "/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(?=/|$)");
  private static final Pattern LONG_NUMERIC_PATH_SEGMENT = Pattern.compile("/\\d{6,}(?=/|$)");

  private final Tracer tracer;

  public RequestCorrelationFilter(ObjectProvider<Tracer> tracerProvider) {
    this.tracer = tracerProvider.getIfAvailable();
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {
    var requestId = resolveRequestId(request.getHeader(REQUEST_ID_HEADER));
    var startedAtNanos = System.nanoTime();
    request.setAttribute(REQUEST_ID_ATTRIBUTE, requestId);
    response.setHeader(REQUEST_ID_HEADER, requestId);
    putCorrelationContext(requestId);

    try {
      filterChain.doFilter(request, response);
    } finally {
      var durationNanos = System.nanoTime() - startedAtNanos;
      recordHttpMetric(request, response, durationNanos);
      logRequestSummary(request, response, requestId, durationNanos);
      clearCorrelationContext();
    }
  }

  private String resolveRequestId(String candidate) {
    if (candidate != null && SAFE_REQUEST_ID.matcher(candidate.trim()).matches()) {
      return candidate.trim();
    }
    return UUID.randomUUID().toString();
  }

  private void putCorrelationContext(String requestId) {
    MDC.put("requestId", requestId);
    currentSpan().ifPresent(span -> {
      MDC.put("traceId", span.context().traceId());
      MDC.put("spanId", span.context().spanId());
    });
  }

  private java.util.Optional<Span> currentSpan() {
    return tracer == null ? java.util.Optional.empty() : java.util.Optional.ofNullable(tracer.currentSpan());
  }

  private void recordHttpMetric(HttpServletRequest request, HttpServletResponse response, long durationNanos) {
    Metrics.timer(
            "hms.http.server.requests",
            "method", safeMethod(request.getMethod()),
            "status", Integer.toString(response.getStatus()),
            "outcome", outcome(response.getStatus()))
        .record(durationNanos, TimeUnit.NANOSECONDS);
  }

  private void logRequestSummary(
      HttpServletRequest request,
      HttpServletResponse response,
      String requestId,
      long durationNanos) {
    LOGGER.info(
        "http_request method={} path={} status={} durationMs={} requestId={} traceId={}",
        safeMethod(request.getMethod()),
        sanitizedPath(request.getRequestURI()),
        response.getStatus(),
        Duration.ofNanos(durationNanos).toMillis(),
        requestId,
        MDC.get("traceId"));
  }

  private String safeMethod(String method) {
    return method == null || method.isBlank() ? "UNKNOWN" : method.toUpperCase(java.util.Locale.ROOT);
  }

  private String sanitizedPath(String path) {
    if (path == null || path.isBlank()) {
      return "/";
    }
    return LONG_NUMERIC_PATH_SEGMENT.matcher(UUID_PATH_SEGMENT.matcher(path).replaceAll("/{id}")).replaceAll("/{id}");
  }

  private String outcome(int status) {
    if (status >= 500) {
      return "SERVER_ERROR";
    }
    if (status >= 400) {
      return "CLIENT_ERROR";
    }
    if (status >= 300) {
      return "REDIRECTION";
    }
    return "SUCCESS";
  }

  private void clearCorrelationContext() {
    MDC.remove("requestId");
    MDC.remove("traceId");
    MDC.remove("spanId");
  }
}
