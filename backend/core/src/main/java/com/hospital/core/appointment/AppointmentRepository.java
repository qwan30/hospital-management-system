package com.hospital.core.appointment;

import com.hospital.shared.enums.AppointmentStatus;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AppointmentRepository extends JpaRepository<AppointmentEntity, UUID> {
  Optional<AppointmentEntity> findByConfirmationCode(String confirmationCode);

  @EntityGraph(attributePaths = {"patient", "doctor", "firstSlot"})
  @Query("select appointment from AppointmentEntity appointment where appointment.id = :appointmentId")
  Optional<AppointmentEntity> findDetailedById(@Param("appointmentId") UUID appointmentId);

  @EntityGraph(attributePaths = {"patient", "doctor", "firstSlot"})
  List<AppointmentEntity> findByAppointmentDateOrderByFirstSlotStartTimeAsc(LocalDate appointmentDate);

  @EntityGraph(attributePaths = {"patient", "doctor", "firstSlot"})
  List<AppointmentEntity> findByAppointmentDateAndStatusInOrderByCheckedInAtAscFirstSlotStartTimeAsc(
      LocalDate appointmentDate,
      Collection<AppointmentStatus> statuses);

  @EntityGraph(attributePaths = {"patient", "doctor", "firstSlot"})
  List<AppointmentEntity> findByDoctorIdAndAppointmentDateOrderByFirstSlotStartTimeAsc(UUID doctorId, LocalDate appointmentDate);

  @EntityGraph(attributePaths = {"patient", "doctor", "firstSlot"})
  List<AppointmentEntity> findByDoctorIdAndAppointmentDateBetweenOrderByAppointmentDateAscFirstSlotStartTimeAsc(
      UUID doctorId,
      LocalDate startDate,
      LocalDate endDate);

  @EntityGraph(attributePaths = {"patient", "doctor", "firstSlot"})
  List<AppointmentEntity> findByPatientIdOrderByAppointmentDateDescFirstSlotStartTimeDesc(UUID patientId);

  @EntityGraph(attributePaths = {"patient", "doctor", "firstSlot"})
  List<AppointmentEntity> findByPatientIdAndDoctorIdOrderByAppointmentDateDescFirstSlotStartTimeDesc(
      UUID patientId,
      UUID doctorId);

  @EntityGraph(attributePaths = {"patient", "doctor", "firstSlot"})
  List<AppointmentEntity> findByPatientIdAndAppointmentDateAndStatusInOrderByCheckedInAtDescFirstSlotStartTimeDesc(
      UUID patientId,
      LocalDate appointmentDate,
      Collection<AppointmentStatus> statuses);

  @EntityGraph(attributePaths = {"patient", "doctor", "firstSlot"})
  Optional<AppointmentEntity> findByIdAndStatusIn(UUID appointmentId, Collection<AppointmentStatus> statuses);

  boolean existsByDoctorIdAndPatientId(UUID doctorId, UUID patientId);

  boolean existsByPatientIdAndAppointmentDateAndStatusIn(UUID patientId, LocalDate appointmentDate, Collection<AppointmentStatus> statuses);

  long countByAppointmentDate(LocalDate appointmentDate);

  @EntityGraph(attributePaths = {"patient", "doctor", "firstSlot"})
  @Query("""
      select a from AppointmentEntity a
      where (:status is null or a.status = :status)
        and (:doctorId is null or a.doctor.id = :doctorId)
        and (:date is null or a.appointmentDate = :date)
      order by a.appointmentDate desc, a.firstSlot.startTime asc
      """)
  Page<AppointmentEntity> findAllFiltered(
      @Param("status") AppointmentStatus status,
      @Param("doctorId") UUID doctorId,
      @Param("date") LocalDate date,
      Pageable pageable);

  long countByStatus(AppointmentStatus status);

  long countByDoctorId(UUID doctorId);

  @Query("select count(a) from AppointmentEntity a where a.appointmentDate between :from and :to")
  long countByDateRange(@Param("from") LocalDate from, @Param("to") LocalDate to);
}
