package com.hospital.core.medicalrecord;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.hospital.core.appointment.AppointmentEntity;
import com.hospital.core.appointment.AppointmentRepository;
import com.hospital.core.email.EmailService;
import com.hospital.core.patient.PatientEntity;
import com.hospital.core.patient.PatientIdentifierProtector;
import com.hospital.core.patient.PatientRepository;
import com.hospital.core.prescription.PrescriptionPdfDocument;
import com.hospital.core.prescription.PrescriptionPdfService;
import com.hospital.core.prescription.PrescriptionItemEntity;
import com.hospital.core.scheduler.ReminderService;
import com.hospital.core.timeslot.TimeSlotEntity;
import com.hospital.core.user.UserEntity;
import com.hospital.shared.enums.AppointmentStatus;
import com.hospital.shared.enums.UserRole;
import com.hospital.shared.medicalrecord.MedicalRecordCreateRequest;
import com.hospital.shared.medicalrecord.PrescriptionItemPayload;
import com.hospital.shared.medicalrecord.VitalSignsPayload;
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
class MedicalRecordServiceTest {
  @Mock
  private AppointmentRepository appointmentRepository;

  @Mock
  private MedicalRecordRepository medicalRecordRepository;

  @Mock
  private PatientIdentifierProtector patientIdentifierProtector;

  @Mock
  private PatientRepository patientRepository;

  @Mock
  private ReminderService reminderService;

  @Mock
  private PrescriptionPdfService prescriptionPdfService;

  @Mock
  private EmailService emailService;

  @InjectMocks
  private MedicalRecordService medicalRecordService;

  @Test
  void rejectsDuplicateMedicalRecordCreation() {
    var doctor = doctor();
    var appointment = appointment(doctor, LocalDate.of(2026, 3, 16), LocalTime.of(8, 0));

    when(appointmentRepository.findDetailedById(appointment.getId())).thenReturn(Optional.of(appointment));
    when(medicalRecordRepository.existsByAppointmentId(appointment.getId())).thenReturn(true);

    assertThatThrownBy(() -> medicalRecordService.createMedicalRecord(
        doctor.getId(),
        new MedicalRecordCreateRequest(
            appointment.getId(),
            "Diagnosis",
            "Notes",
            new VitalSignsPayload("120/80", 36.8, 65.0, 170.0),
            LocalDate.of(2026, 3, 20),
            List.of())))
        .hasMessageContaining("already exists");
  }

  @Test
  void returnsPatientHistoryInMostRecentFirstOrder() {
    var patient = patient();
    var doctor = doctor();
    var olderAppointment = appointment(doctor, LocalDate.of(2026, 3, 10), LocalTime.of(8, 0));
    olderAppointment.setPatient(patient);
    var newerAppointment = appointment(doctor, LocalDate.of(2026, 3, 16), LocalTime.of(9, 0));
    newerAppointment.setPatient(patient);

    var newerRecord = record(newerAppointment, "New diagnosis", 2);
    var olderRecord = record(olderAppointment, "Old diagnosis", 1);

    when(patientIdentifierProtector.hash(patient.getCccd())).thenReturn("hashed-cccd");
    when(patientIdentifierProtector.decrypt(patient.getCccd())).thenReturn(patient.getCccd());
    when(patientRepository.findByCccdHash("hashed-cccd")).thenReturn(Optional.of(patient));
    when(appointmentRepository.findByPatientIdOrderByAppointmentDateDescFirstSlotStartTimeDesc(patient.getId()))
        .thenReturn(List.of(olderAppointment, newerAppointment));
    when(medicalRecordRepository.findDetailedByAppointmentIds(anyCollection()))
        .thenReturn(List.of(olderRecord, newerRecord));

    var history = medicalRecordService.getPatientHistory(patient.getCccd());

    assertThat(history.appointments()).extracting(item -> item.appointmentId())
        .containsExactly(newerAppointment.getId(), olderAppointment.getId());
    assertThat(history.appointments().get(0).medicalRecord().diagnosis()).isEqualTo("New diagnosis");
  }

