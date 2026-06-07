package com.hospital.core.admin;

import com.hospital.core.common.NotFoundException;
import com.hospital.core.content.ContentAdminService;
import com.hospital.core.department.DepartmentRepository;
import com.hospital.core.inventory.InventoryService;
import com.hospital.core.appointment.AppointmentRepository;
import com.hospital.core.user.UserRepository;
import com.hospital.shared.admin.AdminPublicContentResponse;
import com.hospital.shared.admin.AdminRoomResponse;
import com.hospital.shared.admin.AdminRoomUpsertRequest;
import com.hospital.shared.admin.AdminNewsArticleUpsertRequest;
import com.hospital.shared.admin.DoctorScheduleTemplateResponse;
import com.hospital.shared.admin.DoctorScheduleTemplateUpsertRequest;
import com.hospital.shared.admin.SpecialClosureResponse;
import com.hospital.shared.admin.SpecialClosureUpsertRequest;
import com.hospital.shared.admin.SystemMonitoringSnapshotResponse;
import com.hospital.shared.enums.RoomStatus;
import com.hospital.shared.enums.UserRole;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import javax.sql.DataSource;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OperationsAdminService {
  private final ContentAdminService contentAdminService;
  private final DepartmentRepository departmentRepository;
  private final RoomRepository roomRepository;
  private final DoctorScheduleTemplateRepository doctorScheduleTemplateRepository;
  private final SpecialClosureRepository specialClosureRepository;
  private final UserRepository userRepository;
  private final InventoryService inventoryService;
  private final AppointmentRepository appointmentRepository;
  private final DataSource dataSource;
  private final Environment environment;
  private final Clock clock;
  private final Instant startedAt;

  public OperationsAdminService(
      ContentAdminService contentAdminService,
      DepartmentRepository departmentRepository,
      RoomRepository roomRepository,
      DoctorScheduleTemplateRepository doctorScheduleTemplateRepository,
      SpecialClosureRepository specialClosureRepository,
      UserRepository userRepository,
      InventoryService inventoryService,
      AppointmentRepository appointmentRepository,
      DataSource dataSource,
      Environment environment,
      Clock clock) {
    this.contentAdminService = contentAdminService;
    this.departmentRepository = departmentRepository;
    this.roomRepository = roomRepository;
    this.doctorScheduleTemplateRepository = doctorScheduleTemplateRepository;
    this.specialClosureRepository = specialClosureRepository;
    this.userRepository = userRepository;
    this.inventoryService = inventoryService;
    this.appointmentRepository = appointmentRepository;
    this.dataSource = dataSource;
    this.environment = environment;
    this.clock = clock;
    this.startedAt = Instant.now(clock);
  }

  @Transactional(readOnly = true)
  public List<AdminRoomResponse> listRooms() {
    return roomRepository.findAllByOrderByNameAsc().stream().map(this::toRoomResponse).toList();
  }

  @Transactional
  public AdminRoomResponse createRoom(AdminRoomUpsertRequest request) {
    var room = new RoomEntity();
    applyRoom(room, request);
    return toRoomResponse(roomRepository.save(room));
  }

  @Transactional(readOnly = true)
  public AdminRoomResponse getRoom(UUID roomId) {
    return toRoomResponse(
        roomRepository.findById(roomId).orElseThrow(() -> new NotFoundException("Room not found")));
  }

  @Transactional
  public AdminRoomResponse updateRoom(UUID roomId, AdminRoomUpsertRequest request) {
    var room = roomRepository.findById(roomId).orElseThrow(() -> new NotFoundException("Room not found"));
    applyRoom(room, request);
    return toRoomResponse(room);
  }

  @Transactional
  public AdminRoomResponse updateRoomStatus(UUID roomId, RoomStatus status) {
    var room = roomRepository.findById(roomId).orElseThrow(() -> new NotFoundException("Room not found"));
    room.setStatus(status);
    return toRoomResponse(room);
  }

  @Transactional
  public void deleteRoom(UUID roomId) {
    var room = roomRepository.findById(roomId).orElseThrow(() -> new NotFoundException("Room not found"));
    room.setActive(false);
    // Soft-delete: preserves historical appointment room references
  }

  @Transactional(readOnly = true)
  public List<DoctorScheduleTemplateResponse> listScheduleTemplates() {
    return doctorScheduleTemplateRepository.findAllByOrderByDayOfWeekAscStartTimeAsc().stream()
        .map(this::toScheduleTemplateResponse)
        .toList();
  }

  @Transactional
  public DoctorScheduleTemplateResponse createScheduleTemplate(DoctorScheduleTemplateUpsertRequest request) {
    var template = new DoctorScheduleTemplateEntity();
    applyScheduleTemplate(template, request);
    return toScheduleTemplateResponse(doctorScheduleTemplateRepository.save(template));
  }

  @Transactional
  public DoctorScheduleTemplateResponse updateScheduleTemplate(UUID templateId, DoctorScheduleTemplateUpsertRequest request) {
    var template = doctorScheduleTemplateRepository.findById(templateId)
        .orElseThrow(() -> new NotFoundException("Schedule template not found"));
    applyScheduleTemplate(template, request);
    return toScheduleTemplateResponse(template);
  }

  @Transactional(readOnly = true)
  public List<SpecialClosureResponse> listSpecialClosures() {
    return specialClosureRepository.findAllByOrderByClosureDateDescTitleAsc().stream()
        .map(this::toSpecialClosureResponse)
        .toList();
  }

  @Transactional
  public SpecialClosureResponse createSpecialClosure(SpecialClosureUpsertRequest request) {
    var closure = new SpecialClosureEntity();
    applySpecialClosure(closure, request);
    return toSpecialClosureResponse(specialClosureRepository.save(closure));
  }

  @Transactional
  public SpecialClosureResponse updateSpecialClosure(UUID closureId, SpecialClosureUpsertRequest request) {
    var closure = specialClosureRepository.findById(closureId)
        .orElseThrow(() -> new NotFoundException("Special closure not found"));
    applySpecialClosure(closure, request);
    return toSpecialClosureResponse(closure);
  }

  @Transactional(readOnly = true)
  public List<AdminPublicContentResponse> listPublicContent() {
    return contentAdminService.listAllNews().stream()
        .map(article -> new AdminPublicContentResponse(
            article.id(),
            article.slug(),
            article.title(),
            article.summary(),
            article.content(),
            article.imageUrl(),
            article.publishedAt(),
            true))
        .toList();
  }

  @Transactional
  public AdminPublicContentResponse createPublicContent(AdminNewsArticleUpsertRequest request) {
    var article = contentAdminService.createNews(request);
    return new AdminPublicContentResponse(
        article.id(),
        article.slug(),
        article.title(),
        article.summary(),
        article.content(),
        article.imageUrl(),
        article.publishedAt(),
        true);
  }

  @Transactional
  public AdminPublicContentResponse updatePublicContent(UUID contentId, AdminNewsArticleUpsertRequest request) {
    var article = contentAdminService.updateNews(contentId, request);
    return new AdminPublicContentResponse(
        article.id(),
        article.slug(),
        article.title(),
        article.summary(),
        article.content(),
        article.imageUrl(),
        article.publishedAt(),
        true);
  }

  @Transactional(readOnly = true)
  public SystemMonitoringSnapshotResponse getMonitoringSnapshot() {
    var today = LocalDate.now(clock);
    var scheduleAlertCount = (int) specialClosureRepository.findAllByOrderByClosureDateDescTitleAsc().stream()
        .filter(SpecialClosureEntity::isActive)
        .count();
    var inventoryAlertCount = inventoryService.listAlerts(today).size();
    var activeAlerts = scheduleAlertCount + inventoryAlertCount;
    var databaseStatus = databaseStatus();
    var queueSnapshot = queueSnapshot(today);
    var metricsStatus = metricsStatus();
    var tracingStatus = tracingStatus();
    var loggingStatus = loggingStatus();
    var observabilityStatus = observabilityStatus(metricsStatus, tracingStatus, loggingStatus);
    var healthy = activeAlerts == 0
        && "UP".equals(databaseStatus)
        && "UP".equals(queueSnapshot.status())
        && "UP".equals(observabilityStatus);

    return new SystemMonitoringSnapshotResponse(
        Instant.now(clock),
        java.time.Duration.between(startedAt, Instant.now(clock)).toSeconds(),
        healthy,
        activeAlerts,
        scheduleAlertCount,
        inventoryAlertCount,
        databaseStatus,
        queueSnapshot.status(),
        queueSnapshot.todayQueueCount(),
        metricsStatus,
        tracingStatus,
        loggingStatus,
        observabilityStatus);
  }

  private String databaseStatus() {
    try (Connection connection = dataSource.getConnection()) {
      return connection.isValid(2) ? "UP" : "DEGRADED";
    } catch (SQLException exception) {
      return "DOWN";
    }
  }

  private QueueSnapshot queueSnapshot(LocalDate today) {
    try {
      return new QueueSnapshot("UP", appointmentRepository.countByAppointmentDate(today));
    } catch (RuntimeException exception) {
      return new QueueSnapshot("DEGRADED", -1L);
    }
  }

  private String metricsStatus() {
    var exposure = environment.getProperty("management.endpoints.web.exposure.include", "");
    return exposure.contains("prometheus") ? "UP" : "MISSING";
  }

  private String tracingStatus() {
    if (!environment.getProperty("management.tracing.enabled", Boolean.class, true)) {
      return "DISABLED";
    }
    var endpoint = environment.getProperty("management.otlp.tracing.endpoint", "");
    return endpoint == null || endpoint.isBlank() ? "MISSING" : "UP";
  }

  private String loggingStatus() {
    return environment.getProperty("hms.observability.structured-logging-enabled", Boolean.class, true)
        ? "UP"
        : "TEXT_ONLY";
  }

  private String observabilityStatus(String metricsStatus, String tracingStatus, String loggingStatus) {
    return "UP".equals(metricsStatus) && "UP".equals(tracingStatus) && "UP".equals(loggingStatus)
        ? "UP"
        : "DEGRADED";
  }

  private record QueueSnapshot(String status, long todayQueueCount) {}

  private void applyRoom(RoomEntity room, AdminRoomUpsertRequest request) {
    room.setName(request.name().trim());
    room.setDepartment(request.departmentId() == null
        ? null
        : departmentRepository.findById(request.departmentId())
            .orElseThrow(() -> new NotFoundException("Department not found")));
    room.setStatus(request.status() == null ? RoomStatus.READY : request.status());
    room.setActive(request.active() == null ? true : request.active());
  }

  private void applyScheduleTemplate(DoctorScheduleTemplateEntity template, DoctorScheduleTemplateUpsertRequest request) {
    template.setDoctor(userRepository.findByIdAndRoleAndActiveTrue(request.doctorId(), UserRole.DOCTOR)
        .orElseThrow(() -> new NotFoundException("Doctor not found")));
    template.setDayOfWeek(request.weekday());
    template.setStartTime(request.startTime());
    template.setEndTime(request.endTime());
    template.setSlotDurationMinutes(request.slotDurationMinutes());
    template.setActive(request.active() == null ? true : request.active());
  }

  private void applySpecialClosure(SpecialClosureEntity closure, SpecialClosureUpsertRequest request) {
    closure.setTitle(request.title().trim());
    closure.setClosureDate(request.closureDate());
    closure.setDoctor(request.doctorId() == null
        ? null
        : userRepository.findById(request.doctorId()).orElseThrow(() -> new NotFoundException("Doctor not found")));
    closure.setRoom(request.roomId() == null
        ? null
        : roomRepository.findById(request.roomId()).orElseThrow(() -> new NotFoundException("Room not found")));
    closure.setReason(request.reason());
    closure.setActive(request.active() == null ? true : request.active());
  }

  private AdminRoomResponse toRoomResponse(RoomEntity room) {
    return new AdminRoomResponse(
        room.getId(),
        room.getName(),
        room.getDepartment() == null ? null : room.getDepartment().getId(),
        room.getDepartment() == null ? null : room.getDepartment().getName(),
        room.getStatus(),
        room.isActive());
  }

  private DoctorScheduleTemplateResponse toScheduleTemplateResponse(DoctorScheduleTemplateEntity template) {
    return new DoctorScheduleTemplateResponse(
        template.getId(),
        template.getDoctor().getId(),
        template.getDoctor().getFullName(),
        template.getDayOfWeek(),
        template.getStartTime(),
        template.getEndTime(),
        template.getSlotDurationMinutes(),
        template.isActive());
  }

  private SpecialClosureResponse toSpecialClosureResponse(SpecialClosureEntity closure) {
    return new SpecialClosureResponse(
        closure.getId(),
        closure.getTitle(),
        closure.getClosureDate(),
        closure.getDoctor() == null ? null : closure.getDoctor().getId(),
        closure.getDoctor() == null ? null : closure.getDoctor().getFullName(),
        closure.getRoom() == null ? null : closure.getRoom().getId(),
        closure.getRoom() == null ? null : closure.getRoom().getName(),
        closure.getReason(),
        closure.isActive());
  }
}
