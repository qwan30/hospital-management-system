package com.hospital.api.vitalsigns;

import com.hospital.api.config.ClinicalAccessGuard;
import com.hospital.core.vitalsigns.VitalSignsService;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.vitalsigns.VitalSignsCreateRequest;
import com.hospital.shared.vitalsigns.VitalSignsResponse;
import com.hospital.shared.vitalsigns.VitalSignsUpdateRequest;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/vital-signs")
public class VitalSignsController {
  private final VitalSignsService vitalSignsService;
  private final ClinicalAccessGuard clinicalAccessGuard;

  public VitalSignsController(VitalSignsService vitalSignsService, ClinicalAccessGuard clinicalAccessGuard) {
    this.vitalSignsService = vitalSignsService;
    this.clinicalAccessGuard = clinicalAccessGuard;
  }

  @PostMapping
  @PreAuthorize("@rbac.hasPermission(authentication, 'VITAL_SIGNS_WRITE')")
  public ResponseEntity<ApiResponse<VitalSignsResponse>> createVitalSigns(
      @Valid @RequestBody VitalSignsCreateRequest request,
      Authentication authentication) {
    // The appointment arrives in the body rather than the path, but it is still caller-supplied.
    clinicalAccessGuard.requireAppointmentWrite(authentication, request.appointmentId());
    return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(vitalSignsService.createVitalSigns(request)));
  }

  @GetMapping("/{appointmentId}")
  @PreAuthorize("@rbac.hasPermission(authentication, 'VITAL_SIGNS_READ')")
  public ApiResponse<VitalSignsResponse> getByAppointment(
      @PathVariable UUID appointmentId,
      Authentication authentication) {
    clinicalAccessGuard.requireAppointmentRead(authentication, appointmentId);
    return ApiResponse.ok(vitalSignsService.getByAppointment(appointmentId));
  }

  @PutMapping("/{vitalSignId}")
  @PreAuthorize("@rbac.hasPermission(authentication, 'VITAL_SIGNS_WRITE')")
  public ApiResponse<VitalSignsResponse> updateVitalSigns(
      @PathVariable UUID vitalSignId,
      @Valid @RequestBody VitalSignsUpdateRequest request,
      Authentication authentication) {
    // Keyed by vital-sign id, not appointment id, so the patient is two hops away.
    clinicalAccessGuard.requireVitalSignWrite(authentication, vitalSignId);
    return ApiResponse.ok(vitalSignsService.updateVitalSigns(vitalSignId, request));
  }

  @DeleteMapping("/{vitalSignId}")
  @PreAuthorize("@rbac.hasPermission(authentication, 'VITAL_SIGNS_WRITE')")
  public ResponseEntity<Void> deleteVitalSigns(
      @PathVariable UUID vitalSignId,
      Authentication authentication) {
    clinicalAccessGuard.requireVitalSignWrite(authentication, vitalSignId);
    vitalSignsService.deleteVitalSigns(vitalSignId);
    return ResponseEntity.noContent().build();
  }
}
