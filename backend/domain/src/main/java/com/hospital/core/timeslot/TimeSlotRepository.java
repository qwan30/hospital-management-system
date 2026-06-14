package com.hospital.core.timeslot;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TimeSlotRepository extends JpaRepository<TimeSlotEntity, UUID> {
  List<TimeSlotEntity> findByDoctorIdAndSlotDateOrderByStartTimeAsc(UUID doctorId, LocalDate slotDate);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("""
      select slot from TimeSlotEntity slot
      where slot.doctor.id = :doctorId
        and slot.slotDate = :slotDate
        and slot.startTime >= :startTime
      order by slot.startTime asc
      """)
  List<TimeSlotEntity> lockWindow(
      @Param("doctorId") UUID doctorId,
      @Param("slotDate") LocalDate slotDate,
      @Param("startTime") LocalTime startTime);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select slot from TimeSlotEntity slot where slot.id = :slotId")
  Optional<TimeSlotEntity> findByIdForUpdate(@Param("slotId") UUID slotId);

  @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"doctor"})
  List<TimeSlotEntity> findTop10BySlotDateGreaterThanEqualAndStatusOrderBySlotDateAscStartTimeAsc(
      LocalDate slotDate,
      com.hospital.shared.enums.SlotStatus status);
}
