package com.hospital.core.prescription;

import static org.assertj.core.api.Assertions.assertThat;

import com.hospital.core.appointment.AppointmentEntity;
import com.hospital.core.medicalrecord.MedicalRecordEntity;
import com.hospital.core.patient.PatientEntity;
import com.hospital.core.timeslot.TimeSlotEntity;
import com.hospital.core.user.UserEntity;
import com.hospital.shared.enums.AppointmentStatus;
import com.hospital.shared.enums.UserRole;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.junit.jupiter.api.Test;

class PrescriptionPdfServiceTest {
  private final PrescriptionPdfService prescriptionPdfService = new PrescriptionPdfService();

  @Test
  void generatesPdfWithPrescriptionContent() throws IOException {
    var document = prescriptionPdfService.generate(record());

    assertThat(document.content()).isNotEmpty();
    assertThat(document.fileName()).contains("prescription");

    try (PDDocument pdf = Loader.loadPDF(document.content())) {
      var text = new PDFTextStripper().getText(pdf);
      assertThat(text)
          .contains("Nguyen Van Test")
          .contains("Dr. Test")
          .contains("Cetirizine 10mg");
    }
  }

  private MedicalRecordEntity record() {
    var patient = new PatientEntity();
    patient.setId(UUID.randomUUID());
    patient.setFullName("Nguyen Van Test");
    patient.setEmail("nguyen.van.test@example.com");
    patient.setPhone("0901234567");
    patient.setCccd("012345678901");
    patient.setDateOfBirth(LocalDate.of(1990, 1, 1));

    var doctor = new UserEntity();
    doctor.setId(UUID.randomUUID());
    doctor.setFullName("Dr. Test");
    doctor.setEmail("doctor1@hospital.vn");
    doctor.setRole(UserRole.DOCTOR);

    var slot = new TimeSlotEntity();
    slot.setId(UUID.randomUUID());
    slot.setSlotDate(LocalDate.of(2030, 1, 12));
    slot.setStartTime(LocalTime.of(9, 0));
    slot.setEndTime(LocalTime.of(9, 30));

    var appointment = new AppointmentEntity();
    appointment.setId(UUID.randomUUID());
    appointment.setPatient(patient);
    appointment.setDoctor(doctor);
    appointment.setFirstSlot(slot);
    appointment.setAppointmentDate(LocalDate.of(2030, 1, 12));
    appointment.setConfirmationCode("HMS-PDF");
    appointment.setStatus(AppointmentStatus.DONE);

    var record = new MedicalRecordEntity();
    record.setId(UUID.randomUUID());
    record.setAppointment(appointment);
    record.setDiagnosis("Upper respiratory infection");
    record.setClinicalNotes("Patient stable and responsive.");
    record.setFollowUpDate(LocalDate.of(2030, 1, 19));

    var item = new PrescriptionItemEntity();
    item.setId(UUID.randomUUID());
    item.setMedicalRecord(record);
    item.setMedicineName("Cetirizine 10mg");
    item.setDosage("10mg");
    item.setFrequency("1/day");
    item.setDurationDays(7);
    item.setInstructions("After dinner");
    item.setSortOrder(1);
    record.setPrescriptionItems(List.of(item));
    return record;
  }
}
