package com.hospital.api.admin;

import com.hospital.core.admin.AdminService;
import com.hospital.shared.admin.AdminUserResponse;
import com.hospital.shared.admin.AdminUserRoleRequest;
import com.hospital.shared.admin.AdminUserStatusRequest;
import com.hospital.shared.admin.AdminUserUpsertRequest;
import com.hospital.shared.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
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
@Tag(name = "Admin – Users", description = "Staff user management")
public class AdminUserController {
  private final AdminService adminService;

  public AdminUserController(AdminService adminService) {
    this.adminService = adminService;
  }

  @GetMapping
  @Operation(summary = "List all staff users")
  public ApiResponse<List<AdminUserResponse>> listUsers() {
    return ApiResponse.ok(adminService.listUsers());
  }

  @GetMapping("/{userId}")
  @Operation(summary = "Get a single staff user by ID")
  public ApiResponse<AdminUserResponse> getUser(@PathVariable UUID userId) {
    return ApiResponse.ok(adminService.getUser(userId));
  }

  @PostMapping
  @Operation(summary = "Create a new staff user")
  public ResponseEntity<ApiResponse<AdminUserResponse>> createUser(@Valid @RequestBody AdminUserUpsertRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.ok(adminService.createUser(request), "User created"));
  }

  @PutMapping("/{userId}")
  @Operation(summary = "Update staff user details")
  public ApiResponse<AdminUserResponse> updateUser(
      @PathVariable UUID userId,
      @Valid @RequestBody AdminUserUpsertRequest request) {
    return ApiResponse.ok(adminService.updateUser(userId, request), "User updated");
  }

  @DeleteMapping("/{userId}")
  @Operation(summary = "Soft-delete (deactivate) a staff user")
  public ApiResponse<Void> deleteUser(@PathVariable UUID userId) {
    adminService.deleteUser(userId);
    return ApiResponse.ok(null, "User deactivated");
  }

  @PostMapping("/{userId}/activate")
  @Operation(summary = "Activate a previously deactivated staff account")
  public ApiResponse<AdminUserResponse> activateUser(@PathVariable UUID userId) {
    return ApiResponse.ok(adminService.activateUser(userId), "User activated");
  }

  @PostMapping("/{userId}/deactivate")
  @Operation(summary = "Deactivate a staff account without deleting it")
  public ApiResponse<AdminUserResponse> deactivateUser(@PathVariable UUID userId) {
    return ApiResponse.ok(adminService.deactivateUser(userId), "User deactivated");
  }

  @PutMapping("/{userId}/role")
  @Operation(summary = "Change the role of a staff user")
  public ApiResponse<AdminUserResponse> changeRole(
      @PathVariable UUID userId,
      @Valid @RequestBody AdminUserRoleRequest request) {
    return ApiResponse.ok(adminService.changeUserRole(userId, request.role()), "Role updated");
  }
}
