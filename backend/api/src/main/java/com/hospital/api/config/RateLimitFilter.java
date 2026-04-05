package com.hospital.api.config;

import com.hospital.api.auth.JwtTokenService;
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
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class RateLimitFilter extends OncePerRequestFilter {
  private static final Duration WINDOW = Duration.ofMinutes(1);
  private static final String INTERNAL_ASSISTANT_PATH = "/api/v1/internal-assistant/messages";

  private final Map<String, WindowCounter> counters = new ConcurrentHashMap<>();
  private final SecurityHttpProperties securityHttpProperties;
  private final SecurityErrorResponseWriter securityErrorResponseWriter;
  private final JwtTokenService jwtTokenService;

  public RateLimitFilter(
      SecurityHttpProperties securityHttpProperties,
      SecurityErrorResponseWriter securityErrorResponseWriter,
      JwtTokenService jwtTokenService) {
    this.securityHttpProperties = securityHttpProperties;
    this.securityErrorResponseWriter = securityErrorResponseWriter;
    this.jwtTokenService = jwtTokenService;
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    if (!"POST".equalsIgnoreCase(request.getMethod())) {
      return true;
    }

    var path = request.getRequestURI();
    return !path.equals("/api/v1/auth/login")
        && !path.equals("/api/v1/auth/refresh")
        && !path.equals("/api/v1/ai/analyze-symptoms")
        && !path.equals("/api/v1/appointments")
        && !path.equals("/api/v1/chatbot/messages")
        && !path.equals(INTERNAL_ASSISTANT_PATH);
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {
    var path = request.getRequestURI();
    var internalAssistantRequest = INTERNAL_ASSISTANT_PATH.equals(path);
    var limit = internalAssistantRequest
        ? securityHttpProperties.internalAssistantRateLimitPerMinute()
        : securityHttpProperties.publicRateLimitPerMinute();

    if (limit <= 0) {
      filterChain.doFilter(request, response);
      return;
    }

    var counterKey = internalAssistantRequest ? resolveInternalAssistantKey(request) : request.getRemoteAddr();
    var counter = counters.compute(counterKey, (key, current) -> current == null || current.isExpired()
        ? new WindowCounter(Instant.now().plus(WINDOW))
        : current);

    if (counter.incrementAndGet() > limit) {
      securityErrorResponseWriter.write(response, 429, "rate_limited", "Rate limit exceeded");
      return;
    }

    filterChain.doFilter(request, response);
  }

  private String resolveInternalAssistantKey(HttpServletRequest request) {
    var authorization = request.getHeader("Authorization");
    if (authorization != null && authorization.startsWith("Bearer ")) {
      try {
        var claims = jwtTokenService.parseClaims(authorization.substring(7));
        return "internal:" + claims.getSubject();
      } catch (RuntimeException ignored) {
        // Fall back to IP so malformed tokens are still rate-limited.
      }
    }

    return "internal-ip:" + request.getRemoteAddr();
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
