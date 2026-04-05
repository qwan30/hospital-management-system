package com.hospital.api.admin;

import com.hospital.core.admin.OperationsAdminService;
import com.hospital.shared.admin.AdminNewsArticleUpsertRequest;
import com.hospital.shared.admin.AdminPublicContentResponse;
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
@RequestMapping("/api/v1/admin/public-content")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPublicContentController {
  private final OperationsAdminService operationsAdminService;

  public AdminPublicContentController(OperationsAdminService operationsAdminService) {
    this.operationsAdminService = operationsAdminService;
  }

  @GetMapping
  public ApiResponse<List<AdminPublicContentResponse>> listContent() {
    return ApiResponse.ok(operationsAdminService.listPublicContent());
  }

  @PostMapping
  public ApiResponse<AdminPublicContentResponse> createContent(
      @Valid @RequestBody AdminNewsArticleUpsertRequest request) {
    return ApiResponse.ok(operationsAdminService.createPublicContent(request));
  }

  @PutMapping("/{contentId}")
  public ApiResponse<AdminPublicContentResponse> updateContent(
      @PathVariable UUID contentId,
      @Valid @RequestBody AdminNewsArticleUpsertRequest request) {
    return ApiResponse.ok(operationsAdminService.updatePublicContent(contentId, request));
  }
}
