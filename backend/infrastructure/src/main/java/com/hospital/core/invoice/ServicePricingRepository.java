package com.hospital.core.invoice;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServicePricingRepository extends JpaRepository<ServicePricingEntity, UUID> {
  @EntityGraph(attributePaths = {"department"})
  List<ServicePricingEntity> findAllByOrderByEffectiveDateDescServiceNameAsc();

  @EntityGraph(attributePaths = {"department"})
  Optional<ServicePricingEntity> findTopByDepartmentIdAndServiceNameIgnoreCaseAndEffectiveDateLessThanEqualOrderByEffectiveDateDesc(
      UUID departmentId,
      String serviceName,
      LocalDate effectiveDate);
}
