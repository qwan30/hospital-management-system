package com.hospital.api.queue;

import com.hospital.core.appointment.AppointmentWorkflowService;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.appointment.ClinicalAppointmentResponse;
import com.hospital.shared.queue.QueueRoomAssignmentRequest;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/queue")
public class QueueController {
  private final AppointmentWorkflowService appointmentWorkflowService;

  public QueueController(AppointmentWorkflowService appointmentWorkflowService) {
    this.appointmentWorkflowService = appointmentWorkflowService;
  }

  @GetMapping("/today")
  @PreAuthorize("@rbac.hasPermission(authentication, 'QUEUE_READ')")
  public ApiResponse<List<ClinicalAppointmentResponse>> getTodayQueue(
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
    return ApiResponse.ok(appointmentWorkflowService.listQueueForDate(date == null ? LocalDate.now() : date));
  }

  @PostMapping("/{appointmentId}/call")
  @PreAuthorize("@rbac.hasPermission(authentication, 'QUEUE_MANAGE')")
  public ApiResponse<ClinicalAppointmentResponse> callPatient(@PathVariable UUID appointmentId) {
    return ApiResponse.ok(appointmentWorkflowService.callQueuePatient(appointmentId), "Patient called");
  }

  @PostMapping("/{appointmentId}/skip")
  @PreAuthorize("@rbac.hasPermission(authentication, 'QUEUE_MANAGE')")
  public ApiResponse<ClinicalAppointmentResponse> skipPatient(@PathVariable UUID appointmentId) {
    return ApiResponse.ok(
        appointmentWorkflowService.skipQueuePatient(appointmentId, LocalDateTime.now()),
        "Patient moved to back of ready queue");
  }

  @PostMapping("/{appointmentId}/assign-room")
  @PreAuthorize("@rbac.hasPermission(authentication, 'QUEUE_MANAGE')")
  public ApiResponse<ClinicalAppointmentResponse> assignRoom(
      @PathVariable UUID appointmentId,
      @Valid @RequestBody QueueRoomAssignmentRequest request) {
    return ApiResponse.ok(
        appointmentWorkflowService.assignQueueRoom(appointmentId, request.roomName()),
        "Room assigned");
  }

  @PostMapping("/{appointmentId}/start-consultation")
  @PreAuthorize("@rbac.hasPermission(authentication, 'QUEUE_MANAGE')")
  public ApiResponse<ClinicalAppointmentResponse> startConsultation(@PathVariable UUID appointmentId) {
    return ApiResponse.ok(
        appointmentWorkflowService.markInConsultation(appointmentId),
        "Consultation started");
  }

  @PostMapping("/{appointmentId}/complete")
  @PreAuthorize("@rbac.hasPermission(authentication, 'QUEUE_MANAGE')")
  public ApiResponse<ClinicalAppointmentResponse> completeVisit(@PathVariable UUID appointmentId) {
    return ApiResponse.ok(
        appointmentWorkflowService.completeQueueVisit(appointmentId),
        "Queue visit completed");
  }
}
