package com.hospital.core.internalassistant;

import com.hospital.core.user.UserEntity;
import com.hospital.shared.internalassistant.InternalAssistantFeedbackValue;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "internal_assistant_feedback")
@Getter
@Setter
@NoArgsConstructor
public class InternalAssistantFeedbackEntity {
  @Id
  private UUID id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "message_id", nullable = false, unique = true)
  private InternalAssistantMessageEntity message;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "actor_id", nullable = false)
  private UserEntity actor;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32)
  private InternalAssistantFeedbackValue value;

  @Column(columnDefinition = "text")
  private String note;

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
