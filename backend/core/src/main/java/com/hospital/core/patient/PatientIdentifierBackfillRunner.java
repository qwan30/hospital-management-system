package com.hospital.core.patient;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class PatientIdentifierBackfillRunner implements ApplicationRunner {
  private final PatientRepository patientRepository;
  private final PatientIdentifierProtector patientIdentifierProtector;

  public PatientIdentifierBackfillRunner(
      PatientRepository patientRepository,
      PatientIdentifierProtector patientIdentifierProtector) {
    this.patientRepository = patientRepository;
    this.patientIdentifierProtector = patientIdentifierProtector;
  }

  @Override
  @Transactional
  public void run(ApplicationArguments args) {
    var pendingPatients = patientRepository.findByCccdHashIsNull();
    for (var patient : pendingPatients) {
      var plainCccd = patientIdentifierProtector.decrypt(patient.getCccd());
      patient.setCccd(patientIdentifierProtector.encrypt(plainCccd));
      patient.setCccdHash(patientIdentifierProtector.hash(plainCccd));
    }
  }
}
