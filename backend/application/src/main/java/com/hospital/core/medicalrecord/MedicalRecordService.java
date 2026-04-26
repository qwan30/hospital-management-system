package com.hospital.core.medicalrecord;

import com.hospital.core.appointment.AppointmentRepository;
import com.hospital.core.common.ConflictException;
import com.hospital.core.common.NotFoundException;
import com.hospital.core.email.EmailService;
import com.hospital.core.patient.PatientIdentifierProtector;
import com.hospital.core.patient.PatientRepository;
import com.hospital.core.prescription.PrescriptionPdfDocument;
import com.hospital.core.prescription.PrescriptionPdfService;
import com.hospital.core.prescription.PrescriptionItemEntity;
import com.hospital.core.scheduler.ReminderService;
import com.hospital.shared.enums.AppointmentStatus;
import com.hospital.shared.medicalrecord.MedicalRecordCreateRequest;
import com.hospital.shared.medicalrecord.MedicalRecordResponse;
import com.hospital.shared.medicalrecord.PatientHistoryAppointmentResponse;
import com.hospital.shared.medicalrecord.PatientHistoryResponse;
import com.hospital.shared.medicalrecord.PrescriptionItemPayload;
import com.hospital.shared.medicalrecord.VitalSignsPayload;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MedicalRecordService {
  private final AppointmentRepository appointmentRepository;
  private final MedicalRecordRepository medicalRecordRepository;
  private final PatientIdentifierProtector patientIdentifierProtector;
  private final PatientRepository patientRepository;
  private final ReminderService reminderService;
  private final PrescriptionPdfService prescriptionPdfService;
  private final EmailService emailService;

  public MedicalRecordService(
      AppointmentRepository appointmentRepository,
      MedicalRecordRepository medicalRecordRepository,
      PatientIdentifierProtector patientIdentifierProtector,
      PatientRepository patientRepository,
      ReminderService reminderService,
      PrescriptionPdfService prescriptionPdfService,
      EmailService emailService) {
    this.appointmentRepository = appointmentRepository;
    this.medicalRecordRepository = medicalRecordRepository;
    this.patientIdentifierProtector = patientIdentifierProtector;
    this.patientRepository = patientRepository;
    this.reminderService = reminderService;
    this.prescriptionPdfService = prescriptionPdfService;
    this.emailService = emailService;
  }

  @Transactional
  public MedicalRecordResponse createMedicalRecord(UUID doctorId, MedicalRecordCreateRequest request) {
    var appointment = appointmentRepository.findDetailedById(request.appointmentId())
        .orElseThrow(() -> new NotFoundException("Appointment not found"));

    if (!appointment.getDoctor().getId().equals(doctorId)) {
      throw new AccessDeniedException("Doctor cannot create records for another doctor's appointment");
    }

    if (medicalRecordRepository.existsByAppointmentId(appointment.getId())) {
      throw new ConflictException("Medical record already exists for this appointment");
    }

    if (appointment.getStatus() != AppointmentStatus.CHECKED_IN
        && appointment.getStatus() != AppointmentStatus.IN_PROGRESS
        && appointment.getStatus() != AppointmentStatus.DONE) {
      throw new ConflictException("Appointment must be checked in, in progress, or done before creating a medical record");
    }

    var record = new MedicalRecordEntity();
    record.setAppointment(appointment);
    record.setDiagnosis(request.diagnosis());
    record.setClinicalNotes(request.clinicalNotes());
    applyVitalSigns(record, request.vitalSigns());
    record.setFollowUpDate(request.followUpDate());
    reminderService.planReminder(record);

    var items = request.prescriptionItems() == null ? List.<PrescriptionItemPayload>of() : request.prescriptionItems();
    for (int index = 0; index < items.size(); index++) {
      var payload = items.get(index);
      var entity = new PrescriptionItemEntity();
      entity.setMedicalRecord(record);
      entity.setMedicineName(payload.medicineName());
      entity.setDosage(payload.dosage());
      entity.setFrequency(payload.frequency());
      entity.setDurationDays(payload.durationDays());
      entity.setInstructions(payload.instructions());
      entity.setSortOrder(payload.sortOrder() == null ? index : payload.sortOrder());
      record.getPrescriptionItems().add(entity);
    }

    appointment.setStatus(AppointmentStatus.DONE);
    var saved = medicalRecordRepository.save(record);
    reminderService.sendReminderIfDue(saved);
    var prescriptionDocument = prescriptionPdfService.generate(saved);
    emailService.sendVisitResult(
        saved.getAppointment().getPatient().getEmail(),
        saved.getAppointment().getPatient().getFullName(),
        saved.getDiagnosis(),
        saved.getFollowUpDate(),
        saved.getAppointment().getDoctor().getFullName(),
        prescriptionDocument.content(),
        prescriptionDocument.fileName());
    return toMedicalRecordResponse(saved);
  }

  @Transactional(readOnly = true)
  public PrescriptionPdfDocument previewPrescriptionPdf(UUID doctorId, MedicalRecordCreateRequest request) {
    var appointment = appointmentRepository.findDetailedById(request.appointmentId())
        .orElseThrow(() -> new NotFoundException("Appointment not found"));

    if (!appointment.getDoctor().getId().equals(doctorId)) {
      throw new AccessDeniedException("Doctor cannot preview another doctor's prescription");
    }

    var previewRecord = new MedicalRecordEntity();
    previewRecord.setAppointment(appointment);
    previewRecord.setDiagnosis(request.diagnosis());
    previewRecord.setClinicalNotes(request.clinicalNotes());
    applyVitalSigns(previewRecord, request.vitalSigns());
    previewRecord.setFollowUpDate(request.followUpDate());

    var items = request.prescriptionItems() == null ? List.<PrescriptionItemPayload>of() : request.prescriptionItems();
    for (int index = 0; index < items.size(); index++) {
      var payload = items.get(index);
      var entity = new PrescriptionItemEntity();
      entity.setMedicalRecord(previewRecord);
      entity.setMedicineName(payload.medicineName());
      entity.setDosage(payload.dosage());
      entity.setFrequency(payload.frequency());
      entity.setDurationDays(payload.durationDays());
      entity.setInstructions(payload.instructions());
      entity.setSortOrder(payload.sortOrder() == null ? index : payload.sortOrder());
      previewRecord.getPrescriptionItems().add(entity);
    }

    return prescriptionPdfService.generate(previewRecord);
  }

  @Transactional(readOnly = true)
  public PrescriptionPdfDocument generatePrescriptionPdf(UUID doctorId, UUID recordId) {
    var record = medicalRecordRepository.findDetailedById(recordId)
        .orElseThrow(() -> new NotFoundException("Medical record not found"));

    if (!record.getAppointment().getDoctor().getId().equals(doctorId)) {
      throw new AccessDeniedException("Doctor cannot access another doctor's prescription");
    }

    return prescriptionPdfService.generate(record);
  }

  @Transactional(readOnly = true)
  public PatientHistoryResponse getPatientHistory(String cccd) {
    var plainCccd = patientIdentifierProtector.decrypt(cccd);
    var patient = patientRepository.findByCccdHash(patientIdentifierProtector.hash(plainCccd))
        .orElseThrow(() -> new NotFoundException("Patient not found"));

    var appointments = appointmentRepository.findByPatientIdOrderByAppointmentDateDescFirstSlotStartTimeDesc(patient.getId());
    var appointmentIds = appointments.stream().map(appointment -> appointment.getId()).toList();
    var records = appointmentIds.isEmpty() ? List.<MedicalRecordEntity>of() : medicalRecordRepository.findDetailedByAppointmentIds(appointmentIds);
    Map<UUID, MedicalRecordEntity> recordsByAppointmentId = new LinkedHashMap<>();
    records.forEach(record -> recordsByAppointmentId.put(record.getAppointment().getId(), record));

    return new PatientHistoryResponse(
        patient.getId(),
        patient.getFullName(),
        patient.getPhone(),
        patientIdentifierProtector.decrypt(patient.getCccd()),
        patient.getDateOfBirth(),
        appointments.stream()
            .sorted(Comparator
                .comparing(com.hospital.core.appointment.AppointmentEntity::getAppointmentDate).reversed()
                .thenComparing(appointment -> appointment.getFirstSlot().getStartTime(), Comparator.reverseOrder()))
            .map(appointment -> new PatientHistoryAppointmentResponse(
                appointment.getId(),
                appointment.getAppointmentDate(),
                appointment.getFirstSlot().getStartTime(),
                appointment.getFirstSlot().getEndTime(),
                appointment.getStatus(),
                appointment.getDoctor().getId(),
                appointment.getDoctor().getFullName(),
                toMedicalRecordResponse(recordsByAppointmentId.get(appointment.getId()))))
            .toList());
  }

  private void applyVitalSigns(MedicalRecordEntity record, VitalSignsPayload vitalSigns) {
    if (vitalSigns == null) {
      return;
    }

    record.setBloodPressure(vitalSigns.bloodPressure());
    record.setTemperature(toBigDecimal(vitalSigns.temperature()));
    record.setWeight(toBigDecimal(vitalSigns.weight()));
    record.setHeight(toBigDecimal(vitalSigns.height()));
  }

  private MedicalRecordResponse toMedicalRecordResponse(MedicalRecordEntity record) {
    if (record == null) {
      return null;
    }

    var prescriptionItems = record.getPrescriptionItems().stream()
        .sorted(Comparator.comparingInt(item -> item.getSortOrder() == null ? 0 : item.getSortOrder()))
        .map(item -> new PrescriptionItemPayload(
            item.getMedicineName(),
            item.getDosage(),
            item.getFrequency(),
            item.getDurationDays(),
            item.getInstructions(),
            item.getSortOrder()))
        .toList();

    return new MedicalRecordResponse(
        record.getId(),
        record.getAppointment().getId(),
        record.getDiagnosis(),
        record.getClinicalNotes(),
        new VitalSignsPayload(
            record.getBloodPressure(),
            toDouble(record.getTemperature()),
            toDouble(record.getWeight()),
            toDouble(record.getHeight())),
        record.getFollowUpDate(),
        prescriptionItems,
        record.getAppointment().getStatus());
  }

  private BigDecimal toBigDecimal(Double value) {
    return value == null ? null : BigDecimal.valueOf(value);
  }

  private Double toDouble(BigDecimal value) {
    return value == null ? null : value.doubleValue();
  }
}
