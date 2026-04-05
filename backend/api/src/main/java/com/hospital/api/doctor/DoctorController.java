package com.hospital.api.doctor;

import com.hospital.core.doctor.DoctorReadService;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.doctor.DoctorResponse;
import com.hospital.shared.doctor.DoctorSlotResponse;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/doctors")
public class DoctorController {
  private final DoctorReadService doctorReadService;

  public DoctorController(DoctorReadService doctorReadService) {
    this.doctorReadService = doctorReadService;
  }

  @GetMapping
  public ApiResponse<List<DoctorResponse>> listDoctors() {
    return ApiResponse.ok(doctorReadService.listDoctors());
  }

  @GetMapping("/{doctorId}")
  public ApiResponse<DoctorResponse> getDoctor(@PathVariable UUID doctorId) {
    return ApiResponse.ok(doctorReadService.getDoctor(doctorId));
  }

  @GetMapping("/{doctorId}/slots")
  public ApiResponse<List<DoctorSlotResponse>> listDoctorSlots(
      @PathVariable UUID doctorId,
      @RequestParam @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
    return ApiResponse.ok(doctorReadService.listDoctorSlots(doctorId, date));
  }
}
