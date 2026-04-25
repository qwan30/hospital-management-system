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
@Table(name = "hospital_content_sections")
@Getter
@Setter
@NoArgsConstructor
public class HospitalContentSectionEntity {
  @Id
  private UUID id;

  @Column(nullable = false, unique = true, length = 100)
  private String slug;

  @Column(nullable = false, length = 200)
  private String title;

  @Column(columnDefinition = "text")
  private String body;

  @Column(name = "image_url", length = 500)
  private String imageUrl;

  @Column(name = "cta_label", length = 120)
  private String ctaLabel;

  @Column(name = "cta_href", length = 500)
  private String ctaHref;

  @Column(name = "sort_order", nullable = false)
  private int sortOrder;

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
    createdAt = now;
    updatedAt = now;
  }

  @PreUpdate
  void preUpdate() {
    updatedAt = Instant.now();
  }
}
