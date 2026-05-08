package com.hospital.core.audit;

import com.hospital.core.user.UserEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
public class AuditLogEntity {
  @Id
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "actor_id")
  private UserEntity actor;

  @Column(nullable = false, length = 120)
  private String action;

  @Column(name = "entity_type", nullable = false, length = 120)
  private String entityType;

  @Column(name = "entity_id")
  private UUID entityId;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(columnDefinition = "jsonb")
  private String metadata;

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
