package com.hospital.core.medicalrecord;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecordEntity, UUID> {
  boolean existsByAppointmentId(UUID appointmentId);

  @EntityGraph(attributePaths = {"appointment", "appointment.patient", "appointment.doctor", "appointment.firstSlot", "prescriptionItems"})
  @Query("""
      select distinct record
      from MedicalRecordEntity record
      left join fetch record.prescriptionItems item
      join fetch record.appointment appointment
      join fetch appointment.patient patient
      join fetch appointment.doctor doctor
      join fetch appointment.firstSlot slot
      where record.id = :recordId
      """)
  Optional<MedicalRecordEntity> findDetailedById(@Param("recordId") UUID recordId);

  @Query("""
      select distinct record
      from MedicalRecordEntity record
      left join fetch record.prescriptionItems item
      join fetch record.appointment appointment
      where record.appointment.id = :appointmentId
      """)
  Optional<MedicalRecordEntity> findDetailedByAppointmentId(@Param("appointmentId") UUID appointmentId);

  @Query("""
      select distinct record
      from MedicalRecordEntity record
      left join fetch record.prescriptionItems item
      join fetch record.appointment appointment
      where record.appointment.id in :appointmentIds
      """)
  List<MedicalRecordEntity> findDetailedByAppointmentIds(@Param("appointmentIds") Collection<UUID> appointmentIds);

  @EntityGraph(attributePaths = {"appointment", "appointment.patient", "appointment.doctor"})
  List<MedicalRecordEntity> findByReminderSentFalseAndReminderScheduledAtLessThanEqualOrderByReminderScheduledAtAsc(Instant dueAt);
}
