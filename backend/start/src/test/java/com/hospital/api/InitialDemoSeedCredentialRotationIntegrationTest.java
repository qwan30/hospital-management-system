package com.hospital.api;

import static org.assertj.core.api.Assertions.assertThat;

import com.hospital.core.patientauth.PatientAccountRepository;
import com.hospital.core.seed.SeedDataService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

@ActiveProfiles("test")
class InitialDemoSeedCredentialRotationIntegrationTest extends AbstractIntegrationTest {

  @Autowired
  private PatientAccountRepository patientAccountRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  @Autowired
  private SeedDataService seedDataService;

  @Test
  void initialDemoSeedRotatesExistingStaffAndPatientAccountCredentials() {
    var admin = userRepository.findByEmailIgnoreCaseAndActiveTrue("admin@hospital.vn").orElseThrow();
    admin.setPasswordHash(passwordEncoder.encode("obsolete-initial-admin-password"));
    userRepository.save(admin);

    var patientAccount = patientAccountRepository.findByEmailIgnoreCaseAndActiveTrue("patient@example.com")
        .orElseThrow();
    patientAccount.setPasswordHash(passwordEncoder.encode("obsolete-initial-patient-password"));
    patientAccountRepository.save(patientAccount);

    seedDataService.seedIfEmpty();

    assertThat(passwordEncoder.matches("Admin@1234", userRepository.findById(admin.getId()).orElseThrow().getPasswordHash()))
        .isTrue();
    assertThat(passwordEncoder.matches("Patient@1234", patientAccountRepository
        .findByEmailIgnoreCaseAndActiveTrue("patient@example.com").orElseThrow().getPasswordHash()))
        .isTrue();
  }
}
