package com.hospital.core.patientportal;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientMessageThreadRepository extends JpaRepository<PatientMessageThreadEntity, UUID> {
  @EntityGraph(attributePaths = {"patient"})
  List<PatientMessageThreadEntity> findByPatientIdOrderByUpdatedAtDesc(UUID patientId);
}
