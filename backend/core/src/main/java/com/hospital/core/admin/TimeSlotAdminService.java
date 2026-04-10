package com.hospital.core.admin;

import com.hospital.core.common.NotFoundException;
import com.hospital.core.timeslot.TimeSlotEntity;
import com.hospital.core.timeslot.TimeSlotRepository;
import com.hospital.shared.admin.AdminSlotGenerateRequest;
import com.hospital.shared.admin.AdminSlotGenerateResult;
import com.hospital.shared.admin.AdminSlotResponse;
import com.hospital.shared.enums.SlotStatus;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TimeSlotAdminService {

  private static final int DEFAULT_SLOT_MINUTES = 30;

  private final DoctorScheduleTemplateRepository templateRepository;
  private final TimeSlotRepository timeSlotRepository;

  public TimeSlotAdminService(
      DoctorScheduleTemplateRepository templateRepository,
      TimeSlotRepository timeSlotRepository) {
    this.templateRepository = templateRepository;
    this.timeSlotRepository = timeSlotRepository;
  }

  /**
   * Generates time slots for the given date range using DoctorScheduleTemplates.
   * Skips slots that already exist (idempotent). Optionally scoped to a single doctor.
   */
  @Transactional
  public AdminSlotGenerateResult generateSlots(AdminSlotGenerateRequest request) {
    var templates = request.doctorId() != null
        ? templateRepository.findAllByOrderByDayOfWeekAscStartTimeAsc().stream()
            .filter(t -> t.getDoctor().getId().equals(request.doctorId()) && t.isActive())
            .toList()
        : templateRepository.findAllByOrderByDayOfWeekAscStartTimeAsc().stream()
            .filter(DoctorScheduleTemplateEntity::isActive)
            .toList();

    int created = 0;
    int skipped = 0;
    List<TimeSlotEntity> toSave = new ArrayList<>();

    for (var date = request.fromDate(); !date.isAfter(request.toDate()); date = date.plusDays(1)) {
      final var currentDate = date;
      var dayTemplates = templates.stream()
          .filter(t -> t.getDayOfWeek() == currentDate.getDayOfWeek().getValue())
          .toList();

      for (var template : dayTemplates) {
        var slotDuration = template.getSlotDurationMinutes() > 0
            ? template.getSlotDurationMinutes()
            : DEFAULT_SLOT_MINUTES;

        var start = template.getStartTime();
        while (!start.plusMinutes(slotDuration).isAfter(template.getEndTime())) {
          final var slotStart = start;
          final var doctorId = template.getDoctor().getId();

          // Check for existing slot to stay idempotent
          var existing = timeSlotRepository
              .findByDoctorIdAndSlotDateOrderByStartTimeAsc(doctorId, currentDate)
              .stream()
              .anyMatch(s -> s.getStartTime().equals(slotStart));

          if (existing) {
            skipped++;
          } else {
            var slot = new TimeSlotEntity();
            slot.setDoctor(template.getDoctor());
            slot.setSlotDate(currentDate);
            slot.setStartTime(slotStart);
            slot.setEndTime(slotStart.plusMinutes(slotDuration));
            slot.setStatus(SlotStatus.AVAILABLE);
            toSave.add(slot);
            created++;
          }
          start = start.plusMinutes(slotDuration);
        }
      }
    }

    timeSlotRepository.saveAll(toSave);
    return new AdminSlotGenerateResult(created, skipped, "%d slots created, %d skipped (already existed)".formatted(created, skipped));
  }

  @Transactional
  public AdminSlotResponse blockSlot(UUID slotId) {
    var slot = findSlot(slotId);
    if (slot.getStatus() == SlotStatus.BOOKED) {
      throw new com.hospital.core.common.ConflictException("Cannot block a BOOKED slot");
    }
    slot.setStatus(SlotStatus.BLOCKED);
    return toResponse(slot);
  }

  @Transactional
  public void deleteSlot(UUID slotId) {
    var slot = findSlot(slotId);
    if (slot.getStatus() == SlotStatus.BOOKED) {
      throw new com.hospital.core.common.ConflictException("Cannot delete a BOOKED slot");
    }
    timeSlotRepository.delete(slot);
  }

  private TimeSlotEntity findSlot(UUID slotId) {
    return timeSlotRepository.findById(slotId)
        .orElseThrow(() -> new NotFoundException("Slot not found"));
  }

  private AdminSlotResponse toResponse(TimeSlotEntity slot) {
    return new AdminSlotResponse(
        slot.getId(),
        slot.getDoctor().getId(),
        slot.getDoctor().getFullName(),
        slot.getSlotDate(),
        slot.getStartTime(),
        slot.getEndTime(),
        slot.getStatus());
  }
}
