package com.hospital.core.internalassistant.knowledge;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KnowledgeNodeRepository extends JpaRepository<KnowledgeNodeEntity, UUID> {
  @EntityGraph(attributePaths = {"document"})
  List<KnowledgeNodeEntity> findAllByOrderByNodeKeyAsc();

  @EntityGraph(attributePaths = {"document"})
  List<KnowledgeNodeEntity> findAllByDocumentActiveTrueOrderByNodeKeyAsc();

  Optional<KnowledgeNodeEntity> findByNodeKey(String nodeKey);

  void deleteByDocumentId(UUID documentId);
}
