package com.hospital.core.internalassistant;

import com.hospital.core.user.UserEntity;
import com.hospital.shared.enums.UserRole;
import com.hospital.shared.internalassistant.InternalAssistantMode;
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
@Table(name = "internal_assistant_sessions")
@Getter
@Setter
@NoArgsConstructor
public class InternalAssistantSessionEntity {
  @Id
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "actor_id", nullable = false)
  private UserEntity actor;

  @Enumerated(EnumType.STRING)
  @Column(name = "actor_role", nullable = false, length = 32)
  private UserRole actorRole;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private InternalAssistantMode mode;

  @Column(name = "patient_id")
  private UUID patientId;

  @Column(name = "appointment_id")
  private UUID appointmentId;

  @Column(name = "session_key", nullable = false, unique = true, length = 255)
  private String sessionKey;

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
