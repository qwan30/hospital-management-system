package com.hospital.api.department;

import com.hospital.core.department.DepartmentReadService;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.department.DepartmentResponse;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/departments")
public class DepartmentController {
  private final DepartmentReadService departmentReadService;

  public DepartmentController(DepartmentReadService departmentReadService) {
    this.departmentReadService = departmentReadService;
  }

  @GetMapping
  public ApiResponse<List<DepartmentResponse>> listDepartments() {
    return ApiResponse.ok(departmentReadService.listDepartments());
  }
}
