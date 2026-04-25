package com.hospital.api.admin;

import com.hospital.core.admin.AdminService;
import com.hospital.shared.admin.AdminStatsResponse;
import com.hospital.shared.api.ApiResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/stats")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStatsController {
  private final AdminService adminService;

  public AdminStatsController(AdminService adminService) {
    this.adminService = adminService;
  }

  @GetMapping
  public ApiResponse<AdminStatsResponse> getStats() {
    return ApiResponse.ok(adminService.getStats());
  }
}
