package com.hospital.core.seed;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class NonBillingDemoSeedPropertiesTest {

  @Test
  void defaultsTargetThePromotedNonBillingDemoScale() {
    var properties = new NonBillingDemoSeedProperties();

    assertThat(properties.isEnabled()).isFalse();
    assertThat(properties.getSource()).isEqualTo("kaggle-hmis");
    assertThat(properties.getDatasetRoot()).isEqualTo("classpath:seed-data/kaggle/hospital-hmis");
    assertThat(properties.additionalDepartments(3)).isEqualTo(17);
    assertThat(properties.additionalDoctors(2)).isEqualTo(48);
    assertThat(properties.additionalPatients(1)).isEqualTo(499);
    assertThat(properties.additionalAppointments(0)).isEqualTo(1000);
    assertThat(properties.additionalInventoryItems(3)).isEqualTo(197);
    assertThat(properties.additionalAuditLogs(0)).isEqualTo(1000);
  }

  @Test
  void neverReturnsNegativeAdditionalCounts() {
    var properties = new NonBillingDemoSeedProperties();

    assertThat(properties.additionalDepartments(50)).isZero();
    assertThat(properties.additionalDoctors(50)).isZero();
    assertThat(properties.additionalPatients(500)).isZero();
    assertThat(properties.additionalAppointments(1200)).isZero();
    assertThat(properties.additionalInventoryItems(300)).isZero();
    assertThat(properties.additionalAuditLogs(1200)).isZero();
  }

  @Test
  void requiresAnExplicitPasswordBeforeCreatingAdditionalDoctorAccounts() {
    assertThatThrownBy(() -> new NonBillingDemoSeedProperties().requireConfiguredPassword())
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("explicit password is required");
  }
}
