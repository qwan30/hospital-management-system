package com.hospital.core.seed;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class InitialDemoSeedPropertiesTest {
  @Test
  void defaultsDisabledUntilAnExplicitDemoOrTestConfigurationEnablesIt() {
    assertThat(new InitialDemoSeedProperties().isEnabled()).isFalse();
  }

  @Test
  void passwordsHaveNoBuiltInDemoDefaults() {
    var passwords = new InitialDemoSeedProperties().getPasswords();

    assertThat(passwords.getDoctor1()).isNull();
    assertThat(passwords.getDoctor2()).isNull();
    assertThat(passwords.getNurse()).isNull();
    assertThat(passwords.getReceptionist()).isNull();
    assertThat(passwords.getPharmacist()).isNull();
    assertThat(passwords.getAccountant()).isNull();
    assertThat(passwords.getAdmin()).isNull();
    assertThat(passwords.getPatient()).isNull();
  }

  @Test
  void rejectsEnabledSeedWhenAnyPasswordIsNotExplicitlyConfigured() {
    assertThatThrownBy(() -> new InitialDemoSeedProperties().requireConfiguredPasswords())
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("explicit passwords are required");
  }
}
