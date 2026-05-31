package com.hospital.core.email;

import com.hospital.core.shared.HospitalProfileProperties;
import java.time.LocalDate;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
  private static final Logger LOGGER = LoggerFactory.getLogger(EmailService.class);

  private final GmailApiClient gmailApiClient;
  private final EmailDeliveryAttemptRepository deliveryAttemptRepository;
  private final HospitalProfileProperties hospitalProfileProperties;

  public EmailService(
      GmailApiClient gmailApiClient,
      EmailDeliveryAttemptRepository deliveryAttemptRepository,
      HospitalProfileProperties hospitalProfileProperties) {
    this.gmailApiClient = gmailApiClient;
    this.deliveryAttemptRepository = deliveryAttemptRepository;
    this.hospitalProfileProperties = hospitalProfileProperties;
  }

  public boolean sendAppointmentConfirmation(String recipient, String confirmationCode) {
    var subject = "Your HMS appointment is confirmed";
    var sent = deliver(
        "APPOINTMENT_CONFIRMATION",
        recipient,
        subject,
        """
            <h2>Appointment confirmed</h2>
            <p>Your confirmation code is <strong>%s</strong>.</p>
            <p>Hospital: %s</p>
            <p>Address: %s</p>
            <p>Hotline: %s</p>
            <p>Please bring identification and arrive 15 minutes early.</p>
            """.formatted(
            confirmationCode,
            valueOrDefault(hospitalProfileProperties.name(), "Hospital Management System"),
            valueOrDefault(hospitalProfileProperties.address(), "123 ABC Street, District 1, Ho Chi Minh City"),
            valueOrDefault(hospitalProfileProperties.phone(), "028 1234 5678")),
        null,
        null,
        null);
    LOGGER.info("email_confirmation recipient={} confirmationCode={} sent={}", recipient, confirmationCode, sent);
    return sent;
  }

  public boolean sendFollowUpReminder(String recipient, String patientName, LocalDate followUpDate, String doctorName) {
    var subject = "Follow-up reminder for " + followUpDate;
    var sent = deliver(
        "FOLLOW_UP_REMINDER",
        recipient,
        subject,
        """
            <h2>Follow-up reminder</h2>
            <p>Patient: <strong>%s</strong></p>
            <p>Your follow-up visit is scheduled for <strong>%s</strong> with <strong>%s</strong>.</p>
            <p>Please bring your prescription and any recent test results.</p>
            <p>Hotline: %s</p>
            """.formatted(
            patientName,
            followUpDate,
            doctorName,
            valueOrDefault(hospitalProfileProperties.phone(), "028 1234 5678")),
        null,
        null,
        null);
    LOGGER.info(
        "email_follow_up recipient={} patientName={} followUpDate={} doctorName={} sent={}",
        recipient,
        patientName,
        followUpDate,
        doctorName,
        sent);
    return sent;
  }

  public boolean sendVisitResult(
      String recipient,
      String patientName,
      String diagnosis,
      LocalDate followUpDate,
      String doctorName,
      byte[] prescriptionPdf,
      String prescriptionFileName) {
    var followUpLine = followUpDate == null
        ? "<p>No follow-up visit was scheduled.</p>"
        : "<p>Follow-up date: <strong>" + followUpDate + "</strong></p>";
    var subject = "Visit result from " + valueOrDefault(hospitalProfileProperties.name(), "Hospital Management System");
    var sent = deliver(
        "VISIT_RESULT",
        recipient,
        subject,
        """
            <h2>Visit result</h2>
            <p>Patient: <strong>%s</strong></p>
            <p>Doctor: <strong>%s</strong></p>
            <p>Diagnosis: %s</p>
            %s
            <p>Your prescription PDF is attached.</p>
            """.formatted(patientName, doctorName, diagnosis, followUpLine),
        prescriptionPdf,
        prescriptionFileName,
        "application/pdf");
    LOGGER.info("email_visit_result recipient={} patientName={} sent={}", recipient, patientName, sent);
    return sent;
  }

  private boolean deliver(
      String messageType,
      String recipient,
      String subject,
      String htmlBody,
      byte[] attachmentBytes,
      String attachmentFileName,
      String attachmentMimeType) {
    if (!gmailApiClient.isReadyForExternalDelivery()) {
      recordAttempt(messageType, recipient, subject, "LOCAL_RECORD", "RECORDED", attachmentFileName, null);
      return true;
    }

    var sent = gmailApiClient.sendHtmlEmail(
        recipient,
        subject,
        htmlBody,
        attachmentBytes,
        attachmentFileName,
        attachmentMimeType);
    recordAttempt(
        messageType,
        recipient,
        subject,
        "GMAIL",
        sent ? "SENT" : "FAILED",
        attachmentFileName,
        sent ? null : "Gmail transport returned false");
    return sent;
  }

  private void recordAttempt(
      String messageType,
      String recipient,
      String subject,
      String provider,
      String status,
      String attachmentFileName,
      String failureReason) {
    var attempt = new EmailDeliveryAttemptEntity();
    attempt.setMessageType(messageType);
    attempt.setRecipient(truncate(valueOrDefault(recipient, "unknown"), 255));
    attempt.setSubject(truncate(valueOrDefault(subject, "HMS notification"), 255));
    attempt.setProvider(provider);
    attempt.setStatus(status);
    attempt.setAttachmentFileName(truncate(attachmentFileName, 255));
    attempt.setFailureReason(truncate(failureReason, 500));
    deliveryAttemptRepository.save(attempt);
  }

  private String valueOrDefault(String value, String fallback) {
    return Objects.requireNonNullElse(value, fallback);
  }

  private String truncate(String value, int maxLength) {
    if (value == null || value.length() <= maxLength) {
      return value;
    }
    return value.substring(0, maxLength);
  }
}
