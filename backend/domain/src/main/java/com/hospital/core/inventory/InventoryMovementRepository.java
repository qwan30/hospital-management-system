package com.hospital.core.inventory;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryMovementRepository extends JpaRepository<InventoryMovementEntity, UUID> {
  @EntityGraph(attributePaths = {"item", "lot", "medicalRecord", "medicalRecord.appointment", "medicalRecord.appointment.patient"})
  List<InventoryMovementEntity> findTop20ByOrderByCreatedAtDesc();
}
