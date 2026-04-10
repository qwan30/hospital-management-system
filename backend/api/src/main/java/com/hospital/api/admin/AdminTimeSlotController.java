package com.hospital.api.admin;

import com.hospital.core.admin.TimeSlotAdminService;
import com.hospital.shared.admin.AdminSlotGenerateRequest;
import com.hospital.shared.admin.AdminSlotGenerateResult;
import com.hospital.shared.admin.AdminSlotResponse;
import com.hospital.shared.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/slots")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin – Slots", description = "Time slot generation and management")
public class AdminTimeSlotController {

  private final TimeSlotAdminService timeSlotAdminService;

  public AdminTimeSlotController(TimeSlotAdminService timeSlotAdminService) {
    this.timeSlotAdminService = timeSlotAdminService;
  }

  @PostMapping("/generate")
  @Operation(
      summary = "Generate time slots from schedule templates",
      description = "Creates AVAILABLE slots for all (or a specific) doctor for the given date range. Idempotent — skips slots that already exist.")
  public ApiResponse<AdminSlotGenerateResult> generateSlots(@Valid @RequestBody AdminSlotGenerateRequest request) {
    return ApiResponse.ok(timeSlotAdminService.generateSlots(request), "Slot generation complete");
  }

  @PutMapping("/{slotId}/block")
  @Operation(
      summary = "Manually block a time slot",
      description = "Sets the slot status to BLOCKED. Fails if the slot is already BOOKED.")
  public ApiResponse<AdminSlotResponse> blockSlot(@PathVariable UUID slotId) {
    return ApiResponse.ok(timeSlotAdminService.blockSlot(slotId), "Slot blocked");
  }

  @DeleteMapping("/{slotId}")
  @Operation(
      summary = "Delete a time slot",
      description = "Permanently removes an AVAILABLE or BLOCKED slot. Fails if the slot is BOOKED.")
  public ApiResponse<Void> deleteSlot(@PathVariable UUID slotId) {
    timeSlotAdminService.deleteSlot(slotId);
    return ApiResponse.ok(null, "Slot deleted");
  }
}
