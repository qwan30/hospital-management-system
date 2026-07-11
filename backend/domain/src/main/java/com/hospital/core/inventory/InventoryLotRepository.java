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

public interface InventoryLotRepository extends JpaRepository<InventoryLotEntity, UUID> {
  @EntityGraph(attributePaths = {"item"})
  List<InventoryLotEntity> findAllByOrderByExpiresOnAsc();

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("SELECT i FROM InventoryLotEntity i WHERE i.id = :id")
  Optional<InventoryLotEntity> findByIdForUpdate(@Param("id") UUID id);
}
