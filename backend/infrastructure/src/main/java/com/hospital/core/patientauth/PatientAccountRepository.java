package com.hospital.core.patientauth;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientAccountRepository extends JpaRepository<PatientAccountEntity, UUID> {
  @EntityGraph(attributePaths = {"patient"})
  Optional<PatientAccountEntity> findByEmailIgnoreCaseAndActiveTrue(String email);

  @EntityGraph(attributePaths = {"patient"})
  Optional<PatientAccountEntity> findByPatientIdAndActiveTrue(UUID patientId);
}
