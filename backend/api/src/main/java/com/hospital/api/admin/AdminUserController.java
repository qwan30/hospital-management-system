package com.hospital.api.admin;

import com.hospital.core.admin.AdminService;
import com.hospital.shared.admin.AdminUserResponse;
import com.hospital.shared.admin.AdminUserUpsertRequest;
import com.hospital.shared.api.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {
  private final AdminService adminService;

  public AdminUserController(AdminService adminService) {
    this.adminService = adminService;
  }

  @GetMapping
  public ApiResponse<List<AdminUserResponse>> listUsers() {
    return ApiResponse.ok(adminService.listUsers());
  }

  @PostMapping
  public ResponseEntity<ApiResponse<AdminUserResponse>> createUser(@Valid @RequestBody AdminUserUpsertRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.ok(adminService.createUser(request), "User created"));
  }

  @PutMapping("/{userId}")
  public ApiResponse<AdminUserResponse> updateUser(
      @PathVariable UUID userId,
      @Valid @RequestBody AdminUserUpsertRequest request) {
    return ApiResponse.ok(adminService.updateUser(userId, request), "User updated");
  }
}
