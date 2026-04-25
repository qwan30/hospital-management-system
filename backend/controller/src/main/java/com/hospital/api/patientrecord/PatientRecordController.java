package com.hospital.api.patientrecord;

import com.hospital.core.patientrecord.PatientRecordService;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.patientrecord.PatientRecordDetailResponse;
import com.hospital.shared.patientrecord.PatientRecordListItemResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/patient-records")
@PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
public class PatientRecordController {
  private final PatientRecordService patientRecordService;

  public PatientRecordController(PatientRecordService patientRecordService) {
    this.patientRecordService = patientRecordService;
  }

  @GetMapping
  public ApiResponse<List<PatientRecordListItemResponse>> search(@RequestParam(required = false) String query) {
    return ApiResponse.ok(patientRecordService.search(query));
  }

  @GetMapping("/{patientId}")
  public ApiResponse<PatientRecordDetailResponse> getDetail(@PathVariable UUID patientId) {
    return ApiResponse.ok(patientRecordService.getDetail(patientId));
  }
}
