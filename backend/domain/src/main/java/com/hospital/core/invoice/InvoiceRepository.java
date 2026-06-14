package com.hospital.core.invoice;

import com.hospital.shared.enums.InvoiceStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceRepository extends JpaRepository<InvoiceEntity, UUID> {
  @EntityGraph(attributePaths = {"appointment", "appointment.patient", "appointment.doctor", "appointment.doctor.department"})
  List<InvoiceEntity> findAllByOrderByCreatedAtDesc();

  @EntityGraph(attributePaths = {"appointment", "appointment.patient", "appointment.doctor", "appointment.doctor.department"})
  List<InvoiceEntity> findByStatusOrderByCreatedAtDesc(InvoiceStatus status);

  @EntityGraph(attributePaths = {"appointment", "appointment.patient", "appointment.doctor", "appointment.doctor.department"})
  Optional<InvoiceEntity> findById(UUID id);

  boolean existsByAppointmentId(UUID appointmentId);

  long countByStatus(InvoiceStatus status);
}
