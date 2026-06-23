package com.hospital.core.patient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class PatientIdentifierProtectorTest {

  @Test
  void encryptAndDecrypt_success() {
    var properties = new PatientIdentifierProperties("my-secret-key-12345678901234567890");
    var protector = new PatientIdentifierProtector(properties);
    var original = "123456789012";

    var encrypted = protector.encrypt(original);
    assertThat(encrypted).startsWith("enc:");
    assertThat(protector.isEncrypted(encrypted)).isTrue();
    assertThat(protector.isEncrypted(original)).isFalse();

    var decrypted = protector.decrypt(encrypted);
    assertThat(decrypted).isEqualTo(original);
  }

  @Test
  void encrypt_nullOrBlankReturnsSame() {
    var properties = new PatientIdentifierProperties("secret");
    var protector = new PatientIdentifierProtector(properties);

    assertThat(protector.encrypt(null)).isNull();
    assertThat(protector.encrypt("")).isEmpty();
    assertThat(protector.encrypt("   ")).isEqualTo("   ");
  }

  @Test
  void decrypt_nullOrBlankReturnsSame() {
    var properties = new PatientIdentifierProperties("secret");
    var protector = new PatientIdentifierProtector(properties);

    assertThat(protector.decrypt(null)).isNull();
    assertThat(protector.decrypt("")).isEmpty();
    assertThat(protector.decrypt("   ")).isEqualTo("   ");
  }

  @Test
  void decrypt_notEncryptedReturnsSame() {
    var properties = new PatientIdentifierProperties("secret");
    var protector = new PatientIdentifierProtector(properties);

    assertThat(protector.decrypt("normal-text")).isEqualTo("normal-text");
  }

  @Test
  void hash_nullOrBlankReturnsNull() {
    var properties = new PatientIdentifierProperties("secret");
    var protector = new PatientIdentifierProtector(properties);

    assertThat(protector.hash(null)).isNull();
    assertThat(protector.hash("")).isNull();
    assertThat(protector.hash("   ")).isNull();
  }

  @Test
  void hash_success() {
    var properties = new PatientIdentifierProperties("secret");
    var protector = new PatientIdentifierProtector(properties);
    var hash = protector.hash("hello");
    assertThat(hash).isNotNull().hasSize(64);
  }

  @Test
  void key_missingSecretThrowsException() {
    var properties = new PatientIdentifierProperties("");
    var protector = new PatientIdentifierProtector(properties);
    assertThatThrownBy(() -> protector.encrypt("test"))
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("secret is not configured");
  }
}
