package com.hospital.api.vitalsigns;

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
@PreAuthorize("hasAnyRole('DOCTOR','NURSE','ADMIN')")
public class VitalSignsController {
  private final VitalSignsService vitalSignsService;

  public VitalSignsController(VitalSignsService vitalSignsService) {
    this.vitalSignsService = vitalSignsService;
  }

  @PostMapping
  public ResponseEntity<ApiResponse<VitalSignsResponse>> createVitalSigns(@Valid @RequestBody VitalSignsCreateRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(vitalSignsService.createVitalSigns(request)));
  }

  @GetMapping("/{appointmentId}")
  public ApiResponse<VitalSignsResponse> getByAppointment(@PathVariable UUID appointmentId) {
    return ApiResponse.ok(vitalSignsService.getByAppointment(appointmentId));
  }

  @PutMapping("/{vitalSignId}")
  public ApiResponse<VitalSignsResponse> updateVitalSigns(@PathVariable UUID vitalSignId, @Valid @RequestBody VitalSignsUpdateRequest request) {
    return ApiResponse.ok(vitalSignsService.updateVitalSigns(vitalSignId, request));
  }

  @DeleteMapping("/{vitalSignId}")
  public ResponseEntity<Void> deleteVitalSigns(@PathVariable UUID vitalSignId) {
    vitalSignsService.deleteVitalSigns(vitalSignId);
    return ResponseEntity.noContent().build();
  }
}
