package com.hospital.api.admin;

import com.hospital.core.audit.AuditLogService;
import com.hospital.shared.admin.AuditLogResponse;
import com.hospital.shared.api.ApiResponse;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/audit-logs")
@PreAuthorize("@rbac.hasPermission(authentication, 'AUDIT_LOG_READ')")
public class AdminAuditLogController {
  private final AuditLogService auditLogService;

  public AdminAuditLogController(AuditLogService auditLogService) {
    this.auditLogService = auditLogService;
  }

  @GetMapping
  public ApiResponse<List<AuditLogResponse>> listAuditLogs(
      @RequestParam(required = false) String entityType,
      @RequestParam(required = false) String action,
      @RequestParam(required = false, defaultValue = "50") int limit) {
    return ApiResponse.ok(auditLogService.list(entityType, action, limit));
  }
}
