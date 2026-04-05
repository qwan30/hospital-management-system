package com.hospital.core.content;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HospitalContentSectionRepository extends JpaRepository<HospitalContentSectionEntity, UUID> {
  List<HospitalContentSectionEntity> findByActiveTrueOrderBySortOrderAscTitleAsc();

  List<HospitalContentSectionEntity> findAllByOrderBySortOrderAscTitleAsc();

  Optional<HospitalContentSectionEntity> findBySlugIgnoreCase(String slug);
}
