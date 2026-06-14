package com.hospital.core.email;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailDeliveryAttemptRepository extends JpaRepository<EmailDeliveryAttemptEntity, UUID> {
  List<EmailDeliveryAttemptEntity> findTop10ByOrderByCreatedAtDesc();
}
