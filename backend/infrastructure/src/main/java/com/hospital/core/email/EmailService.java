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
  private final HospitalProfileProperties hospitalProfileProperties;

  public EmailService(GmailApiClient gmailApiClient, HospitalProfileProperties hospitalProfileProperties) {
    this.gmailApiClient = gmailApiClient;
    this.hospitalProfileProperties = hospitalProfileProperties;
  }

  public void sendAppointmentConfirmation(String recipient, String confirmationCode) {
    var sent = gmailApiClient.sendHtmlEmail(
        recipient,
        "Your HMS appointment is confirmed",
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
  }

  public void sendFollowUpReminder(String recipient, String patientName, LocalDate followUpDate, String doctorName) {
    var sent = gmailApiClient.sendHtmlEmail(
        recipient,
        "Follow-up reminder for " + followUpDate,
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
  }

  public void sendVisitResult(
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
    var sent = gmailApiClient.sendHtmlEmail(
        recipient,
        "Visit result from " + valueOrDefault(hospitalProfileProperties.name(), "Hospital Management System"),
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
  }

  private String valueOrDefault(String value, String fallback) {
    return Objects.requireNonNullElse(value, fallback);
  }
}
