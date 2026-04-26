package com.hospital.core.seed;

import com.hospital.core.appointment.AppointmentEntity;
import com.hospital.core.appointment.AppointmentRepository;
import com.hospital.core.department.DepartmentEntity;
import com.hospital.core.department.DepartmentRepository;
import com.hospital.core.inventory.InventoryItemEntity;
import com.hospital.core.inventory.InventoryItemRepository;
import com.hospital.core.inventory.InventoryLotEntity;
import com.hospital.core.inventory.InventoryLotRepository;
import com.hospital.core.inventory.InventoryMovementEntity;
import com.hospital.core.inventory.InventoryMovementRepository;
import com.hospital.core.invoice.ServicePricingEntity;
import com.hospital.core.invoice.ServicePricingRepository;
import com.hospital.core.medicalrecord.MedicalRecordEntity;
import com.hospital.core.medicalrecord.MedicalRecordRepository;
import com.hospital.core.patient.PatientEntity;
import com.hospital.core.patient.PatientIdentifierProtector;
import com.hospital.core.patient.PatientRepository;
import com.hospital.core.patientauth.PatientAccountEntity;
import com.hospital.core.patientauth.PatientAccountRepository;
import com.hospital.core.patientportal.LabResultEntity;
import com.hospital.core.patientportal.PatientPortalLabResultRepository;
import com.hospital.core.patientportal.PatientMessageEntity;
import com.hospital.core.patientportal.PatientMessageRepository;
import com.hospital.core.patientportal.PatientMessageThreadEntity;
import com.hospital.core.patientportal.PatientMessageThreadRepository;
import com.hospital.core.timeslot.TimeSlotEntity;
import com.hospital.core.timeslot.TimeSlotRepository;
import com.hospital.core.user.UserEntity;
import com.hospital.core.user.UserRepository;
import com.hospital.shared.enums.AppointmentStatus;
import com.hospital.shared.enums.Gender;
import com.hospital.shared.enums.SlotStatus;
import com.hospital.shared.enums.UserRole;
import java.time.LocalDate;
import java.time.LocalTime;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SeedDataService {
  private final AppointmentRepository appointmentRepository;
  private final DepartmentRepository departmentRepository;
  private final InventoryItemRepository inventoryItemRepository;
  private final InventoryLotRepository inventoryLotRepository;
  private final InventoryMovementRepository inventoryMovementRepository;
  private final PatientPortalLabResultRepository labResultRepository;
  private final MedicalRecordRepository medicalRecordRepository;
  private final PatientAccountRepository patientAccountRepository;
  private final PatientIdentifierProtector patientIdentifierProtector;
  private final PatientMessageRepository patientMessageRepository;
  private final PatientMessageThreadRepository patientMessageThreadRepository;
  private final PatientRepository patientRepository;
  private final ServicePricingRepository servicePricingRepository;
  private final UserRepository userRepository;
  private final TimeSlotRepository timeSlotRepository;
  private final PasswordEncoder passwordEncoder;

  public SeedDataService(
      AppointmentRepository appointmentRepository,
      DepartmentRepository departmentRepository,
      InventoryItemRepository inventoryItemRepository,
      InventoryLotRepository inventoryLotRepository,
      InventoryMovementRepository inventoryMovementRepository,
      PatientPortalLabResultRepository labResultRepository,
      MedicalRecordRepository medicalRecordRepository,
      PatientAccountRepository patientAccountRepository,
      PatientIdentifierProtector patientIdentifierProtector,
      PatientMessageRepository patientMessageRepository,
      PatientMessageThreadRepository patientMessageThreadRepository,
      PatientRepository patientRepository,
      ServicePricingRepository servicePricingRepository,
      UserRepository userRepository,
      TimeSlotRepository timeSlotRepository,
      PasswordEncoder passwordEncoder) {
    this.appointmentRepository = appointmentRepository;
    this.departmentRepository = departmentRepository;
    this.inventoryItemRepository = inventoryItemRepository;
    this.inventoryLotRepository = inventoryLotRepository;
    this.inventoryMovementRepository = inventoryMovementRepository;
    this.labResultRepository = labResultRepository;
    this.medicalRecordRepository = medicalRecordRepository;
    this.patientAccountRepository = patientAccountRepository;
    this.patientIdentifierProtector = patientIdentifierProtector;
    this.patientMessageRepository = patientMessageRepository;
    this.patientMessageThreadRepository = patientMessageThreadRepository;
    this.patientRepository = patientRepository;
    this.servicePricingRepository = servicePricingRepository;
    this.userRepository = userRepository;
    this.timeSlotRepository = timeSlotRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @Transactional
  public void seedIfEmpty() {
    if (departmentRepository.count() > 0 || userRepository.count() > 0) {
      return;
    }

    var internalMedicine = createDepartment("Internal Medicine", "General consultation and chronic care", "028 1000 0001");
    var pediatrics = createDepartment("Pediatrics", "Children and adolescent care", "028 1000 0002");
    var cardiology = createDepartment("Cardiology", "Heart and vascular specialty", "028 1000 0003");
    departmentRepository.saveAll(List.of(internalMedicine, pediatrics, cardiology));
    servicePricingRepository.saveAll(List.of(
        createPricing(internalMedicine, "CONSULTATION", BigDecimal.valueOf(220000)),
        createPricing(pediatrics, "CONSULTATION", BigDecimal.valueOf(180000)),
        createPricing(cardiology, "CONSULTATION", BigDecimal.valueOf(300000))));

    var doctorOne = createUser("doctor1@hospital.vn", "Doctor@1234", "Dr. Nguyen Van An", UserRole.DOCTOR, internalMedicine, "Internal Medicine");
    var doctorTwo = createUser("doctor2@hospital.vn", "Doctor@1234", "Dr. Tran Thi Binh", UserRole.DOCTOR, cardiology, "Cardiology");
    var nurse = createUser("nurse@hospital.vn", "Nurse@1234", "Le Thi Cuc", UserRole.NURSE, internalMedicine, null);
    createUser("receptionist@hospital.vn", "Reception@1234", "Vo Thi Reception", UserRole.RECEPTIONIST, null, null);
    createUser("pharmacist@hospital.vn", "Pharma@1234", "Hoang Van Pharmacist", UserRole.PHARMACIST, null, null);
    var accountant = createUser("accountant@hospital.vn", "Acc@1234", "Pham Van Dung", UserRole.ACCOUNTANT, null, null);
    var admin = createUser("admin@hospital.vn", "Admin@1234", "System Admin", UserRole.ADMIN, null, null);
    userRepository.saveAll(List.of(doctorOne, doctorTwo, nurse, accountant, admin));

    if (timeSlotRepository.count() == 0) {
      generateSlots(doctorOne);
      generateSlots(doctorTwo);
    }

    if (inventoryItemRepository.count() == 0) {
      seedInventory(internalMedicine, cardiology);
    }

    if (patientAccountRepository.count() == 0) {
      seedPatientPortal(doctorOne);
    }
  }

  private DepartmentEntity createDepartment(String name, String description, String phone) {
    var entity = new DepartmentEntity();
    entity.setName(name);
    entity.setDescription(description);
    entity.setPhone(phone);
    entity.setImageUrl("https://images.unsplash.com/photo-1576091160550-2173dba999ef");
    return entity;
  }

  private ServicePricingEntity createPricing(DepartmentEntity department, String serviceName, BigDecimal amount) {
    var pricing = new ServicePricingEntity();
    pricing.setDepartment(department);
    pricing.setServiceName(serviceName);
    pricing.setAmount(amount);
    pricing.setEffectiveDate(LocalDate.now().minusDays(1));
    return pricing;
  }

  private UserEntity createUser(
      String email,
      String rawPassword,
      String fullName,
      UserRole role,
      DepartmentEntity department,
      String specialty) {
    var user = new UserEntity();
    user.setEmail(email);
    user.setPasswordHash(passwordEncoder.encode(rawPassword));
    user.setFullName(fullName);
    user.setPhone("0900000000");
    user.setRole(role);
    user.setDepartment(department);
    user.setSpecialty(specialty);
    user.setQualification(role == UserRole.DOCTOR ? "MD" : null);
    user.setExperienceYears(role == UserRole.DOCTOR ? 10 : null);
    return user;
  }

  private void generateSlots(UserEntity doctor) {
    for (int dayOffset = 1; dayOffset <= 14; dayOffset++) {
      var date = LocalDate.now().plusDays(dayOffset);
      var startTime = LocalTime.of(8, 0);
      while (startTime.isBefore(LocalTime.of(17, 0))) {
        var slot = new TimeSlotEntity();
        slot.setDoctor(doctor);
        slot.setSlotDate(date);
        slot.setStartTime(startTime);
        slot.setEndTime(startTime.plusMinutes(30));
        slot.setStatus(SlotStatus.AVAILABLE);
        timeSlotRepository.save(slot);
        startTime = startTime.plusMinutes(30);
      }
    }
  }

  private void seedInventory(DepartmentEntity internalMedicine, DepartmentEntity cardiology) {
    var cetirizine = createInventoryItem(
        internalMedicine,
        "MED-CET-010",
        "Cetirizine 10mg",
        "Medication",
        "box",
        18,
        72,
        "IN_STOCK");
    var saline = createInventoryItem(
        internalMedicine,
        "SUP-SAL-500",
        "Normal Saline 500ml",
        "Consumable",
        "bag",
        12,
        22,
        "LOW_STOCK");
    var ecgPads = createInventoryItem(
        cardiology,
        "EQP-ECG-001",
        "ECG Electrode Pads",
        "Equipment",
        "pack",
        10,
        58,
        "IN_STOCK");

    inventoryItemRepository.saveAll(List.of(cetirizine, saline, ecgPads));
    inventoryLotRepository.saveAll(List.of(
        createInventoryLot(cetirizine, "LOT-CET-2402", "WellSpring Pharma", 80, 72, LocalDate.now().plusMonths(10)),
        createInventoryLot(saline, "LOT-SAL-2401", "MedSupply VN", 40, 22, LocalDate.now().plusMonths(3)),
        createInventoryLot(ecgPads, "LOT-ECG-2405", "Heartline Medical", 70, 58, LocalDate.now().plusMonths(12))));
    inventoryMovementRepository.saveAll(List.of(
        createInventoryMovement(cetirizine, "RESTOCK", 80, "Monthly antihistamine restock"),
        createInventoryMovement(saline, "DISPENSE", -18, "Ward usage over the last 48 hours"),
        createInventoryMovement(ecgPads, "RESTOCK", 70, "Cardiology stock top-up")));
  }

  private InventoryItemEntity createInventoryItem(
      DepartmentEntity department,
      String sku,
      String itemName,
      String category,
      String unit,
      int reorderLevel,
      int quantityOnHand,
      String status) {
    var item = new InventoryItemEntity();
    item.setDepartment(department);
    item.setSku(sku);
    item.setItemName(itemName);
    item.setCategory(category);
    item.setUnit(unit);
    item.setReorderLevel(reorderLevel);
    item.setQuantityOnHand(quantityOnHand);
    item.setStatus(status);
    item.setLastRestockedAt(java.time.Instant.now().minusSeconds(86_400));
    return item;
  }

  private InventoryLotEntity createInventoryLot(
      InventoryItemEntity item,
      String lotCode,
      String supplierName,
      int quantityReceived,
      int quantityRemaining,
      LocalDate expiresOn) {
    var lot = new InventoryLotEntity();
    lot.setItem(item);
    lot.setLotCode(lotCode);
    lot.setSupplierName(supplierName);
    lot.setQuantityReceived(quantityReceived);
    lot.setQuantityRemaining(quantityRemaining);
    lot.setExpiresOn(expiresOn);
    return lot;
  }

  private InventoryMovementEntity createInventoryMovement(
      InventoryItemEntity item,
      String movementType,
      int quantityDelta,
      String note) {
    var movement = new InventoryMovementEntity();
    movement.setItem(item);
    movement.setMovementType(movementType);
    movement.setQuantityDelta(quantityDelta);
    movement.setNote(note);
    return movement;
  }

  private void seedPatientPortal(UserEntity doctor) {
    var patient = new PatientEntity();
    patient.setFullName("Nguyen Thi Hoa");
    patient.setPhone("0912345678");
    patient.setEmail("patient@example.com");
    patient.setDateOfBirth(LocalDate.of(1992, 4, 15));
    patient.setGender(Gender.FEMALE);
    patient.setOccupation("Office Manager");
    patient.setBloodType("A+");
    patient.setMedicalHistory("Seasonal allergies and mild asthma.");
    patient.setDrugAllergies("Penicillin");
    patient.setInsuranceNumber("BHYT-23910231");
    patient.setCccd(patientIdentifierProtector.encrypt("012345678901"));
    patient.setCccdHash(patientIdentifierProtector.hash("012345678901"));
    patient = patientRepository.save(patient);

    var account = new PatientAccountEntity();
    account.setPatient(patient);
    account.setEmail("patient@example.com");
    account.setPasswordHash(passwordEncoder.encode("Patient@1234"));
    account.setActive(true);
    patientAccountRepository.save(account);

    var upcomingSlot = new TimeSlotEntity();
    upcomingSlot.setDoctor(doctor);
    upcomingSlot.setSlotDate(LocalDate.now().plusDays(2));
    upcomingSlot.setStartTime(LocalTime.of(9, 0));
    upcomingSlot.setEndTime(LocalTime.of(9, 30));
    upcomingSlot.setStatus(SlotStatus.BOOKED);
    upcomingSlot = timeSlotRepository.save(upcomingSlot);

    var completedSlot = new TimeSlotEntity();
    completedSlot.setDoctor(doctor);
    completedSlot.setSlotDate(LocalDate.now().minusDays(14));
    completedSlot.setStartTime(LocalTime.of(10, 30));
    completedSlot.setEndTime(LocalTime.of(11, 0));
    completedSlot.setStatus(SlotStatus.BOOKED);
    completedSlot = timeSlotRepository.save(completedSlot);

    var upcomingAppointment = new AppointmentEntity();
    upcomingAppointment.setPatient(patient);
    upcomingAppointment.setDoctor(doctor);
    upcomingAppointment.setFirstSlot(upcomingSlot);
    upcomingAppointment.setAppointmentDate(upcomingSlot.getSlotDate());
    upcomingAppointment.setAiDurationMinutes(30);
    upcomingAppointment.setSymptoms("Follow-up on allergy treatment and cough management.");
    upcomingAppointment.setConfirmationCode("HMS-PORTAL-001");
    upcomingAppointment.setStatus(AppointmentStatus.CONFIRMED);
    appointmentRepository.save(upcomingAppointment);

    var completedAppointment = new AppointmentEntity();
    completedAppointment.setPatient(patient);
    completedAppointment.setDoctor(doctor);
    completedAppointment.setFirstSlot(completedSlot);
    completedAppointment.setAppointmentDate(completedSlot.getSlotDate());
    completedAppointment.setAiDurationMinutes(45);
    completedAppointment.setSymptoms("Persistent chest tightness and seasonal allergy flare.");
    completedAppointment.setConfirmationCode("HMS-PORTAL-000");
    completedAppointment.setStatus(AppointmentStatus.DONE);
    completedAppointment = appointmentRepository.save(completedAppointment);

    var medicalRecord = new MedicalRecordEntity();
    medicalRecord.setAppointment(completedAppointment);
    medicalRecord.setDiagnosis("Seasonal allergic rhinitis");
    medicalRecord.setClinicalNotes("Symptoms improved with antihistamine and inhaler review.");
    medicalRecordRepository.save(medicalRecord);

    var labResult = new LabResultEntity();
    labResult.setPatient(patient);
    labResult.setAppointment(completedAppointment);
    labResult.setTestName("Complete Blood Count");
    labResult.setStatus("Reviewed");
    labResult.setResultSummary("Mild eosinophilia consistent with allergic response.");
    labResult.setDoctorComment("Continue allergy control plan and repeat only if symptoms worsen.");
    labResult.setAttachmentUrl("/lab-results/demo-cbc.pdf");
    labResult.setCollectedAt(Instant.now().minusSeconds(1_209_600));
    labResultRepository.save(labResult);

    var thread = new PatientMessageThreadEntity();
    thread.setPatient(patient);
    thread.setSubject("Follow-up visit preparation");
    thread.setChannel("Portal");
    thread.setUnreadCount(1);
    thread.setLastMessagePreview("Please bring your latest inhaler list and symptom notes.");
    thread = patientMessageThreadRepository.save(thread);

    var staffMessage = new PatientMessageEntity();
    staffMessage.setThread(thread);
    staffMessage.setSenderRole("CARE_TEAM");
    staffMessage.setBody("Please bring your latest inhaler list and symptom notes to the upcoming follow-up visit.");
    patientMessageRepository.save(staffMessage);

    var patientMessage = new PatientMessageEntity();
    patientMessage.setThread(thread);
    patientMessage.setSenderRole("PATIENT");
    patientMessage.setBody("Confirmed. I will bring the medication list and my recent symptom log.");
    patientMessageRepository.save(patientMessage);
  }
}
