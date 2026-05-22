package com.hospital.core.seed;

import com.hospital.shared.enums.AppointmentStatus;
import com.hospital.shared.enums.Gender;
import com.hospital.shared.enums.InvoiceStatus;
import com.hospital.shared.enums.RoomStatus;
import com.hospital.shared.enums.UserRole;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

final class ReleaseDemoSeedCatalog {
  static final String SOURCE = "release-demo-seed";
  static final String PATIENT_PASSWORD = "Patient@1234";

  private ReleaseDemoSeedCatalog() {
  }

  static List<DepartmentSeed> departments() {
    return List.of(
        new DepartmentSeed("Internal Medicine", "General consultation and chronic disease care", "028 1000 0001"),
        new DepartmentSeed("Pediatrics", "Child and adolescent care", "028 1000 0002"),
        new DepartmentSeed("Cardiology", "Heart and vascular specialty care", "028 1000 0003"),
        new DepartmentSeed("Emergency Medicine", "Urgent triage, stabilization, and observation", "028 2000 0001"),
        new DepartmentSeed("Radiology", "Diagnostic imaging and procedure support", "028 2000 0002"),
        new DepartmentSeed("Laboratory", "Clinical laboratory testing and review", "028 2000 0003"),
        new DepartmentSeed("Pharmacy", "Medication review and dispensing", "028 2000 0004"),
        new DepartmentSeed("Orthopedics", "Bone, joint, and rehabilitation services", "028 2000 0005"));
  }

  static List<StaffAccountSeed> staffAccounts() {
    return List.of(
        new StaffAccountSeed("admin@hospital.vn", "Admin@1234", "System Admin", UserRole.ADMIN, null, null),
        new StaffAccountSeed("doctor1@hospital.vn", "Doctor@1234", "Dr. Nguyen Van An", UserRole.DOCTOR, "Internal Medicine", "Internal Medicine"),
        new StaffAccountSeed("doctor2@hospital.vn", "Doctor@1234", "Dr. Tran Thi Binh", UserRole.DOCTOR, "Cardiology", "Cardiology"),
        new StaffAccountSeed("doctor3@hospital.vn", "Doctor@1234", "Dr. Le Minh Khoa", UserRole.DOCTOR, "Radiology", "Radiology"),
        new StaffAccountSeed("doctor4@hospital.vn", "Doctor@1234", "Dr. Pham Nhu Quynh", UserRole.DOCTOR, "Pediatrics", "Pediatrics"),
        new StaffAccountSeed("nurse@hospital.vn", "Nurse@1234", "Le Thi Cuc", UserRole.NURSE, "Internal Medicine", null),
        new StaffAccountSeed("receptionist@hospital.vn", "Reception@1234", "Vo Thi Reception", UserRole.RECEPTIONIST, null, null),
        new StaffAccountSeed("pharmacist@hospital.vn", "Pharma@1234", "Hoang Van Pharmacist", UserRole.PHARMACIST, "Pharmacy", null),
        new StaffAccountSeed("accountant@hospital.vn", "Acc@1234", "Pham Van Dung", UserRole.ACCOUNTANT, null, null));
  }

  static List<RoomSeed> rooms() {
    return List.of(
        new RoomSeed("IM-101", "Internal Medicine", RoomStatus.READY, "Primary outpatient consultation room"),
        new RoomSeed("IM-102", "Internal Medicine", RoomStatus.IN_USE, "Nurse intake and vitals room"),
        new RoomSeed("CARD-201", "Cardiology", RoomStatus.READY, "Cardiology consultation room"),
        new RoomSeed("ER-OBS-01", "Emergency Medicine", RoomStatus.READY, "Emergency observation bay"),
        new RoomSeed("RAD-01", "Radiology", RoomStatus.MAINTENANCE, "Imaging room reserved for UAT maintenance alert"),
        new RoomSeed("LAB-01", "Laboratory", RoomStatus.READY, "Specimen collection room"));
  }

