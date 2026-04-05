package com.hospital.core.patientportal;

import com.hospital.core.appointment.AppointmentEntity;
import com.hospital.core.patient.PatientEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "lab_results")
@Getter
@Setter
@NoArgsConstructor
public class LabResultEntity {
  @Id
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "patient_id", nullable = false)
  private PatientEntity patient;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "appointment_id")
  private AppointmentEntity appointment;

  @Column(name = "test_name", nullable = false, length = 255)
  private String testName;

  @Column(nullable = false, length = 40)
  private String status;

  @Column(name = "result_summary", columnDefinition = "text")
  private String resultSummary;

  @Column(name = "doctor_comment", columnDefinition = "text")
  private String doctorComment;

  @Column(name = "attachment_url", length = 500)
  private String attachmentUrl;

  @Column(name = "collected_at", nullable = false)
  private Instant collectedAt;

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
