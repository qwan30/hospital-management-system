package com.hospital.core.seed.kaggle;

import static org.assertj.core.api.Assertions.assertThat;

import com.hospital.shared.enums.AppointmentStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class KaggleHmisNormalizerTest {

  private KaggleHmisNormalizer normalizer;

  @BeforeEach
  void setUp() {
    normalizer = new KaggleHmisNormalizer();
  }

  @Test
  void normalizesDepartmentAliasesAndCaseWhitespace() {
    assertThat(normalizer.normalizeDepartment("  emergency  ")).isEqualTo("Emergency Medicine");
    assertThat(normalizer.normalizeDepartment("CARDIOLOGY")).isEqualTo("Cardiology");
    assertThat(normalizer.normalizeDepartment("Ortho")).isEqualTo("Orthopedics");
    assertThat(normalizer.normalizeDepartment("OB/GYN")).isEqualTo("Obstetrics");
    assertThat(normalizer.normalizeDepartment("Internal Medicine")).isEqualTo("Internal Medicine");
    assertThat(normalizer.normalizeDepartment("Unknown Department")).isEqualTo("Internal Medicine");
  }

  @Test
  void normalizesBloodTypes() {
    assertThat(normalizer.normalizeBloodType("o+")).isEqualTo("O+");
    assertThat(normalizer.normalizeBloodType("A-")).isEqualTo("A-");
    assertThat(normalizer.normalizeBloodType("ab positive")).isEqualTo("AB+");
    assertThat(normalizer.normalizeBloodType("B_NEG")).isEqualTo("B-");
    assertThat(normalizer.normalizeBloodType("invalid")).isEqualTo("O+");
  }

  @Test
  void normalizesAppointmentStatusToValidHmsEnums() {
    assertThat(normalizer.normalizeAppointmentStatus("Discharged", 0)).isEqualTo(AppointmentStatus.DONE);
    assertThat(normalizer.normalizeAppointmentStatus("Admitted", 1)).isEqualTo(AppointmentStatus.IN_PROGRESS);
    assertThat(normalizer.normalizeAppointmentStatus("Scheduled", 0)).isEqualTo(AppointmentStatus.CONFIRMED);
    assertThat(normalizer.normalizeAppointmentStatus("Unknown", 0)).isIn(
        AppointmentStatus.PENDING,
        AppointmentStatus.CONFIRMED,
        AppointmentStatus.CHECKED_IN,
        AppointmentStatus.IN_PROGRESS,
        AppointmentStatus.DONE);
  }
}
