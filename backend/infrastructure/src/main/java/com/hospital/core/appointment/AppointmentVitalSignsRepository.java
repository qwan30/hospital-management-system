package com.hospital.core.appointment;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentVitalSignsRepository extends JpaRepository<AppointmentVitalSignsEntity, UUID> {
  Optional<AppointmentVitalSignsEntity> findByAppointmentId(UUID appointmentId);

  boolean existsByAppointmentId(UUID appointmentId);
}
