package com.hospital.api.queue;

import com.hospital.core.appointment.AppointmentWorkflowService;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.appointment.ClinicalAppointmentResponse;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
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
}
