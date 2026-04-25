package com.hospital.core.internalassistant;

import com.hospital.shared.internalassistant.InternalAssistantScope;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "internal_assistant_messages")
@Getter
@Setter
@NoArgsConstructor
public class InternalAssistantMessageEntity {
  @Id
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "session_id", nullable = false)
  private InternalAssistantSessionEntity session;

  @Column(nullable = false, length = 20)
  private String role;

  @Column(nullable = false, columnDefinition = "text")
  private String content;

  @Enumerated(EnumType.STRING)
  @Column(length = 20)
  private InternalAssistantScope scope;

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
