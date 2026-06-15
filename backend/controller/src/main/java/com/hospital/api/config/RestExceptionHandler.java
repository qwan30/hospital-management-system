package com.hospital.api.config;

import com.hospital.core.common.ConflictException;
import com.hospital.core.common.NotFoundException;
import com.hospital.shared.api.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class RestExceptionHandler {
  private static final Logger LOGGER = LoggerFactory.getLogger(RestExceptionHandler.class);
  @ExceptionHandler(NotFoundException.class)
  ResponseEntity<ApiResponse<Void>> handleNotFound(NotFoundException exception) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(ApiResponse.fail("not_found", exception.getMessage()));
  }

  @ExceptionHandler(ConflictException.class)
  ResponseEntity<ApiResponse<Void>> handleConflict(ConflictException exception) {
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(ApiResponse.fail("conflict", exception.getMessage()));
  }

  @ExceptionHandler(BadCredentialsException.class)
  ResponseEntity<ApiResponse<Void>> handleUnauthorized(BadCredentialsException exception) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(ApiResponse.fail("unauthorized", exception.getMessage()));
  }

  @ExceptionHandler(IllegalArgumentException.class)
  ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException exception) {
    return ResponseEntity.badRequest()
        .body(ApiResponse.fail("validation_error", exception.getMessage()));
  }

  @ExceptionHandler(AccessDeniedException.class)
  ResponseEntity<ApiResponse<Void>> handleForbidden(AccessDeniedException exception) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(ApiResponse.fail("forbidden", exception.getMessage()));
  }

  @ExceptionHandler(AuthorizationDeniedException.class)
  ResponseEntity<ApiResponse<Void>> handleAuthorizationDenied(AuthorizationDeniedException exception) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(ApiResponse.fail("forbidden", "Access is denied"));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException exception) {
    var message = exception.getBindingResult().getFieldErrors().stream()
        .map(error -> error.getField() + ": " + error.getDefaultMessage())
        .collect(Collectors.joining(", "));

    return ResponseEntity.badRequest().body(ApiResponse.fail("validation_error", message));
  }

  @ExceptionHandler(ConstraintViolationException.class)
  ResponseEntity<ApiResponse<Void>> handleConstraintViolation(ConstraintViolationException exception) {
    return ResponseEntity.badRequest().body(ApiResponse.fail("validation_error", exception.getMessage()));
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  ResponseEntity<ApiResponse<Void>> handleMessageNotReadable(HttpMessageNotReadableException exception) {
    return ResponseEntity.badRequest().body(ApiResponse.fail("validation_error", "Malformed request body"));
  }

  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  ResponseEntity<ApiResponse<Void>> handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException exception) {
    return ResponseEntity.badRequest().body(ApiResponse.fail("validation_error", "Invalid request parameter"));
  }

  @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
  ResponseEntity<ApiResponse<Void>> handleMediaTypeNotSupported(HttpMediaTypeNotSupportedException exception) {
    return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
        .body(ApiResponse.fail("unsupported_media_type", exception.getMessage()));
  }

  @ExceptionHandler(org.springframework.web.servlet.resource.NoResourceFoundException.class)
  ResponseEntity<ApiResponse<Void>> handleNoResourceFound(org.springframework.web.servlet.resource.NoResourceFoundException exception) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(ApiResponse.fail("not_found", exception.getMessage()));
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<ApiResponse<Void>> handleGeneric(Exception exception) {
    LOGGER.error("Unhandled exception", exception);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(ApiResponse.fail("internal_error", "Internal server error"));
  }
}
