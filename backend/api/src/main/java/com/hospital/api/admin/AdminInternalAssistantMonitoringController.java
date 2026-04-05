package com.hospital.api.admin;

import com.hospital.core.internalassistant.InternalAssistantMetricsService;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.internalassistant.InternalAssistantMonitoringResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/monitoring/internal-assistant")
@PreAuthorize("hasRole('ADMIN')")
public class AdminInternalAssistantMonitoringController {
  private final InternalAssistantMetricsService internalAssistantMetricsService;

  public AdminInternalAssistantMonitoringController(InternalAssistantMetricsService internalAssistantMetricsService) {
    this.internalAssistantMetricsService = internalAssistantMetricsService;
  }

  @GetMapping
  public ApiResponse<InternalAssistantMonitoringResponse> getSnapshot() {
    return ApiResponse.ok(internalAssistantMetricsService.snapshot());
  }
}
