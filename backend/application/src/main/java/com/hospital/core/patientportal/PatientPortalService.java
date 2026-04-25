package com.hospital.core.patientportal;

import com.hospital.core.appointment.AppointmentRepository;
import com.hospital.core.common.NotFoundException;
import com.hospital.core.patient.PatientRepository;
import com.hospital.shared.patientportal.PatientPortalAppointmentResponse;
import com.hospital.shared.patientportal.PatientPortalLabResultResponse;
import com.hospital.shared.patientportal.PatientPortalMessageResponse;
import com.hospital.shared.patientportal.PatientPortalMessageThreadResponse;
import com.hospital.shared.patientportal.PatientPortalOverviewResponse;
import com.hospital.shared.patientportal.PatientPortalProfileResponse;
import com.hospital.shared.patientportal.PatientPortalProfileUpdateRequest;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PatientPortalService {
  private final AppointmentRepository appointmentRepository;
  private final LabResultRepository labResultRepository;
  private final PatientMessageRepository patientMessageRepository;
  private final PatientMessageThreadRepository patientMessageThreadRepository;
  private final PatientRepository patientRepository;

  public PatientPortalService(
      AppointmentRepository appointmentRepository,
      LabResultRepository labResultRepository,
      PatientMessageRepository patientMessageRepository,
      PatientMessageThreadRepository patientMessageThreadRepository,
      PatientRepository patientRepository) {
    this.appointmentRepository = appointmentRepository;
    this.labResultRepository = labResultRepository;
    this.patientMessageRepository = patientMessageRepository;
    this.patientMessageThreadRepository = patientMessageThreadRepository;
    this.patientRepository = patientRepository;
  }

  @Transactional(readOnly = true)
  public PatientPortalOverviewResponse getOverview(UUID patientId) {
    var patient = patientRepository.findById(patientId)
        .orElseThrow(() -> new NotFoundException("Patient not found"));
    var appointments = appointmentRepository.findByPatientIdOrderByAppointmentDateDescFirstSlotStartTimeDesc(patientId);
    var upcomingAppointments = appointments.stream()
        .filter(appointment -> !appointment.getAppointmentDate().isBefore(LocalDate.now()))
        .sorted(Comparator
            .comparing(com.hospital.core.appointment.AppointmentEntity::getAppointmentDate)
            .thenComparing(appointment -> appointment.getFirstSlot().getStartTime()))
        .toList();
    var threads = patientMessageThreadRepository.findByPatientIdOrderByUpdatedAtDesc(patientId);
    var labResults = labResultRepository.findByPatientIdOrderByCollectedAtDesc(patientId);

    return new PatientPortalOverviewResponse(
        patient.getFullName(),
        upcomingAppointments.size(),
        threads.stream().mapToInt(PatientMessageThreadEntity::getUnreadCount).sum(),
        labResults.size(),
        upcomingAppointments.isEmpty() ? null : toAppointment(upcomingAppointments.get(0)));
  }

  @Transactional(readOnly = true)
  public List<PatientPortalAppointmentResponse> listAppointments(UUID patientId) {
    return appointmentRepository.findByPatientIdOrderByAppointmentDateDescFirstSlotStartTimeDesc(patientId).stream()
        .map(this::toAppointment)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<PatientPortalLabResultResponse> listLabResults(UUID patientId) {
    return labResultRepository.findByPatientIdOrderByCollectedAtDesc(patientId).stream()
        .map(result -> new PatientPortalLabResultResponse(
            result.getId(),
            result.getAppointment() == null ? null : result.getAppointment().getId(),
            result.getTestName(),
            result.getStatus(),
            result.getResultSummary(),
            result.getDoctorComment(),
            result.getAttachmentUrl(),
            result.getCollectedAt()))
        .toList();
  }

  @Transactional(readOnly = true)
  public List<PatientPortalMessageThreadResponse> listMessages(UUID patientId) {
    return patientMessageThreadRepository.findByPatientIdOrderByUpdatedAtDesc(patientId).stream()
        .map(thread -> new PatientPortalMessageThreadResponse(
            thread.getId(),
            thread.getSubject(),
            thread.getChannel(),
            thread.getUnreadCount(),
            thread.getLastMessagePreview(),
            thread.getUpdatedAt(),
            patientMessageRepository.findByThreadIdOrderByCreatedAtAsc(thread.getId()).stream()
                .map(message -> new PatientPortalMessageResponse(
                    message.getId(),
                    message.getSenderRole(),
                    message.getBody(),
                    message.getCreatedAt()))
                .toList()))
        .toList();
  }

  @Transactional(readOnly = true)
  public PatientPortalProfileResponse getProfile(UUID patientId) {
    var patient = patientRepository.findById(patientId)
        .orElseThrow(() -> new NotFoundException("Patient not found"));
    return toProfile(patientId, patient);
  }

  @Transactional
  public PatientPortalProfileResponse updateProfile(UUID patientId, PatientPortalProfileUpdateRequest request) {
    var patient = patientRepository.findById(patientId)
        .orElseThrow(() -> new NotFoundException("Patient not found"));
    patient.setFullName(request.fullName().trim());
    patient.setEmail(request.email().trim().toLowerCase());
    patient.setPhone(request.phone().trim());
    patient.setOccupation(request.occupation());
    patient.setBloodType(request.bloodType());
    patient.setMedicalHistory(request.medicalHistory());
    patient.setDrugAllergies(request.drugAllergies());
    patient.setInsuranceNumber(request.insuranceNumber());
    return toProfile(patientId, patient);
  }

  private PatientPortalAppointmentResponse toAppointment(com.hospital.core.appointment.AppointmentEntity appointment) {
    return new PatientPortalAppointmentResponse(
        appointment.getId(),
        appointment.getConfirmationCode(),
        appointment.getAppointmentDate(),
        appointment.getFirstSlot().getStartTime(),
        appointment.getFirstSlot().getEndTime(),
        appointment.getDoctor().getFullName(),
        appointment.getStatus().name());
  }

  private PatientPortalProfileResponse toProfile(UUID patientId, com.hospital.core.patient.PatientEntity patient) {
    return new PatientPortalProfileResponse(
        patientId,
        patient.getFullName(),
        patient.getEmail(),
        patient.getPhone(),
        patient.getDateOfBirth(),
        patient.getOccupation(),
        patient.getBloodType(),
        patient.getMedicalHistory(),
        patient.getDrugAllergies(),
        patient.getInsuranceNumber());
  }
}
