package com.hospital.core.inventory;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "inventory_lots")
@Getter
@Setter
@NoArgsConstructor
public class InventoryLotEntity {
  @Id
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "item_id", nullable = false)
  private InventoryItemEntity item;

  @Column(name = "lot_code", nullable = false, length = 80)
  private String lotCode;

  @Column(name = "supplier_name", length = 200)
  private String supplierName;

  @Column(name = "quantity_received", nullable = false)
  private int quantityReceived;

  @Column(name = "quantity_remaining", nullable = false)
  private int quantityRemaining;

  @Column(name = "expires_on")
  private LocalDate expiresOn;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  @PrePersist
  void prePersist() {
    var now = Instant.now();
    if (id == null) {
      id = UUID.randomUUID();
    }
    createdAt = now;
    updatedAt = now;
  }

  @PreUpdate
  void preUpdate() {
    updatedAt = Instant.now();
  }
}
