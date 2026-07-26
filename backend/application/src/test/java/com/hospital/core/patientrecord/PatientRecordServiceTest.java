package com.hospital.core.patientrecord;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.hospital.core.appointment.AppointmentRepository;
import com.hospital.core.appointment.AppointmentEntity;
import com.hospital.core.audit.AuditLogService;
import com.hospital.core.medicalrecord.MedicalRecordRepository;
import com.hospital.core.patient.PatientEntity;
import com.hospital.core.patient.PatientIdentifierProtector;
import com.hospital.core.patient.PatientRepository;
import com.hospital.shared.enums.Gender;
import com.hospital.shared.enums.AppointmentStatus;
import com.hospital.shared.enums.UserRole;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import org.springframework.security.access.AccessDeniedException;

@ExtendWith(MockitoExtension.class)
class PatientRecordServiceTest {
  @Mock private AppointmentRepository appointmentRepository;
  @Mock private AuditLogService auditLogService;
  @Mock private MedicalRecordRepository medicalRecordRepository;
  @Mock private PatientIdentifierProtector patientIdentifierProtector;
  @Mock private PatientRepository patientRepository;

  private PatientRecordService service;

  @BeforeEach
  void setUp() {
    service = new PatientRecordService(
        appointmentRepository,
        auditLogService,
        medicalRecordRepository,
        patientIdentifierProtector,
        patientRepository);
  }

  @Test
  void careRelationshipReadUsesPessimisticLock() throws Exception {
    var method = AppointmentRepository.class.getMethod(
        "findCareRelationshipForRead", UUID.class, UUID.class, java.util.Collection.class);

    assertThat(method.getAnnotation(Lock.class)).isNotNull();
    assertThat(method.getAnnotation(Lock.class).value()).isEqualTo(LockModeType.PESSIMISTIC_READ);
  }

  @Test
  void doctorSearchUsesOnlyDoctorScopedRepositoryQuery() {
    var doctorId = UUID.randomUUID();
    var patient = patient();
    when(patientRepository.searchForDoctor(
        eq(doctorId), eq("scope@example.com"), eq(null), eq(List.of(
            AppointmentStatus.CHECKED_IN,
            AppointmentStatus.IN_PROGRESS,
            AppointmentStatus.DONE)), eq(PageRequest.of(0, 20))))
        .thenReturn(List.of(patient));
    when(appointmentRepository.findByPatientIdOrderByAppointmentDateDescFirstSlotStartTimeDesc(patient.getId()))
        .thenReturn(List.of());

    var result = service.search(doctorId, UserRole.DOCTOR, " scope@example.com ");

    assertThat(result).extracting(item -> item.patientId()).containsExactly(patient.getId());
    verify(patientRepository).searchForDoctor(
        eq(doctorId), eq("scope@example.com"), eq(null), eq(List.of(
            AppointmentStatus.CHECKED_IN,
            AppointmentStatus.IN_PROGRESS,
            AppointmentStatus.DONE)), eq(PageRequest.of(0, 20)));
    verify(patientRepository, never()).searchByQuery(any());
    verify(patientRepository, never()).findTop20ByOrderByUpdatedAtDesc();
    verify(patientRepository, never()).findByCccdHash(any());
    verify(auditLogService).record(
        eq(doctorId), eq("PATIENT_RECORD_SEARCH"), eq("PATIENT_RECORD"), eq(patient.getId()), any());
  }

  @Test
  void relatedDoctorCanReadPatientDetail() {
    var doctorId = UUID.randomUUID();
    var patient = patient();
    when(appointmentRepository.findCareRelationshipForRead(
        patient.getId(), doctorId, List.of(
            AppointmentStatus.CHECKED_IN,
            AppointmentStatus.IN_PROGRESS,
            AppointmentStatus.DONE))).thenReturn(List.of(appointment(AppointmentStatus.DONE)));
    when(patientRepository.findById(patient.getId())).thenReturn(Optional.of(patient));
    when(appointmentRepository.findByPatientIdOrderByAppointmentDateDescFirstSlotStartTimeDesc(patient.getId()))
        .thenReturn(List.of());

    var detail = service.getDetail(doctorId, UserRole.DOCTOR, patient.getId());

    assertThat(detail.patientId()).isEqualTo(patient.getId());
    assertThat(detail.cccd()).isNull();
    verify(patientIdentifierProtector, never()).decrypt(any());
    verify(auditLogService).record(
        eq(doctorId), eq("PATIENT_RECORD_READ"), eq("PATIENT_RECORD"), eq(patient.getId()), any());
  }

  @Test
  void unrelatedDoctorCannotReadPatientDetailOrProbeExistence() {
    var doctorId = UUID.randomUUID();
    var patientId = UUID.randomUUID();
    when(appointmentRepository.findCareRelationshipForRead(
        eq(patientId), eq(doctorId), any())).thenReturn(List.of());

    assertThatThrownBy(() -> service.getDetail(doctorId, UserRole.DOCTOR, patientId))
        .isInstanceOf(AccessDeniedException.class);

    verify(patientRepository, never()).findById(patientId);
    verify(patientIdentifierProtector, never()).decrypt(any());
  }

  @Test
  void adminCanReadAnyPatientDetailWithoutTreatmentRelationship() {
    var adminId = UUID.randomUUID();
    var patient = patient();
    when(patientRepository.findById(patient.getId())).thenReturn(Optional.of(patient));
    when(appointmentRepository.findByPatientIdOrderByAppointmentDateDescFirstSlotStartTimeDesc(patient.getId()))
        .thenReturn(List.of());

    var detail = service.getDetail(adminId, UserRole.ADMIN, patient.getId());

    assertThat(detail.patientId()).isEqualTo(patient.getId());
    verify(appointmentRepository, never())
        .findCareRelationshipForRead(any(), any(), any());
    assertThat(detail.cccd()).isNull();
  }

