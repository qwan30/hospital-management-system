package com.hospital.api.auth;

import com.hospital.api.config.SecurityErrorResponseWriter;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
  private final JwtTokenService jwtTokenService;
  private final SecurityErrorResponseWriter securityErrorResponseWriter;

  public JwtAuthenticationFilter(
      JwtTokenService jwtTokenService,
      SecurityErrorResponseWriter securityErrorResponseWriter) {
    this.jwtTokenService = jwtTokenService;
    this.securityErrorResponseWriter = securityErrorResponseWriter;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {
    var header = request.getHeader(HttpHeaders.AUTHORIZATION);
    if (header != null && header.startsWith("Bearer ")) {
      var token = header.substring(7);
      try {
        Claims claims = jwtTokenService.parseClaims(token);
        var role = claims.get("role", String.class);
        if (role == null || role.isBlank()) {
          SecurityContextHolder.clearContext();
          securityErrorResponseWriter.write(response, 401, "unauthorized", "Bearer token is malformed");
          return;
        }

        var authentication = new UsernamePasswordAuthenticationToken(
            claims.getSubject(),
            token,
            List.of(new SimpleGrantedAuthority("ROLE_" + role)));
        SecurityContextHolder.getContext().setAuthentication(authentication);
      } catch (ExpiredJwtException exception) {
        SecurityContextHolder.clearContext();
        securityErrorResponseWriter.write(response, 401, "unauthorized", "Access token has expired");
        return;
      } catch (JwtException | IllegalArgumentException exception) {
        SecurityContextHolder.clearContext();
        securityErrorResponseWriter.write(response, 401, "unauthorized", "Bearer token is malformed");
        return;
      }
    }

    filterChain.doFilter(request, response);
  }
}
