package com.hospital.api.admin;

import com.hospital.core.admin.AdminService;
import com.hospital.shared.admin.AdminDepartmentDoctorRequest;
import com.hospital.shared.admin.AdminDepartmentResponse;
import com.hospital.shared.admin.AdminDepartmentUpsertRequest;
import com.hospital.shared.admin.AdminUserResponse;
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
@RequestMapping("/api/v1/admin/departments")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin – Departments", description = "Department management")
public class AdminDepartmentController {
  private final AdminService adminService;

  public AdminDepartmentController(AdminService adminService) {
    this.adminService = adminService;
  }

  @GetMapping
  @Operation(summary = "List all departments")
  public ApiResponse<List<AdminDepartmentResponse>> listDepartments() {
    return ApiResponse.ok(adminService.listDepartments());
  }

  @GetMapping("/{departmentId}")
  @Operation(summary = "Get a single department by ID")
  public ApiResponse<AdminDepartmentResponse> getDepartment(@PathVariable UUID departmentId) {
    return ApiResponse.ok(adminService.getDepartment(departmentId));
  }

  @PostMapping
  @Operation(summary = "Create a new department")
  public ResponseEntity<ApiResponse<AdminDepartmentResponse>> createDepartment(
      @Valid @RequestBody AdminDepartmentUpsertRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.ok(adminService.createDepartment(request), "Department created"));
  }

  @PutMapping("/{departmentId}")
  @Operation(summary = "Update an existing department")
  public ApiResponse<AdminDepartmentResponse> updateDepartment(
      @PathVariable UUID departmentId,
      @Valid @RequestBody AdminDepartmentUpsertRequest request) {
    return ApiResponse.ok(adminService.updateDepartment(departmentId, request), "Department updated");
  }

  @DeleteMapping("/{departmentId}")
  @Operation(summary = "Soft-delete (deactivate) a department")
  public ApiResponse<Void> deleteDepartment(@PathVariable UUID departmentId) {
    adminService.deleteDepartment(departmentId);
    return ApiResponse.ok(null, "Department deactivated");
  }

  @PostMapping("/{departmentId}/assign-doctor")
  @Operation(summary = "Assign a doctor to a department")
  public ApiResponse<AdminUserResponse> assignDoctor(
      @PathVariable UUID departmentId,
      @Valid @RequestBody AdminDepartmentDoctorRequest request) {
    return ApiResponse.ok(adminService.assignDoctorToDepartment(departmentId, request.doctorId()), "Doctor assigned");
  }

  @DeleteMapping("/{departmentId}/remove-doctor/{doctorId}")
  @Operation(summary = "Remove a doctor from a department")
  public ApiResponse<AdminUserResponse> removeDoctor(
      @PathVariable UUID departmentId,
      @PathVariable UUID doctorId) {
    return ApiResponse.ok(adminService.removeDoctorFromDepartment(departmentId, doctorId), "Doctor removed");
  }
}
