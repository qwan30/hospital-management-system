package com.hospital.core.internalassistant;

import static org.assertj.core.api.Assertions.assertThat;

import com.hospital.shared.internalassistant.InternalAssistantMode;
import org.junit.jupiter.api.Test;

class InternalAssistantQueryRouterTest {
  private final InternalAssistantQueryRouter router = new InternalAssistantQueryRouter();

  @Test
  void classifiesDocumentQueries() {
    assertThat(router.suggestMode("What is the follow-up reminder workflow?"))
        .isEqualTo(InternalAssistantMode.DOCS);
  }

  @Test
  void classifiesPatientQueries() {
    assertThat(router.suggestMode("Show the latest diagnosis for this bệnh nhân"))
        .isEqualTo(InternalAssistantMode.PATIENT);
  }

  @Test
  void classifiesHybridQueries() {
    assertThat(router.suggestMode("For this patient, what SOP applies to follow-up reminders?"))
        .isEqualTo(InternalAssistantMode.HYBRID);
  }
}
