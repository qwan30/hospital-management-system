package com.hospital.core.appointment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.hospital.core.common.ConflictException;
import com.hospital.core.email.EmailService;
import com.hospital.core.patient.PatientIdentifierProtector;
import com.hospital.core.patient.PatientRepository;
import com.hospital.core.timeslot.TimeSlotEntity;
import com.hospital.core.timeslot.TimeSlotRepository;
import com.hospital.core.user.UserEntity;
import com.hospital.core.user.UserRepository;
import com.hospital.shared.booking.AppointmentCreateRequest;
import com.hospital.shared.booking.PatientAddressRequest;
import com.hospital.shared.enums.Gender;
import com.hospital.shared.enums.SlotStatus;
import com.hospital.shared.enums.UserRole;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AppointmentWriteServiceTest {
  @Mock
  private AppointmentRepository appointmentRepository;

  @Mock
  private PatientRepository patientRepository;

  @Mock
  private PatientIdentifierProtector patientIdentifierProtector;

  @Mock
  private TimeSlotRepository timeSlotRepository;

  @Mock
  private UserRepository userRepository;

  @Mock
  private EmailService emailService;

  @InjectMocks
  private AppointmentWriteService appointmentWriteService;

  @Test
  void createsAppointmentAndBooksRequiredSlots() {
    var doctor = new UserEntity();
    doctor.setId(UUID.randomUUID());
    doctor.setRole(UserRole.DOCTOR);

    var firstSlot = slot(doctor, LocalTime.of(8, 0), LocalTime.of(8, 30), SlotStatus.AVAILABLE);
    var secondSlot = slot(doctor, LocalTime.of(8, 30), LocalTime.of(9, 0), SlotStatus.AVAILABLE);

    when(userRepository.findByIdAndRoleAndActiveTrue(doctor.getId(), UserRole.DOCTOR)).thenReturn(Optional.of(doctor));
    when(timeSlotRepository.findByIdForUpdate(firstSlot.getId())).thenReturn(Optional.of(firstSlot));
    when(timeSlotRepository.lockWindow(doctor.getId(), firstSlot.getSlotDate(), firstSlot.getStartTime()))
        .thenReturn(List.of(firstSlot, secondSlot));
    when(patientIdentifierProtector.encrypt(org.mockito.ArgumentMatchers.anyString())).thenAnswer(invocation -> invocation.getArgument(0));
    when(patientIdentifierProtector.hash(org.mockito.ArgumentMatchers.anyString())).thenReturn("hashed-cccd");
    when(patientRepository.save(any())).thenAnswer(invocation -> {
      var patient = invocation.getArgument(0, com.hospital.core.patient.PatientEntity.class);
      patient.setId(UUID.randomUUID());
      return patient;
    });
    when(appointmentRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

    var response = appointmentWriteService.createAppointment(request(doctor.getId(), firstSlot.getId(), 60));

    assertThat(response.doctorId()).isEqualTo(doctor.getId());
    assertThat(response.status().name()).isEqualTo("CONFIRMED");
    assertThat(firstSlot.getStatus()).isEqualTo(SlotStatus.BOOKED);
    assertThat(secondSlot.getStatus()).isEqualTo(SlotStatus.BOOKED);
    assertThat(response.patientId()).isNotNull();
    verify(appointmentRepository).save(any());
    verify(patientRepository).save(any());
    verify(emailService).sendAppointmentConfirmation("nguyen.thi.test@example.com", response.confirmationCode());
  }

  @Test
  void rejectsNonContiguousSlotWindow() {
    var doctor = new UserEntity();
    doctor.setId(UUID.randomUUID());
    doctor.setRole(UserRole.DOCTOR);

    var firstSlot = slot(doctor, LocalTime.of(8, 0), LocalTime.of(8, 30), SlotStatus.AVAILABLE);
    var brokenSlot = slot(doctor, LocalTime.of(9, 0), LocalTime.of(9, 30), SlotStatus.AVAILABLE);

    when(userRepository.findByIdAndRoleAndActiveTrue(doctor.getId(), UserRole.DOCTOR)).thenReturn(Optional.of(doctor));
    when(timeSlotRepository.findByIdForUpdate(firstSlot.getId())).thenReturn(Optional.of(firstSlot));
    when(timeSlotRepository.lockWindow(doctor.getId(), firstSlot.getSlotDate(), firstSlot.getStartTime()))
        .thenReturn(List.of(firstSlot, brokenSlot));

    assertThatThrownBy(() -> appointmentWriteService.createAppointment(request(doctor.getId(), firstSlot.getId(), 60)))
        .isInstanceOf(ConflictException.class);
  }

  private AppointmentCreateRequest request(UUID doctorId, UUID firstSlotId, int durationMinutes) {
    return new AppointmentCreateRequest(
        doctorId,
        firstSlotId,
        durationMinutes,
        "Nguyen Thi Test",
        "012345678901",
        "nguyen.thi.test@example.com",
        "0900000000",
        LocalDate.of(1995, 1, 1),
        Gender.FEMALE,
        new PatientAddressRequest("Ho Chi Minh City", "District 1", "123 Example Street"),
        "Teacher",
        "O+",
        "Seasonal allergies",
        "Penicillin",
        "BHYT-1234567890",
        null,
        "dau dau va sot");
  }

  private TimeSlotEntity slot(UserEntity doctor, LocalTime startTime, LocalTime endTime, SlotStatus status) {
    var slot = new TimeSlotEntity();
    slot.setId(UUID.randomUUID());
    slot.setDoctor(doctor);
    slot.setSlotDate(LocalDate.of(2026, 3, 16));
    slot.setStartTime(startTime);
    slot.setEndTime(endTime);
    slot.setStatus(status);
    return slot;
  }
}
