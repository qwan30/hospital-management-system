package com.hospital.core.audit;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLogEntity, UUID> {
  @EntityGraph(attributePaths = {"actor"})
  List<AuditLogEntity> findAllByOrderByCreatedAtDesc();
}