  @Test
  void cancelledOrMerelyConfirmedAppointmentDoesNotGrantReadAccess() {
    var doctorId = UUID.randomUUID();
    var patientId = UUID.randomUUID();
    when(appointmentRepository.findCareRelationshipForRead(
        eq(patientId), eq(doctorId), any())).thenReturn(List.of());

    assertThat(service.hasReadAccess(doctorId, UserRole.DOCTOR, patientId)).isFalse();
  }

  @Test
  void nurseWithActivelyPresentPatientHasClinicalAccess() {
    var nurseId = UUID.randomUUID();
    var patientId = UUID.randomUUID();
    when(appointmentRepository.existsByPatientIdAndStatusIn(eq(patientId), any()))
        .thenReturn(true);

    assertThat(service.hasClinicalAccess(nurseId, UserRole.NURSE, patientId)).isTrue();
  }

  @Test
  void nurseWithoutActivelyPresentPatientHasNoClinicalAccess() {
    var nurseId = UUID.randomUUID();
    var patientId = UUID.randomUUID();
    when(appointmentRepository.existsByPatientIdAndStatusIn(eq(patientId), any()))
        .thenReturn(false);

    assertThat(service.hasClinicalAccess(nurseId, UserRole.NURSE, patientId)).isFalse();
  }

  @Test
  void nurseClinicalScopeExcludesDischargedPatients() {
    var nurseId = UUID.randomUUID();
    var patientId = UUID.randomUUID();
    when(appointmentRepository.existsByPatientIdAndStatusIn(eq(patientId), any()))
        .thenReturn(false);

    service.hasClinicalAccess(nurseId, UserRole.NURSE, patientId);

    // Nurses are scoped to patients physically present, so DONE must not be queried
    // even though the doctor path deliberately includes it for historical access.
    verify(appointmentRepository)
        .existsByPatientIdAndStatusIn(patientId, List.of(
            AppointmentStatus.CHECKED_IN, AppointmentStatus.IN_PROGRESS));
  }

  @Test
  void doctorClinicalAccessStillUsesCareRelationshipAndNotTheNurseScope() {
    var doctorId = UUID.randomUUID();
    var patientId = UUID.randomUUID();
    when(appointmentRepository.findCareRelationshipForRead(eq(patientId), eq(doctorId), any()))
        .thenReturn(List.of(appointment(AppointmentStatus.DONE)));

    assertThat(service.hasClinicalAccess(doctorId, UserRole.DOCTOR, patientId)).isTrue();
    verify(appointmentRepository, never()).existsByPatientIdAndStatusIn(any(), any());
  }

  @Test
  void adminHasClinicalAccessWithoutQueryingAppointments() {
    assertThat(service.hasClinicalAccess(UUID.randomUUID(), UserRole.ADMIN, UUID.randomUUID())).isTrue();

    verify(appointmentRepository, never()).existsByPatientIdAndStatusIn(any(), any());
    verify(appointmentRepository, never()).findCareRelationshipForRead(any(), any(), any());
  }

  @Test
  void receptionistHasNoClinicalAccess() {
    assertThat(service.hasClinicalAccess(UUID.randomUUID(), UserRole.RECEPTIONIST, UUID.randomUUID()))
        .isFalse();
  }

  @Test
  void requireClinicalAccessThrowsForUnscopedNurse() {
    var nurseId = UUID.randomUUID();
    var patientId = UUID.randomUUID();
    when(appointmentRepository.existsByPatientIdAndStatusIn(eq(patientId), any()))
        .thenReturn(false);

    assertThatThrownBy(() -> service.requireClinicalAccess(nurseId, UserRole.NURSE, patientId))
        .isInstanceOf(AccessDeniedException.class);
  }

  @Test
  void requireClinicalWriteAccessIsSeparateFromReadScope() {
    var nurseId = UUID.randomUUID();
    var patientId = UUID.randomUUID();
    when(appointmentRepository.existsByPatientIdAndStatusIn(eq(patientId), any()))
        .thenReturn(true);

    // Distinct entry point so a future widening of read scope cannot silently grant writes,
    // mirroring how RbacAuthorizationService separates LAB_RESULT_READ from LAB_RESULT_WRITE.
    service.requireClinicalWriteAccess(nurseId, UserRole.NURSE, patientId);
  }

  @Test
  void nurseStillCannotUseThePatientRecordReadGuard() {
    // Pinning test: hasReadAccess must remain ADMIN/DOCTOR-only so adding the clinical
    // predicate does not widen /patient-records or the AI endpoints.
    assertThat(service.hasReadAccess(UUID.randomUUID(), UserRole.NURSE, UUID.randomUUID())).isFalse();
  }

  private AppointmentEntity appointment(AppointmentStatus status) {
    var appointment = new AppointmentEntity();
    appointment.setStatus(status);
    return appointment;
  }

  private PatientEntity patient() {
    var patient = new PatientEntity();
    patient.setId(UUID.randomUUID());
    patient.setFullName("Treatment Scope Patient");
    patient.setPhone("0901234567");
    patient.setEmail("scope@example.com");
    patient.setDateOfBirth(LocalDate.of(1990, 5, 15));
    patient.setGender(Gender.FEMALE);
    patient.setCccd("encrypted-cccd");
    patient.setInsuranceNumber("BHYT-SCOPE");
    return patient;
  }
}
