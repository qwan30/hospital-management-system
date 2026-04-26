package com.hospital.api.patient;

import com.hospital.core.medicalrecord.MedicalRecordService;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.medicalrecord.PatientHistoryResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/patients")
public class PatientController {
  private final MedicalRecordService medicalRecordService;

  public PatientController(MedicalRecordService medicalRecordService) {
    this.medicalRecordService = medicalRecordService;
  }

  @GetMapping("/{cccd}/history")
  @PreAuthorize("@rbac.hasPermission(authentication, 'PATIENT_HISTORY_READ')")
  public ApiResponse<PatientHistoryResponse> getPatientHistory(@PathVariable String cccd) {
    return ApiResponse.ok(medicalRecordService.getPatientHistory(cccd));
  }
}
