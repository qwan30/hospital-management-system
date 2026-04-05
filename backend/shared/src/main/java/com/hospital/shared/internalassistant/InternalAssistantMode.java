package com.hospital.shared.internalassistant;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Locale;

public enum InternalAssistantMode {
  DOCS("docs"),
  PATIENT("patient"),
  HYBRID("hybrid");

  private final String jsonValue;

  InternalAssistantMode(String jsonValue) {
    this.jsonValue = jsonValue;
  }

  @JsonValue
  public String jsonValue() {
    return jsonValue;
  }

  @JsonCreator
  public static InternalAssistantMode fromJson(String value) {
    var normalized = value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    for (InternalAssistantMode mode : values()) {
      if (mode.jsonValue.equals(normalized) || mode.name().equalsIgnoreCase(normalized)) {
        return mode;
      }
    }
    throw new IllegalArgumentException("Unsupported internal assistant mode: " + value);
  }
}
