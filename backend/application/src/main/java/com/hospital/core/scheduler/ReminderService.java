package com.hospital.core.scheduler;

import com.hospital.core.email.EmailService;
import com.hospital.core.medicalrecord.MedicalRecordEntity;
import com.hospital.core.medicalrecord.MedicalRecordRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReminderService {
  private static final Logger LOGGER = LoggerFactory.getLogger(ReminderService.class);
  private static final ZoneId HOSPITAL_ZONE = ZoneId.of("Asia/Saigon");
  private static final LocalTime DEFAULT_REMINDER_TIME = LocalTime.of(8, 0);

  private final MedicalRecordRepository medicalRecordRepository;
  private final EmailService emailService;
  private final Clock clock;

  public ReminderService(
      MedicalRecordRepository medicalRecordRepository,
      EmailService emailService,
      Clock clock) {
    this.medicalRecordRepository = medicalRecordRepository;
    this.emailService = emailService;
    this.clock = clock;
  }

  public void planReminder(MedicalRecordEntity record) {
    if (record.getFollowUpDate() == null) {
      record.setReminderScheduledAt(null);
      record.setReminderSent(false);
      record.setReminderSentAt(null);
      return;
    }

    var now = nowInHospitalZone();
    var reminderAt = record.getFollowUpDate().atTime(DEFAULT_REMINDER_TIME).atZone(HOSPITAL_ZONE);
    if (!record.getFollowUpDate().isAfter(now.toLocalDate())
        && !now.toLocalTime().isBefore(DEFAULT_REMINDER_TIME)) {
      reminderAt = now;
    }

    record.setReminderScheduledAt(reminderAt.toInstant());
    record.setReminderSent(false);
    record.setReminderSentAt(null);
  }

  public boolean sendReminderIfDue(MedicalRecordEntity record) {
    if (record.getFollowUpDate() == null
        || record.isReminderSent()
        || record.getReminderScheduledAt() == null
        || record.getReminderScheduledAt().isAfter(clock.instant())) {
      return false;
    }

    return sendReminder(record);
  }

  @Scheduled(cron = "${hms.reminders.cron:0 */15 * * * *}", zone = "Asia/Saigon")
  @Transactional
  public int dispatchDueReminders() {
    var records = medicalRecordRepository
        .findByReminderSentFalseAndReminderScheduledAtLessThanEqualOrderByReminderScheduledAtAsc(clock.instant());
    var sentCount = 0;
    for (var record : records) {
      if (sendReminder(record)) {
        sentCount++;
      }
    }
    return sentCount;
  }

  private boolean sendReminder(MedicalRecordEntity record) {
    var recipient = record.getAppointment().getPatient().getEmail();
    if (!isDeliverableEmail(recipient)) {
      LOGGER.warn("follow_up_reminder_skipped reason=undeliverable_recipient");
      record.setReminderSent(true);
      record.setReminderSentAt(clock.instant());
      return false;
    }

    try {
      var delivered = emailService.sendFollowUpReminder(
          recipient,
          record.getAppointment().getPatient().getFullName(),
          record.getFollowUpDate(),
          record.getAppointment().getDoctor().getFullName());
      if (!delivered) {
        LOGGER.warn("follow_up_reminder_delivery_not_confirmed");
        return false;
      }
      record.setReminderSent(true);
      record.setReminderSentAt(clock.instant());
      return true;
    } catch (RuntimeException exception) {
      LOGGER.warn("follow_up_reminder_failed", exception);
      return false;
    }
  }

  private ZonedDateTime nowInHospitalZone() {
    return ZonedDateTime.now(clock).withZoneSameInstant(HOSPITAL_ZONE);
  }

  private boolean isDeliverableEmail(String email) {
    return email != null
        && !email.isBlank()
        && !email.toLowerCase().endsWith("@pending.local");
  }
}
