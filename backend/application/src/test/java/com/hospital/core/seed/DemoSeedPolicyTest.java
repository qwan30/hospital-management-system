package com.hospital.core.seed;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

class DemoSeedPolicyTest {
  @Test
  void allowsOnlyExplicitDemoAndTestProfiles() {
    assertThat(new DemoSeedPolicy(environment("dev")).isAllowed()).isTrue();
    assertThat(new DemoSeedPolicy(environment("test")).isAllowed()).isTrue();
    assertThat(new DemoSeedPolicy(environment("demo")).isAllowed()).isTrue();
    assertThat(new DemoSeedPolicy(environment("release-demo")).isAllowed()).isTrue();
  }

  @Test
  void deniesProductionDefaultMigrateAndMixedProfiles() {
    for (String profile : Arrays.asList("production", "default", "migrate", "staging", "production,dev", "")) {
      var environment = new MockEnvironment();
      if (!profile.isBlank()) {
        environment.setActiveProfiles(profile.split(","));
      }
      assertThat(new DemoSeedPolicy(environment).isAllowed()).as(profile).isFalse();
    }
  }

  private MockEnvironment environment(String profile) {
    var environment = new MockEnvironment();
    environment.setActiveProfiles(profile);
    return environment;
  }
}
