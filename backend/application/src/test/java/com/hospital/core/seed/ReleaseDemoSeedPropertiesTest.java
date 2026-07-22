package com.hospital.core.seed;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class ReleaseDemoSeedPropertiesTest {

  @Test
  void defaultsAreVpsSafeAndDisabled() {
    var properties = new ReleaseDemoSeedProperties();

    assertThat(properties.isEnabled()).isFalse();
    assertThat(properties.getFutureSlotDays()).isEqualTo(14);
    assertThat(properties.getTargetPatients()).isEqualTo(8);
    assertThat(properties.getTargetAppointments()).isEqualTo(12);
    assertThat(properties.getTargetInventoryItems()).isEqualTo(8);
    assertThat(properties.getTargetAuditLogs()).isEqualTo(16);
    assertThat(properties.getPasswords().getAdmin()).isNull();
    assertThat(properties.getPasswords().getDoctor()).isNull();
    assertThat(properties.getPasswords().getNurse()).isNull();
    assertThat(properties.getPasswords().getReceptionist()).isNull();
    assertThat(properties.getPasswords().getPharmacist()).isNull();
    assertThat(properties.getPasswords().getAccountant()).isNull();
    assertThat(properties.getPasswords().getPatient()).isNull();
  }

  @Test
  void valuesCanBeOverriddenByConfigurationBinding() {
    var properties = new ReleaseDemoSeedProperties();

    properties.setEnabled(true);
    properties.setFutureSlotDays(7);
    properties.setTargetPatients(20);
    properties.setTargetAppointments(40);
    properties.setTargetInventoryItems(15);
    properties.setTargetAuditLogs(30);

    assertThat(properties.isEnabled()).isTrue();
    assertThat(properties.getFutureSlotDays()).isEqualTo(7);
    assertThat(properties.getTargetPatients()).isEqualTo(20);
    assertThat(properties.getTargetAppointments()).isEqualTo(40);
    assertThat(properties.getTargetInventoryItems()).isEqualTo(15);
    assertThat(properties.getTargetAuditLogs()).isEqualTo(30);
  }

  @Test
  void rejectsEnabledSeedWhenAnyPasswordIsNotExplicitlyConfigured() {
    assertThatThrownBy(() -> new ReleaseDemoSeedProperties().requireConfiguredPasswords())
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("explicit passwords are required");
  }
}
