package com.hospital.core.appointment;

import com.hospital.shared.enums.AppointmentStatus;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
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
}
