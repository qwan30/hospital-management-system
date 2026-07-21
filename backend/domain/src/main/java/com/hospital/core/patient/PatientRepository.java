package com.hospital.core.patient;

import java.util.Optional;
import java.time.LocalDate;
import java.util.Collection;
import java.util.UUID;
import com.hospital.shared.enums.AppointmentStatus;
import org.springframework.data.domain.Pageable;
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

  @Query("""
      select patient
      from PatientEntity patient
      where exists (
        select appointment.id
        from AppointmentEntity appointment
        where appointment.patient = patient
          and appointment.doctor.id = :doctorId
          and appointment.status in :careStatuses
      )
        and (
          :query = ''
          or lower(patient.fullName) like lower(concat('%', :query, '%'))
          or lower(patient.phone) like lower(concat('%', :query, '%'))
          or lower(patient.email) like lower(concat('%', :query, '%'))
          or (:cccdHash is not null and patient.cccdHash = :cccdHash)
        )
      order by patient.updatedAt desc
      """)
  java.util.List<PatientEntity> searchForDoctor(
      @Param("doctorId") UUID doctorId,
      @Param("query") String query,
      @Param("cccdHash") String cccdHash,
      @Param("careStatuses") Collection<AppointmentStatus> careStatuses,
      Pageable pageable);

  java.util.List<PatientEntity> findByCccdHashIsNull();
}
