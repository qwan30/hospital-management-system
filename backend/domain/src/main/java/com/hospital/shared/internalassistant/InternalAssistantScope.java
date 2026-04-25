package com.hospital.shared.internalassistant;

import com.fasterxml.jackson.annotation.JsonValue;

public enum InternalAssistantScope {
  DOCS("docs"),
  PATIENT("patient"),
  HYBRID("hybrid"),
  REFUSED("refused");

  private final String jsonValue;

  InternalAssistantScope(String jsonValue) {
    this.jsonValue = jsonValue;
  }

  @JsonValue
  public String jsonValue() {
    return jsonValue;
  }
}
