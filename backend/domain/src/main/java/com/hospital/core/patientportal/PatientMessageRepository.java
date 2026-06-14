package com.hospital.core.patientportal;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientMessageRepository extends JpaRepository<PatientMessageEntity, UUID> {
  List<PatientMessageEntity> findByThreadIdOrderByCreatedAtAsc(UUID threadId);
}
