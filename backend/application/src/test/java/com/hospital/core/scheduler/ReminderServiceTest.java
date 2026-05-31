package com.hospital.core.scheduler;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.hospital.core.appointment.AppointmentEntity;
import com.hospital.core.email.EmailService;
import com.hospital.core.medicalrecord.MedicalRecordEntity;
import com.hospital.core.medicalrecord.MedicalRecordRepository;
import com.hospital.core.patient.PatientEntity;
import com.hospital.core.user.UserEntity;
import com.hospital.shared.enums.UserRole;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ReminderServiceTest {
  @Mock
  private MedicalRecordRepository medicalRecordRepository;

  @Mock
  private EmailService emailService;

  private ReminderService reminderService;

  @BeforeEach
  void setUp() {
    var clock = Clock.fixed(Instant.parse("2026-03-15T04:30:00Z"), ZoneId.of("UTC"));
    reminderService = new ReminderService(medicalRecordRepository, emailService, clock);
  }

  @Test
  void plansReminderForEightAmAsiaSaigon() {
    var record = record(LocalDate.of(2026, 3, 16));

    reminderService.planReminder(record);

    assertThat(record.getReminderScheduledAt()).isEqualTo(Instant.parse("2026-03-16T01:00:00Z"));
    assertThat(record.isReminderSent()).isFalse();
    assertThat(record.getReminderSentAt()).isNull();
  }

  @Test
  void sendsImmediatelyWhenFollowUpDateIsTodayAfterEightAm() {
    var record = record(LocalDate.of(2026, 3, 15));
    when(emailService.sendFollowUpReminder("patient@example.com", "Nguyen Van Test", LocalDate.of(2026, 3, 15), "Dr. Test"))
        .thenReturn(true);
    reminderService.planReminder(record);

    reminderService.sendReminderIfDue(record);

    assertThat(record.isReminderSent()).isTrue();
    assertThat(record.getReminderSentAt()).isEqualTo(Instant.parse("2026-03-15T04:30:00Z"));
    verify(emailService).sendFollowUpReminder(
        "patient@example.com",
        "Nguyen Van Test",
        LocalDate.of(2026, 3, 15),
        "Dr. Test");
  }

  @Test
  void dispatchesOnlyDueUnsentReminders() {
    var record = record(LocalDate.of(2026, 3, 15));
    record.setReminderScheduledAt(Instant.parse("2026-03-15T01:00:00Z"));
    when(medicalRecordRepository.findByReminderSentFalseAndReminderScheduledAtLessThanEqualOrderByReminderScheduledAtAsc(any()))
        .thenReturn(List.of(record));
    when(emailService.sendFollowUpReminder("patient@example.com", "Nguyen Van Test", LocalDate.of(2026, 3, 15), "Dr. Test"))
        .thenReturn(true);

    var sentCount = reminderService.dispatchDueReminders();

    assertThat(sentCount).isEqualTo(1);
    assertThat(record.isReminderSent()).isTrue();
    verify(emailService).sendFollowUpReminder(
        "patient@example.com",
        "Nguyen Van Test",
        LocalDate.of(2026, 3, 15),
        "Dr. Test");
  }

  @Test
  void keepsReminderPendingWhenDeliveryFailsForRetry() {
    var record = record(LocalDate.of(2026, 3, 15));
    reminderService.planReminder(record);
    when(emailService.sendFollowUpReminder("patient@example.com", "Nguyen Van Test", LocalDate.of(2026, 3, 15), "Dr. Test"))
        .thenReturn(false);

    var sent = reminderService.sendReminderIfDue(record);

    assertThat(sent).isFalse();
    assertThat(record.isReminderSent()).isFalse();
    assertThat(record.getReminderSentAt()).isNull();
  }

  @Test
  void skipsPlaceholderAddressesWithoutSendingEmail() {
    var record = record(LocalDate.of(2026, 3, 15));
    record.getAppointment().getPatient().setEmail("auto-012345678901@pending.local");
    reminderService.planReminder(record);

    var sent = reminderService.sendReminderIfDue(record);

    assertThat(sent).isFalse();
    assertThat(record.isReminderSent()).isTrue();
    verify(emailService, never()).sendFollowUpReminder(any(), any(), any(), any());
  }

  private MedicalRecordEntity record(LocalDate followUpDate) {
    var patient = new PatientEntity();
    patient.setId(UUID.randomUUID());
    patient.setFullName("Nguyen Van Test");
    patient.setEmail("patient@example.com");

    var doctor = new UserEntity();
    doctor.setId(UUID.randomUUID());
    doctor.setFullName("Dr. Test");
    doctor.setRole(UserRole.DOCTOR);

    var appointment = new AppointmentEntity();
    appointment.setId(UUID.randomUUID());
    appointment.setPatient(patient);
    appointment.setDoctor(doctor);

    var record = new MedicalRecordEntity();
    record.setId(UUID.randomUUID());
    record.setAppointment(appointment);
    record.setFollowUpDate(followUpDate);
    return record;
  }
}
