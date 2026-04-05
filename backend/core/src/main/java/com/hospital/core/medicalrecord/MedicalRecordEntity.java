package com.hospital.core.medicalrecord;

import com.hospital.core.appointment.AppointmentEntity;
import com.hospital.core.prescription.PrescriptionItemEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "medical_records")
@Getter
@Setter
@NoArgsConstructor
public class MedicalRecordEntity {
  @Id
  private UUID id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "appointment_id", nullable = false, unique = true)
  private AppointmentEntity appointment;

  @Column(columnDefinition = "text")
  private String diagnosis;

  @Column(name = "clinical_notes", columnDefinition = "text")
  private String clinicalNotes;

  @Column(name = "blood_pressure", length = 32)
  private String bloodPressure;

  @Column
  private BigDecimal temperature;

  @Column
  private BigDecimal weight;

  @Column
  private BigDecimal height;

  @Column(name = "prescription_pdf_url", length = 500)
  private String prescriptionPdfUrl;

  @Column(name = "follow_up_date")
  private LocalDate followUpDate;

  @Column(name = "reminder_sent", nullable = false)
  private boolean reminderSent;

  @Column(name = "reminder_scheduled_at")
  private Instant reminderScheduledAt;

  @Column(name = "reminder_sent_at")
  private Instant reminderSentAt;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  @OneToMany(mappedBy = "medicalRecord", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<PrescriptionItemEntity> prescriptionItems = new ArrayList<>();

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
