package com.hospital.core.patientrecord;

import com.hospital.core.appointment.AppointmentRepository;
import com.hospital.core.common.NotFoundException;
import com.hospital.core.medicalrecord.MedicalRecordEntity;
import com.hospital.core.medicalrecord.MedicalRecordRepository;
import com.hospital.core.patient.PatientEntity;
import com.hospital.core.patient.PatientIdentifierProtector;
import com.hospital.core.patient.PatientRepository;
import com.hospital.shared.medicalrecord.MedicalRecordResponse;
import com.hospital.shared.medicalrecord.PatientHistoryAppointmentResponse;
import com.hospital.shared.medicalrecord.PrescriptionItemPayload;
import com.hospital.shared.medicalrecord.VitalSignsPayload;
import com.hospital.shared.patientrecord.PatientRecordDetailResponse;
import com.hospital.shared.patientrecord.PatientRecordListItemResponse;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PatientRecordService {
  private final AppointmentRepository appointmentRepository;
  private final MedicalRecordRepository medicalRecordRepository;
  private final PatientIdentifierProtector patientIdentifierProtector;
  private final PatientRepository patientRepository;

  public PatientRecordService(
      AppointmentRepository appointmentRepository,
      MedicalRecordRepository medicalRecordRepository,
      PatientIdentifierProtector patientIdentifierProtector,
      PatientRepository patientRepository) {
    this.appointmentRepository = appointmentRepository;
    this.medicalRecordRepository = medicalRecordRepository;
    this.patientIdentifierProtector = patientIdentifierProtector;
    this.patientRepository = patientRepository;
  }

  @Transactional(readOnly = true)
  public List<PatientRecordListItemResponse> search(String query) {
    var normalizedQuery = query == null ? "" : query.trim();
    List<PatientEntity> matchedPatients;

    if (normalizedQuery.isBlank()) {
      matchedPatients = patientRepository.findTop20ByOrderByUpdatedAtDesc();
    } else {
      var patientSet = new LinkedHashSet<PatientEntity>(patientRepository.searchByQuery(normalizedQuery));
      if (normalizedQuery.matches("\\d{12}")) {
        patientRepository.findByCccdHash(patientIdentifierProtector.hash(normalizedQuery))
            .ifPresent(patientSet::add);
      }
      matchedPatients = new ArrayList<>(patientSet);
    }

    return matchedPatients.stream()
        .map(patient -> {
          var appointments = appointmentRepository.findByPatientIdOrderByAppointmentDateDescFirstSlotStartTimeDesc(patient.getId());
          var latestAppointmentDate = appointments.isEmpty() ? null : appointments.get(0).getAppointmentDate();
          return new PatientRecordListItemResponse(
              patient.getId(),
              patient.getFullName(),
              patient.getPhone(),
              patient.getEmail(),
              patient.getDateOfBirth(),
              latestAppointmentDate,
              appointments.size());
        })
        .toList();
  }

  @Transactional(readOnly = true)
  public PatientRecordDetailResponse getDetail(UUID patientId) {
    var patient = patientRepository.findById(patientId)
        .orElseThrow(() -> new NotFoundException("Patient not found"));

    var appointments = appointmentRepository.findByPatientIdOrderByAppointmentDateDescFirstSlotStartTimeDesc(patientId);
    var appointmentIds = appointments.stream().map(appointment -> appointment.getId()).toList();
    var records = appointmentIds.isEmpty()
        ? List.<MedicalRecordEntity>of()
        : medicalRecordRepository.findDetailedByAppointmentIds(appointmentIds);
    Map<UUID, MedicalRecordEntity> recordsByAppointmentId = new LinkedHashMap<>();
    records.forEach(record -> recordsByAppointmentId.put(record.getAppointment().getId(), record));

    return new PatientRecordDetailResponse(
        patient.getId(),
        patient.getFullName(),
        patient.getPhone(),
        patient.getEmail(),
        patientIdentifierProtector.decrypt(patient.getCccd()),
        patient.getDateOfBirth(),
        patient.getOccupation(),
        patient.getBloodType(),
        patient.getMedicalHistory(),
        patient.getDrugAllergies(),
        patient.getInsuranceNumber(),
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

  private Double toDouble(BigDecimal value) {
    return value == null ? null : value.doubleValue();
  }
}
