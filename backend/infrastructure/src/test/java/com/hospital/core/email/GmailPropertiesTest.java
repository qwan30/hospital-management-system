package com.hospital.core.email;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class GmailPropertiesTest {

  @Test
  void resolvedTokenUrl_customUrl() {
    var props = new GmailProperties(true, "id", "sec", "ref", "sender", "http://custom-token", "http://custom-api");
    assertThat(props.resolvedTokenUrl()).isEqualTo("http://custom-token");
    assertThat(props.resolvedApiBaseUrl()).isEqualTo("http://custom-api");
  }

  @Test
  void resolvedTokenUrl_defaultUrl() {
    var props = new GmailProperties(true, "id", "sec", "ref", "sender", null, "");
    assertThat(props.resolvedTokenUrl()).isEqualTo("https://oauth2.googleapis.com/token");
    assertThat(props.resolvedApiBaseUrl()).isEqualTo("https://gmail.googleapis.com");
  }
}
