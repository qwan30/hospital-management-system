package com.hospital.core.department;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<DepartmentEntity, UUID> {
  List<DepartmentEntity> findByActiveTrueOrderByNameAsc();

  List<DepartmentEntity> findAllByOrderByNameAsc();

  boolean existsByNameIgnoreCase(String name);
}
