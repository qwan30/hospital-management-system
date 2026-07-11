package com.hospital.core.support;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupportTicketRepository extends JpaRepository<SupportTicketEntity, UUID> {
  Page<SupportTicketEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
