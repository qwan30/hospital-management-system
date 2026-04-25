package com.hospital.core.internalassistant.knowledge;

import com.hospital.shared.internalassistant.KnowledgeIngestionStage;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "knowledge_document_ingestions")
@Getter
@Setter
@NoArgsConstructor
public class KnowledgeDocumentIngestionEntity {
  @Id
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "document_id", nullable = false)
  private KnowledgeDocumentEntity document;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 40)
  private KnowledgeIngestionStage stage;

  @Column(name = "error_message", columnDefinition = "text")
  private String errorMessage;

  @Column(name = "started_at")
  private Instant startedAt;

  @Column(name = "completed_at")
  private Instant completedAt;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  @PrePersist
  void prePersist() {
    var now = Instant.now();
    if (id == null) {
      id = UUID.randomUUID();
    }
    createdAt = now;
    updatedAt = now;
  }

  @PreUpdate
  void preUpdate() {
    updatedAt = Instant.now();
  }
}