  static List<ScheduleTemplateSeed> scheduleTemplates() {
    return List.of(
        new ScheduleTemplateSeed("doctor1@hospital.vn", "IM-101", 1, LocalTime.of(8, 0), LocalTime.of(12, 0), 30),
        new ScheduleTemplateSeed("doctor1@hospital.vn", "IM-101", 3, LocalTime.of(13, 30), LocalTime.of(17, 0), 30),
        new ScheduleTemplateSeed("doctor2@hospital.vn", "CARD-201", 2, LocalTime.of(8, 0), LocalTime.of(12, 0), 30),
        new ScheduleTemplateSeed("doctor2@hospital.vn", "CARD-201", 4, LocalTime.of(13, 30), LocalTime.of(17, 0), 30),
        new ScheduleTemplateSeed("doctor3@hospital.vn", "RAD-01", 1, LocalTime.of(9, 0), LocalTime.of(12, 0), 30),
        new ScheduleTemplateSeed("doctor4@hospital.vn", "IM-102", 5, LocalTime.of(8, 0), LocalTime.of(11, 30), 30));
  }

  static List<SpecialClosureSeed> specialClosures() {
    return List.of(
        new SpecialClosureSeed("UAT radiology maintenance window", "doctor3@hospital.vn", "RAD-01", 7, "Synthetic release drill for room maintenance"),
        new SpecialClosureSeed("UAT pediatric training afternoon", "doctor4@hospital.vn", "IM-102", 10, "Synthetic release drill for schedule closure handling"));
  }

  static List<ContentSectionSeed> contentSections() {
    return List.of(
        new ContentSectionSeed("release-hero", "Release UAT hospital access", "Book, check in, review results, and manage hospital operations with synthetic data.", "Book appointment", "/booking", 1),
        new ContentSectionSeed("release-services", "Backend-integrated care journeys", "Departments, doctors, queue, portal, inventory, finance, and admin screens have seeded records for release testing.", "Explore departments", "/departments", 2),
        new ContentSectionSeed("release-portal", "Patient portal ready for UAT", "Synthetic patients include appointments, lab results, profile data, and care-team messages.", "Open portal", "/portal/login", 3));
  }

  static List<NewsSeed> newsArticles() {
    return List.of(
        new NewsSeed("release-uat-evening-clinic", "Synthetic UAT evening clinic", "Release demo slots are available for public booking checks."),
        new NewsSeed("release-uat-patient-portal", "Patient portal release data loaded", "Synthetic portal patients include appointments, lab results, and messages."),
        new NewsSeed("release-uat-inventory-finance", "Operations data ready for UAT", "Inventory alerts, invoices, payments, and audit logs are available for role testing."));
  }

  static List<PatientSeed> patients(int targetPatients) {
    var seeds = new ArrayList<>(List.of(
        new PatientSeed("Nguyen Thi Hoa", "patient@example.com", "0912345678", LocalDate.of(1992, 4, 15), Gender.FEMALE, "012345678901", "Office Manager", "A+", "Seasonal allergies and mild asthma.", "Penicillin", "BHYT-23910231", true),
        new PatientSeed("Nguyen Van Clinical", "nguyen.van.clinical@example.com", "0912001001", LocalDate.of(1990, 5, 15), Gender.MALE, "098765432109", "Teacher", "O+", "Hypertension monitoring cohort.", "None recorded", "UAT-INS-0001", true),
        new PatientSeed("Tran Thi Queue", "release.patient002@example.com", "0912001002", LocalDate.of(1988, 8, 22), Gender.FEMALE, "098765432110", "Accountant", "B+", "Cardiology follow-up cohort.", "Iodine", "UAT-INS-0002", true),
        new PatientSeed("Le Van Imaging", "release.patient003@example.com", "0912001003", LocalDate.of(1979, 1, 9), Gender.MALE, "098765432111", "Engineer", "AB+", "Diagnostic imaging cohort.", "None recorded", "UAT-INS-0003", false),
        new PatientSeed("Pham Nhu Portal", "release.patient004@example.com", "0912001004", LocalDate.of(1984, 11, 2), Gender.FEMALE, "098765432112", "Retail Manager", "A-", "Portal lab-result review cohort.", "Sulfa", "UAT-INS-0004", true),
        new PatientSeed("Vo Minh Finance", "release.patient005@example.com", "0912001005", LocalDate.of(1996, 7, 18), Gender.MALE, "098765432113", "Designer", "O-", "Completed appointment and invoice cohort.", "None recorded", "UAT-INS-0005", false),
        new PatientSeed("Dang Thi Imaging", "release.patient006@example.com", "0912001006", LocalDate.of(1991, 3, 25), Gender.FEMALE, "098765432114", "Coordinator", "B-", "Pending imaging cohort.", "None recorded", "UAT-INS-0006", false)));

    for (int index = seeds.size() + 1; index <= targetPatients; index++) {
      seeds.add(new PatientSeed(
          "Release Patient %03d".formatted(index),
          "release.patient%03d@example.com".formatted(index),
          "0912%06d".formatted(index),
          LocalDate.of(1975 + (index % 25), (index % 12) + 1, (index % 27) + 1),
          index % 2 == 0 ? Gender.FEMALE : Gender.MALE,
          "770%09d".formatted(index),
          "Synthetic UAT participant",
          List.of("A+", "B+", "O+", "AB+").get(index % 4),
          "Generated release UAT medical history.",
          index % 5 == 0 ? "Penicillin" : "None recorded",
          "UAT-INS-%04d".formatted(index),
          index <= 8));
    }
    return List.copyOf(seeds);
  }

