package com.hospital.core.admin;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpecialClosureRepository extends JpaRepository<SpecialClosureEntity, UUID> {
  @EntityGraph(attributePaths = {"doctor", "room"})
  List<SpecialClosureEntity> findAllByOrderByClosureDateDescTitleAsc();
}
