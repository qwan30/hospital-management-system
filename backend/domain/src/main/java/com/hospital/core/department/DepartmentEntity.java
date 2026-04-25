package com.hospital.core.department;

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
@Table(name = "departments")
@Getter
@Setter
@NoArgsConstructor
public class DepartmentEntity {
  @Id
  private UUID id;

  @Column(nullable = false, unique = true, length = 150)
  private String name;

  @Column(columnDefinition = "text")
  private String description;

  @Column(name = "image_url", length = 500)
  private String imageUrl;

  @Column(length = 20)
  private String phone;

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
