package com.hospital.core.appointment;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "appointment_vital_signs")
@Getter
@Setter
@NoArgsConstructor
public class AppointmentVitalSignsEntity {
  @Id
  private UUID id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "appointment_id", nullable = false, unique = true)
  private AppointmentEntity appointment;

  @Column(name = "blood_pressure", length = 32)
  private String bloodPressure;

  @Column
  private BigDecimal temperature;

  @Column
  private BigDecimal weight;

  @Column
  private BigDecimal height;

  @Column(name = "heart_rate")
  private Integer heartRate;

  @Column(name = "respiratory_rate")
  private Integer respiratoryRate;

  @Column(name = "oxygen_saturation")
  private BigDecimal oxygenSaturation;

  @Column(name = "recorded_at", nullable = false)
  private Instant recordedAt;

  @PrePersist
  void prePersist() {
    if (id == null) {
      id = UUID.randomUUID();
    }
    if (recordedAt == null) {
      recordedAt = Instant.now();
    }
  }
}
