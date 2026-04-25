package com.hospital.core.appointment;

import com.hospital.core.patient.PatientEntity;
import com.hospital.core.timeslot.TimeSlotEntity;
import com.hospital.core.user.UserEntity;
import com.hospital.shared.enums.AppointmentStatus;
import com.hospital.shared.enums.Gender;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@NoArgsConstructor
public class AppointmentEntity {
  @Id
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "patient_id", nullable = false)
  private PatientEntity patient;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "doctor_id", nullable = false)
  private UserEntity doctor;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "first_slot_id", nullable = false)
  private TimeSlotEntity firstSlot;

  @Column(name = "appointment_date", nullable = false)
  private LocalDate appointmentDate;

  @Column(name = "ai_duration_minutes", nullable = false)
  private int aiDurationMinutes;

  @Column(columnDefinition = "text")
  private String symptoms;

  @Column(name = "confirmation_code", nullable = false, unique = true, length = 32)
  private String confirmationCode;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private AppointmentStatus status;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  @Column(name = "checked_in_at")
  private LocalDateTime checkedInAt;

  @Column(name = "booking_contact_full_name", length = 200)
  private String bookingContactFullName;

  @Column(name = "booking_contact_relationship", length = 100)
  private String bookingContactRelationship;

  @Column(name = "booking_contact_phone", length = 20)
  private String bookingContactPhone;

  @Column(name = "booking_contact_email", length = 255)
  private String bookingContactEmail;

  @Column(name = "booking_contact_cccd", columnDefinition = "text")
  private String bookingContactCccd;

  @Column(name = "booking_contact_date_of_birth")
  private LocalDate bookingContactDateOfBirth;

  @Enumerated(EnumType.STRING)
  @Column(name = "booking_contact_gender", length = 20)
  private Gender bookingContactGender;

  @Column(columnDefinition = "text")
  private String notes;

  @Column(length = 500)
  private String reason;

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
