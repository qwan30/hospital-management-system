package com.hospital.core.patientrecord;

import com.hospital.core.appointment.AppointmentRepository;
import com.hospital.core.audit.AuditLogService;
import com.hospital.core.common.NotFoundException;
import com.hospital.core.common.NumberUtils;
import com.hospital.core.medicalrecord.MedicalRecordEntity;
import com.hospital.core.medicalrecord.MedicalRecordRepository;
import com.hospital.core.patient.PatientEntity;
import com.hospital.core.patient.PatientIdentifierProtector;
import com.hospital.core.patient.PatientRepository;
import com.hospital.shared.medicalrecord.MedicalRecordResponse;
import com.hospital.shared.medicalrecord.PatientHistoryAppointmentResponse;
import com.hospital.shared.medicalrecord.PrescriptionItemPayload;
import com.hospital.shared.medicalrecord.VitalSignsPayload;
import com.hospital.shared.patientrecord.PatientRecordDetailResponse;
import com.hospital.shared.patientrecord.PatientRecordListItemResponse;
import com.hospital.shared.enums.UserRole;
import com.hospital.shared.enums.AppointmentStatus;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;

@Service
public class PatientRecordService {
  private static final List<AppointmentStatus> CARE_RELATIONSHIP_STATUSES = List.of(
      AppointmentStatus.CHECKED_IN,
      AppointmentStatus.IN_PROGRESS,
      AppointmentStatus.DONE);

  /** Patient is physically in the facility. Excludes DONE, so nurse scope ends at discharge. */
  private static final List<AppointmentStatus> ACTIVE_CLINICAL_STATUSES = List.of(
      AppointmentStatus.CHECKED_IN,
      AppointmentStatus.IN_PROGRESS);
  private final AppointmentRepository appointmentRepository;
  private final AuditLogService auditLogService;
  private final MedicalRecordRepository medicalRecordRepository;
  private final PatientIdentifierProtector patientIdentifierProtector;
  private final PatientRepository patientRepository;

  public PatientRecordService(
      AppointmentRepository appointmentRepository,
      AuditLogService auditLogService,
      MedicalRecordRepository medicalRecordRepository,
      PatientIdentifierProtector patientIdentifierProtector,
      PatientRepository patientRepository) {
    this.appointmentRepository = appointmentRepository;
    this.auditLogService = auditLogService;
    this.medicalRecordRepository = medicalRecordRepository;
    this.patientIdentifierProtector = patientIdentifierProtector;
    this.patientRepository = patientRepository;
  }

  @Transactional(readOnly = true)
  public List<PatientRecordListItemResponse> search(UUID actorId, UserRole role, String query) {
    var normalizedQuery = query == null ? "" : query.trim();
    List<PatientEntity> matchedPatients = switch (role) {
      case ADMIN -> searchAllPatients(normalizedQuery);
      case DOCTOR -> patientRepository.searchForDoctor(
          actorId,
          normalizedQuery,
          normalizedQuery.matches("\\d{12}")
              ? patientIdentifierProtector.hash(normalizedQuery)
              : null,
          CARE_RELATIONSHIP_STATUSES,
          PageRequest.of(0, 20));
      default -> throw new AccessDeniedException("Patient record access denied");
    };

    var response = matchedPatients.stream()
        .map(patient -> {
          var appointments = appointmentRepository.findByPatientIdOrderByAppointmentDateDescFirstSlotStartTimeDesc(patient.getId());
          var latestAppointmentDate = appointments.isEmpty() ? null : appointments.get(0).getAppointmentDate();
          return new PatientRecordListItemResponse(
              patient.getId(),
              patient.getFullName(),
              patient.getPhone(),
              patient.getEmail(),
              patient.getDateOfBirth(),
              latestAppointmentDate,
              appointments.size());
        })
        .toList();
    if (response.isEmpty()) {
      auditLogService.record(actorId, "PATIENT_RECORD_SEARCH", "PATIENT_RECORD", null, Map.of(
          "queryType", queryType(normalizedQuery),
          "resultCount", 0,
          "role", role.name()));
    } else {
      response.forEach(patient -> auditLogService.record(
          actorId,
          "PATIENT_RECORD_SEARCH",
          "PATIENT_RECORD",
          patient.patientId(),
          Map.of("queryType", queryType(normalizedQuery), "role", role.name())));
    }
    return response;
  }

  private List<PatientEntity> searchAllPatients(String normalizedQuery) {
    if (normalizedQuery.isBlank()) {
      return patientRepository.findTop20ByOrderByUpdatedAtDesc();
    }

    var patientSet = new LinkedHashSet<PatientEntity>(patientRepository.searchByQuery(normalizedQuery));
    if (normalizedQuery.matches("\\d{12}")) {
      patientRepository.findByCccdHash(patientIdentifierProtector.hash(normalizedQuery))
          .ifPresent(patientSet::add);
    }
    return new ArrayList<>(patientSet);
  }

