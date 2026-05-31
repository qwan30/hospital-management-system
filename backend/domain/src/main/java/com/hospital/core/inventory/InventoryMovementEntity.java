package com.hospital.core.inventory;

import com.hospital.core.medicalrecord.MedicalRecordEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "inventory_movements")
@Getter
@Setter
@NoArgsConstructor
public class InventoryMovementEntity {
  @Id
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "item_id", nullable = false)
  private InventoryItemEntity item;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "lot_id")
  private InventoryLotEntity lot;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "medical_record_id")
  private MedicalRecordEntity medicalRecord;

  @Column(name = "movement_type", nullable = false, length = 32)
  private String movementType;

  @Column(name = "quantity_delta", nullable = false)
  private int quantityDelta;

  @Column(name = "prescription_item_name", length = 255)
  private String prescriptionItemName;

  @Column(name = "dispensed_to_patient", length = 255)
  private String dispensedToPatient;

  @Column(columnDefinition = "text")
  private String note;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @PrePersist
  void prePersist() {
    if (id == null) {
      id = UUID.randomUUID();
    }
    createdAt = Instant.now();
  }
}
