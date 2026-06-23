package com.hospital.api.config;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class OriginValidationFilterTest {

  private final OriginValidationFilter filter = new OriginValidationFilter(
      new SecurityHttpProperties(
          List.of("https://app.hospital.test"),
          true,
          true,
          "Strict",
          30,
          false),
      new SecurityErrorResponseWriter(new ObjectMapper().findAndRegisterModules()));

  @Test
  void protectedCookieEndpoint_rejectsUntrustedOrigin() throws Exception {
    var request = request("/api/v1/auth/refresh");
    request.addHeader("Origin", "https://evil.test");
    var response = new MockHttpServletResponse();
    var chain = new MockFilterChain();

    filter.doFilter(request, response, chain);

    assertThat(response.getStatus()).isEqualTo(403);
    assertThat(response.getContentAsString()).contains("Origin or Referer not allowed");
  }

  @Test
  void protectedCookieEndpoint_allowsConfiguredOrigin() throws Exception {
    var request = request("/api/v1/auth/logout");
    request.addHeader("Origin", "https://app.hospital.test");
    var response = new MockHttpServletResponse();
    var chain = new MockFilterChain();

    filter.doFilter(request, response, chain);

    assertThat(response.getStatus()).isEqualTo(200);
  }

  @Test
  void protectedCookieEndpoint_rejectsMalformedReferer() throws Exception {
    var request = request("/api/v1/patient-auth/claim");
    request.addHeader("Referer", "http://[bad-host");
    var response = new MockHttpServletResponse();
    var chain = new MockFilterChain();

    filter.doFilter(request, response, chain);

    assertThat(response.getStatus()).isEqualTo(403);
  }

  @Test
  void nonProtectedEndpoint_skipsOriginCheck() throws Exception {
    var request = request("/api/v1/departments");
    request.addHeader("Origin", "https://evil.test");
    var response = new MockHttpServletResponse();
    var chain = new MockFilterChain();

    filter.doFilter(request, response, chain);

    assertThat(response.getStatus()).isEqualTo(200);
  }

  private MockHttpServletRequest request(String path) {
    var request = new MockHttpServletRequest("POST", path);
    request.setRequestURI(path);
    return request;
  }
}
