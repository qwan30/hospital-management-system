package com.hospital.api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import io.micrometer.core.instrument.Metrics;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class RateLimitFilter extends OncePerRequestFilter {
  private static final Duration WINDOW = Duration.ofMinutes(1);

  private final Map<String, WindowCounter> counters = new ConcurrentHashMap<>();
  private final SecurityHttpProperties securityHttpProperties;
  private final SecurityErrorResponseWriter securityErrorResponseWriter;

  public RateLimitFilter(
      SecurityHttpProperties securityHttpProperties,
      SecurityErrorResponseWriter securityErrorResponseWriter) {
    this.securityHttpProperties = securityHttpProperties;
    this.securityErrorResponseWriter = securityErrorResponseWriter;
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    if (!"POST".equalsIgnoreCase(request.getMethod())) {
      return true;
    }

    var path = request.getRequestURI();
    return !path.equals("/api/v1/auth/login")
        && !path.equals("/api/v1/auth/refresh")
        && !path.equals("/api/v1/appointments")
        && !path.equals("/api/v1/chatbot/messages");
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {
    var limit = securityHttpProperties.publicRateLimitPerMinute();

    if (limit <= 0) {
      filterChain.doFilter(request, response);
      return;
    }

    var counterKey = request.getRemoteAddr();
    var counter = counters.compute(counterKey, (key, current) -> current == null || current.isExpired()
        ? new WindowCounter(Instant.now().plus(WINDOW))
        : current);

    if (counter.incrementAndGet() > limit) {
      Metrics.counter(
              "hms.security.rate_limit.rejections",
              "endpoint", "public_api",
              "status", "429")
          .increment();
      securityErrorResponseWriter.write(response, 429, "rate_limited", "Rate limit exceeded");
      return;
    }

    filterChain.doFilter(request, response);
  }

  private static final class WindowCounter {
    private final Instant expiresAt;
    private final AtomicInteger count;

    private WindowCounter(Instant expiresAt) {
      this.expiresAt = expiresAt;
      this.count = new AtomicInteger();
    }

    private boolean isExpired() {
      return Instant.now().isAfter(expiresAt);
    }

    private int incrementAndGet() {
      return count.incrementAndGet();
    }
  }
}
