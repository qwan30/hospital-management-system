package com.hospital.api.admin;

import com.hospital.core.admin.OperationsAdminService;
import com.hospital.shared.admin.DoctorScheduleTemplateResponse;
import com.hospital.shared.admin.DoctorScheduleTemplateUpsertRequest;
import com.hospital.shared.api.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/schedule-templates")
@PreAuthorize("@rbac.hasPermission(authentication, 'ADMIN_SCHEDULE_MANAGE')")
public class AdminScheduleTemplateController {
  private final OperationsAdminService operationsAdminService;

  public AdminScheduleTemplateController(OperationsAdminService operationsAdminService) {
    this.operationsAdminService = operationsAdminService;
  }

  @GetMapping
  public ApiResponse<List<DoctorScheduleTemplateResponse>> listTemplates() {
    return ApiResponse.ok(operationsAdminService.listScheduleTemplates());
  }

  @PostMapping
  public ApiResponse<DoctorScheduleTemplateResponse> createTemplate(
      @Valid @RequestBody DoctorScheduleTemplateUpsertRequest request) {
    return ApiResponse.ok(operationsAdminService.createScheduleTemplate(request));
  }

  @PutMapping("/{templateId}")
  public ApiResponse<DoctorScheduleTemplateResponse> updateTemplate(
      @PathVariable UUID templateId,
      @Valid @RequestBody DoctorScheduleTemplateUpsertRequest request) {
    return ApiResponse.ok(operationsAdminService.updateScheduleTemplate(templateId, request));
  }
}
