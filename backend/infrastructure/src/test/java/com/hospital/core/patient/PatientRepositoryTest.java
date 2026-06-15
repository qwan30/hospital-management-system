package com.hospital.core.patient;

import static org.assertj.core.api.Assertions.assertThat;

import com.hospital.shared.enums.Gender;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class PatientRepositoryTest {

  @Autowired
  private PatientRepository patientRepository;

  @Autowired
  private TestEntityManager entityManager;

  @Test
  void findByCccdHash_nonExistentHashReturnsEmpty() {
    var result = patientRepository.findByCccdHash("nonexistent-sha256-hash-value");

    assertThat(result).isEmpty();
  }

  @Test
  void findByCccdHash_existingHashReturnsPatient() {
    var patient = new PatientEntity();
    patient.setId(UUID.randomUUID());
    patient.setFullName("Nguyen Van A");
    patient.setPhone("0912345678");
    patient.setEmail("nguyenvana@test.com");
    patient.setDateOfBirth(LocalDate.of(1990, 1, 1));
    patient.setGender(Gender.MALE);
    patient.setCccd("encrypted-cccd-001");
    patient.setCccdHash("known-sha256-hash-value");

    entityManager.persist(patient);
    entityManager.flush();

    var result = patientRepository.findByCccdHash("known-sha256-hash-value");

    assertThat(result).isPresent();
    assertThat(result.get().getFullName()).isEqualTo("Nguyen Van A");
    assertThat(result.get().getCccdHash()).isEqualTo("known-sha256-hash-value");
  }

  @Test
  void findFirstByEmailIgnoreCaseAndDateOfBirth_noMatchReturnsEmpty() {
    var result = patientRepository.findFirstByEmailIgnoreCaseAndDateOfBirth(
        "unknown@test.com", LocalDate.of(2000, 1, 1));

    assertThat(result).isEmpty();
  }

  @Test
  void findFirstByEmailIgnoreCaseAndDateOfBirth_withMatchReturnsPatient() {
    var patient = new PatientEntity();
    patient.setId(UUID.randomUUID());
    patient.setFullName("Tran Thi B");
    patient.setPhone("0987654321");
    patient.setEmail("tranthib@test.com");
    patient.setDateOfBirth(LocalDate.of(1995, 6, 15));
    patient.setGender(Gender.FEMALE);
    patient.setCccd("encrypted-cccd-002");
    patient.setCccdHash("another-sha256-hash-value");

    entityManager.persist(patient);
    entityManager.flush();

    var result = patientRepository.findFirstByEmailIgnoreCaseAndDateOfBirth(
        "TRANTHIB@test.com", LocalDate.of(1995, 6, 15));

    assertThat(result).isPresent();
    assertThat(result.get().getFullName()).isEqualTo("Tran Thi B");
  }

  @Test
  void searchByQuery_noMatchReturnsEmptyList() {
    var results = patientRepository.searchByQuery("nonexistent-patient-name");

    assertThat(results).isEmpty();
  }
}