  static List<AppointmentSeed> appointments(int targetAppointments, List<String> patientEmails) {
    var seeds = new ArrayList<>(List.of(
        new AppointmentSeed("HMS-UAT-QUEUE-001", "nguyen.van.clinical@example.com", "doctor1@hospital.vn", 0, LocalTime.of(8, 0), AppointmentStatus.CHECKED_IN, "Queue-ready hypertension review.", true, false, false, false, null),
        new AppointmentSeed("HMS-UAT-QUEUE-002", "release.patient002@example.com", "doctor2@hospital.vn", 0, LocalTime.of(8, 30), AppointmentStatus.IN_PROGRESS, "Cardiology consultation in progress.", true, false, false, false, null),
        new AppointmentSeed("HMS-UAT-QUEUE-003", "release.patient003@example.com", "doctor1@hospital.vn", 0, LocalTime.of(9, 0), AppointmentStatus.CONFIRMED, "Waiting room release queue case.", false, false, false, false, null),
        new AppointmentSeed("HMS-UAT-DONE-001", "patient@example.com", "doctor1@hospital.vn", -14, LocalTime.of(10, 0), AppointmentStatus.DONE, "Completed allergy follow-up with portal artifacts.", true, true, true, true, InvoiceStatus.PAID),
        new AppointmentSeed("HMS-UAT-DONE-002", "release.patient004@example.com", "doctor2@hospital.vn", -3, LocalTime.of(10, 30), AppointmentStatus.DONE, "Completed cardiac review for unpaid invoice flow.", true, true, true, true, InvoiceStatus.UNPAID),
        new AppointmentSeed("HMS-UAT-CONFIRM-001", "release.patient005@example.com", "doctor4@hospital.vn", 2, LocalTime.of(14, 0), AppointmentStatus.CONFIRMED, "Upcoming pediatric consultation.", false, false, false, false, null),
        new AppointmentSeed("HMS-UAT-PENDING-001", "release.patient006@example.com", "doctor3@hospital.vn", 3, LocalTime.of(9, 30), AppointmentStatus.PENDING, "Pending imaging appointment.", false, false, false, false, null)));

    for (int index = seeds.size() + 1; index <= targetAppointments; index++) {
      var patientEmail = patientEmails.get((index - 1) % patientEmails.size());
      var status = List.of(AppointmentStatus.CONFIRMED, AppointmentStatus.CHECKED_IN, AppointmentStatus.IN_PROGRESS, AppointmentStatus.DONE, AppointmentStatus.PENDING).get(index % 5);
      seeds.add(new AppointmentSeed(
          "HMS-UAT-AUTO-%03d".formatted(index),
          patientEmail,
          index % 2 == 0 ? "doctor1@hospital.vn" : "doctor2@hospital.vn",
          index % 4 == 0 ? -index : index % 10,
          LocalTime.of(8 + (index % 7), index % 2 == 0 ? 0 : 30),
          status,
          "Generated release UAT appointment %03d.".formatted(index),
          status == AppointmentStatus.CHECKED_IN || status == AppointmentStatus.IN_PROGRESS || status == AppointmentStatus.DONE,
          status == AppointmentStatus.DONE,
          status == AppointmentStatus.DONE,
          status == AppointmentStatus.DONE,
          status == AppointmentStatus.DONE && index % 2 == 0 ? InvoiceStatus.PAID : InvoiceStatus.UNPAID));
    }
    return List.copyOf(seeds);
  }

