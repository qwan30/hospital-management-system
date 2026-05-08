package com.hospital.core.lab;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.hospital.core.appointment.AppointmentEntity;
import com.hospital.core.appointment.AppointmentRepository;
import com.hospital.core.common.NotFoundException;
import com.hospital.core.patient.PatientEntity;
import com.hospital.shared.lab.LabResultCreateRequest;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class LabResultServiceTest {

  @Mock private LabResultRepository labResultRepository;
  @Mock private AppointmentRepository appointmentRepository;

  private LabResultService service;

  @BeforeEach
  void setUp() {
    service = new LabResultService(labResultRepository, appointmentRepository);
  }

  @Test
  void createLabResult_validAppointment_savesAndReturns() {
    var appointmentId = UUID.randomUUID();
    var appointment = new AppointmentEntity();
    appointment.setId(appointmentId);
    appointment.setPatient(new PatientEntity());
    when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));
    when(labResultRepository.save(any(LabResultEntity.class))).thenAnswer(inv -> {
      var e = inv.getArgument(0, LabResultEntity.class);
      e.prePersist();
      return e;
    });

    var request = new LabResultCreateRequest(appointmentId, "CBC", "Normal", "4.5-11.0", "COMPLETED", "All within range");
    var response = service.createLabResult(request);

    assertThat(response.id()).isNotNull();
    assertThat(response.appointmentId()).isEqualTo(appointmentId);
    assertThat(response.testName()).isEqualTo("CBC");
    assertThat(response.resultValue()).isEqualTo("Normal");
    assertThat(response.status()).isEqualTo("COMPLETED");
    verify(labResultRepository).save(any());
  }

  @Test
  void createLabResult_invalidAppointment_throwsNotFound() {
    var appointmentId = UUID.randomUUID();
    when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> service.createLabResult(
        new LabResultCreateRequest(appointmentId, "CBC", "Normal", null, null, null)))
        .isInstanceOf(NotFoundException.class);
  }

  @Test
  void getLabResult_existing_returnsResponse() {
    var resultId = UUID.randomUUID();
    var entity = buildLabResult(resultId);
    when(labResultRepository.findByIdAndDeletedFalse(resultId)).thenReturn(Optional.of(entity));

    var response = service.getLabResult(resultId);

    assertThat(response.id()).isEqualTo(resultId);
    assertThat(response.testName()).isEqualTo("Blood Glucose");
  }

  @Test
  void getLabResult_notFound_throwsNotFound() {
    var resultId = UUID.randomUUID();
    when(labResultRepository.findByIdAndDeletedFalse(resultId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> service.getLabResult(resultId))
        .isInstanceOf(NotFoundException.class);
  }

  @Test
  void getLabResultsByAppointment_returnsListSortedByCreatedAt() {
    var appointmentId = UUID.randomUUID();
    var result1 = buildLabResult(UUID.randomUUID());
    var result2 = buildLabResult(UUID.randomUUID());
    when(labResultRepository.findByAppointmentIdAndDeletedFalseOrderByCreatedAtDesc(appointmentId))
        .thenReturn(List.of(result1, result2));

    var responses = service.getLabResultsByAppointment(appointmentId);

    assertThat(responses).hasSize(2);
  }

  @Test
  void deleteLabResult_existing_softDeletes() {
    var resultId = UUID.randomUUID();
    var entity = buildLabResult(resultId);
    when(labResultRepository.findByIdAndDeletedFalse(resultId)).thenReturn(Optional.of(entity));

    service.deleteLabResult(resultId);

    assertThat(entity.isDeleted()).isTrue();
  }

  @Test
  void deleteLabResult_notFound_throwsNotFound() {
    var resultId = UUID.randomUUID();
    when(labResultRepository.findByIdAndDeletedFalse(resultId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> service.deleteLabResult(resultId))
        .isInstanceOf(NotFoundException.class);
  }

  private LabResultEntity buildLabResult(UUID id) {
    var appointment = new AppointmentEntity();
    appointment.setId(UUID.randomUUID());
    appointment.setPatient(new PatientEntity());

    var entity = new LabResultEntity();
    entity.setId(id);
    entity.setPatient(appointment.getPatient());
    entity.setAppointment(appointment);
    entity.setTestName("Blood Glucose");
    entity.setResultValue("95 mg/dL");
    entity.setReferenceRange("70-100 mg/dL");
    entity.setStatus("COMPLETED");
    entity.setNotes("Fasting test");
    entity.setDeleted(false);
    entity.setCreatedAt(Instant.now());
    entity.setUpdatedAt(Instant.now());
    return entity;
  }
}
