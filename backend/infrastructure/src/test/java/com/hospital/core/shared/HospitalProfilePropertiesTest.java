package com.hospital.core.shared;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class HospitalProfilePropertiesTest {

  @Test
  void testRecord() {
    var props = new HospitalProfileProperties("Name", "Address", "Phone", "Maps", "Privacy", "Fb", "Yt");
    assertThat(props.name()).isEqualTo("Name");
    assertThat(props.address()).isEqualTo("Address");
    assertThat(props.phone()).isEqualTo("Phone");
    assertThat(props.mapsEmbedUrl()).isEqualTo("Maps");
    assertThat(props.privacyPolicyUrl()).isEqualTo("Privacy");
    assertThat(props.facebookUrl()).isEqualTo("Fb");
    assertThat(props.youtubeUrl()).isEqualTo("Yt");
  }
}