  static List<InventorySeed> inventoryItems(int targetInventoryItems) {
    var seeds = new ArrayList<>(List.of(
        new InventorySeed("UAT-MED-AML-005", "Amlodipine 5mg", "Medication", "box", 20, 92, "IN_STOCK", "Internal Medicine"),
        new InventorySeed("UAT-MED-ATR-020", "Atorvastatin 20mg", "Medication", "box", 18, 12, "LOW_STOCK", "Cardiology"),
        new InventorySeed("UAT-LAB-CBC-001", "CBC Reagent Kit", "Laboratory", "kit", 10, 34, "IN_STOCK", "Laboratory"),
        new InventorySeed("UAT-SUP-GLO-001", "Nitrile Gloves", "Consumable", "box", 50, 48, "LOW_STOCK", "Emergency Medicine"),
        new InventorySeed("UAT-EQP-ECG-002", "Portable ECG Cable", "Equipment", "unit", 5, 7, "IN_STOCK", "Cardiology"),
        new InventorySeed("UAT-MED-ORS-001", "Oral Rehydration Salts", "Medication", "sachet", 40, 75, "IN_STOCK", "Pediatrics")));
    for (int index = seeds.size() + 1; index <= targetInventoryItems; index++) {
      seeds.add(new InventorySeed(
          "UAT-AUTO-%04d".formatted(index),
          "Release Demo Supply %03d".formatted(index),
          List.of("Medication", "Consumable", "Equipment", "Laboratory").get(index % 4),
          List.of("box", "unit", "pack", "bottle").get(index % 4),
          15 + (index % 20),
          30 + (index % 60),
          index % 4 == 0 ? "LOW_STOCK" : "IN_STOCK",
          departments().get(index % departments().size()).name()));
    }
    return List.copyOf(seeds);
  }

  static List<AuditSeed> auditLogs(int targetAuditLogs) {
    var actions = List.of("RELEASE_DEMO_LOGIN_VALIDATED", "RELEASE_DEMO_QUEUE_VALIDATED", "RELEASE_DEMO_PORTAL_VALIDATED", "RELEASE_DEMO_FINANCE_VALIDATED");
    var seeds = new ArrayList<AuditSeed>();
    for (int index = 1; index <= targetAuditLogs; index++) {
      seeds.add(new AuditSeed(
          "release-demo-%03d".formatted(index),
          index % 2 == 0 ? "admin@hospital.vn" : "accountant@hospital.vn",
          actions.get(index % actions.size())));
    }
    return List.copyOf(seeds);
  }

  record DepartmentSeed(String name, String description, String phone) {
  }

  record StaffAccountSeed(String email, String password, String fullName, UserRole role, String departmentName, String specialty) {
  }

  record RoomSeed(String name, String departmentName, RoomStatus status, String notes) {
  }

  record ScheduleTemplateSeed(String doctorEmail, String roomName, int weekday, LocalTime startTime, LocalTime endTime, int slotDurationMinutes) {
  }

  record SpecialClosureSeed(String title, String doctorEmail, String roomName, int dayOffset, String reason) {
  }

  record ContentSectionSeed(String slug, String title, String body, String ctaLabel, String ctaHref, int sortOrder) {
  }

  record NewsSeed(String slug, String title, String summary) {
    Instant publishedAt() {
      return Instant.parse("2026-05-01T00:00:00Z");
    }
  }

  record PatientSeed(String fullName, String email, String phone, LocalDate dateOfBirth, Gender gender, String citizenId, String occupation, String bloodType, String medicalHistory, String drugAllergies, String insuranceNumber, boolean portalAccount) {
  }

  record AppointmentSeed(String confirmationCode, String patientEmail, String doctorEmail, int dayOffset, LocalTime startTime, AppointmentStatus status, String symptoms, boolean vitals, boolean medicalRecord, boolean labResult, boolean invoice, InvoiceStatus invoiceStatus) {
  }

  record InventorySeed(String sku, String itemName, String category, String unit, int reorderLevel, int quantityOnHand, String status, String departmentName) {
    String lotCode() {
      return sku + "-LOT";
    }
  }

  record AuditSeed(String key, String actorEmail, String action) {
  }

  record ServicePricingSeed(String departmentName, String serviceName, BigDecimal amount) {
  }
}
