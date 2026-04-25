package com.hospital.core.user;

import com.hospital.core.department.DepartmentEntity;
import com.hospital.shared.enums.UserRole;
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
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class UserEntity {
  @Id
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "department_id")
  private DepartmentEntity department;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(name = "password_hash", nullable = false)
  private String passwordHash;

  @Column(name = "full_name", nullable = false, length = 200)
  private String fullName;

  @Column(length = 20)
  private String phone;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private UserRole role;

  @Column(length = 200)
  private String specialty;

  @Column(length = 200)
  private String qualification;

  @Column(name = "avatar_url", length = 500)
  private String avatarUrl;

  @Column(name = "experience_years")
  private Integer experienceYears;

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
