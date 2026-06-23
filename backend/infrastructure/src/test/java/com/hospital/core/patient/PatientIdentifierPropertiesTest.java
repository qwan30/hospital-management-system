package com.hospital.core.patient;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class PatientIdentifierPropertiesTest {

  @Test
  void testRecord() {
    var props = new PatientIdentifierProperties("my-secret");
    assertThat(props.secret()).isEqualTo("my-secret");
  }
}
