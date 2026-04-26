package com.hospital.api.admin;

import com.hospital.core.content.ContentAdminService;
import com.hospital.shared.admin.AdminContentSectionUpsertRequest;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.publicsite.HospitalContentSectionResponse;
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
@RequestMapping("/api/v1/admin/content/sections")
@PreAuthorize("@rbac.hasPermission(authentication, 'ADMIN_CONTENT_MANAGE')")
public class AdminContentController {
  private final ContentAdminService contentAdminService;

  public AdminContentController(ContentAdminService contentAdminService) {
    this.contentAdminService = contentAdminService;
  }

  @GetMapping
  public ApiResponse<List<HospitalContentSectionResponse>> listSections() {
    return ApiResponse.ok(contentAdminService.listSections());
  }

  @PostMapping
  public ApiResponse<HospitalContentSectionResponse> createSection(
      @Valid @RequestBody AdminContentSectionUpsertRequest request) {
    return ApiResponse.ok(contentAdminService.createSection(request));
  }

  @PutMapping("/{sectionId}")
  public ApiResponse<HospitalContentSectionResponse> updateSection(
      @PathVariable UUID sectionId,
      @Valid @RequestBody AdminContentSectionUpsertRequest request) {
    return ApiResponse.ok(contentAdminService.updateSection(sectionId, request));
  }
}