  @Transactional(readOnly = true)
  public PatientRecordDetailResponse getDetail(UUID actorId, UserRole role, UUID patientId) {
    requireReadAccess(actorId, role, patientId);
    var patient = patientRepository.findById(patientId)
        .orElseThrow(() -> new NotFoundException("Patient not found"));

    var appointments = appointmentRepository.findByPatientIdOrderByAppointmentDateDescFirstSlotStartTimeDesc(patientId);
    var appointmentIds = appointments.stream().map(appointment -> appointment.getId()).toList();
    var records = appointmentIds.isEmpty()
        ? List.<MedicalRecordEntity>of()
        : medicalRecordRepository.findDetailedByAppointmentIds(appointmentIds);
    Map<UUID, MedicalRecordEntity> recordsByAppointmentId = new LinkedHashMap<>();
    records.forEach(record -> recordsByAppointmentId.put(record.getAppointment().getId(), record));

    var response = new PatientRecordDetailResponse(
        patient.getId(),
        patient.getFullName(),
        patient.getPhone(),
        patient.getEmail(),
        null,
        patient.getDateOfBirth(),
        patient.getOccupation(),
        patient.getBloodType(),
        patient.getMedicalHistory(),
        patient.getDrugAllergies(),
        patient.getInsuranceNumber(),
        appointments.stream()
            .sorted(Comparator
                .comparing(com.hospital.core.appointment.AppointmentEntity::getAppointmentDate).reversed()
                .thenComparing(appointment -> appointment.getFirstSlot().getStartTime(), Comparator.reverseOrder()))
            .map(appointment -> new PatientHistoryAppointmentResponse(
                appointment.getId(),
                appointment.getAppointmentDate(),
                appointment.getFirstSlot().getStartTime(),
                appointment.getFirstSlot().getEndTime(),
                appointment.getStatus(),
                appointment.getDoctor().getId(),
                appointment.getDoctor().getFullName(),
                toMedicalRecordResponse(recordsByAppointmentId.get(appointment.getId()))))
            .toList());
    auditLogService.record(actorId, "PATIENT_RECORD_READ", "PATIENT_RECORD", patientId, Map.of(
        "role", role.name()));
    return response;
  }

  @Transactional(readOnly = true)
  public boolean hasReadAccess(UUID actorId, UserRole role, UUID patientId) {
    return role == UserRole.ADMIN
        || role == UserRole.DOCTOR
            && !appointmentRepository
                .findCareRelationshipForRead(patientId, actorId, CARE_RELATIONSHIP_STATUSES)
                .isEmpty();
  }

  public void requireReadAccess(UUID actorId, UserRole role, UUID patientId) {
    if (!hasReadAccess(actorId, role, patientId)) {
      throw new AccessDeniedException("Patient record access denied");
    }
  }

  /**
   * Object-level scope for clinical data (vital signs, lab results, follow-ups).
   *
   * <p>Distinct from {@link #hasReadAccess} because NURSE holds VITAL_SIGNS_READ/WRITE and
   * LAB_RESULT_READ but is deliberately absent from the patient-record read guard. Reusing that guard
   * here would deny every nurse and break intake.
   *
   * <p>Nurses are scoped to patients physically present — CHECKED_IN or IN_PROGRESS only. DONE is
   * excluded, unlike {@code CARE_RELATIONSHIP_STATUSES}, which includes it so doctors retain access
   * to patients they have already treated.
   */
  @Transactional
  public boolean hasClinicalAccess(UUID actorId, UserRole role, UUID patientId) {
    if (role == UserRole.ADMIN) {
      return true;
    }
    if (role == UserRole.DOCTOR) {
      return !appointmentRepository
          .findCareRelationshipForRead(patientId, actorId, CARE_RELATIONSHIP_STATUSES)
          .isEmpty();
    }
    if (role == UserRole.NURSE) {
      return appointmentRepository.existsByPatientIdAndStatusIn(patientId, ACTIVE_CLINICAL_STATUSES);
    }
    return false;
  }

  /**
   * Annotated so the pessimistic lock on {@code findCareRelationshipForRead} always has a
   * transaction. {@link #requireReadAccess} relies on its callers for that, which works only by
   * coincidence of who calls it today.
   *
   * <p>Deliberately NOT {@code readOnly = true}: the lock emits {@code SELECT ... FOR SHARE}, which
   * PostgreSQL rejects inside a read-only transaction with "cannot execute SELECT FOR SHARE in a
   * read-only transaction". Marking it read-only looks harmless and passes an H2-style unit test, but
   * fails against real PostgreSQL.
   */
  @Transactional
  public void requireClinicalAccess(UUID actorId, UserRole role, UUID patientId) {
    if (!hasClinicalAccess(actorId, role, patientId)) {
      throw new AccessDeniedException("Clinical data access denied");
    }
  }

  /**
   * Separate entry point for mutations so a future widening of read scope cannot silently grant
   * writes, mirroring how RbacAuthorizationService separates LAB_RESULT_READ from LAB_RESULT_WRITE.
   */
  @Transactional
  public void requireClinicalWriteAccess(UUID actorId, UserRole role, UUID patientId) {
    if (!hasClinicalAccess(actorId, role, patientId)) {
      throw new AccessDeniedException("Clinical data access denied");
    }
  }

  private String queryType(String normalizedQuery) {
    if (normalizedQuery.isBlank()) {
      return "BLANK";
    }
    return normalizedQuery.matches("\\d{12}") ? "IDENTIFIER" : "TEXT";
  }

  private MedicalRecordResponse toMedicalRecordResponse(MedicalRecordEntity record) {
    if (record == null) {
      return null;
    }

    var prescriptionItems = record.getPrescriptionItems().stream()
        .sorted(Comparator.comparingInt(item -> item.getSortOrder() == null ? 0 : item.getSortOrder()))
        .map(item -> new PrescriptionItemPayload(
            item.getMedicineName(),
            item.getDosage(),
            item.getFrequency(),
            item.getDurationDays(),
            item.getInstructions(),
            item.getSortOrder()))
        .toList();

    return new MedicalRecordResponse(
        record.getId(),
        record.getAppointment().getId(),
        record.getDiagnosis(),
        record.getClinicalNotes(),
        new VitalSignsPayload(
            record.getBloodPressure(),
            NumberUtils.toDouble(record.getTemperature()),
            NumberUtils.toDouble(record.getWeight()),
            NumberUtils.toDouble(record.getHeight())),
        record.getFollowUpDate(),
        prescriptionItems,
        record.getAppointment().getStatus());
  }
}
