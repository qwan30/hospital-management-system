package com.hospital.shared.api;

import java.time.Instant;

public record ApiResponse<T>(
    boolean success,
    T data,
    String message,
    ApiError error,
    PaginationMeta pagination,
    Instant timestamp
) {
  public static <T> ApiResponse<T> ok(T data) {
    return new ApiResponse<>(true, data, "Request completed successfully", null, null, Instant.now());
  }

  public static <T> ApiResponse<T> ok(T data, PaginationMeta pagination) {
    return new ApiResponse<>(true, data, "Request completed successfully", null, pagination, Instant.now());
  }

  public static <T> ApiResponse<T> ok(T data, String message) {
    return new ApiResponse<>(true, data, message, null, null, Instant.now());
  }

  public static <T> ApiResponse<T> fail(String code, String message) {
    return new ApiResponse<>(false, null, message, ApiError.of(code, message), null, Instant.now());
  }
}
