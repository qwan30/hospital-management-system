package com.hospital.core.inventory;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InventoryItemRepository extends JpaRepository<InventoryItemEntity, UUID> {
  @EntityGraph(attributePaths = {"department"})
  List<InventoryItemEntity> findAllByOrderByItemNameAsc();

  Optional<InventoryItemEntity> findBySku(String sku);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("SELECT i FROM InventoryItemEntity i WHERE i.id = :id")
  Optional<InventoryItemEntity> findByIdForUpdate(@Param("id") UUID id);
}
