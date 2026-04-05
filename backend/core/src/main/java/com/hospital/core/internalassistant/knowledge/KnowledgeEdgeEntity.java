package com.hospital.core.internalassistant.knowledge;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "knowledge_edges")
@Getter
@Setter
@NoArgsConstructor
public class KnowledgeEdgeEntity {
  @Id
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "source_node_id", nullable = false)
  private KnowledgeNodeEntity sourceNode;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "target_node_id", nullable = false)
  private KnowledgeNodeEntity targetNode;

  @Column(name = "relation_type", nullable = false, length = 80)
  private String relationType;

  @Column(nullable = false)
  private int weight;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @PrePersist
  void prePersist() {
    if (id == null) {
      id = UUID.randomUUID();
    }
    createdAt = Instant.now();
  }
}
