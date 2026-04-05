package com.hospital.core.internalassistant.knowledge;

import com.hospital.shared.internalassistant.KnowledgeDocumentStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KnowledgeDocumentRepository extends JpaRepository<KnowledgeDocumentEntity, UUID> {
  Optional<KnowledgeDocumentEntity> findByDocumentKey(String documentKey);

  List<KnowledgeDocumentEntity> findByActiveTrueOrderByTitleAsc();

  List<KnowledgeDocumentEntity> findAllByOrderByUpdatedAtDesc();

  List<KnowledgeDocumentEntity> findByStatusOrderByUpdatedAtDesc(KnowledgeDocumentStatus status);
}
