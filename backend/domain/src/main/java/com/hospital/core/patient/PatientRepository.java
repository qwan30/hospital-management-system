package com.hospital.core.patient;

import java.util.Optional;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PatientRepository extends JpaRepository<PatientEntity, UUID> {
  Optional<PatientEntity> findByCccdHash(String cccdHash);

  Optional<PatientEntity> findFirstByEmailIgnoreCaseAndDateOfBirth(String email, LocalDate dateOfBirth);

  java.util.List<PatientEntity> findTop20ByOrderByUpdatedAtDesc();

  @Query("""
      select patient
      from PatientEntity patient
      where lower(patient.fullName) like lower(concat('%', :query, '%'))
        or lower(patient.phone) like lower(concat('%', :query, '%'))
        or lower(patient.email) like lower(concat('%', :query, '%'))
      order by patient.updatedAt desc
      """)
  java.util.List<PatientEntity> searchByQuery(@Param("query") String query);

  java.util.List<PatientEntity> findByCccdHashIsNull();
}
