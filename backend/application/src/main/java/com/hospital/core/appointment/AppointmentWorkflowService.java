package com.hospital.core.appointment;

import com.hospital.core.common.ConflictException;
import com.hospital.core.common.NotFoundException;
import com.hospital.core.patient.PatientIdentifierProtector;
import com.hospital.core.user.UserRepository;
import com.hospital.shared.appointment.AppointmentDetailResponse;
import com.hospital.shared.appointment.AppointmentListResponse;
import com.hospital.shared.appointment.AppointmentUpdateRequest;
import com.hospital.shared.appointment.AppointmentVitalSignsRequest;
import com.hospital.shared.appointment.AppointmentVitalSignsResponse;
import com.hospital.shared.appointment.ClinicalAppointmentResponse;
import com.hospital.shared.appointment.FollowUpRequest;
import com.hospital.shared.appointment.FollowUpResponse;
import com.hospital.shared.enums.AppointmentStatus;
import com.hospital.shared.enums.UserRole;
import java.math.BigDecimal;
import java.util.Comparator;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AppointmentWorkflowService {
  private final AppointmentRepository appointmentRepository;
  private final AppointmentVitalSignsRepository vitalSignsRepository;
  private final FollowUpRepository followUpRepository;
  private final PatientIdentifierProtector patientIdentifierProtector;
  private final UserRepository userRepository;

  public AppointmentWorkflowService(
      AppointmentRepository appointmentRepository,
      AppointmentVitalSignsRepository vitalSignsRepository,
      FollowUpRepository followUpRepository,
      PatientIdentifierProtector patientIdentifierProtector,
      UserRepository userRepository) {
    this.appointmentRepository = appointmentRepository;
    this.vitalSignsRepository = vitalSignsRepository;
    this.followUpRepository = followUpRepository;
    this.patientIdentifierProtector = patientIdentifierProtector;
    this.userRepository = userRepository;
  }

  @Transactional(readOnly = true)
  public List<ClinicalAppointmentResponse> listAppointmentsForDate(LocalDate appointmentDate) {
    return appointmentRepository.findByAppointmentDateOrderByFirstSlotStartTimeAsc(appointmentDate).stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public Page<AppointmentListResponse> listAppointments(
      AppointmentStatus status, UUID doctorId, LocalDate date, int page, int size) {
    var pageable = PageRequest.of(page, size);
    return appointmentRepository.findAllFiltered(status, doctorId, date, pageable)
        .map(this::toListResponse);
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

  @Transactional
  public void cancelAppointment(UUID appointmentId) {
    var appointment = appointmentRepository.findDetailedById(appointmentId)
        .orElseThrow(() -> new NotFoundException("Appointment not found"));

    if (appointment.getStatus() == AppointmentStatus.CANCELLED
        || appointment.getStatus() == AppointmentStatus.DONE) {
      throw new ConflictException("Cannot cancel a " + appointment.getStatus().name().toLowerCase() + " appointment");
    }

    appointment.setStatus(AppointmentStatus.CANCELLED);
  }

  @Transactional
  public ClinicalAppointmentResponse updateAppointmentMeta(UUID appointmentId, AppointmentUpdateRequest request) {
    var appointment = appointmentRepository.findDetailedById(appointmentId)
        .orElseThrow(() -> new NotFoundException("Appointment not found"));

    if (request.notes() != null) {
      appointment.setNotes(request.notes());
    }
    if (request.reason() != null) {
      appointment.setReason(request.reason());
    }
    return toResponse(appointment);
  }

  @Transactional
  public AppointmentVitalSignsResponse recordVitalSigns(UUID appointmentId, AppointmentVitalSignsRequest request) {
    var appointment = appointmentRepository.findDetailedById(appointmentId)
        .orElseThrow(() -> new NotFoundException("Appointment not found"));

    if (vitalSignsRepository.existsByAppointmentId(appointmentId)) {
      throw new ConflictException("Vital signs already recorded for this appointment");
    }

    var entity = new AppointmentVitalSignsEntity();
    entity.setAppointment(appointment);
    entity.setBloodPressure(request.bloodPressure());
    entity.setTemperature(toBigDecimal(request.temperature()));
    entity.setWeight(toBigDecimal(request.weight()));
    entity.setHeight(toBigDecimal(request.height()));
    entity.setHeartRate(request.heartRate());
    entity.setRespiratoryRate(request.respiratoryRate());
    entity.setOxygenSaturation(toBigDecimal(request.oxygenSaturation()));
    var saved = vitalSignsRepository.save(entity);
    return toVitalSignsResponse(saved);
  }

  @Transactional(readOnly = true)
  public AppointmentVitalSignsResponse getVitalSigns(UUID appointmentId) {
    var entity = vitalSignsRepository.findByAppointmentId(appointmentId)
        .orElseThrow(() -> new NotFoundException("Vital signs not found for this appointment"));
    return toVitalSignsResponse(entity);
  }

  @Transactional
  public FollowUpResponse createFollowUp(UUID appointmentId, FollowUpRequest request) {
    var appointment = appointmentRepository.findDetailedById(appointmentId)
        .orElseThrow(() -> new NotFoundException("Appointment not found"));

    if (followUpRepository.existsByParentAppointmentId(appointmentId)) {
      throw new ConflictException("Follow-up already exists for this appointment");
    }

    var entity = new FollowUpEntity();
    entity.setParentAppointment(appointment);
    entity.setFollowUpDate(request.followUpDate());
    entity.setReason(request.reason());
    var saved = followUpRepository.save(entity);
    return toFollowUpResponse(saved);
  }

  @Transactional(readOnly = true)
  public FollowUpResponse getFollowUp(UUID appointmentId) {
    var entity = followUpRepository.findByParentAppointmentId(appointmentId)
        .orElseThrow(() -> new NotFoundException("No follow-up found for this appointment"));
    return toFollowUpResponse(entity);
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

  private BigDecimal toBigDecimal(Double value) {
    return value == null ? null : BigDecimal.valueOf(value);
  }

  private Double toDouble(BigDecimal value) {
    return value == null ? null : value.doubleValue();
  }

  private AppointmentListResponse toListResponse(AppointmentEntity appointment) {
    return new AppointmentListResponse(
        appointment.getId(),
        appointment.getConfirmationCode(),
        appointment.getStatus(),
        appointment.getAppointmentDate(),
        appointment.getFirstSlot().getStartTime(),
        appointment.getFirstSlot().getEndTime(),
        appointment.getDoctor().getId(),
        appointment.getDoctor().getFullName(),
        appointment.getPatient().getId(),
        appointment.getPatient().getFullName(),
        appointment.getPatient().getPhone(),
        appointment.getSymptoms(),
        appointment.getCreatedAt());
  }

  private AppointmentVitalSignsResponse toVitalSignsResponse(AppointmentVitalSignsEntity entity) {
    return new AppointmentVitalSignsResponse(
        entity.getId(),
        entity.getAppointment().getId(),
        entity.getBloodPressure(),
        toDouble(entity.getTemperature()),
        toDouble(entity.getWeight()),
        toDouble(entity.getHeight()),
        entity.getHeartRate(),
        entity.getRespiratoryRate(),
        toDouble(entity.getOxygenSaturation()),
        entity.getRecordedAt());
  }

  private FollowUpResponse toFollowUpResponse(FollowUpEntity entity) {
    return new FollowUpResponse(
        entity.getId(),
        entity.getParentAppointment().getId(),
        entity.getFollowUpDate(),
        entity.getReason(),
        entity.getParentAppointment().getStatus());
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
