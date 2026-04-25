package com.hospital.core.patient;

import com.hospital.shared.enums.Gender;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "patients")
@Getter
@Setter
@NoArgsConstructor
public class PatientEntity {
  @Id
  private UUID id;

  @Column(name = "full_name", nullable = false, length = 200)
  private String fullName;

  @Column(nullable = false, length = 20)
  private String phone;

  @Column(nullable = false, length = 255)
  private String email;

  @Column(name = "date_of_birth", nullable = false)
  private LocalDate dateOfBirth;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private Gender gender;

  @Column(nullable = false, unique = true, columnDefinition = "text")
  private String cccd;

  @Column(name = "cccd_hash", unique = true, length = 64)
  private String cccdHash;

  @Column(name = "province_or_city", length = 120)
  private String provinceOrCity;

  @Column(length = 120)
  private String district;

  @Column(name = "street_address", columnDefinition = "text")
  private String streetAddress;

  @Column(length = 120)
  private String occupation;

  @Column(name = "blood_type", length = 20)
  private String bloodType;

  @Column(name = "medical_history", columnDefinition = "text")
  private String medicalHistory;

  @Column(name = "drug_allergies", columnDefinition = "text")
  private String drugAllergies;

  @Column(name = "insurance_number", length = 64)
  private String insuranceNumber;

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