  @Test
  void finalizesAppointmentWhenCreatingMedicalRecord() {
    var doctor = doctor();
    var appointment = appointment(doctor, LocalDate.of(2026, 3, 16), LocalTime.of(8, 0));
    var request = new MedicalRecordCreateRequest(
        appointment.getId(),
        "Diagnosis",
        "Notes",
        new VitalSignsPayload("120/80", 36.8, 65.0, 170.0),
        LocalDate.of(2026, 3, 22),
        List.of(new PrescriptionItemPayload("Cetirizine", "10mg", "1/day", 7, "After dinner", 1)));

    when(appointmentRepository.findDetailedById(appointment.getId())).thenReturn(Optional.of(appointment));
    when(medicalRecordRepository.existsByAppointmentId(appointment.getId())).thenReturn(false);
    when(medicalRecordRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
    when(prescriptionPdfService.generate(any(MedicalRecordEntity.class)))
        .thenReturn(new PrescriptionPdfDocument("prescription.pdf", new byte[] {1, 2, 3}));

    var response = medicalRecordService.createMedicalRecord(doctor.getId(), request);

    assertThat(appointment.getStatus()).isEqualTo(AppointmentStatus.DONE);
    assertThat(response.prescriptionItems()).hasSize(1);
    assertThat(response.vitalSigns().bloodPressure()).isEqualTo("120/80");
    verify(reminderService).planReminder(any(MedicalRecordEntity.class));
    verify(reminderService).sendReminderIfDue(any(MedicalRecordEntity.class));
    verify(emailService).sendVisitResult(
        eq(appointment.getPatient().getEmail()),
        eq(appointment.getPatient().getFullName()),
        eq("Diagnosis"),
        eq(LocalDate.of(2026, 3, 22)),
        eq(appointment.getDoctor().getFullName()),
        any(byte[].class),
        eq("prescription.pdf"));
  }

  @Test
  void generatesPrescriptionPdfForTheAssignedDoctor() {
    var doctor = doctor();
    var appointment = appointment(doctor, LocalDate.of(2026, 3, 16), LocalTime.of(8, 0));
    var record = record(appointment, "Diagnosis", 1);
    var pdfDocument = new PrescriptionPdfDocument("prescription.pdf", new byte[] {1, 2, 3});

    when(medicalRecordRepository.findDetailedById(record.getId())).thenReturn(Optional.of(record));
    when(prescriptionPdfService.generate(record)).thenReturn(pdfDocument);

    var result = medicalRecordService.generatePrescriptionPdf(doctor.getId(), record.getId());

    assertThat(result).isEqualTo(pdfDocument);
  }

  @Test
  void previewsPrescriptionPdfWithoutPersistingMedicalRecord() {
    var doctor = doctor();
    var appointment = appointment(doctor, LocalDate.of(2026, 3, 16), LocalTime.of(8, 0));
    var request = new MedicalRecordCreateRequest(
        appointment.getId(),
        "Preview diagnosis",
        "Preview notes",
        new VitalSignsPayload("118/79", 36.6, 64.0, 168.0),
        LocalDate.of(2026, 3, 21),
        List.of(new PrescriptionItemPayload("Amoxicillin", "500mg", "2/day", 5, "After meals", 1)));
    var pdfDocument = new PrescriptionPdfDocument("preview.pdf", new byte[] {9, 9, 9});

    when(appointmentRepository.findDetailedById(appointment.getId())).thenReturn(Optional.of(appointment));
    when(prescriptionPdfService.generate(any(MedicalRecordEntity.class))).thenReturn(pdfDocument);

    var result = medicalRecordService.previewPrescriptionPdf(doctor.getId(), request);

    assertThat(result).isEqualTo(pdfDocument);
    verify(prescriptionPdfService).generate(any(MedicalRecordEntity.class));
  }

  @Test
  void rejectsPrescriptionPdfAccessForAnotherDoctor() {
    var doctor = doctor();
    var otherDoctor = doctor();
    otherDoctor.setId(UUID.randomUUID());
    var appointment = appointment(doctor, LocalDate.of(2026, 3, 16), LocalTime.of(8, 0));
    var record = record(appointment, "Diagnosis", 1);

    when(medicalRecordRepository.findDetailedById(record.getId())).thenReturn(Optional.of(record));

    assertThatThrownBy(() -> medicalRecordService.generatePrescriptionPdf(otherDoctor.getId(), record.getId()))
        .hasMessageContaining("another doctor's");
  }

  private UserEntity doctor() {
    var doctor = new UserEntity();
    doctor.setId(UUID.randomUUID());
    doctor.setEmail("doctor1@hospital.vn");
    doctor.setFullName("Dr. Test");
    doctor.setRole(UserRole.DOCTOR);
    return doctor;
  }

  private PatientEntity patient() {
    var patient = new PatientEntity();
    patient.setId(UUID.randomUUID());
    patient.setFullName("Nguyen Van Test");
    patient.setEmail("nguyen.van.test@example.com");
    patient.setPhone("0900000000");
    patient.setCccd("012345678901");
    patient.setDateOfBirth(LocalDate.of(1990, 1, 1));
    patient.setGender(com.hospital.shared.enums.Gender.OTHER);
    return patient;
  }

  private AppointmentEntity appointment(UserEntity doctor, LocalDate date, LocalTime startTime) {
    var slot = new TimeSlotEntity();
    slot.setId(UUID.randomUUID());
    slot.setDoctor(doctor);
    slot.setSlotDate(date);
    slot.setStartTime(startTime);
    slot.setEndTime(startTime.plusMinutes(30));

    var appointment = new AppointmentEntity();
    appointment.setId(UUID.randomUUID());
    appointment.setDoctor(doctor);
    appointment.setPatient(patient());
    appointment.setFirstSlot(slot);
    appointment.setAppointmentDate(date);
    appointment.setConfirmationCode("HMS-TEST");
    appointment.setStatus(AppointmentStatus.IN_PROGRESS);
    return appointment;
  }

  private MedicalRecordEntity record(AppointmentEntity appointment, String diagnosis, int sortOrder) {
    var record = new MedicalRecordEntity();
    record.setId(UUID.randomUUID());
    record.setAppointment(appointment);
    record.setDiagnosis(diagnosis);

    var item = new PrescriptionItemEntity();
    item.setId(UUID.randomUUID());
    item.setMedicalRecord(record);
    item.setMedicineName("Medicine");
    item.setDosage("10mg");
    item.setSortOrder(sortOrder);
    record.setPrescriptionItems(List.of(item));
    return record;
  }
}
