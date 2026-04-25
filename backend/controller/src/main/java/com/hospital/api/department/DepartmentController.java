package com.hospital.api.department;

import com.hospital.core.department.DepartmentReadService;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.department.DepartmentDetailResponse;
import com.hospital.shared.department.DepartmentDetailResponse.DepartmentDoctorSummary;
import com.hospital.shared.department.DepartmentResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/departments")
@Tag(name = "Departments", description = "Public department information")
public class DepartmentController {
  private final DepartmentReadService departmentReadService;

  public DepartmentController(DepartmentReadService departmentReadService) {
    this.departmentReadService = departmentReadService;
  }

  @GetMapping
  @Operation(summary = "List all active departments")
  public ApiResponse<List<DepartmentResponse>> listDepartments() {
    return ApiResponse.ok(departmentReadService.listDepartments());
  }

  @GetMapping("/{departmentId}")
  @Operation(summary = "Get department detail including doctor list")
  public ApiResponse<DepartmentDetailResponse> getDepartment(@PathVariable UUID departmentId) {
    return ApiResponse.ok(departmentReadService.getDepartmentDetail(departmentId));
  }

  @GetMapping("/{departmentId}/doctors")
  @Operation(summary = "Get doctors belonging to a specific department")
  public ApiResponse<List<DepartmentDoctorSummary>> getDepartmentDoctors(@PathVariable UUID departmentId) {
    return ApiResponse.ok(departmentReadService.getDepartmentDetail(departmentId).doctors());
  }
}
