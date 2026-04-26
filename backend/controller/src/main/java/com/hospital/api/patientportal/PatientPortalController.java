package com.hospital.api.patientportal;

import com.hospital.core.patientportal.PatientPortalService;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.patientportal.PatientPortalAppointmentResponse;
import com.hospital.shared.patientportal.PatientPortalLabResultResponse;
import com.hospital.shared.patientportal.PatientPortalMessageThreadResponse;
import com.hospital.shared.patientportal.PatientPortalOverviewResponse;
import com.hospital.shared.patientportal.PatientPortalProfileResponse;
import com.hospital.shared.patientportal.PatientPortalProfileUpdateRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/patient-portal")
public class PatientPortalController {
  private final PatientPortalService patientPortalService;

  public PatientPortalController(PatientPortalService patientPortalService) {
    this.patientPortalService = patientPortalService;
  }

  @GetMapping("/overview")
  @PreAuthorize("@rbac.hasPermission(authentication, 'PATIENT_PORTAL_READ')")
  public ApiResponse<PatientPortalOverviewResponse> getOverview(Authentication authentication) {
    return ApiResponse.ok(patientPortalService.getOverview(patientId(authentication)));
  }

  @GetMapping("/appointments")
  @PreAuthorize("@rbac.hasPermission(authentication, 'PATIENT_PORTAL_READ')")
  public ApiResponse<List<PatientPortalAppointmentResponse>> listAppointments(Authentication authentication) {
    return ApiResponse.ok(patientPortalService.listAppointments(patientId(authentication)));
  }

  @GetMapping("/lab-results")
  @PreAuthorize("@rbac.hasPermission(authentication, 'PATIENT_PORTAL_READ')")
  public ApiResponse<List<PatientPortalLabResultResponse>> listLabResults(Authentication authentication) {
    return ApiResponse.ok(patientPortalService.listLabResults(patientId(authentication)));
  }

  @GetMapping("/messages")
  @PreAuthorize("@rbac.hasPermission(authentication, 'PATIENT_PORTAL_READ')")
  public ApiResponse<List<PatientPortalMessageThreadResponse>> listMessages(Authentication authentication) {
    return ApiResponse.ok(patientPortalService.listMessages(patientId(authentication)));
  }

  @GetMapping("/profile")
  @PreAuthorize("@rbac.hasPermission(authentication, 'PATIENT_PORTAL_READ')")
  public ApiResponse<PatientPortalProfileResponse> getProfile(Authentication authentication) {
    return ApiResponse.ok(patientPortalService.getProfile(patientId(authentication)));
  }

  @PutMapping("/profile")
  @PreAuthorize("@rbac.hasPermission(authentication, 'PATIENT_PORTAL_WRITE')")
  public ApiResponse<PatientPortalProfileResponse> updateProfile(
      Authentication authentication,
      @Valid @RequestBody PatientPortalProfileUpdateRequest request) {
    return ApiResponse.ok(patientPortalService.updateProfile(patientId(authentication), request));
  }

  private UUID patientId(Authentication authentication) {
    return UUID.fromString(authentication.getName());
  }
}
