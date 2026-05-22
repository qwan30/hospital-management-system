package com.hospital.core.appointment;

import com.hospital.core.common.ConflictException;
import com.hospital.core.common.NotFoundException;
import com.hospital.core.audit.AuditLogService;
import com.hospital.core.patient.PatientEntity;
import com.hospital.core.patient.PatientIdentifierProtector;
import com.hospital.core.timeslot.TimeSlotEntity;
import com.hospital.core.user.UserEntity;
import com.hospital.core.user.UserRepository;
import com.hospital.shared.appointment.AppointmentUpdateRequest;
import com.hospital.shared.appointment.AppointmentVitalSignsRequest;
import com.hospital.shared.appointment.FollowUpRequest;
import com.hospital.shared.enums.AppointmentStatus;
import com.hospital.shared.enums.UserRole;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentWorkflowServiceTest {

  @Mock private AppointmentRepository appointmentRepository;
  @Mock private AppointmentVitalSignsRepository vitalSignsRepository;
  @Mock private FollowUpRepository followUpRepository;
  @Mock private PatientIdentifierProtector patientIdentifierProtector;
  @Mock private UserRepository userRepository;
  @Mock private AuditLogService auditLogService;
  @Mock private EntityManager entityManager;
  @Mock private TypedQuery<AppointmentEntity> appointmentQuery;
  @Mock private TypedQuery<Long> appointmentCountQuery;

  @InjectMocks private AppointmentWorkflowService service;

  private AppointmentEntity sampleAppointment;
  private UUID appointmentId;
  private UUID doctorId;
  private UUID patientId;

  @BeforeEach
  void setUp() {
    appointmentId = UUID.randomUUID();
    doctorId = UUID.randomUUID();
    patientId = UUID.randomUUID();

    var doctor = new UserEntity();
    doctor.setId(doctorId);
    doctor.setFullName("Dr. Tran Van");
    doctor.setRole(UserRole.DOCTOR);

    var patient = new PatientEntity();
    patient.setId(patientId);
    patient.setFullName("Nguyen Van A");
    patient.setPhone("0901234567");
    patient.setCccd("encrypted-cccd");

    var slot = new TimeSlotEntity();
    slot.setStartTime(LocalTime.of(9, 0));
    slot.setEndTime(LocalTime.of(9, 30));

    sampleAppointment = new AppointmentEntity();
    sampleAppointment.setId(appointmentId);
    sampleAppointment.setDoctor(doctor);
    sampleAppointment.setPatient(patient);
    sampleAppointment.setFirstSlot(slot);
    sampleAppointment.setAppointmentDate(LocalDate.of(2026, 4, 15));
    sampleAppointment.setStatus(AppointmentStatus.CONFIRMED);
    sampleAppointment.setConfirmationCode("CONF-123");
    sampleAppointment.setCreatedAt(Instant.now());
  }

  @Nested
  class ListAppointments {
    @Test
    void shouldReturnPaginatedAppointments() {
      mockAppointmentSearch(List.of(sampleAppointment), 1L);

      var result = service.listAppointments(null, null, null, 0, 20);
      assertThat(result.getContent()).hasSize(1);
      assertThat(result.getContent().get(0).appointmentId()).isEqualTo(appointmentId);
      assertThat(result.getContent().get(0).doctorName()).isEqualTo("Dr. Tran Van");
    }

    @Test
    void shouldFilterByStatus() {
      mockAppointmentSearch(List.of(sampleAppointment), 1L);

      var result = service.listAppointments(AppointmentStatus.CONFIRMED, null, null, 0, 10);
      assertThat(result.getContent()).hasSize(1);
      verify(appointmentQuery).setParameter("status", AppointmentStatus.CONFIRMED);
      verify(appointmentCountQuery).setParameter("status", AppointmentStatus.CONFIRMED);
    }
  }

  private void mockAppointmentSearch(List<AppointmentEntity> appointments, long total) {
    when(entityManager.createQuery(startsWith("select appointment from AppointmentEntity appointment"), eq(AppointmentEntity.class)))
        .thenReturn(appointmentQuery);
    when(entityManager.createQuery(startsWith("select count(appointment) from AppointmentEntity appointment"), eq(Long.class)))
        .thenReturn(appointmentCountQuery);
    lenient().when(appointmentQuery.setParameter(anyString(), any())).thenReturn(appointmentQuery);
    lenient().when(appointmentCountQuery.setParameter(anyString(), any())).thenReturn(appointmentCountQuery);
    when(appointmentQuery.setFirstResult(anyInt())).thenReturn(appointmentQuery);
    when(appointmentQuery.setMaxResults(anyInt())).thenReturn(appointmentQuery);
    when(appointmentQuery.getResultList()).thenReturn(appointments);
    when(appointmentCountQuery.getSingleResult()).thenReturn(total);
  }

  @Nested
  class CancelAppointment {
    @Test
    void shouldCancelConfirmedAppointment() {
      when(appointmentRepository.findDetailedById(appointmentId))
          .thenReturn(Optional.of(sampleAppointment));

      service.cancelAppointment(appointmentId);

      assertThat(sampleAppointment.getStatus()).isEqualTo(AppointmentStatus.CANCELLED);
    }

    @Test
    void shouldThrowWhenAppointmentNotFound() {
      when(appointmentRepository.findDetailedById(appointmentId))
          .thenReturn(Optional.empty());

      assertThatThrownBy(() -> service.cancelAppointment(appointmentId))
          .isInstanceOf(NotFoundException.class)
          .hasMessage("Appointment not found");
    }

    @Test
    void shouldThrowWhenAlreadyCancelled() {
      sampleAppointment.setStatus(AppointmentStatus.CANCELLED);
      when(appointmentRepository.findDetailedById(appointmentId))
          .thenReturn(Optional.of(sampleAppointment));

      assertThatThrownBy(() -> service.cancelAppointment(appointmentId))
          .isInstanceOf(ConflictException.class)
          .hasMessageContaining("Cannot cancel");
    }

    @Test
    void shouldThrowWhenAlreadyDone() {
      sampleAppointment.setStatus(AppointmentStatus.DONE);
      when(appointmentRepository.findDetailedById(appointmentId))
          .thenReturn(Optional.of(sampleAppointment));

      assertThatThrownBy(() -> service.cancelAppointment(appointmentId))
          .isInstanceOf(ConflictException.class);
    }
  }

  @Nested
  class UpdateAppointmentMeta {
    @Test
    void shouldUpdateNotesAndReason() {
      when(appointmentRepository.findDetailedById(appointmentId))
          .thenReturn(Optional.of(sampleAppointment));
      when(patientIdentifierProtector.decrypt(any())).thenReturn("123456789012");

      var request = new AppointmentUpdateRequest("Updated notes", "Urgent visit");
      var result = service.updateAppointmentMeta(appointmentId, request);

      assertThat(sampleAppointment.getNotes()).isEqualTo("Updated notes");
      assertThat(sampleAppointment.getReason()).isEqualTo("Urgent visit");
      assertThat(result.appointmentId()).isEqualTo(appointmentId);
    }

    @Test
    void shouldUpdateOnlyNonNullFields() {
      sampleAppointment.setNotes("Original notes");
      sampleAppointment.setReason("Original reason");
      when(appointmentRepository.findDetailedById(appointmentId))
          .thenReturn(Optional.of(sampleAppointment));
      when(patientIdentifierProtector.decrypt(any())).thenReturn("123456789012");

      var request = new AppointmentUpdateRequest("New notes", null);
      service.updateAppointmentMeta(appointmentId, request);

      assertThat(sampleAppointment.getNotes()).isEqualTo("New notes");
      assertThat(sampleAppointment.getReason()).isEqualTo("Original reason");
    }

    @Test
    void shouldThrowWhenAppointmentNotFound() {
      when(appointmentRepository.findDetailedById(appointmentId))
          .thenReturn(Optional.empty());

      assertThatThrownBy(() -> service.updateAppointmentMeta(appointmentId,
          new AppointmentUpdateRequest("notes", null)))
          .isInstanceOf(NotFoundException.class);
    }
  }

  @Nested
  class RecordVitalSigns {
    @Test
    void shouldRecordVitalSigns() {
      when(appointmentRepository.findDetailedById(appointmentId))
          .thenReturn(Optional.of(sampleAppointment));
      when(vitalSignsRepository.existsByAppointmentId(appointmentId)).thenReturn(false);
      when(vitalSignsRepository.save(any())).thenAnswer(invocation -> {
        var entity = invocation.getArgument(0, AppointmentVitalSignsEntity.class);
        entity.setId(UUID.randomUUID());
        entity.setRecordedAt(Instant.now());
        return entity;
      });

      var request = new AppointmentVitalSignsRequest(
          "120/80", 36.5, 70.0, 170.0, 75, 16, 98.0);
      var result = service.recordVitalSigns(appointmentId, request);

      assertThat(result).isNotNull();
      assertThat(result.bloodPressure()).isEqualTo("120/80");
      assertThat(result.temperature()).isEqualTo(36.5);
      assertThat(result.heartRate()).isEqualTo(75);
      verify(vitalSignsRepository).save(any());
    }

    @Test
    void shouldThrowWhenAlreadyRecorded() {
      when(appointmentRepository.findDetailedById(appointmentId))
          .thenReturn(Optional.of(sampleAppointment));
      when(vitalSignsRepository.existsByAppointmentId(appointmentId)).thenReturn(true);

      assertThatThrownBy(() -> service.recordVitalSigns(appointmentId,
          new AppointmentVitalSignsRequest("120/80", 36.5, 70.0, 170.0, 75, 16, 98.0)))
          .isInstanceOf(ConflictException.class)
          .hasMessageContaining("already recorded");
    }
  }

  @Nested
  class GetVitalSigns {
    @Test
    void shouldReturnVitalSigns() {
      var entity = new AppointmentVitalSignsEntity();
      entity.setId(UUID.randomUUID());
      entity.setAppointment(sampleAppointment);
      entity.setBloodPressure("130/85");
      entity.setTemperature(BigDecimal.valueOf(37.2));
      entity.setWeight(BigDecimal.valueOf(65.0));
      entity.setHeight(BigDecimal.valueOf(165.0));
      entity.setHeartRate(72);
      entity.setRespiratoryRate(18);
      entity.setOxygenSaturation(BigDecimal.valueOf(97.5));
      entity.setRecordedAt(Instant.now());

      when(vitalSignsRepository.findByAppointmentId(appointmentId))
          .thenReturn(Optional.of(entity));

      var result = service.getVitalSigns(appointmentId);
      assertThat(result.bloodPressure()).isEqualTo("130/85");
      assertThat(result.heartRate()).isEqualTo(72);
    }

    @Test
    void shouldThrowWhenNotFound() {
      when(vitalSignsRepository.findByAppointmentId(appointmentId))
          .thenReturn(Optional.empty());

      assertThatThrownBy(() -> service.getVitalSigns(appointmentId))
          .isInstanceOf(NotFoundException.class);
    }
  }

  @Nested
  class CreateFollowUp {
    @Test
    void shouldCreateFollowUp() {
      when(appointmentRepository.findDetailedById(appointmentId))
          .thenReturn(Optional.of(sampleAppointment));
      when(followUpRepository.existsByParentAppointmentId(appointmentId)).thenReturn(false);
      when(followUpRepository.save(any())).thenAnswer(invocation -> {
        var entity = invocation.getArgument(0, FollowUpEntity.class);
        entity.setId(UUID.randomUUID());
        entity.setCreatedAt(Instant.now());
        return entity;
      });

      var request = new FollowUpRequest(LocalDate.of(2026, 5, 15), "Check healing progress");
      var result = service.createFollowUp(appointmentId, request);

      assertThat(result.parentAppointmentId()).isEqualTo(appointmentId);
      assertThat(result.followUpDate()).isEqualTo(LocalDate.of(2026, 5, 15));
      assertThat(result.reason()).isEqualTo("Check healing progress");
    }

    @Test
    void shouldThrowWhenFollowUpAlreadyExists() {
      when(appointmentRepository.findDetailedById(appointmentId))
          .thenReturn(Optional.of(sampleAppointment));
      when(followUpRepository.existsByParentAppointmentId(appointmentId)).thenReturn(true);

      assertThatThrownBy(() -> service.createFollowUp(appointmentId,
          new FollowUpRequest(LocalDate.of(2026, 5, 15), null)))
          .isInstanceOf(ConflictException.class)
          .hasMessageContaining("already exists");
    }
  }

  @Nested
  class GetFollowUp {
    @Test
    void shouldReturnFollowUp() {
      var entity = new FollowUpEntity();
      entity.setId(UUID.randomUUID());
      entity.setParentAppointment(sampleAppointment);
      entity.setFollowUpDate(LocalDate.of(2026, 5, 20));
      entity.setReason("Recovery review");

      when(followUpRepository.findByParentAppointmentId(appointmentId))
          .thenReturn(Optional.of(entity));

      var result = service.getFollowUp(appointmentId);
      assertThat(result.followUpDate()).isEqualTo(LocalDate.of(2026, 5, 20));
      assertThat(result.reason()).isEqualTo("Recovery review");
    }

    @Test
    void shouldThrowWhenNoFollowUp() {
      when(followUpRepository.findByParentAppointmentId(appointmentId))
          .thenReturn(Optional.empty());

      assertThatThrownBy(() -> service.getFollowUp(appointmentId))
          .isInstanceOf(NotFoundException.class);
    }
  }

  @Nested
  class CheckInAppointment {
    @Test
    void shouldCheckInConfirmedAppointment() {
      when(appointmentRepository.findDetailedById(appointmentId))
          .thenReturn(Optional.of(sampleAppointment));
      when(patientIdentifierProtector.decrypt(any())).thenReturn("123456789012");

      var now = LocalDateTime.now();
      var result = service.checkInAppointment(appointmentId, now);

      assertThat(result.status()).isEqualTo(AppointmentStatus.CHECKED_IN);
      assertThat(sampleAppointment.getCheckedInAt()).isEqualTo(now);
    }

    @Test
    void shouldThrowWhenNotConfirmed() {
      sampleAppointment.setStatus(AppointmentStatus.CHECKED_IN);
      when(appointmentRepository.findDetailedById(appointmentId))
          .thenReturn(Optional.of(sampleAppointment));

      assertThatThrownBy(() -> service.checkInAppointment(appointmentId, LocalDateTime.now()))
          .isInstanceOf(ConflictException.class);
    }
  }

  @Nested
  class QueueActions {
    @Test
    void shouldCallPatientAndRecordAuditTrail() {
      sampleAppointment.setStatus(AppointmentStatus.CHECKED_IN);
      when(appointmentRepository.findDetailedById(appointmentId))
          .thenReturn(Optional.of(sampleAppointment));
      when(patientIdentifierProtector.decrypt(any())).thenReturn("123456789012");

      var result = service.callQueuePatient(appointmentId);

      assertThat(result.status()).isEqualTo(AppointmentStatus.CHECKED_IN);
      verify(auditLogService).record(eq("QUEUE_CALL_PATIENT"), eq("APPOINTMENT"), eq(appointmentId), anyMap());
    }

    @Test
    void shouldSkipPatientToBackOfReadyQueueAndRecordAuditTrail() {
      sampleAppointment.setStatus(AppointmentStatus.CHECKED_IN);
      when(appointmentRepository.findDetailedById(appointmentId))
          .thenReturn(Optional.of(sampleAppointment));
      when(patientIdentifierProtector.decrypt(any())).thenReturn("123456789012");

      var skippedAt = LocalDateTime.of(2026, 4, 26, 10, 15);
      var result = service.skipQueuePatient(appointmentId, skippedAt);

      assertThat(result.checkedInAt()).isEqualTo(skippedAt);
      verify(auditLogService).record(eq("QUEUE_SKIP_PATIENT"), eq("APPOINTMENT"), eq(appointmentId), anyMap());
    }

    @Test
    void shouldAssignRoomInNotesAndRecordAuditTrail() {
      sampleAppointment.setStatus(AppointmentStatus.CHECKED_IN);
      when(appointmentRepository.findDetailedById(appointmentId))
          .thenReturn(Optional.of(sampleAppointment));
      when(patientIdentifierProtector.decrypt(any())).thenReturn("123456789012");

      service.assignQueueRoom(appointmentId, "Consult 2");

      assertThat(sampleAppointment.getNotes()).contains("Consult 2");
      verify(auditLogService).record(eq("QUEUE_ASSIGN_ROOM"), eq("APPOINTMENT"), eq(appointmentId), anyMap());
    }

    @Test
    void shouldMarkInConsultationFromCheckedInAndRecordAuditTrail() {
      sampleAppointment.setStatus(AppointmentStatus.CHECKED_IN);
      when(appointmentRepository.findDetailedById(appointmentId))
          .thenReturn(Optional.of(sampleAppointment));
      when(patientIdentifierProtector.decrypt(any())).thenReturn("123456789012");

      var result = service.markInConsultation(appointmentId);

      assertThat(result.status()).isEqualTo(AppointmentStatus.IN_PROGRESS);
      verify(auditLogService).record(eq("QUEUE_START_CONSULTATION"), eq("APPOINTMENT"), eq(appointmentId), anyMap());
    }

    @Test
    void shouldCompleteVisitFromInProgressAndRecordAuditTrail() {
      sampleAppointment.setStatus(AppointmentStatus.IN_PROGRESS);
      when(appointmentRepository.findDetailedById(appointmentId))
          .thenReturn(Optional.of(sampleAppointment));
      when(patientIdentifierProtector.decrypt(any())).thenReturn("123456789012");

      var result = service.completeQueueVisit(appointmentId);

      assertThat(result.status()).isEqualTo(AppointmentStatus.DONE);
      verify(auditLogService).record(eq("QUEUE_COMPLETE_VISIT"), eq("APPOINTMENT"), eq(appointmentId), anyMap());
    }

    @Test
    void shouldRejectCompletingVisitBeforeConsultationStarts() {
      sampleAppointment.setStatus(AppointmentStatus.CHECKED_IN);
      when(appointmentRepository.findDetailedById(appointmentId))
          .thenReturn(Optional.of(sampleAppointment));

      assertThatThrownBy(() -> service.completeQueueVisit(appointmentId))
          .isInstanceOf(ConflictException.class)
          .hasMessageContaining("in consultation");
    }
  }
}
