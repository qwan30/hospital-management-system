package com.hospital.api.patient;

import com.hospital.core.audit.AuditLogService;
import com.hospital.core.medicalrecord.MedicalRecordService;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.enums.UserRole;
import com.hospital.shared.medicalrecord.PatientHistoryResponse;
import java.util.Map;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/patients")
public class PatientController {
  private final MedicalRecordService medicalRecordService;
  private final AuditLogService auditLogService;

  public PatientController(MedicalRecordService medicalRecordService, AuditLogService auditLogService) {
    this.medicalRecordService = medicalRecordService;
    this.auditLogService = auditLogService;
  }

  /**
   * Returns the patient's full clinical history including the decrypted national identifier, so the
   * actor must be scope-checked against this specific patient — the role permission alone is held by
   * every doctor. {@code @Transactional} is required because the underlying scope check takes a
   * pessimistic read lock.
   */
  @GetMapping("/{cccd}/history")
  @PreAuthorize("@rbac.hasPermission(authentication, 'PATIENT_HISTORY_READ')")
  @Transactional(readOnly = true)
  public ApiResponse<PatientHistoryResponse> getPatientHistory(
      @PathVariable String cccd,
      Authentication authentication) {
    var actorId = actorId(authentication);
    var role = role(authentication);
    var history = medicalRecordService.getPatientHistory(actorId, role, cccd);

    // Audited only on success, after the scope check, mirroring PatientRecordService.getDetail.
    // AuditLogService.record is REQUIRES_NEW, so this survives the read-only transaction.
    auditLogService.record(
        actorId,
        "PATIENT_HISTORY_READ",
        "PATIENT_RECORD",
        history.patientId(),
        Map.of("role", role.name()));
    return ApiResponse.ok(history);
  }

  private UUID actorId(Authentication authentication) {
    return UUID.fromString(authentication.getName());
  }

  private UserRole role(Authentication authentication) {
    return authentication.getAuthorities().stream()
        .map(authority -> authority.getAuthority().replaceFirst("^ROLE_", ""))
        .map(UserRole::valueOf)
        .findFirst()
        .orElseThrow();
  }
}
