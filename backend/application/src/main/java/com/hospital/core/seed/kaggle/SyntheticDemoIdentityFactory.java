package com.hospital.core.seed.kaggle;

import com.hospital.shared.enums.Gender;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Component;

@Component
public class SyntheticDemoIdentityFactory {

  private static final List<String> PATIENT_FIRST_NAMES_FEMALE = List.of(
      "Hoa", "Mai", "Lan", "Linh", "Trang", "Huong", "Thao", "Ngoc", "Ha", "Huyen",
      "Anh", "Nhung", "Phuong", "Yen", "Quynh", "Tam", "Van", "Bich", "Hang", "Tuyet");

  private static final List<String> PATIENT_FIRST_NAMES_MALE = List.of(
      "An", "Binh", "Cuong", "Dung", "Duc", "Hai", "Hieu", "Hung", "Hoang", "Kien",
      "Long", "Minh", "Nam", "Phong", "Quan", "Son", "Thang", "Tuan", "Viet", "Vinh");

  private static final List<String> LAST_NAMES = List.of(
      "Nguyen", "Tran", "Le", "Pham", "Hoang", "Phan", "Vu", "Dang", "Bui", "Do",
      "Ho", "Ngo", "Duong", "Ly", "Dinh", "Doan", "Huynh", "Truong", "Vo", "Nguyen Thi");

  private static final List<String> OCCUPATIONS = List.of(
      "Software Engineer", "Teacher", "Accountant", "Business Owner", "Office Worker",
      "Pharmacist", "Marketing Specialist", "Architect", "Civil Servant", "Student",
      "Sales Representative", "Designer", "Consultant", "Financial Analyst", "Logistics Coordinator");

  public record SyntheticPatientIdentity(
      String fullName,
      String email,
      String phone,
      String occupation,
      String insuranceNumber,
      String rawCccd,
      Gender gender) {}

  public record SyntheticDoctorIdentity(
      String fullName,
      String email,
      String phone,
      String specialty,
      String qualification,
      int experienceYears) {}

  public SyntheticPatientIdentity patientIdentity(String sourcePatientId, String sourceGender) {
    String cleanId = sourcePatientId == null ? "0" : sourcePatientId.trim();
    int idHash = Math.abs(cleanId.hashCode());

    Gender gender = (sourceGender != null && sourceGender.trim().equalsIgnoreCase("female"))
        ? Gender.FEMALE
        : Gender.MALE;

    String lastName = LAST_NAMES.get(idHash % LAST_NAMES.size());
    String firstName = (gender == Gender.FEMALE)
        ? PATIENT_FIRST_NAMES_FEMALE.get((idHash / 7) % PATIENT_FIRST_NAMES_FEMALE.size())
        : PATIENT_FIRST_NAMES_MALE.get((idHash / 7) % PATIENT_FIRST_NAMES_MALE.size());

    String fullName = lastName + " " + firstName;
    String email = "kaggle.patient." + cleanId + "@example.com";
    String phone = String.format(Locale.ROOT, "09%08d", (idHash % 90000000) + 10000000);
    String occupation = OCCUPATIONS.get((idHash / 13) % OCCUPATIONS.size());
    String insuranceNumber = String.format(Locale.ROOT, "KGH-INS-%06d", idHash % 1000000);
    String rawCccd = String.format(Locale.ROOT, "880%09d", Math.abs((long) idHash * 31L) % 1000000000L);

    return new SyntheticPatientIdentity(
        fullName,
        email,
        phone,
        occupation,
        insuranceNumber,
        rawCccd,
        gender);
  }

  public SyntheticDoctorIdentity doctorIdentity(
      String sourceDoctorId,
      String sourceName,
      String specialty,
      String sourceQualification,
      String sourceExperienceYears) {
    String cleanId = sourceDoctorId == null ? "0" : sourceDoctorId.trim();
    int idHash = Math.abs(cleanId.hashCode());

    String fullName = (sourceName != null && !sourceName.isBlank())
        ? sourceName.trim()
        : "Dr. Demo Clinician " + cleanId;
    if (!fullName.toLowerCase(Locale.ROOT).startsWith("dr.") && !fullName.toLowerCase(Locale.ROOT).startsWith("bs.")) {
      fullName = "Dr. " + fullName;
    }

    String email = "kaggle.doctor." + cleanId + "@hospital.demo";
    String phone = String.format(Locale.ROOT, "090%07d", (idHash % 9000000) + 1000000);
    String qualification = (sourceQualification != null && !sourceQualification.isBlank())
        ? sourceQualification.trim()
        : "MD";

    int expYears = 10;
    if (sourceExperienceYears != null && !sourceExperienceYears.isBlank()) {
      try {
        expYears = Integer.parseInt(sourceExperienceYears.trim());
      } catch (NumberFormatException ignored) {
        expYears = 8 + (idHash % 20);
      }
    }

    return new SyntheticDoctorIdentity(
        fullName,
        email,
        phone,
        specialty,
        qualification,
        expYears);
  }
}
