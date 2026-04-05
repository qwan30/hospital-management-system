package com.hospital.core.inventory;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryItemRepository extends JpaRepository<InventoryItemEntity, UUID> {
  @EntityGraph(attributePaths = {"department"})
  List<InventoryItemEntity> findAllByOrderByItemNameAsc();
}
