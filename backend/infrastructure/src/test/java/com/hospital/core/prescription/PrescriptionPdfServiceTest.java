package com.hospital.core.prescription;

import static org.assertj.core.api.Assertions.assertThat;

import com.hospital.core.appointment.AppointmentEntity;
import com.hospital.core.medicalrecord.MedicalRecordEntity;
import com.hospital.core.patient.PatientEntity;
import com.hospital.core.user.UserEntity;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class PrescriptionPdfServiceTest {

  @Test
  void generate_successWithPrescriptionItems() {
    var service = new PrescriptionPdfService();

    var doctor = new UserEntity();
    doctor.setFullName("Dr. House");

    var patient = new PatientEntity();
    patient.setFullName("John Doe");
    patient.setEmail("john.doe@example.com");

    var appointment = new AppointmentEntity();
    appointment.setAppointmentDate(LocalDate.of(2026, 6, 23));
    appointment.setDoctor(doctor);
    appointment.setPatient(patient);

    var recordId = UUID.randomUUID();
    var record = new MedicalRecordEntity();
    record.setId(recordId);
    record.setAppointment(appointment);
    record.setDiagnosis("Common Cold");
    record.setClinicalNotes("Rest and hydrate.");
    record.setFollowUpDate(LocalDate.of(2026, 6, 30));

    var item = new PrescriptionItemEntity();
    item.setMedicineName("Paracetamol");
    item.setDosage("500mg");
    item.setFrequency("3 times a day");
    item.setDurationDays(5);
    item.setInstructions("After meals");

    record.setPrescriptionItems(List.of(item));

    var pdf = service.generate(record);
    assertThat(pdf).isNotNull();
    assertThat(pdf.fileName()).isEqualTo("prescription-" + recordId + ".pdf");
    assertThat(pdf.content()).isNotEmpty();
  }

  @Test
  void generate_successEmptyPrescriptionItems() {
    var service = new PrescriptionPdfService();

    var doctor = new UserEntity();
    doctor.setFullName("Dr. House");

    var patient = new PatientEntity();
    patient.setFullName("John Doe");
    patient.setEmail("john.doe@example.com");

    var appointment = new AppointmentEntity();
    appointment.setAppointmentDate(LocalDate.of(2026, 6, 23));
    appointment.setDoctor(doctor);
    appointment.setPatient(patient);

    var recordId = UUID.randomUUID();
    var record = new MedicalRecordEntity();
    record.setId(recordId);
    record.setAppointment(appointment);
    record.setDiagnosis(null);
    record.setClinicalNotes("");
    record.setFollowUpDate(null);
    record.setPrescriptionItems(new ArrayList<>());

    var pdf = service.generate(record);
    assertThat(pdf).isNotNull();
    assertThat(pdf.content()).isNotEmpty();
  }
}
