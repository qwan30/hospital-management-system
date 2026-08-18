package com.hospital.api.seed;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import com.hospital.core.seed.ReleaseDemoSeedService;
import com.hospital.core.seed.SeedDataService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class SeedDataConfigurationTest {

  private SeedDataService seedDataService;
  private ReleaseDemoSeedService releaseDemoSeedService;
  private SeedDataConfiguration configuration;

  @BeforeEach
  void setUp() {
    seedDataService = mock(SeedDataService.class);
    releaseDemoSeedService = mock(ReleaseDemoSeedService.class);
    configuration = new SeedDataConfiguration();
  }

  @Test
  void seedDataRunner_runsAllStepsSuccessfully() throws Exception {
    doNothing().when(seedDataService).seedInitialDemoIfEnabled();
    doNothing().when(seedDataService).seedNonBillingDemoIfEnabled();
    doNothing().when(releaseDemoSeedService).seedIfEnabled();

    var runner = configuration.seedDataRunner(seedDataService, releaseDemoSeedService);
    assertThatCode(() -> runner.run()).doesNotThrowAnyException();

    verify(seedDataService).seedInitialDemoIfEnabled();
    verify(seedDataService).seedNonBillingDemoIfEnabled();
    verify(releaseDemoSeedService).seedIfEnabled();
  }

  @Test
  void seedDataRunner_handlesStepFailureWithoutCrashing() throws Exception {
    doThrow(new IllegalStateException("Demo seed blocked")).when(seedDataService).seedInitialDemoIfEnabled();
    doNothing().when(seedDataService).seedNonBillingDemoIfEnabled();
    doNothing().when(releaseDemoSeedService).seedIfEnabled();

    var runner = configuration.seedDataRunner(seedDataService, releaseDemoSeedService);
    assertThatCode(() -> runner.run()).doesNotThrowAnyException();

    verify(seedDataService).seedInitialDemoIfEnabled();
    verify(seedDataService).seedNonBillingDemoIfEnabled();
    verify(releaseDemoSeedService).seedIfEnabled();
  }
}
