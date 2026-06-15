package com.hospital.api.config;

import static org.assertj.core.api.Assertions.assertThat;

import com.hospital.core.common.ConflictException;
import com.hospital.core.common.NotFoundException;
import com.hospital.shared.api.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

class RestExceptionHandlerTest {

  private RestExceptionHandler handler;

  @BeforeEach
  void setUp() {
    handler = new RestExceptionHandler();
  }

  @Nested
  class NotFoundHandling {
    @Test
    void returns404WithErrorEnvelope() {
      var response = handler.handleNotFound(new NotFoundException("Resource not found"));

      assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
      assertThat(response.getBody()).isNotNull();
      assertThat(response.getBody().success()).isFalse();
      assertThat(response.getBody().error().code()).isEqualTo("not_found");
      assertThat(response.getBody().error().message()).isEqualTo("Resource not found");
    }

    @Test
    void returns404ForNoResourceFoundException() {
      var ex = new org.springframework.web.servlet.resource.NoResourceFoundException(
          org.springframework.http.HttpMethod.GET, "/api/v1/nonexistent");
      var response = handler.handleNoResourceFound(ex);

      assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
      assertThat(response.getBody().error().code()).isEqualTo("not_found");
    }
  }

  @Nested
  class ConflictHandling {
    @Test
    void returns409WithErrorEnvelope() {
      var response = handler.handleConflict(new ConflictException("Duplicate resource"));

      assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
      assertThat(response.getBody().error().code()).isEqualTo("conflict");
    }
  }

  @Nested
  class UnauthorizedHandling {
    @Test
    void returns401ForBadCredentials() {
      var response = handler.handleUnauthorized(new BadCredentialsException("Invalid credentials"));

      assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
      assertThat(response.getBody().error().code()).isEqualTo("unauthorized");
    }
  }

  @Nested
  class ForbiddenHandling {
    @Test
    void returns403ForAccessDenied() {
      var response = handler.handleForbidden(new AccessDeniedException("Access denied"));

      assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
      assertThat(response.getBody().error().code()).isEqualTo("forbidden");
    }
  }

  @Nested
  class ValidationHandling {
    @Test
    void returns400ForIllegalArgument() {
      var response = handler.handleIllegalArgument(new IllegalArgumentException("Invalid parameter"));

      assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
      assertThat(response.getBody().error().code()).isEqualTo("validation_error");
    }

    @Test
    void returns400ForMalformedRequestBody() {
      var response = handler.handleMessageNotReadable(
          new HttpMessageNotReadableException("Malformed", new org.springframework.http.HttpInputMessage() {
            public org.springframework.http.HttpHeaders getHeaders() { return org.springframework.http.HttpHeaders.EMPTY; }
            public java.io.InputStream getBody() { return java.io.InputStream.nullInputStream(); }
          }));

      assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
      assertThat(response.getBody().error().code()).isEqualTo("validation_error");
      assertThat(response.getBody().error().message()).isEqualTo("Malformed request body");
    }

    @Test
    void returns400ForTypeMismatch() {
      var response = handler.handleMethodArgumentTypeMismatch(
          new MethodArgumentTypeMismatchException("abc", java.util.UUID.class, "id", null, null));

      assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
      assertThat(response.getBody().error().code()).isEqualTo("validation_error");
    }
  }

  @Nested
  class MediaTypeHandling {
    @Test
    void returns415ForUnsupportedMediaType() {
      var response = handler.handleMediaTypeNotSupported(
          new HttpMediaTypeNotSupportedException("text/plain"));

      assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
      assertThat(response.getBody().error().code()).isEqualTo("unsupported_media_type");
    }
  }

  @Nested
  class GenericErrorHandling {
    @Test
    void returns500ForUnhandledExceptions() {
      var response = handler.handleGeneric(new RuntimeException("Unexpected error"));

      assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
      assertThat(response.getBody().error().code()).isEqualTo("internal_error");
      assertThat(response.getBody().error().message()).isEqualTo("Internal server error");
    }

    @Test
    void genericErrorNeverLeaksInternalDetails() {
      var response = handler.handleGeneric(new NullPointerException("secret database password"));

      assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
      assertThat(response.getBody().error().message()).isEqualTo("Internal server error");
      assertThat(response.getBody().error().message()).doesNotContain("secret");
      assertThat(response.getBody().error().message()).doesNotContain("password");
    }
  }
}
