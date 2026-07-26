package com.hospital.api.lab;

import com.hospital.api.config.ClinicalAccessGuard;
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
import org.springframework.security.core.Authentication;
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
  private final ClinicalAccessGuard clinicalAccessGuard;

  public LabResultController(LabResultService labResultService, ClinicalAccessGuard clinicalAccessGuard) {
    this.labResultService = labResultService;
    this.clinicalAccessGuard = clinicalAccessGuard;
  }

  @PostMapping("/lab-results")
  @PreAuthorize("@rbac.hasPermission(authentication, 'LAB_RESULT_WRITE')")
  public ResponseEntity<ApiResponse<LabResultResponse>> createLabResult(
      @Valid @RequestBody LabResultCreateRequest request,
      Authentication authentication) {
    // Appointment id comes from the body here, but it is still caller-supplied.
    clinicalAccessGuard.requireAppointmentWrite(authentication, request.appointmentId());
    return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(labResultService.createLabResult(request)));
  }

  @GetMapping("/lab-results/{resultId}")
  @PreAuthorize("@rbac.hasPermission(authentication, 'LAB_RESULT_READ')")
  public ApiResponse<LabResultResponse> getLabResult(
      @PathVariable UUID resultId,
      Authentication authentication) {
    clinicalAccessGuard.requireLabResultRead(authentication, resultId);
    return ApiResponse.ok(labResultService.getLabResult(resultId));
  }

  @GetMapping("/appointments/{appointmentId}/lab-results")
  @PreAuthorize("@rbac.hasPermission(authentication, 'LAB_RESULT_READ')")
  public ApiResponse<List<LabResultResponse>> getLabResultsByAppointment(
      @PathVariable UUID appointmentId,
      Authentication authentication) {
    clinicalAccessGuard.requireAppointmentRead(authentication, appointmentId);
    return ApiResponse.ok(labResultService.getLabResultsByAppointment(appointmentId));
  }

  @DeleteMapping("/lab-results/{resultId}")
  @PreAuthorize("@rbac.hasPermission(authentication, 'LAB_RESULT_WRITE')")
  public ResponseEntity<Void> deleteLabResult(
      @PathVariable UUID resultId,
      Authentication authentication) {
    clinicalAccessGuard.requireLabResultWrite(authentication, resultId);
    labResultService.deleteLabResult(resultId);
    return ResponseEntity.noContent().build();
  }
}
