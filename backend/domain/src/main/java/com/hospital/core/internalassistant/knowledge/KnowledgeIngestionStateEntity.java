package com.hospital.core.internalassistant.knowledge;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "knowledge_ingestion_states")
@Getter
@Setter
@NoArgsConstructor
public class KnowledgeIngestionStateEntity {
  @Id
  private UUID id;

  @Column(name = "corpus_version", nullable = false, unique = true, length = 80)
  private String corpusVersion;

  @Column(nullable = false, length = 40)
  private String status;

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
