package com.hospital.core.email;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "email_delivery_attempts")
@Getter
@Setter
@NoArgsConstructor
public class EmailDeliveryAttemptEntity {
  @Id
  private UUID id;

  @Column(name = "message_type", nullable = false, length = 80)
  private String messageType;

  @Column(nullable = false, length = 255)
  private String recipient;

  @Column(nullable = false, length = 255)
  private String subject;

  @Column(nullable = false, length = 40)
  private String provider;

  @Column(nullable = false, length = 40)
  private String status;

  @Column(name = "attachment_file_name", length = 255)
  private String attachmentFileName;

  @Column(name = "failure_reason", length = 500)
  private String failureReason;

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
