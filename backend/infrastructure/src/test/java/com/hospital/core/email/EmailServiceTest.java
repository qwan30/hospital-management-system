package com.hospital.core.email;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.hospital.core.shared.HospitalProfileProperties;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class EmailServiceTest {

  private GmailApiClient gmailApiClient;
  private EmailDeliveryAttemptRepository deliveryAttemptRepository;
  private HospitalProfileProperties hospitalProfileProperties;
  private EmailService emailService;

  @BeforeEach
  void setUp() {
    gmailApiClient = mock(GmailApiClient.class);
    deliveryAttemptRepository = mock(EmailDeliveryAttemptRepository.class);
    hospitalProfileProperties = new HospitalProfileProperties(
        "Test Hospital", "456 Test Rd", "12345678", "http://maps", "http://privacy", "fb", "yt"
    );
    emailService = new EmailService(gmailApiClient, deliveryAttemptRepository, hospitalProfileProperties);
  }

  @Test
  void sendAppointmentConfirmation_whenExternalDeliveryNotReady_recordsLocalStaging() {
    when(gmailApiClient.isReadyForExternalDelivery()).thenReturn(false);

    boolean result = emailService.sendAppointmentConfirmation("test@recipient.com", "CONF-123");

    assertThat(result).isTrue();
    verify(gmailApiClient, never()).sendHtmlEmail(any(), any(), any(), any(), any(), any());

    var captor = ArgumentCaptor.forClass(EmailDeliveryAttemptEntity.class);
    verify(deliveryAttemptRepository).save(captor.capture());
    var attempt = captor.getValue();
    assertThat(attempt.getMessageType()).isEqualTo("APPOINTMENT_CONFIRMATION");
    assertThat(attempt.getRecipient()).isEqualTo("test@recipient.com");
    assertThat(attempt.getProvider()).isEqualTo("LOCAL_RECORD");
    assertThat(attempt.getStatus()).isEqualTo("RECORDED");
  }

  @Test
  void sendAppointmentConfirmation_whenExternalDeliveryReady_sendsAndRecordsGmailSent() {
    when(gmailApiClient.isReadyForExternalDelivery()).thenReturn(true);
    when(gmailApiClient.sendHtmlEmail(any(), any(), any(), any(), any(), any())).thenReturn(true);

    boolean result = emailService.sendAppointmentConfirmation("test@recipient.com", "CONF-123");

    assertThat(result).isTrue();
    verify(gmailApiClient).sendHtmlEmail(
        eq("test@recipient.com"),
        eq("Your HMS appointment is confirmed"),
        anyString(),
        isNull(),
        isNull(),
        isNull()
    );

    var captor = ArgumentCaptor.forClass(EmailDeliveryAttemptEntity.class);
    verify(deliveryAttemptRepository).save(captor.capture());
    var attempt = captor.getValue();
    assertThat(attempt.getProvider()).isEqualTo("GMAIL");
    assertThat(attempt.getStatus()).isEqualTo("SENT");
  }

  @Test
  void sendAppointmentConfirmation_whenGmailFails_recordsGmailFailed() {
    when(gmailApiClient.isReadyForExternalDelivery()).thenReturn(true);
    when(gmailApiClient.sendHtmlEmail(any(), any(), any(), any(), any(), any())).thenReturn(false);

    boolean result = emailService.sendAppointmentConfirmation("test@recipient.com", "CONF-123");

    assertThat(result).isFalse();

    var captor = ArgumentCaptor.forClass(EmailDeliveryAttemptEntity.class);
    verify(deliveryAttemptRepository).save(captor.capture());
    var attempt = captor.getValue();
    assertThat(attempt.getProvider()).isEqualTo("GMAIL");
    assertThat(attempt.getStatus()).isEqualTo("FAILED");
    assertThat(attempt.getFailureReason()).isEqualTo("Gmail transport returned false");
  }

  @Test
  void sendFollowUpReminder_success() {
    when(gmailApiClient.isReadyForExternalDelivery()).thenReturn(false);

    boolean result = emailService.sendFollowUpReminder("test@recipient.com", "John Doe", LocalDate.of(2026, 7, 1), "Dr. Smith");

    assertThat(result).isTrue();
    verify(deliveryAttemptRepository).save(any(EmailDeliveryAttemptEntity.class));
  }

  @Test
  void sendVisitResult_success() {
    when(gmailApiClient.isReadyForExternalDelivery()).thenReturn(false);

    boolean result = emailService.sendVisitResult(
        "test@recipient.com", "John Doe", "Flu", LocalDate.of(2026, 7, 1), "Dr. Smith", new byte[]{1, 2, 3}, "prescription.pdf"
    );

    assertThat(result).isTrue();
    verify(deliveryAttemptRepository).save(any(EmailDeliveryAttemptEntity.class));
  }
}
