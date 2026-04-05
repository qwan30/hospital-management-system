package com.hospital.core.internalassistant.knowledge;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KnowledgeChunkRepository extends JpaRepository<KnowledgeChunkEntity, UUID> {
  @EntityGraph(attributePaths = {"document"})
  List<KnowledgeChunkEntity> findAllByOrderByReferenceKeyAsc();

  @EntityGraph(attributePaths = {"document"})
  List<KnowledgeChunkEntity> findAllByDocumentActiveTrueOrderByReferenceKeyAsc();

  @EntityGraph(attributePaths = {"document"})
  List<KnowledgeChunkEntity> findByDocumentIdOrderByChunkIndexAsc(UUID documentId);

  void deleteByDocumentId(UUID documentId);
}
