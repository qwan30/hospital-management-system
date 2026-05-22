package com.hospital.core.seed;

import static org.assertj.core.api.Assertions.assertThat;

import com.hospital.shared.enums.UserRole;
import java.util.Collection;
import java.util.HashSet;
import org.junit.jupiter.api.Test;

class ReleaseDemoSeedCatalogTest {

  @Test
  void staffPersonasCoverEveryImplementedRole() {
    var roles = ReleaseDemoSeedCatalog.staffAccounts().stream()
        .map(ReleaseDemoSeedCatalog.StaffAccountSeed::role)
        .collect(java.util.stream.Collectors.toSet());

    assertThat(roles).contains(
        UserRole.ADMIN,
        UserRole.DOCTOR,
        UserRole.NURSE,
        UserRole.RECEPTIONIST,
        UserRole.PHARMACIST,
        UserRole.ACCOUNTANT);
  }

  @Test
  void naturalKeysAreUniqueForIdempotentTopUp() {
    assertUnique(ReleaseDemoSeedCatalog.departments().stream().map(ReleaseDemoSeedCatalog.DepartmentSeed::name).toList());
    assertUnique(ReleaseDemoSeedCatalog.staffAccounts().stream().map(ReleaseDemoSeedCatalog.StaffAccountSeed::email).toList());
    assertUnique(ReleaseDemoSeedCatalog.rooms().stream().map(ReleaseDemoSeedCatalog.RoomSeed::name).toList());
    assertUnique(ReleaseDemoSeedCatalog.contentSections().stream().map(ReleaseDemoSeedCatalog.ContentSectionSeed::slug).toList());
    assertUnique(ReleaseDemoSeedCatalog.newsArticles().stream().map(ReleaseDemoSeedCatalog.NewsSeed::slug).toList());
    assertUnique(ReleaseDemoSeedCatalog.patients(12).stream().map(ReleaseDemoSeedCatalog.PatientSeed::email).toList());
    assertUnique(ReleaseDemoSeedCatalog.patients(12).stream().map(ReleaseDemoSeedCatalog.PatientSeed::citizenId).toList());
    assertUnique(ReleaseDemoSeedCatalog.inventoryItems(12).stream().map(ReleaseDemoSeedCatalog.InventorySeed::sku).toList());
    assertUnique(ReleaseDemoSeedCatalog.inventoryItems(12).stream().map(ReleaseDemoSeedCatalog.InventorySeed::lotCode).toList());
    assertUnique(ReleaseDemoSeedCatalog.auditLogs(24).stream().map(ReleaseDemoSeedCatalog.AuditSeed::key).toList());
  }

  @Test
  void appointmentsReferenceSeededPatientsAndDoctors() {
    var patients = ReleaseDemoSeedCatalog.patients(10);
    var patientEmails = patients.stream().map(ReleaseDemoSeedCatalog.PatientSeed::email).toList();
    var doctorEmails = ReleaseDemoSeedCatalog.staffAccounts().stream()
        .filter(account -> account.role() == UserRole.DOCTOR)
        .map(ReleaseDemoSeedCatalog.StaffAccountSeed::email)
        .toList();

    var appointments = ReleaseDemoSeedCatalog.appointments(14, patientEmails);

    assertUnique(appointments.stream().map(ReleaseDemoSeedCatalog.AppointmentSeed::confirmationCode).toList());
    assertThat(appointments).allSatisfy(appointment -> {
      assertThat(patientEmails).contains(appointment.patientEmail());
      assertThat(doctorEmails).contains(appointment.doctorEmail());
    });
  }

  @Test
  void catalogIncludesBaselineAndReleasePatientPersonas() {
    var emails = ReleaseDemoSeedCatalog.patients(8).stream()
        .map(ReleaseDemoSeedCatalog.PatientSeed::email)
        .toList();

    assertThat(emails).contains("patient@example.com", "nguyen.van.clinical@example.com");
  }

  private void assertUnique(Collection<String> values) {
    var normalized = values.stream()
        .map(value -> value.trim().toLowerCase(java.util.Locale.ROOT))
        .toList();

    assertThat(new HashSet<>(normalized)).hasSize(normalized.size());
  }
}
