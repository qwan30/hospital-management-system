package com.hospital.core.seed;

import java.util.Locale;
import java.util.Set;
import java.util.stream.Stream;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * Keeps synthetic seed data behind an explicit non-production profile boundary.
 * An empty profile set and mixed profiles fail closed.
 */
@Component
public class DemoSeedPolicy {
  private static final Set<String> ALLOWED_PROFILES = Set.of("dev", "test", "demo", "release-demo");

  private final Environment environment;

  public DemoSeedPolicy(Environment environment) {
    this.environment = environment;
  }

  public boolean isAllowed() {
    var activeProfiles = environment.getActiveProfiles();
    return activeProfiles.length > 0
        && Stream.of(activeProfiles)
            .map(profile -> profile.trim().toLowerCase(Locale.ROOT))
            .allMatch(ALLOWED_PROFILES::contains);
  }

  public void requireAllowed(String seedType) {
    if (!isAllowed()) {
      throw new IllegalStateException(
          "Demo seed '" + seedType + "' requires an explicit demo or test Spring profile");
    }
  }
}
