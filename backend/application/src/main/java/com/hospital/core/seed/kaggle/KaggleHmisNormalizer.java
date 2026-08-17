package com.hospital.core.seed.kaggle;

import com.hospital.shared.enums.AppointmentStatus;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class KaggleHmisNormalizer {

  public static final List<String> CANONICAL_DEPARTMENTS = List.of(
      "Internal Medicine",
      "Pediatrics",
      "Cardiology",
      "Emergency Medicine",
      "Radiology",
      "Laboratory",
      "Pharmacy",
      "Orthopedics",
      "Dermatology",
      "Ophthalmology",
      "ENT",
      "Neurology",
      "Oncology",
      "Endocrinology",
      "Gastroenterology",
      "Pulmonology",
      "Rehabilitation",
      "Obstetrics",
      "Urology",
      "General Surgery");

  private static final Map<String, String> DEPARTMENT_ALIASES = Map.ofEntries(
      Map.entry("emergency", "Emergency Medicine"),
      Map.entry("emergency medicine", "Emergency Medicine"),
      Map.entry("emergency room", "Emergency Medicine"),
      Map.entry("er", "Emergency Medicine"),
      Map.entry("trauma", "Emergency Medicine"),
      Map.entry("radiology", "Radiology"),
      Map.entry("diagnostic imaging", "Radiology"),
      Map.entry("imaging", "Radiology"),
      Map.entry("laboratory", "Laboratory"),
      Map.entry("lab", "Laboratory"),
      Map.entry("pathology", "Laboratory"),
      Map.entry("pharmacy", "Pharmacy"),
      Map.entry("cardiology", "Cardiology"),
      Map.entry("cardio", "Cardiology"),
      Map.entry("cardiac", "Cardiology"),
      Map.entry("pediatrics", "Pediatrics"),
      Map.entry("pediatric", "Pediatrics"),
      Map.entry("child care", "Pediatrics"),
      Map.entry("orthopedics", "Orthopedics"),
      Map.entry("orthopedic", "Orthopedics"),
      Map.entry("ortho", "Orthopedics"),
      Map.entry("dermatology", "Dermatology"),
      Map.entry("derma", "Dermatology"),
      Map.entry("skin", "Dermatology"),
      Map.entry("ophthalmology", "Ophthalmology"),
      Map.entry("eye", "Ophthalmology"),
      Map.entry("ent", "ENT"),
      Map.entry("ear nose throat", "ENT"),
      Map.entry("otolaryngology", "ENT"),
      Map.entry("neurology", "Neurology"),
      Map.entry("neuro", "Neurology"),
      Map.entry("oncology", "Oncology"),
      Map.entry("onco", "Oncology"),
      Map.entry("cancer", "Oncology"),
      Map.entry("endocrinology", "Endocrinology"),
      Map.entry("endocrine", "Endocrinology"),
      Map.entry("gastroenterology", "Gastroenterology"),
      Map.entry("gastro", "Gastroenterology"),
      Map.entry("pulmonology", "Pulmonology"),
      Map.entry("pulmo", "Pulmonology"),
      Map.entry("respiratory", "Pulmonology"),
      Map.entry("rehabilitation", "Rehabilitation"),
      Map.entry("rehab", "Rehabilitation"),
      Map.entry("physiotherapy", "Rehabilitation"),
      Map.entry("obstetrics", "Obstetrics"),
      Map.entry("ob/gyn", "Obstetrics"),
      Map.entry("gynecology", "Obstetrics"),
      Map.entry("maternity", "Obstetrics"),
      Map.entry("urology", "Urology"),
      Map.entry("uro", "Urology"),
      Map.entry("general surgery", "General Surgery"),
      Map.entry("surgery", "General Surgery"),
      Map.entry("internal medicine", "Internal Medicine"),
      Map.entry("medicine", "Internal Medicine"),
      Map.entry("general medicine", "Internal Medicine"),
      Map.entry("general consultation", "Internal Medicine"));

  public String normalizeDepartment(String sourceDepartment) {
    if (sourceDepartment == null || sourceDepartment.isBlank()) {
      return "Internal Medicine";
    }
    String cleaned = sourceDepartment.trim().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
    if (DEPARTMENT_ALIASES.containsKey(cleaned)) {
      return DEPARTMENT_ALIASES.get(cleaned);
    }
    for (String canonical : CANONICAL_DEPARTMENTS) {
      if (canonical.equalsIgnoreCase(sourceDepartment.trim())) {
        return canonical;
      }
    }
    return "Internal Medicine";
  }

  public String normalizeBloodType(String sourceBloodType) {
    if (sourceBloodType == null || sourceBloodType.isBlank()) {
      return "O+";
    }
    String cleaned = sourceBloodType.trim().toUpperCase(Locale.ROOT)
        .replace(" ", "")
        .replace("_", "")
        .replace("POSITIVE", "+")
        .replace("POS", "+")
        .replace("NEGATIVE", "-")
        .replace("NEG", "-");

    return switch (cleaned) {
      case "A+" -> "A+";
      case "A-" -> "A-";
      case "B+" -> "B+";
      case "B-" -> "B-";
      case "AB+" -> "AB+";
      case "AB-" -> "AB-";
      case "O-" -> "O-";
      default -> "O+";
    };
  }

  public AppointmentStatus normalizeAppointmentStatus(String sourceStatus, int index) {
    if (sourceStatus != null) {
      String clean = sourceStatus.trim().toLowerCase(Locale.ROOT);
      if (clean.contains("discharg") || clean.contains("done") || clean.contains("complete")) {
        return AppointmentStatus.DONE;
      }
      if (clean.contains("admit") || clean.contains("progress")) {
        return index % 2 == 0 ? AppointmentStatus.CHECKED_IN : AppointmentStatus.IN_PROGRESS;
      }
      if (clean.contains("schedul") || clean.contains("confirm")) {
        return AppointmentStatus.CONFIRMED;
      }
      if (clean.contains("pend")) {
        return AppointmentStatus.PENDING;
      }
    }
    return switch (index % 5) {
      case 0 -> AppointmentStatus.CONFIRMED;
      case 1 -> AppointmentStatus.CHECKED_IN;
      case 2 -> AppointmentStatus.IN_PROGRESS;
      case 3 -> AppointmentStatus.DONE;
      default -> AppointmentStatus.PENDING;
    };
  }
}
