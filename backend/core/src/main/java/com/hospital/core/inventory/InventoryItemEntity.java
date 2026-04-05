package com.hospital.core.inventory;

import com.hospital.core.department.DepartmentEntity;
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
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "inventory_items")
@Getter
@Setter
@NoArgsConstructor
public class InventoryItemEntity {
  @Id
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "department_id")
  private DepartmentEntity department;

  @Column(nullable = false, unique = true, length = 64)
  private String sku;

  @Column(name = "item_name", nullable = false, length = 255)
  private String itemName;

  @Column(nullable = false, length = 120)
  private String category;

  @Column(nullable = false, length = 40)
  private String unit;

  @Column(name = "reorder_level", nullable = false)
  private int reorderLevel;

  @Column(name = "quantity_on_hand", nullable = false)
  private int quantityOnHand;

  @Column(nullable = false, length = 32)
  private String status;

  @Column(name = "last_restocked_at")
  private Instant lastRestockedAt;

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
