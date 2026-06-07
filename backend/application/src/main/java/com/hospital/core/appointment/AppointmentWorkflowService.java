package com.hospital.core.appointment;

import com.hospital.core.common.ConflictException;
import com.hospital.core.common.NotFoundException;
import com.hospital.core.audit.AuditLogService;
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
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import io.micrometer.core.instrument.Metrics;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
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
  private final AuditLogService auditLogService;
  private final EntityManager entityManager;

  public AppointmentWorkflowService(
      AppointmentRepository appointmentRepository,
      AppointmentVitalSignsRepository vitalSignsRepository,
      FollowUpRepository followUpRepository,
      PatientIdentifierProtector patientIdentifierProtector,
      UserRepository userRepository,
      AuditLogService auditLogService,
      EntityManager entityManager) {
    this.appointmentRepository = appointmentRepository;
    this.vitalSignsRepository = vitalSignsRepository;
    this.followUpRepository = followUpRepository;
    this.patientIdentifierProtector = patientIdentifierProtector;
    this.userRepository = userRepository;
    this.auditLogService = auditLogService;
    this.entityManager = entityManager;
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
    return findAppointmentsFiltered(status, doctorId, date, pageable)
        .map(this::toListResponse);
  }

  private Page<AppointmentEntity> findAppointmentsFiltered(
      AppointmentStatus status, UUID doctorId, LocalDate date, PageRequest pageable) {
    var filters = appointmentFilters(status, doctorId, date);
    var whereClause = filters.isEmpty() ? "" : " where " + String.join(" and ", filters);
    var sortClause = " order by appointment.appointmentDate desc, appointment.firstSlot.startTime asc";
    var contentQuery = entityManager.createQuery(
        "select appointment from AppointmentEntity appointment"
            + " join fetch appointment.patient"
            + " join fetch appointment.doctor"
            + " join fetch appointment.firstSlot"
            + whereClause
            + sortClause,
        AppointmentEntity.class);
    bindAppointmentFilters(contentQuery, status, doctorId, date);
    contentQuery.setFirstResult((int) pageable.getOffset());
    contentQuery.setMaxResults(pageable.getPageSize());

    var countQuery = entityManager.createQuery(
        "select count(appointment) from AppointmentEntity appointment" + whereClause,
        Long.class);
    bindAppointmentFilters(countQuery, status, doctorId, date);

    return new PageImpl<>(contentQuery.getResultList(), pageable, countQuery.getSingleResult());
  }

  private List<String> appointmentFilters(AppointmentStatus status, UUID doctorId, LocalDate date) {
    var filters = new ArrayList<String>();
    if (status != null) {
      filters.add("appointment.status = :status");
    }
    if (doctorId != null) {
      filters.add("appointment.doctor.id = :doctorId");
    }
    if (date != null) {
      filters.add("appointment.appointmentDate = :date");
    }
    return filters;
  }

  private <T> void bindAppointmentFilters(
      TypedQuery<T> query, AppointmentStatus status, UUID doctorId, LocalDate date) {
    if (status != null) {
      query.setParameter("status", status);
    }
    if (doctorId != null) {
      query.setParameter("doctorId", doctorId);
    }
    if (date != null) {
      query.setParameter("date", date);
    }
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

  @Transactional
  public ClinicalAppointmentResponse callQueuePatient(UUID appointmentId) {
    var appointment = requireQueueAppointment(
        appointmentId,
        List.of(AppointmentStatus.CHECKED_IN, AppointmentStatus.IN_PROGRESS),
        "Only active queue appointments can be called");

    recordQueueAudit(appointment, "QUEUE_CALL_PATIENT", Map.of(
        "status", appointment.getStatus().name()));
    return toResponse(appointment);
  }

  @Transactional
  public ClinicalAppointmentResponse skipQueuePatient(UUID appointmentId, LocalDateTime skippedAt) {
    var appointment = requireQueueAppointment(
        appointmentId,
        List.of(AppointmentStatus.CHECKED_IN),
        "Only ready queue appointments can be skipped");

    appointment.setCheckedInAt(skippedAt);
    recordQueueAudit(appointment, "QUEUE_SKIP_PATIENT", Map.of(
        "status", appointment.getStatus().name(),
        "checkedInAt", skippedAt.toString()));
    return toResponse(appointment);
  }

  @Transactional
  public ClinicalAppointmentResponse assignQueueRoom(UUID appointmentId, String roomName) {
    var normalizedRoomName = normalizeRoomName(roomName);
    var appointment = requireQueueAppointment(
        appointmentId,
        List.of(AppointmentStatus.CHECKED_IN, AppointmentStatus.IN_PROGRESS),
        "Only active queue appointments can be assigned to a room");

    appointment.setNotes(appendQueueNote(appointment.getNotes(), "Assigned room: " + normalizedRoomName));
    recordQueueAudit(appointment, "QUEUE_ASSIGN_ROOM", Map.of(
        "status", appointment.getStatus().name(),
        "roomName", normalizedRoomName));
    return toResponse(appointment);
  }

  @Transactional
  public ClinicalAppointmentResponse markInConsultation(UUID appointmentId) {
    var appointment = requireQueueAppointment(
        appointmentId,
        List.of(AppointmentStatus.CHECKED_IN),
        "Only ready queue appointments can move into consultation");

    appointment.setStatus(AppointmentStatus.IN_PROGRESS);
    recordQueueAudit(appointment, "QUEUE_START_CONSULTATION", Map.of(
        "previousStatus", AppointmentStatus.CHECKED_IN.name(),
        "nextStatus", AppointmentStatus.IN_PROGRESS.name()));
    return toResponse(appointment);
  }

  @Transactional
  public ClinicalAppointmentResponse completeQueueVisit(UUID appointmentId) {
    var appointment = requireQueueAppointment(
        appointmentId,
        List.of(AppointmentStatus.IN_PROGRESS),
        "Appointment must be in consultation before it can be completed");

    appointment.setStatus(AppointmentStatus.DONE);
    recordQueueAudit(appointment, "QUEUE_COMPLETE_VISIT", Map.of(
        "previousStatus", AppointmentStatus.IN_PROGRESS.name(),
        "nextStatus", AppointmentStatus.DONE.name()));
    return toResponse(appointment);
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
    return getAppointmentDetail(doctorId, UserRole.DOCTOR, appointmentId);
  }

  @Transactional(readOnly = true)
  public AppointmentDetailResponse getAppointmentDetail(UUID actorId, UserRole actorRole, UUID appointmentId) {
    var appointment = appointmentRepository.findDetailedById(appointmentId)
        .orElseThrow(() -> new NotFoundException("Appointment not found"));

    if (actorRole == UserRole.DOCTOR && !appointment.getDoctor().getId().equals(actorId)) {
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

  private AppointmentEntity requireQueueAppointment(
      UUID appointmentId,
      List<AppointmentStatus> allowedStatuses,
      String conflictMessage) {
    var appointment = appointmentRepository.findDetailedById(appointmentId)
        .orElseThrow(() -> new NotFoundException("Appointment not found"));

    if (!allowedStatuses.contains(appointment.getStatus())) {
      throw new ConflictException(conflictMessage);
    }

    return appointment;
  }

  private void recordQueueAudit(AppointmentEntity appointment, String action, Map<String, Object> metadata) {
    Metrics.counter(
            "hms.queue.transitions",
            "action", action,
            "status", appointment.getStatus().name())
        .increment();
    auditLogService.record(action, "APPOINTMENT", appointment.getId(), metadata);
  }

  private String normalizeRoomName(String roomName) {
    if (roomName == null || roomName.isBlank()) {
      throw new ConflictException("Room name is required for queue assignment");
    }

    return roomName.trim();
  }

  private String appendQueueNote(String existingNotes, String queueNote) {
    if (existingNotes == null || existingNotes.isBlank()) {
      return queueNote;
    }

    return existingNotes + System.lineSeparator() + queueNote;
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
