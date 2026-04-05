package com.hospital.core.admin;

import com.hospital.core.common.NotFoundException;
import com.hospital.core.content.ContentAdminService;
import com.hospital.core.department.DepartmentRepository;
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
import java.time.Instant;
import java.util.List;
import java.util.UUID;
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

  public OperationsAdminService(
      ContentAdminService contentAdminService,
      DepartmentRepository departmentRepository,
      RoomRepository roomRepository,
      DoctorScheduleTemplateRepository doctorScheduleTemplateRepository,
      SpecialClosureRepository specialClosureRepository,
      UserRepository userRepository) {
    this.contentAdminService = contentAdminService;
    this.departmentRepository = departmentRepository;
    this.roomRepository = roomRepository;
    this.doctorScheduleTemplateRepository = doctorScheduleTemplateRepository;
    this.specialClosureRepository = specialClosureRepository;
    this.userRepository = userRepository;
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

  @Transactional
  public AdminRoomResponse updateRoom(UUID roomId, AdminRoomUpsertRequest request) {
    var room = roomRepository.findById(roomId).orElseThrow(() -> new NotFoundException("Room not found"));
    applyRoom(room, request);
    return toRoomResponse(room);
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
    var activeAlerts = (int) specialClosureRepository.findAllByOrderByClosureDateDescTitleAsc().stream()
        .filter(SpecialClosureEntity::isActive)
        .count();
    return new SystemMonitoringSnapshotResponse(
        Instant.now(),
        0L,
        true,
        activeAlerts,
        "UP",
        "UP");
  }

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
