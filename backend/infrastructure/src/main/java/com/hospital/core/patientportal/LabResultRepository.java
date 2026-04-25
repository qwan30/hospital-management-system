package com.hospital.core.patientportal;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LabResultRepository extends JpaRepository<LabResultEntity, UUID> {
  @EntityGraph(attributePaths = {"appointment"})
  List<LabResultEntity> findByPatientIdOrderByCollectedAtDesc(UUID patientId);
}
