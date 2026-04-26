package com.hospital.api.lab;

import com.hospital.core.lab.LabResultService;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.lab.LabResultCreateRequest;
import com.hospital.shared.lab.LabResultResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class LabResultController {
  private final LabResultService labResultService;

  public LabResultController(LabResultService labResultService) {
    this.labResultService = labResultService;
  }

  @PostMapping("/lab-results")
  @PreAuthorize("@rbac.hasPermission(authentication, 'LAB_RESULT_WRITE')")
  public ResponseEntity<ApiResponse<LabResultResponse>> createLabResult(@Valid @RequestBody LabResultCreateRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(labResultService.createLabResult(request)));
  }

  @GetMapping("/lab-results/{resultId}")
  @PreAuthorize("@rbac.hasPermission(authentication, 'LAB_RESULT_READ')")
  public ApiResponse<LabResultResponse> getLabResult(@PathVariable UUID resultId) {
    return ApiResponse.ok(labResultService.getLabResult(resultId));
  }

  @GetMapping("/appointments/{appointmentId}/lab-results")
  @PreAuthorize("@rbac.hasPermission(authentication, 'LAB_RESULT_READ')")
  public ApiResponse<List<LabResultResponse>> getLabResultsByAppointment(@PathVariable UUID appointmentId) {
    return ApiResponse.ok(labResultService.getLabResultsByAppointment(appointmentId));
  }

  @DeleteMapping("/lab-results/{resultId}")
  @PreAuthorize("@rbac.hasPermission(authentication, 'LAB_RESULT_WRITE')")
  public ResponseEntity<Void> deleteLabResult(@PathVariable UUID resultId) {
    labResultService.deleteLabResult(resultId);
    return ResponseEntity.noContent().build();
  }
}
