package com.hospital.core.patient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.ApplicationArguments;

@ExtendWith(MockitoExtension.class)
class PatientIdentifierBackfillRunnerTest {

  @Mock
  private PatientRepository patientRepository;

  @Mock
  private PatientIdentifierProtector patientIdentifierProtector;

  @InjectMocks
  private PatientIdentifierBackfillRunner runner;

  @Mock
  private ApplicationArguments args;

  @Test
  void run_withNoPendingPatients_doesNothing() {
    when(patientRepository.findByCccdHashIsNull()).thenReturn(List.of());

    runner.run(args);

    verify(patientRepository, times(1)).findByCccdHashIsNull();
    verifyNoInteractions(patientIdentifierProtector);
  }

  @Test
  void run_withPendingPatients_backfillsHashAndReEncrypts() {
    var patient = new PatientEntity();
    patient.setId(UUID.randomUUID());
    patient.setCccd("encrypted-cccd");

    when(patientRepository.findByCccdHashIsNull()).thenReturn(List.of(patient));
    when(patientIdentifierProtector.decrypt("encrypted-cccd")).thenReturn("plain-cccd");
    when(patientIdentifierProtector.encrypt("plain-cccd")).thenReturn("new-encrypted-cccd");
    when(patientIdentifierProtector.hash("plain-cccd")).thenReturn("hashed-cccd");

    runner.run(args);

    assertThat(patient.getCccd()).isEqualTo("new-encrypted-cccd");
    assertThat(patient.getCccdHash()).isEqualTo("hashed-cccd");

    verify(patientRepository, times(1)).findByCccdHashIsNull();
  }
}
