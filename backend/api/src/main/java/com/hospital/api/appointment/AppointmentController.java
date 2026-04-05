package com.hospital.api.appointment;

import com.hospital.core.appointment.AppointmentWriteService;
import com.hospital.core.appointment.AppointmentWorkflowService;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.appointment.AppointmentDetailResponse;
import com.hospital.shared.appointment.AppointmentCheckInRequest;
import com.hospital.shared.appointment.AppointmentStatusUpdateRequest;
import com.hospital.shared.booking.AppointmentCreateRequest;
import com.hospital.shared.booking.AppointmentResponse;
import com.hospital.shared.appointment.ClinicalAppointmentResponse;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/v1/appointments")
public class AppointmentController {
  private final AppointmentWriteService appointmentWriteService;
  private final AppointmentWorkflowService appointmentWorkflowService;

  public AppointmentController(
      AppointmentWriteService appointmentWriteService,
      AppointmentWorkflowService appointmentWorkflowService) {
    this.appointmentWriteService = appointmentWriteService;
    this.appointmentWorkflowService = appointmentWorkflowService;
  }

  @PostMapping
  public ResponseEntity<ApiResponse<AppointmentResponse>> createAppointment(
      @Valid @RequestBody AppointmentCreateRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(ApiResponse.ok(appointmentWriteService.createAppointment(request)));
  }

  @GetMapping("/today")
  @PreAuthorize("hasRole('NURSE')")
  public ApiResponse<List<ClinicalAppointmentResponse>> listTodayAppointments(
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
    return ApiResponse.ok(appointmentWorkflowService.listAppointmentsForDate(date == null ? LocalDate.now() : date));
  }

  @GetMapping("/{appointmentId}")
  @PreAuthorize("hasRole('DOCTOR')")
  public ApiResponse<AppointmentDetailResponse> getAppointmentDetail(
      @PathVariable UUID appointmentId,
      Authentication authentication) {
    return ApiResponse.ok(appointmentWorkflowService.getAppointmentDetail(
        UUID.fromString(authentication.getName()),
        appointmentId));
  }

  @PostMapping("/{appointmentId}/checkin")
  @PreAuthorize("hasRole('NURSE')")
  public ApiResponse<ClinicalAppointmentResponse> checkInAppointment(
      @PathVariable UUID appointmentId,
      @Valid @RequestBody AppointmentCheckInRequest request) {
    return ApiResponse.ok(appointmentWorkflowService.checkInAppointment(appointmentId, request.checkedInAt()));
  }

  @PutMapping("/{appointmentId}/status")
  @PreAuthorize("hasRole('DOCTOR')")
  public ApiResponse<ClinicalAppointmentResponse> updateAppointmentStatus(
      @PathVariable UUID appointmentId,
      @Valid @RequestBody AppointmentStatusUpdateRequest request,
      Authentication authentication) {
    return ApiResponse.ok(appointmentWorkflowService.updateAppointmentStatus(
        UUID.fromString(authentication.getName()),
        appointmentId,
        request.status()));
  }
}
