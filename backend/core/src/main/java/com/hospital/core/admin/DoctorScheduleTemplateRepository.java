package com.hospital.core.admin;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorScheduleTemplateRepository extends JpaRepository<DoctorScheduleTemplateEntity, UUID> {
  @EntityGraph(attributePaths = {"doctor", "room"})
  List<DoctorScheduleTemplateEntity> findAllByOrderByDayOfWeekAscStartTimeAsc();
}
