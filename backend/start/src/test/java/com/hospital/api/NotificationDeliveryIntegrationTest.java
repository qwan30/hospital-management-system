package com.hospital.api;

import static org.assertj.core.api.Assertions.assertThat;

import com.hospital.core.email.EmailDeliveryAttemptRepository;
import com.hospital.core.email.EmailService;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class NotificationDeliveryIntegrationTest extends AbstractIntegrationTest {
  @Autowired
  private EmailService emailService;

  @Autowired
  private EmailDeliveryAttemptRepository deliveryAttemptRepository;

  @Test
  void localRecordProviderRecordsFollowUpReminderDeliveryAttempt() {
    var before = deliveryAttemptRepository.count();

    var delivered = emailService.sendFollowUpReminder(
        "patient@example.com",
        "Nguyen Thi Hoa",
        LocalDate.of(2026, 6, 15),
        "Dr. Nguyen Van An");

    assertThat(delivered).isTrue();
    assertThat(deliveryAttemptRepository.count()).isEqualTo(before + 1);
    var latest = deliveryAttemptRepository.findTop10ByOrderByCreatedAtDesc().get(0);
    assertThat(latest.getMessageType()).isEqualTo("FOLLOW_UP_REMINDER");
    assertThat(latest.getRecipient()).isEqualTo("patient@example.com");
    assertThat(latest.getProvider()).isEqualTo("LOCAL_RECORD");
    assertThat(latest.getStatus()).isEqualTo("RECORDED");
  }
}
