package com.hospital.core.appointment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.hospital.core.patient.PatientEntity;
import com.hospital.core.patient.PatientIdentifierProtector;
import com.hospital.core.timeslot.TimeSlotEntity;
import com.hospital.core.user.UserEntity;
import com.hospital.core.user.UserRepository;
import com.hospital.shared.appointment.AppointmentDetailResponse;
import com.hospital.shared.enums.AppointmentStatus;
import com.hospital.shared.enums.Gender;
import com.hospital.shared.enums.UserRole;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

@ExtendWith(MockitoExtension.class)
class AppointmentWorkflowServiceTest {
  @Mock
  private AppointmentRepository appointmentRepository;

  @Mock
  private PatientIdentifierProtector patientIdentifierProtector;

  @Mock
  private UserRepository userRepository;

  @InjectMocks
  private AppointmentWorkflowService appointmentWorkflowService;

  @Test
  void rejectsDoctorStatusUpdateForAnotherDoctorsAppointment() {
    var doctor = doctor("doctor1@hospital.vn");
    var otherDoctorId = UUID.randomUUID();
    var appointment = appointment(doctor, AppointmentStatus.CHECKED_IN, LocalTime.of(8, 0));

    when(appointmentRepository.findDetailedById(appointment.getId())).thenReturn(Optional.of(appointment));

    assertThatThrownBy(() -> appointmentWorkflowService.updateAppointmentStatus(
        otherDoctorId,
        appointment.getId(),
        AppointmentStatus.IN_PROGRESS))
        .isInstanceOf(AccessDeniedException.class);
  }

  @Test
  void rejectsInvalidDoctorStatusTransition() {
    var doctor = doctor("doctor1@hospital.vn");
    var appointment = appointment(doctor, AppointmentStatus.CONFIRMED, LocalTime.of(8, 0));

    when(appointmentRepository.findDetailedById(appointment.getId())).thenReturn(Optional.of(appointment));

    assertThatThrownBy(() -> appointmentWorkflowService.updateAppointmentStatus(
        doctor.getId(),
        appointment.getId(),
        AppointmentStatus.DONE))
        .hasMessageContaining("Invalid appointment status transition");
  }

  @Test
  void rejectsDoctorTransitionFromInProgressToDone() {
    var doctor = doctor("doctor1@hospital.vn");
    var appointment = appointment(doctor, AppointmentStatus.IN_PROGRESS, LocalTime.of(8, 0));

    when(appointmentRepository.findDetailedById(appointment.getId())).thenReturn(Optional.of(appointment));

    assertThatThrownBy(() -> appointmentWorkflowService.updateAppointmentStatus(
        doctor.getId(),
        appointment.getId(),
        AppointmentStatus.DONE))
        .hasMessageContaining("Invalid appointment status transition");
  }

  @Test
  void ordersQueueByCheckInTimeThenSlotStart() {
    var doctor = doctor("doctor1@hospital.vn");
    var laterCheckedIn = appointment(doctor, AppointmentStatus.CHECKED_IN, LocalTime.of(8, 0));
    laterCheckedIn.setCheckedInAt(LocalDateTime.of(2026, 3, 16, 8, 15));

    var earlierCheckedIn = appointment(doctor, AppointmentStatus.CHECKED_IN, LocalTime.of(8, 30));
    earlierCheckedIn.setCheckedInAt(LocalDateTime.of(2026, 3, 16, 8, 5));

    when(appointmentRepository.findByAppointmentDateAndStatusInOrderByCheckedInAtAscFirstSlotStartTimeAsc(
        LocalDate.of(2026, 3, 16),
        List.of(AppointmentStatus.CHECKED_IN, AppointmentStatus.IN_PROGRESS)))
        .thenReturn(List.of(laterCheckedIn, earlierCheckedIn));
    when(patientIdentifierProtector.decrypt("012345678901")).thenReturn("012345678901");

    var queue = appointmentWorkflowService.listQueueForDate(LocalDate.of(2026, 3, 16));

    assertThat(queue).extracting(item -> item.appointmentId()).containsExactly(earlierCheckedIn.getId(), laterCheckedIn.getId());
  }

  @Test
  void returnsAppointmentDetailForOwningDoctor() {
    var doctor = doctor("doctor1@hospital.vn");
    var appointment = appointment(doctor, AppointmentStatus.CHECKED_IN, LocalTime.of(8, 0));
    when(appointmentRepository.findDetailedById(appointment.getId())).thenReturn(Optional.of(appointment));
    when(patientIdentifierProtector.decrypt("012345678901")).thenReturn("012345678901");

    AppointmentDetailResponse detail = appointmentWorkflowService.getAppointmentDetail(doctor.getId(), appointment.getId());

    assertThat(detail.appointmentId()).isEqualTo(appointment.getId());
    assertThat(detail.patientEmail()).isEqualTo("patient.test@example.com");
    assertThat(detail.aiDurationMinutes()).isEqualTo(30);
  }

  private UserEntity doctor(String email) {
    var doctor = new UserEntity();
    doctor.setId(UUID.randomUUID());
    doctor.setEmail(email);
    doctor.setFullName("Dr. Test");
    doctor.setRole(UserRole.DOCTOR);
    return doctor;
  }

  private AppointmentEntity appointment(UserEntity doctor, AppointmentStatus status, LocalTime startTime) {
    var patient = new PatientEntity();
    patient.setId(UUID.randomUUID());
    patient.setFullName("Patient Test");
    patient.setEmail("patient.test@example.com");
    patient.setPhone("0900000000");
    patient.setCccd("012345678901");
    patient.setDateOfBirth(LocalDate.of(1990, 1, 1));
    patient.setGender(Gender.OTHER);

    var slot = new TimeSlotEntity();
    slot.setId(UUID.randomUUID());
    slot.setDoctor(doctor);
    slot.setSlotDate(LocalDate.of(2026, 3, 16));
    slot.setStartTime(startTime);
    slot.setEndTime(startTime.plusMinutes(30));

    var appointment = new AppointmentEntity();
    appointment.setId(UUID.randomUUID());
    appointment.setDoctor(doctor);
    appointment.setPatient(patient);
    appointment.setFirstSlot(slot);
    appointment.setAppointmentDate(slot.getSlotDate());
    appointment.setAiDurationMinutes(30);
    appointment.setConfirmationCode("HMS-TEST");
    appointment.setStatus(status);
    return appointment;
  }
}
