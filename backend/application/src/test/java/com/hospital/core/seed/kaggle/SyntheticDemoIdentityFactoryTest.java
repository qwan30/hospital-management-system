package com.hospital.core.seed.kaggle;

import static org.assertj.core.api.Assertions.assertThat;

import com.hospital.shared.enums.Gender;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class SyntheticDemoIdentityFactoryTest {

  private SyntheticDemoIdentityFactory factory;

  @BeforeEach
  void setUp() {
    factory = new SyntheticDemoIdentityFactory();
  }

  @Test
  void createsDeterministicPatientIdentity() {
    var identity1 = factory.patientIdentity("101", "Female");
    var identity2 = factory.patientIdentity("101", "Female");

    assertThat(identity1).isEqualTo(identity2);
    assertThat(identity1.email()).isEqualTo("kaggle.patient.101@example.com");
    assertThat(identity1.rawCccd()).matches("^880\\d{9}$");
    assertThat(identity1.phone()).matches("^09\\d{8}$");
    assertThat(identity1.gender()).isEqualTo(Gender.FEMALE);
    assertThat(identity1.fullName()).isNotBlank();
  }

  @Test
  void distinctSourceIdsProduceDistinctPatientIdentities() {
    var identityA = factory.patientIdentity("1", "Male");
    var identityB = factory.patientIdentity("2", "Male");

    assertThat(identityA.email()).isNotEqualTo(identityB.email());
    assertThat(identityA.rawCccd()).isNotEqualTo(identityB.rawCccd());
    assertThat(identityA.phone()).isNotEqualTo(identityB.phone());
  }

  @Test
  void createsDeterministicDoctorIdentity() {
    var doctor1 = factory.doctorIdentity("45", "Dr. Sanaya Kalla", "Orthopedics", "MS", "12");
    var doctor2 = factory.doctorIdentity("45", "Dr. Sanaya Kalla", "Orthopedics", "MS", "12");

    assertThat(doctor1).isEqualTo(doctor2);
    assertThat(doctor1.email()).isEqualTo("kaggle.doctor.45@hospital.demo");
    assertThat(doctor1.fullName()).isEqualTo("Dr. Sanaya Kalla");
    assertThat(doctor1.qualification()).isEqualTo("MS");
    assertThat(doctor1.experienceYears()).isEqualTo(12);
  }
}
