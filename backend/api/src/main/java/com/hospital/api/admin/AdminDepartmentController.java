package com.hospital.api.admin;

import com.hospital.core.admin.AdminService;
import com.hospital.shared.admin.AdminDepartmentResponse;
import com.hospital.shared.admin.AdminDepartmentUpsertRequest;
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
@RequestMapping("/api/v1/admin/departments")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDepartmentController {
  private final AdminService adminService;

  public AdminDepartmentController(AdminService adminService) {
    this.adminService = adminService;
  }

  @GetMapping
  public ApiResponse<List<AdminDepartmentResponse>> listDepartments() {
    return ApiResponse.ok(adminService.listDepartments());
  }

  @PostMapping
  public ResponseEntity<ApiResponse<AdminDepartmentResponse>> createDepartment(
      @Valid @RequestBody AdminDepartmentUpsertRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.ok(adminService.createDepartment(request), "Department created"));
  }

  @PutMapping("/{departmentId}")
  public ApiResponse<AdminDepartmentResponse> updateDepartment(
      @PathVariable UUID departmentId,
      @Valid @RequestBody AdminDepartmentUpsertRequest request) {
    return ApiResponse.ok(adminService.updateDepartment(departmentId, request), "Department updated");
  }
}
