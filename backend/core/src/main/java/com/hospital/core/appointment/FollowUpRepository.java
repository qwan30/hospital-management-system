package com.hospital.core.appointment;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FollowUpRepository extends JpaRepository<FollowUpEntity, UUID> {
  @EntityGraph(attributePaths = {"parentAppointment"})
  Optional<FollowUpEntity> findByParentAppointmentId(UUID parentAppointmentId);

  boolean existsByParentAppointmentId(UUID parentAppointmentId);
}
