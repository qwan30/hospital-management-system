package com.hospital.core.internalassistant.knowledge;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface KnowledgeEdgeRepository extends JpaRepository<KnowledgeEdgeEntity, UUID> {
  @EntityGraph(attributePaths = {"sourceNode", "targetNode", "sourceNode.document", "targetNode.document"})
  List<KnowledgeEdgeEntity> findAllByOrderByRelationTypeAsc();

  @Query("""
      select edge
      from KnowledgeEdgeEntity edge
      join fetch edge.sourceNode sourceNode
      join fetch edge.targetNode targetNode
      left join fetch sourceNode.document sourceDocument
      left join fetch targetNode.document targetDocument
      where (sourceDocument is null or sourceDocument.active = true)
        and (targetDocument is null or targetDocument.active = true)
      order by edge.relationType asc
      """)
  List<KnowledgeEdgeEntity> findAllForActiveDocuments();
}
