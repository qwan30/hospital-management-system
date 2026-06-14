package com.hospital.core.lab;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LabResultRepository extends JpaRepository<LabResultEntity, UUID> {
  List<LabResultEntity> findByAppointmentIdAndDeletedFalseOrderByCreatedAtDesc(UUID appointmentId);

  Optional<LabResultEntity> findByIdAndDeletedFalse(UUID id);
}
