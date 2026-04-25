package com.hospital.api.config;

import com.hospital.api.auth.JwtAuthenticationFilter;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
  private final JwtAuthenticationFilter jwtAuthenticationFilter;
  private final RateLimitFilter rateLimitFilter;
  private final SecurityErrorResponseWriter securityErrorResponseWriter;
  private final SecurityHttpProperties securityHttpProperties;

  public SecurityConfig(
      JwtAuthenticationFilter jwtAuthenticationFilter,
      RateLimitFilter rateLimitFilter,
      SecurityErrorResponseWriter securityErrorResponseWriter,
      SecurityHttpProperties securityHttpProperties) {
    this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    this.rateLimitFilter = rateLimitFilter;
    this.securityErrorResponseWriter = securityErrorResponseWriter;
    this.securityHttpProperties = securityHttpProperties;
  }

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .cors(Customizer.withDefaults())
        .csrf(csrf -> csrf.disable())
        .headers(headers -> headers
            .contentSecurityPolicy(csp -> csp.policyDirectives(
                "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; "
                    + "script-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'"))
            .referrerPolicy(referrer -> referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER))
            .frameOptions(frameOptions -> frameOptions.sameOrigin()))
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .exceptionHandling(handling -> handling
            .authenticationEntryPoint((request, response, authException) ->
                securityErrorResponseWriter.write(response, 401, "unauthorized", "Authentication is required"))
            .accessDeniedHandler((request, response, accessDeniedException) ->
                securityErrorResponseWriter.write(response, 403, "forbidden", "Access is denied")))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/actuator/health", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
            .requestMatchers("/api/v1/auth/**").permitAll()
            .requestMatchers("/api/v1/patient-auth/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/v1/departments/**", "/api/v1/doctors/**", "/api/v1/content/**", "/api/v1/news").permitAll()
            .requestMatchers(HttpMethod.POST, "/api/v1/ai/analyze-symptoms", "/api/v1/appointments", "/api/v1/chatbot/messages").permitAll()
            .anyRequest().authenticated())
        .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
        .addFilterAfter(jwtAuthenticationFilter, RateLimitFilter.class);

    return http.build();
  }

  @Bean
  CorsConfigurationSource corsConfigurationSource() {
    var configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(securityHttpProperties.allowedOrigins() == null
        ? List.of("http://localhost:3000", "http://localhost:4173")
        : securityHttpProperties.allowedOrigins());
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Origin"));
    configuration.setExposedHeaders(List.of("Set-Cookie"));
    configuration.setAllowCredentials(securityHttpProperties.allowCredentials());
    configuration.setMaxAge(3600L);
    var source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
    return configuration.getAuthenticationManager();
  }
}
