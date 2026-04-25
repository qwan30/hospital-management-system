package com.hospital.core.invoice;

import com.hospital.core.appointment.AppointmentEntity;
import com.hospital.shared.enums.InvoiceStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
public class InvoiceEntity {
  @Id
  private UUID id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "appointment_id", nullable = false, unique = true)
  private AppointmentEntity appointment;

  @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
  private BigDecimal totalAmount = BigDecimal.ZERO;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private InvoiceStatus status = InvoiceStatus.UNPAID;

  @Column(name = "payment_method", length = 50)
  private String paymentMethod;

  @Column(name = "paid_at")
  private Instant paidAt;

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
