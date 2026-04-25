package com.hospital.core.content;

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
@Table(name = "news_articles")
@Getter
@Setter
@NoArgsConstructor
public class NewsArticleEntity {
  @Id
  private UUID id;

  @Column(nullable = false, unique = true, length = 150)
  private String slug;

  @Column(nullable = false, length = 250)
  private String title;

  @Column(nullable = false, columnDefinition = "text")
  private String summary;

  @Column(columnDefinition = "text")
  private String content;

  @Column(name = "image_url", length = 500)
  private String imageUrl;

  @Column(name = "published_at", nullable = false)
  private Instant publishedAt;

  @Column(name = "is_active", nullable = false)
  private boolean active = true;

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
    if (publishedAt == null) {
      publishedAt = now;
    }
    createdAt = now;
    updatedAt = now;
  }

  @PreUpdate
  void preUpdate() {
    updatedAt = Instant.now();
  }
}
