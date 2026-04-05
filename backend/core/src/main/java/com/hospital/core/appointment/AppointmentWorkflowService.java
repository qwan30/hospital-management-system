package com.hospital.core.appointment;

import com.hospital.core.common.ConflictException;
import com.hospital.core.common.NotFoundException;
import com.hospital.core.patient.PatientIdentifierProtector;
import com.hospital.core.user.UserRepository;
import com.hospital.shared.appointment.AppointmentDetailResponse;
import com.hospital.shared.appointment.ClinicalAppointmentResponse;
import com.hospital.shared.enums.AppointmentStatus;
import com.hospital.shared.enums.UserRole;
import java.util.Comparator;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AppointmentWorkflowService {
  private final AppointmentRepository appointmentRepository;
  private final PatientIdentifierProtector patientIdentifierProtector;
  private final UserRepository userRepository;

  public AppointmentWorkflowService(
      AppointmentRepository appointmentRepository,
      PatientIdentifierProtector patientIdentifierProtector,
      UserRepository userRepository) {
    this.appointmentRepository = appointmentRepository;
    this.patientIdentifierProtector = patientIdentifierProtector;
    this.userRepository = userRepository;
  }

  @Transactional(readOnly = true)
  public List<ClinicalAppointmentResponse> listAppointmentsForDate(LocalDate appointmentDate) {
    return appointmentRepository.findByAppointmentDateOrderByFirstSlotStartTimeAsc(appointmentDate).stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional
  public ClinicalAppointmentResponse checkInAppointment(UUID appointmentId, LocalDateTime checkedInAt) {
    var appointment = appointmentRepository.findDetailedById(appointmentId)
        .orElseThrow(() -> new NotFoundException("Appointment not found"));

    if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
      throw new ConflictException("Only confirmed appointments can be checked in");
    }

    appointment.setStatus(AppointmentStatus.CHECKED_IN);
    appointment.setCheckedInAt(checkedInAt);
    return toResponse(appointment);
  }

  @Transactional(readOnly = true)
  public List<ClinicalAppointmentResponse> listQueueForDate(LocalDate appointmentDate) {
    return appointmentRepository.findByAppointmentDateAndStatusInOrderByCheckedInAtAscFirstSlotStartTimeAsc(
            appointmentDate,
            List.of(AppointmentStatus.CHECKED_IN, AppointmentStatus.IN_PROGRESS))
        .stream()
        .map(this::toResponse)
        .sorted(Comparator
            .comparing(ClinicalAppointmentResponse::checkedInAt, Comparator.nullsLast(LocalDateTime::compareTo))
            .thenComparing(ClinicalAppointmentResponse::appointmentDate)
            .thenComparing(ClinicalAppointmentResponse::startTime))
        .toList();
  }

  @Transactional(readOnly = true)
  public List<ClinicalAppointmentResponse> listScheduleForDoctor(UUID doctorId, LocalDate startDate, LocalDate endDate) {
    userRepository.findByIdAndRoleAndActiveTrue(doctorId, UserRole.DOCTOR)
        .orElseThrow(() -> new NotFoundException("Doctor not found"));

    if (startDate.equals(endDate)) {
      return appointmentRepository.findByDoctorIdAndAppointmentDateOrderByFirstSlotStartTimeAsc(doctorId, startDate).stream()
          .map(this::toResponse)
          .toList();
    }

    return appointmentRepository.findByDoctorIdAndAppointmentDateBetweenOrderByAppointmentDateAscFirstSlotStartTimeAsc(
            doctorId,
            startDate,
            endDate)
        .stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public AppointmentDetailResponse getAppointmentDetail(UUID doctorId, UUID appointmentId) {
    var appointment = appointmentRepository.findDetailedById(appointmentId)
        .orElseThrow(() -> new NotFoundException("Appointment not found"));

    if (!appointment.getDoctor().getId().equals(doctorId)) {
      throw new AccessDeniedException("Doctor cannot access another doctor's appointment");
    }

    return toDetailResponse(appointment);
  }

  @Transactional
  public ClinicalAppointmentResponse updateAppointmentStatus(UUID doctorId, UUID appointmentId, AppointmentStatus nextStatus) {
    var appointment = appointmentRepository.findDetailedById(appointmentId)
        .orElseThrow(() -> new NotFoundException("Appointment not found"));

    if (!appointment.getDoctor().getId().equals(doctorId)) {
      throw new AccessDeniedException("Doctor cannot manage another doctor's appointment");
    }

    if (!isAllowedDoctorTransition(appointment.getStatus(), nextStatus)) {
      throw new ConflictException("Invalid appointment status transition");
    }

    appointment.setStatus(nextStatus);
    return toResponse(appointment);
  }

  private boolean isAllowedDoctorTransition(AppointmentStatus currentStatus, AppointmentStatus nextStatus) {
    return currentStatus == AppointmentStatus.CHECKED_IN && nextStatus == AppointmentStatus.IN_PROGRESS;
  }

  private ClinicalAppointmentResponse toResponse(AppointmentEntity appointment) {
    return new ClinicalAppointmentResponse(
        appointment.getId(),
        appointment.getConfirmationCode(),
        appointment.getStatus(),
        appointment.getAppointmentDate(),
        appointment.getFirstSlot().getStartTime(),
        appointment.getFirstSlot().getEndTime(),
        appointment.getCheckedInAt(),
        appointment.getDoctor().getId(),
        appointment.getDoctor().getFullName(),
        appointment.getPatient().getId(),
        appointment.getPatient().getFullName(),
        appointment.getPatient().getPhone(),
        patientIdentifierProtector.decrypt(appointment.getPatient().getCccd()));
  }

  private AppointmentDetailResponse toDetailResponse(AppointmentEntity appointment) {
    return new AppointmentDetailResponse(
        appointment.getId(),
        appointment.getConfirmationCode(),
        appointment.getStatus(),
        appointment.getAppointmentDate(),
        appointment.getFirstSlot().getStartTime(),
        appointment.getFirstSlot().getEndTime(),
        appointment.getCheckedInAt(),
        appointment.getAiDurationMinutes(),
        appointment.getSymptoms(),
        appointment.getDoctor().getId(),
        appointment.getDoctor().getFullName(),
        appointment.getPatient().getId(),
        appointment.getPatient().getFullName(),
        appointment.getPatient().getPhone(),
        patientIdentifierProtector.decrypt(appointment.getPatient().getCccd()),
        appointment.getPatient().getEmail(),
        appointment.getPatient().getDateOfBirth(),
        appointment.getPatient().getGender());
  }
}
