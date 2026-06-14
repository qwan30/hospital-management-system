package com.hospital.api.appointment;

import com.hospital.core.appointment.AppointmentWorkflowService;
import com.hospital.core.appointment.CreateAppointmentUseCase;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.api.PaginationMeta;
import com.hospital.shared.appointment.AppointmentDetailResponse;
import com.hospital.shared.appointment.AppointmentCheckInRequest;
import com.hospital.shared.appointment.AppointmentListResponse;
import com.hospital.shared.appointment.AppointmentStatusUpdateRequest;
import com.hospital.shared.appointment.AppointmentUpdateRequest;
import com.hospital.shared.appointment.AppointmentVitalSignsRequest;
import com.hospital.shared.appointment.AppointmentVitalSignsResponse;
import com.hospital.shared.appointment.ClinicalAppointmentResponse;
import com.hospital.shared.appointment.FollowUpRequest;
import com.hospital.shared.appointment.FollowUpResponse;
import com.hospital.shared.booking.AppointmentCreateRequest;
import com.hospital.shared.booking.AppointmentResponse;
import com.hospital.shared.enums.AppointmentStatus;
import com.hospital.shared.enums.UserRole;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/v1/appointments")
public class AppointmentController {
  private final CreateAppointmentUseCase createAppointmentUseCase;
  private final AppointmentWorkflowService appointmentWorkflowService;

  public AppointmentController(
      CreateAppointmentUseCase createAppointmentUseCase,
      AppointmentWorkflowService appointmentWorkflowService) {
    this.createAppointmentUseCase = createAppointmentUseCase;
    this.appointmentWorkflowService = appointmentWorkflowService;
  }

  @PostMapping
  public ResponseEntity<ApiResponse<AppointmentResponse>> createAppointment(
      @Valid @RequestBody AppointmentCreateRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.ok(createAppointmentUseCase.createAppointment(request)));
  }

  @GetMapping
  @PreAuthorize("@rbac.hasPermission(authentication, 'APPOINTMENT_READ')")
  public ApiResponse<List<AppointmentListResponse>> listAppointments(
      @RequestParam(required = false) AppointmentStatus status,
      @RequestParam(required = false) UUID doctorId,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      Authentication authentication) {
    // Doctors see only their own appointments by default
    var resolvedDoctorId = doctorId;
    if (resolvedDoctorId == null && authentication.getAuthorities().stream()
        .anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"))) {
      resolvedDoctorId = UUID.fromString(authentication.getName());
    }
    var result = appointmentWorkflowService.listAppointments(status, resolvedDoctorId, date, page, size);
    var pagination = new PaginationMeta(result.getTotalElements(), page, size, result.getTotalPages());
    return ApiResponse.ok(result.getContent(), pagination);
  }

  @GetMapping("/today")
  @PreAuthorize("@rbac.hasPermission(authentication, 'QUEUE_READ')")
  public ApiResponse<List<ClinicalAppointmentResponse>> listTodayAppointments(
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
    return ApiResponse.ok(appointmentWorkflowService.listAppointmentsForDate(date == null ? LocalDate.now() : date));
  }

  @GetMapping("/{appointmentId}")
  @PreAuthorize("@rbac.hasPermission(authentication, 'APPOINTMENT_READ')")
  public ApiResponse<AppointmentDetailResponse> getAppointmentDetail(
      @PathVariable UUID appointmentId,
      Authentication authentication) {
    return ApiResponse.ok(appointmentWorkflowService.getAppointmentDetail(
        UUID.fromString(authentication.getName()),
        role(authentication),
        appointmentId));
  }

  @DeleteMapping("/{appointmentId}")
  @PreAuthorize("@rbac.hasPermission(authentication, 'APPOINTMENT_CANCEL')")
  public ResponseEntity<ApiResponse<Void>> cancelAppointment(@PathVariable UUID appointmentId) {
    appointmentWorkflowService.cancelAppointment(appointmentId);
    return ResponseEntity.ok(ApiResponse.ok(null, "Appointment cancelled"));
  }

  @PutMapping("/{appointmentId}")
  @PreAuthorize("@rbac.hasPermission(authentication, 'APPOINTMENT_WRITE')")
  public ApiResponse<ClinicalAppointmentResponse> updateAppointment(
      @PathVariable UUID appointmentId,
      @Valid @RequestBody AppointmentUpdateRequest request) {
    return ApiResponse.ok(appointmentWorkflowService.updateAppointmentMeta(appointmentId, request));
  }

  @PostMapping("/{appointmentId}/checkin")
  @PreAuthorize("@rbac.hasPermission(authentication, 'QUEUE_CHECK_IN')")
  public ApiResponse<ClinicalAppointmentResponse> checkInAppointment(
      @PathVariable UUID appointmentId,
      @Valid @RequestBody AppointmentCheckInRequest request) {
    return ApiResponse.ok(appointmentWorkflowService.checkInAppointment(appointmentId, request.checkedInAt()));
  }

  @PutMapping("/{appointmentId}/status")
  @PreAuthorize("@rbac.hasPermission(authentication, 'APPOINTMENT_STATUS_WRITE')")
  public ApiResponse<ClinicalAppointmentResponse> updateAppointmentStatus(
      @PathVariable UUID appointmentId,
      @Valid @RequestBody AppointmentStatusUpdateRequest request,
      Authentication authentication) {
    return ApiResponse.ok(appointmentWorkflowService.updateAppointmentStatus(
        UUID.fromString(authentication.getName()),
        appointmentId,
        request.status()));
  }

  @PostMapping("/{appointmentId}/vital-signs")
  @PreAuthorize("@rbac.hasPermission(authentication, 'VITAL_SIGNS_WRITE')")
  public ResponseEntity<ApiResponse<AppointmentVitalSignsResponse>> recordVitalSigns(
      @PathVariable UUID appointmentId,
      @Valid @RequestBody AppointmentVitalSignsRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.ok(appointmentWorkflowService.recordVitalSigns(appointmentId, request)));
  }

  @GetMapping("/{appointmentId}/vital-signs")
  @PreAuthorize("@rbac.hasPermission(authentication, 'VITAL_SIGNS_READ')")
  public ApiResponse<AppointmentVitalSignsResponse> getVitalSigns(@PathVariable UUID appointmentId) {
    return ApiResponse.ok(appointmentWorkflowService.getVitalSigns(appointmentId));
  }

  @PostMapping("/{appointmentId}/follow-up")
  @PreAuthorize("@rbac.hasPermission(authentication, 'FOLLOW_UP_WRITE')")
  public ResponseEntity<ApiResponse<FollowUpResponse>> createFollowUp(
      @PathVariable UUID appointmentId,
      @Valid @RequestBody FollowUpRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.ok(appointmentWorkflowService.createFollowUp(appointmentId, request)));
  }

  @GetMapping("/{appointmentId}/follow-up")
  @PreAuthorize("@rbac.hasPermission(authentication, 'FOLLOW_UP_READ')")
  public ApiResponse<FollowUpResponse> getFollowUp(@PathVariable UUID appointmentId) {
    return ApiResponse.ok(appointmentWorkflowService.getFollowUp(appointmentId));
  }

  private UserRole role(Authentication authentication) {
    return authentication.getAuthorities().stream()
        .map(authority -> authority.getAuthority().replaceFirst("^ROLE_", ""))
        .map(UserRole::valueOf)
        .findFirst()
        .orElseThrow();
  }
}
