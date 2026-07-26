package com.hospital.api.config;

import com.hospital.core.appointment.AppointmentRepository;
import com.hospital.core.appointment.AppointmentVitalSignsRepository;
import com.hospital.core.lab.LabResultRepository;
import com.hospital.core.patientrecord.PatientRecordService;
import com.hospital.shared.enums.UserRole;
import java.util.UUID;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Object-level authorization for clinical resources.
 *
 * <p>The {@code @PreAuthorize} annotations on the clinical controllers only assert that the caller's
 * role holds a permission — they say nothing about whether this particular patient is the caller's.
 * Without a second check any authenticated doctor or nurse can read or mutate any patient's data by
 * changing an id in the path. This guard supplies that missing check.
 *
 * <p>Centralised deliberately: the same resolution was needed in four controllers across twelve
 * endpoints, and duplicating it is how one copy ends up subtly different from the others.
 *
 * <p>All methods throw {@link AccessDeniedException}, which RestExceptionHandler maps to 403
 * {@code forbidden}. That is correct for UUID-keyed resources, where an unguessable identifier means
 * existence leakage carries little value. The CCCD-keyed patient-history endpoint deliberately does
 * NOT use this class — it returns 404 for both missing and forbidden, because a 12-digit national ID
 * is enumerable and the 403/404 split would itself be the vulnerability.
 *
 * <p>The {@code @Transactional} annotations are deliberately not {@code readOnly = true}. The
 * underlying care-relationship check takes a pessimistic share lock, and PostgreSQL refuses
 * {@code SELECT ... FOR SHARE} inside a read-only transaction.
 */
@Component
public class ClinicalAccessGuard {
  private final AppointmentRepository appointmentRepository;
  private final AppointmentVitalSignsRepository vitalSignsRepository;
  private final LabResultRepository labResultRepository;
  private final PatientRecordService patientRecordService;

  public ClinicalAccessGuard(
      AppointmentRepository appointmentRepository,
      AppointmentVitalSignsRepository vitalSignsRepository,
      LabResultRepository labResultRepository,
      PatientRecordService patientRecordService) {
    this.appointmentRepository = appointmentRepository;
    this.vitalSignsRepository = vitalSignsRepository;
    this.labResultRepository = labResultRepository;
    this.patientRecordService = patientRecordService;
  }

  /** Guards a read keyed by appointment id. */
  @Transactional
  public void requireAppointmentRead(Authentication authentication, UUID appointmentId) {
    patientRecordService.requireClinicalAccess(
        actorId(authentication), role(authentication), patientOfAppointment(appointmentId));
  }

  /** Guards a mutation keyed by appointment id. */
  @Transactional
  public void requireAppointmentWrite(Authentication authentication, UUID appointmentId) {
    patientRecordService.requireClinicalWriteAccess(
        actorId(authentication), role(authentication), patientOfAppointment(appointmentId));
  }

  /**
   * Guards a mutation keyed by vital-sign id, which needs two hops to reach the patient. A missing
   * record is reported as denied rather than not-found so that a caller without access cannot use
   * this endpoint to test which vital-sign ids exist.
   */
  @Transactional
  public void requireVitalSignWrite(Authentication authentication, UUID vitalSignId) {
    var patientId = vitalSignsRepository.findById(vitalSignId)
        .map(vitalSigns -> vitalSigns.getAppointment().getPatient().getId())
        .orElseThrow(() -> new AccessDeniedException("Clinical data access denied"));

    patientRecordService.requireClinicalWriteAccess(
        actorId(authentication), role(authentication), patientId);
  }

  /** Guards a read keyed by lab-result id. LabResultEntity references the patient directly. */
  @Transactional
  public void requireLabResultRead(Authentication authentication, UUID resultId) {
    patientRecordService.requireClinicalAccess(
        actorId(authentication), role(authentication), patientOfLabResult(resultId));
  }

  /** Guards a mutation keyed by lab-result id. */
  @Transactional
  public void requireLabResultWrite(Authentication authentication, UUID resultId) {
    patientRecordService.requireClinicalWriteAccess(
        actorId(authentication), role(authentication), patientOfLabResult(resultId));
  }

  private UUID patientOfLabResult(UUID resultId) {
    return labResultRepository.findByIdAndDeletedFalse(resultId)
        .map(labResult -> labResult.getPatient().getId())
        .orElseThrow(() -> new AccessDeniedException("Clinical data access denied"));
  }

  private UUID patientOfAppointment(UUID appointmentId) {
    return appointmentRepository.findById(appointmentId)
        .map(appointment -> appointment.getPatient().getId())
        .orElseThrow(() -> new AccessDeniedException("Clinical data access denied"));
  }

  private UUID actorId(Authentication authentication) {
    return UUID.fromString(authentication.getName());
  }

  private UserRole role(Authentication authentication) {
    return authentication.getAuthorities().stream()
        .map(authority -> authority.getAuthority().replaceFirst("^ROLE_", ""))
        .map(UserRole::valueOf)
        .findFirst()
        .orElseThrow(() -> new AccessDeniedException("No role present on the authenticated principal"));
  }
}
