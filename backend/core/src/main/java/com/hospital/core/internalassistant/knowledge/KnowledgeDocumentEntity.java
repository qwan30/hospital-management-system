package com.hospital.core.internalassistant.knowledge;

import com.hospital.shared.internalassistant.KnowledgeDocumentStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "knowledge_documents")
@Getter
@Setter
@NoArgsConstructor
public class KnowledgeDocumentEntity {
  @Id
  private UUID id;

  @Column(name = "document_key", nullable = false, unique = true, length = 120)
  private String documentKey;

  @Column(nullable = false, length = 255)
  private String title;

  @Column(nullable = false, length = 64)
  private String category;

  @Column(name = "source_path", nullable = false, length = 255)
  private String sourcePath;

  @Column(name = "source_filename", length = 255)
  private String sourceFilename;

  @Column(name = "mime_type", length = 120)
  private String mimeType;

  @Column(name = "raw_content", columnDefinition = "text")
  private String rawContent;

  @Column(columnDefinition = "text")
  private String summary;

  @Column(name = "is_active", nullable = false)
  private boolean active = true;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32)
  private KnowledgeDocumentStatus status = KnowledgeDocumentStatus.ACTIVE;

  @Column(name = "version_label", length = 80)
  private String version;

  @Column(name = "owner_name", length = 160)
  private String owner;

  @Column(name = "effective_date")
  private LocalDate effectiveDate;

  @Column(columnDefinition = "text")
  private String tags;

  @Column(name = "activated_at")
  private Instant activatedAt;

  @Column(name = "revoked_at")
  private Instant revokedAt;

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
    if (status == null) {
      status = KnowledgeDocumentStatus.ACTIVE;
    }
  }

  @PreUpdate
  void preUpdate() {
    updatedAt = Instant.now();
  }
}
