package com.hospital.api.schedule;

import com.hospital.core.appointment.AppointmentWorkflowService;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.appointment.ClinicalAppointmentResponse;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/me")
public class ScheduleController {
  private static final Pattern ISO_WEEK_PATTERN = Pattern.compile("^\\d{4}-W\\d{2}$");

  private final AppointmentWorkflowService appointmentWorkflowService;

  public ScheduleController(AppointmentWorkflowService appointmentWorkflowService) {
    this.appointmentWorkflowService = appointmentWorkflowService;
  }

  @GetMapping("/schedule")
  @PreAuthorize("@rbac.hasPermission(authentication, 'SCHEDULE_READ')")
  public ApiResponse<List<ClinicalAppointmentResponse>> getSchedule(
      Authentication authentication,
      @RequestParam(required = false) String date,
      @RequestParam(required = false) String week) {
    if ((date == null || date.isBlank()) == (week == null || week.isBlank())) {
      throw new IllegalArgumentException("Provide exactly one of date or week");
    }

    var doctorId = UUID.fromString(authentication.getName());
    if (week != null && !week.isBlank()) {
      var weekRange = parseIsoWeek(week);
      return ApiResponse.ok(appointmentWorkflowService.listScheduleForDoctor(doctorId, weekRange.start(), weekRange.end()));
    }

    var resolvedDate = "today".equalsIgnoreCase(date) ? LocalDate.now() : LocalDate.parse(date);
    return ApiResponse.ok(appointmentWorkflowService.listScheduleForDoctor(doctorId, resolvedDate, resolvedDate));
  }

  private WeekRange parseIsoWeek(String week) {
    if (!ISO_WEEK_PATTERN.matcher(week).matches()) {
      throw new IllegalArgumentException("Week must use ISO format YYYY-Www");
    }

    var year = Integer.parseInt(week.substring(0, 4));
    var weekNumber = Integer.parseInt(week.substring(6));
    var weekFields = WeekFields.ISO;
    var start = LocalDate.of(year, 1, 4)
        .with(weekFields.weekOfWeekBasedYear(), weekNumber)
        .with(weekFields.dayOfWeek(), DayOfWeek.MONDAY.getValue());
    return new WeekRange(start, start.plusDays(6));
  }

  private record WeekRange(LocalDate start, LocalDate end) {}
}
