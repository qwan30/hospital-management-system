package com.hospital.shared.internalassistant;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Locale;

public enum InternalAssistantFeedbackValue {
  HELPFUL("helpful"),
  NOT_HELPFUL("not_helpful");

  private final String jsonValue;

  InternalAssistantFeedbackValue(String jsonValue) {
    this.jsonValue = jsonValue;
  }

  @JsonValue
  public String toJson() {
    return jsonValue;
  }

  @JsonCreator
  public static InternalAssistantFeedbackValue fromJson(String value) {
    for (InternalAssistantFeedbackValue feedbackValue : values()) {
      if (feedbackValue.jsonValue.equalsIgnoreCase(value)) {
        return feedbackValue;
      }
    }
    throw new IllegalArgumentException("Unsupported assistant feedback value: " + value);
  }

  @Override
  public String toString() {
    return jsonValue.toLowerCase(Locale.ROOT);
  }
}
