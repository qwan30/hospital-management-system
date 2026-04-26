package com.hospital.api.admin;

import com.hospital.core.admin.OperationsAdminService;
import com.hospital.shared.admin.SystemMonitoringSnapshotResponse;
import com.hospital.shared.api.ApiResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/monitoring")
@PreAuthorize("@rbac.hasPermission(authentication, 'ADMIN_MONITORING_READ')")
public class AdminMonitoringController {
  private final OperationsAdminService operationsAdminService;

  public AdminMonitoringController(OperationsAdminService operationsAdminService) {
    this.operationsAdminService = operationsAdminService;
  }

  @GetMapping
  public ApiResponse<SystemMonitoringSnapshotResponse> getSnapshot() {
    return ApiResponse.ok(operationsAdminService.getMonitoringSnapshot());
  }
}
