package com.hospital.core.internalassistant.knowledge;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KnowledgeDocumentIngestionRepository extends JpaRepository<KnowledgeDocumentIngestionEntity, UUID> {
  @EntityGraph(attributePaths = {"document"})
  List<KnowledgeDocumentIngestionEntity> findByDocumentIdOrderByCreatedAtDesc(UUID documentId);

  @EntityGraph(attributePaths = {"document"})
  Optional<KnowledgeDocumentIngestionEntity> findFirstByDocumentIdOrderByCreatedAtDesc(UUID documentId);
}
