package com.hospital.core.internalassistant;

import com.hospital.shared.internalassistant.InternalAssistantMode;
import java.util.Locale;
import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public class InternalAssistantQueryRouter {
  private static final Set<String> DOC_TERMS = Set.of(
      "sop",
      "policy",
      "protocol",
      "guideline",
      "workflow",
      "quy trình",
      "quy trinh",
      "hướng dẫn",
      "huong dan",
      "quy định",
      "quy dinh",
      "nhắc lịch",
      "nhac lich",
      "portal");
  private static final Set<String> PATIENT_TERMS = Set.of(
      "patient",
      "bệnh nhân",
      "benh nhan",
      "chart",
      "hồ sơ",
      "ho so",
      "diagnosis",
      "chẩn đoán",
      "chan doan",
      "allergy",
      "dị ứng",
      "di ung",
      "lab",
      "xét nghiệm",
      "xet nghiem",
      "prescription",
      "đơn thuốc",
      "don thuoc");

  public InternalAssistantMode suggestMode(String message) {
    var normalized = normalize(message);
    var hasDocsIntent = containsAny(normalized, DOC_TERMS);
    var hasPatientIntent = containsAny(normalized, PATIENT_TERMS);

    if (hasDocsIntent && hasPatientIntent) {
      return InternalAssistantMode.HYBRID;
    }
    if (hasPatientIntent) {
      return InternalAssistantMode.PATIENT;
    }
    return InternalAssistantMode.DOCS;
  }

  private boolean containsAny(String normalized, Set<String> tokens) {
    for (String token : tokens) {
      if (normalized.contains(token)) {
        return true;
      }
    }
    return false;
  }

  private String normalize(String value) {
    return value == null ? "" : value.toLowerCase(Locale.ROOT);
  }
}
