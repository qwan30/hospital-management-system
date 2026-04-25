package com.hospital.api.admin;

import com.hospital.core.admin.OperationsAdminService;
import com.hospital.shared.admin.SpecialClosureResponse;
import com.hospital.shared.admin.SpecialClosureUpsertRequest;
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
@RequestMapping("/api/v1/admin/special-closures")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSpecialClosureController {
  private final OperationsAdminService operationsAdminService;

  public AdminSpecialClosureController(OperationsAdminService operationsAdminService) {
    this.operationsAdminService = operationsAdminService;
  }

  @GetMapping
  public ApiResponse<List<SpecialClosureResponse>> listClosures() {
    return ApiResponse.ok(operationsAdminService.listSpecialClosures());
  }

  @PostMapping
  public ApiResponse<SpecialClosureResponse> createClosure(
      @Valid @RequestBody SpecialClosureUpsertRequest request) {
    return ApiResponse.ok(operationsAdminService.createSpecialClosure(request));
  }

  @PutMapping("/{closureId}")
  public ApiResponse<SpecialClosureResponse> updateClosure(
      @PathVariable UUID closureId,
      @Valid @RequestBody SpecialClosureUpsertRequest request) {
    return ApiResponse.ok(operationsAdminService.updateSpecialClosure(closureId, request));
  }
}
