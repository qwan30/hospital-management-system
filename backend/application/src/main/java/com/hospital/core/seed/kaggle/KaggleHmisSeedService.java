package com.hospital.core.seed.kaggle;

import com.hospital.core.appointment.AppointmentEntity;
import com.hospital.core.appointment.AppointmentRepository;
import com.hospital.core.audit.AuditLogEntity;
import com.hospital.core.audit.AuditLogRepository;
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
import com.hospital.core.patientportal.LabResultEntity;
import com.hospital.core.patientportal.PatientPortalLabResultRepository;
import com.hospital.core.prescription.PrescriptionItemEntity;
import com.hospital.core.seed.DemoSeedPolicy;
import com.hospital.core.seed.NonBillingDemoSeedProperties;
import com.hospital.core.timeslot.TimeSlotEntity;
import com.hospital.core.timeslot.TimeSlotRepository;
import com.hospital.core.user.UserEntity;
import com.hospital.core.user.UserRepository;
import com.hospital.shared.enums.AppointmentStatus;
import com.hospital.shared.enums.SlotStatus;
import com.hospital.shared.enums.UserRole;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class KaggleHmisSeedService {

  private static final Logger LOGGER = LoggerFactory.getLogger(KaggleHmisSeedService.class);
  private static final int BATCH_SIZE = 100;

  private final KaggleHmisDatasetReader datasetReader;
  private final KaggleHmisNormalizer normalizer;
  private final SyntheticDemoIdentityFactory identityFactory;
  private final NonBillingDemoSeedProperties properties;
  private final DemoSeedPolicy demoSeedPolicy;
  private final DepartmentRepository departmentRepository;
  private final ServicePricingRepository servicePricingRepository;
  private final UserRepository userRepository;
  private final PatientRepository patientRepository;
  private final TimeSlotRepository timeSlotRepository;
  private final AppointmentRepository appointmentRepository;
  private final InventoryItemRepository inventoryItemRepository;
  private final InventoryLotRepository inventoryLotRepository;
  private final InventoryMovementRepository inventoryMovementRepository;
  private final MedicalRecordRepository medicalRecordRepository;
  private final PatientPortalLabResultRepository labResultRepository;
  private final AuditLogRepository auditLogRepository;
  private final PatientIdentifierProtector patientIdentifierProtector;
  private final PasswordEncoder passwordEncoder;

  public KaggleHmisSeedService(
      KaggleHmisDatasetReader datasetReader,
      KaggleHmisNormalizer normalizer,
      SyntheticDemoIdentityFactory identityFactory,
      NonBillingDemoSeedProperties properties,
      DemoSeedPolicy demoSeedPolicy,
      DepartmentRepository departmentRepository,
      ServicePricingRepository servicePricingRepository,
      UserRepository userRepository,
      PatientRepository patientRepository,
      TimeSlotRepository timeSlotRepository,
      AppointmentRepository appointmentRepository,
      InventoryItemRepository inventoryItemRepository,
      InventoryLotRepository inventoryLotRepository,
      InventoryMovementRepository inventoryMovementRepository,
      MedicalRecordRepository medicalRecordRepository,
      PatientPortalLabResultRepository labResultRepository,
      AuditLogRepository auditLogRepository,
      PatientIdentifierProtector patientIdentifierProtector,
      PasswordEncoder passwordEncoder) {
    this.datasetReader = datasetReader;
    this.normalizer = normalizer;
    this.identityFactory = identityFactory;
    this.properties = properties;
    this.demoSeedPolicy = demoSeedPolicy;
    this.departmentRepository = departmentRepository;
    this.servicePricingRepository = servicePricingRepository;
    this.userRepository = userRepository;
    this.patientRepository = patientRepository;
    this.timeSlotRepository = timeSlotRepository;
    this.appointmentRepository = appointmentRepository;
    this.inventoryItemRepository = inventoryItemRepository;
    this.inventoryLotRepository = inventoryLotRepository;
    this.inventoryMovementRepository = inventoryMovementRepository;
    this.medicalRecordRepository = medicalRecordRepository;
    this.labResultRepository = labResultRepository;
    this.auditLogRepository = auditLogRepository;
    this.patientIdentifierProtector = patientIdentifierProtector;
    this.passwordEncoder = passwordEncoder;
  }

  @Transactional
  public void seedToTargets() {
    if (!properties.isEnabled()) {
      return;
    }
    demoSeedPolicy.requireAllowed("non-billing-demo");

    var doctorPassword = properties.requireConfiguredPassword();
    LOGGER.info("Starting Kaggle HMIS production demo seeding (source={}, root={})...",
        properties.getSource(), properties.getDatasetRoot());

    var dataset = datasetReader.read(properties.getDatasetRoot());
    if (dataset == null) {
      LOGGER.warn("Kaggle HMIS dataset is null, skipping seeding.");
      return;
    }

    var departments = ensureDepartments(dataset, properties.getTargetDepartments());
    var doctors = ensureDoctors(dataset, departments, properties.getTargetDoctors(), doctorPassword);
    var patients = ensurePatients(dataset, properties.getTargetPatients());

    ensureDoctorAvailability(doctors, 14);
    var appointments = ensureAppointments(dataset, doctors, patients, properties.getTargetAppointments());
    var inventoryItems = ensureInventory(dataset, departments, properties.getTargetInventoryItems());
    ensureClinicalEnrichment(dataset, appointments, inventoryItems);

    var allStaff = userRepository.findAllByOrderByFullNameAsc();
    ensureAuditLogs(allStaff, properties.getTargetAuditLogs());

    LOGGER.info("Kaggle HMIS production demo seeding completed successfully.");
  }

  @Transactional
  public List<DepartmentEntity> ensureDepartments(KaggleHmisDataset dataset, int target) {
    var existingDepartments = new ArrayList<>(departmentRepository.findAllByOrderByNameAsc());
    int deficit = properties.additionalDepartments(existingDepartments.size());
    if (deficit <= 0) {
      LOGGER.info("Departments count ({}) meets target ({}), skipping top-up.", existingDepartments.size(), target);
      return existingDepartments;
    }

    Set<String> existingNames = new HashSet<>();
    for (var dept : existingDepartments) {
      existingNames.add(dept.getName().toLowerCase(Locale.ROOT));
    }

    var toSave = new ArrayList<DepartmentEntity>();
    var pricingToSave = new ArrayList<ServicePricingEntity>();

    for (String canonicalName : KaggleHmisNormalizer.CANONICAL_DEPARTMENTS) {
      if (toSave.size() >= deficit) break;
      if (!existingNames.contains(canonicalName.toLowerCase(Locale.ROOT))) {
        var dept = new DepartmentEntity();
        dept.setName(canonicalName);
        dept.setDescription("Specialty clinical department: " + canonicalName);
        dept.setPhone(String.format(Locale.ROOT, "028 3000 %04d", existingDepartments.size() + toSave.size() + 1));
        dept.setActive(true);
        toSave.add(dept);
        existingNames.add(canonicalName.toLowerCase(Locale.ROOT));

        var pricing = new ServicePricingEntity();
        pricing.setDepartment(dept);
        pricing.setServiceName("Consultation - " + canonicalName);
        pricing.setAmount(BigDecimal.valueOf(250000));
        pricing.setEffectiveDate(LocalDate.now());
        pricingToSave.add(pricing);
      }
    }

    if (!toSave.isEmpty()) {
      var saved = departmentRepository.saveAll(List.copyOf(toSave));
      servicePricingRepository.saveAll(List.copyOf(pricingToSave));
      existingDepartments.addAll(saved);
      LOGGER.info("Seeded {} new departments to reach target {}.", saved.size(), target);
    }
    return existingDepartments;
  }

  @Transactional
  public List<UserEntity> ensureDoctors(
      KaggleHmisDataset dataset, List<DepartmentEntity> departments, int target, String doctorPassword) {
    var existingDoctors = new ArrayList<>(userRepository.findByRoleAndActiveTrueOrderByFullNameAsc(UserRole.DOCTOR));
    int deficit = properties.additionalDoctors(existingDoctors.size());
    if (deficit <= 0 || departments.isEmpty()) {
      return existingDoctors;
    }

    Map<String, String> employeeNamesById = new HashMap<>();
    for (var emp : dataset.employees()) {
      employeeNamesById.put(emp.employeeId(), emp.employeeName());
    }

    Set<String> existingEmails = new HashSet<>();
    for (var doc : existingDoctors) {
      existingEmails.add(doc.getEmail().toLowerCase(Locale.ROOT));
    }

    var toSave = new ArrayList<UserEntity>();
    int sourceIndex = 0;
    int createdCount = 0;
    var sourceDoctors = dataset.doctors();

    while (createdCount < deficit) {
      String sourceDocId = String.valueOf(existingDoctors.size() + createdCount + 1);
      String sourceEmpName = null;
      String specialty = departments.get(createdCount % departments.size()).getName();
      String qual = "MD";
      String exp = "10";

      if (sourceIndex < sourceDoctors.size()) {
        var src = sourceDoctors.get(sourceIndex);
        sourceDocId = src.doctorId();
        sourceEmpName = employeeNamesById.get(src.employeeId());
        if (src.specialization() != null && !src.specialization().isBlank()) {
          specialty = normalizer.normalizeDepartment(src.specialization());
        }
        qual = src.qualification();
        exp = src.experienceYears();
        sourceIndex++;
      }

      var identity = identityFactory.doctorIdentity(sourceDocId, sourceEmpName, specialty, qual, exp);
      if (existingEmails.contains(identity.email().toLowerCase(Locale.ROOT))) {
        continue;
      }

      var dept = findMatchingDepartment(departments, identity.specialty());

      var doctor = new UserEntity();
      doctor.setEmail(identity.email());
      doctor.setPasswordHash(passwordEncoder.encode(doctorPassword));
      doctor.setFullName(identity.fullName());
      doctor.setPhone(identity.phone());
      doctor.setRole(UserRole.DOCTOR);
      doctor.setDepartment(dept);
      doctor.setSpecialty(dept.getName());
      doctor.setQualification(identity.qualification());
      doctor.setExperienceYears(identity.experienceYears());
      doctor.setActive(true);

      toSave.add(doctor);
      existingEmails.add(identity.email().toLowerCase(Locale.ROOT));
      createdCount++;

      if (toSave.size() >= BATCH_SIZE) {
        var savedBatch = userRepository.saveAll(List.copyOf(toSave));
        existingDoctors.addAll(savedBatch);
        toSave.clear();
      }
    }

    if (!toSave.isEmpty()) {
      var savedBatch = userRepository.saveAll(List.copyOf(toSave));
      existingDoctors.addAll(savedBatch);
    }

    LOGGER.info("Seeded doctors up to total {}.", existingDoctors.size());
    return existingDoctors;
  }

  @Transactional
  public List<PatientEntity> ensurePatients(KaggleHmisDataset dataset, int target) {
    var existingPatients = new ArrayList<>(patientRepository.findAll());
    int deficit = properties.additionalPatients(existingPatients.size());
    if (deficit <= 0) {
      return existingPatients;
    }

    Set<String> existingEmails = new HashSet<>();
    for (var p : existingPatients) {
      existingEmails.add(p.getEmail().toLowerCase(Locale.ROOT));
    }

    var toSave = new ArrayList<PatientEntity>();
    var sourcePatients = dataset.patients();
    int sourceIndex = 0;
    int createdCount = 0;

    while (createdCount < deficit) {
      String srcId = String.valueOf(existingPatients.size() + createdCount + 1);
      String genderStr = "Female";
      String bloodStr = "O+";
      LocalDate dob = LocalDate.of(1985, 1, 1);

      if (sourceIndex < sourcePatients.size()) {
        var src = sourcePatients.get(sourceIndex);
        srcId = src.patientId();
        genderStr = src.gender();
        bloodStr = src.bloodGroup();
        try {
          if (src.dateOfBirth() != null && !src.dateOfBirth().isBlank()) {
            dob = LocalDate.parse(src.dateOfBirth().trim());
          }
        } catch (Exception ignored) {
          dob = LocalDate.of(1980 + (createdCount % 30), (createdCount % 12) + 1, (createdCount % 28) + 1);
        }
        sourceIndex++;
      }

      var identity = identityFactory.patientIdentity(srcId, genderStr);
      if (existingEmails.contains(identity.email().toLowerCase(Locale.ROOT))) {
        continue;
      }

      var patient = new PatientEntity();
      patient.setFullName(identity.fullName());
      patient.setEmail(identity.email());
      patient.setPhone(identity.phone());
      patient.setDateOfBirth(dob);
      patient.setGender(identity.gender());
      patient.setBloodType(normalizer.normalizeBloodType(bloodStr));
      patient.setOccupation(identity.occupation());
      patient.setInsuranceNumber(identity.insuranceNumber());
      patient.setMedicalHistory("Kaggle HMIS synthetic cohort patient ID " + srcId);
      patient.setDrugAllergies(createdCount % 6 == 0 ? "Penicillin" : "None recorded");
      patient.setCccd(patientIdentifierProtector.encrypt(identity.rawCccd()));
      patient.setCccdHash(patientIdentifierProtector.hash(identity.rawCccd()));

      toSave.add(patient);
      existingEmails.add(identity.email().toLowerCase(Locale.ROOT));
      createdCount++;

      if (toSave.size() >= BATCH_SIZE) {
        var savedBatch = patientRepository.saveAll(List.copyOf(toSave));
        existingPatients.addAll(savedBatch);
        toSave.clear();
      }
    }

    if (!toSave.isEmpty()) {
      var savedBatch = patientRepository.saveAll(List.copyOf(toSave));
      existingPatients.addAll(savedBatch);
    }

    LOGGER.info("Seeded patients up to total {}.", existingPatients.size());
    return existingPatients;
  }

  @Transactional
  public void ensureDoctorAvailability(List<UserEntity> doctors, int futureDays) {
    if (doctors.isEmpty()) return;

    var today = LocalDate.now();
    var slotTimes = List.of(
        LocalTime.of(8, 0),
        LocalTime.of(9, 0),
        LocalTime.of(10, 0),
        LocalTime.of(13, 30),
        LocalTime.of(14, 30));

    var slotsToSave = new ArrayList<TimeSlotEntity>();
    for (int day = 0; day < futureDays; day++) {
      var date = today.plusDays(day);
      for (var doctor : doctors) {
        for (var time : slotTimes) {
          var slot = new TimeSlotEntity();
          slot.setDoctor(doctor);
          slot.setSlotDate(date);
          slot.setStartTime(time);
          slot.setEndTime(time.plusMinutes(45));
          slot.setStatus(SlotStatus.AVAILABLE);
          slotsToSave.add(slot);

          if (slotsToSave.size() >= BATCH_SIZE) {
            timeSlotRepository.saveAll(List.copyOf(slotsToSave));
            slotsToSave.clear();
          }
        }
      }
    }
    if (!slotsToSave.isEmpty()) {
      timeSlotRepository.saveAll(List.copyOf(slotsToSave));
    }
  }

  @Transactional
  public List<AppointmentEntity> ensureAppointments(
      KaggleHmisDataset dataset, List<UserEntity> doctors, List<PatientEntity> patients, int target) {
    var existingAppointments = new ArrayList<>(appointmentRepository.findAll());
    int deficit = properties.additionalAppointments(existingAppointments.size());
    if (deficit <= 0 || doctors.isEmpty() || patients.isEmpty()) {
      return existingAppointments;
    }

    var sourceAdmissions = dataset.admissions();
    var toSave = new ArrayList<AppointmentEntity>();
    var slotsToSave = new ArrayList<TimeSlotEntity>();
    int sourceIndex = 0;
    int createdCount = 0;
    var today = LocalDate.now();

    while (createdCount < deficit) {
      var doctor = doctors.get((createdCount + existingAppointments.size()) % doctors.size());
      var patient = patients.get((createdCount + existingAppointments.size()) % patients.size());

      String statusStr = null;
      int dayOffset = (createdCount % 60) - 40;
      if (sourceIndex < sourceAdmissions.size()) {
        statusStr = sourceAdmissions.get(sourceIndex).admissionStatus();
        sourceIndex++;
      }

      var appointmentDate = today.plusDays(dayOffset);
      var appointmentStatus = normalizer.normalizeAppointmentStatus(statusStr, createdCount);
      if (dayOffset > 0 && appointmentStatus == AppointmentStatus.DONE) {
        appointmentStatus = AppointmentStatus.CONFIRMED;
      }

      var startTime = LocalTime.of(8, 0).plusMinutes((long) (createdCount % 16) * 30L);
      var slot = new TimeSlotEntity();
      slot.setDoctor(doctor);
      slot.setSlotDate(appointmentDate);
      slot.setStartTime(startTime);
      slot.setEndTime(startTime.plusMinutes(30));
      slot.setStatus(SlotStatus.BOOKED);
      slotsToSave.add(slot);

      var appointment = new AppointmentEntity();
      appointment.setPatient(patient);
      appointment.setDoctor(doctor);
      appointment.setFirstSlot(slot);
      appointment.setAppointmentDate(appointmentDate);
      appointment.setStatus(appointmentStatus);
      appointment.setReason("Clinical Consultation - Kaggle HMIS Ref " + (existingAppointments.size() + createdCount + 1));
      appointment.setSymptoms(createdCount % 3 == 0 ? "Fever and mild fatigue" : "Routine clinical examination");
      appointment.setNotes("Scheduled via automated Kaggle seed pipeline");

      toSave.add(appointment);
      createdCount++;

      if (toSave.size() >= BATCH_SIZE) {
        timeSlotRepository.saveAll(List.copyOf(slotsToSave));
        var savedBatch = appointmentRepository.saveAll(List.copyOf(toSave));
        existingAppointments.addAll(savedBatch);
        slotsToSave.clear();
        toSave.clear();
      }
    }

    if (!toSave.isEmpty()) {
      timeSlotRepository.saveAll(List.copyOf(slotsToSave));
      var savedBatch = appointmentRepository.saveAll(List.copyOf(toSave));
      existingAppointments.addAll(savedBatch);
    }

    LOGGER.info("Seeded appointments up to total {}.", existingAppointments.size());
    return existingAppointments;
  }

  @Transactional
  public List<InventoryItemEntity> ensureInventory(
      KaggleHmisDataset dataset, List<DepartmentEntity> departments, int target) {
    var existingItems = new ArrayList<>(inventoryItemRepository.findAll());
    int deficit = properties.additionalInventoryItems(existingItems.size());
    if (deficit <= 0 || departments.isEmpty()) {
      return existingItems;
    }

    var sourceDrugs = dataset.drugs();
    var sourceInventory = dataset.drugInventory();
    var toSave = new ArrayList<InventoryItemEntity>();
    var lotsToSave = new ArrayList<InventoryLotEntity>();
    var movementsToSave = new ArrayList<InventoryMovementEntity>();

    int sourceIndex = 0;
    int createdCount = 0;
    while (createdCount < deficit) {
      var dept = departments.get(createdCount % departments.size());
      String name = "Pharmaceutical Drug " + (existingItems.size() + createdCount + 1);
      String category = "General Medicine";
      int stock = 200;
      int minStock = 30;

      if (sourceIndex < sourceDrugs.size()) {
        var drug = sourceDrugs.get(sourceIndex);
        name = drug.drugName();
        if (drug.brandName() != null && !drug.brandName().isBlank()) {
          name = name + " (" + drug.brandName() + ")";
        }
        if (drug.drugCategory() != null && !drug.drugCategory().isBlank()) {
          category = drug.drugCategory();
        }
        if (sourceIndex < sourceInventory.size()) {
          var inv = sourceInventory.get(sourceIndex);
          try {
            stock = Integer.parseInt(inv.currentStock());
            minStock = Integer.parseInt(inv.reorderLevel());
          } catch (Exception ignored) {}
        }
        sourceIndex++;
      }

      var item = new InventoryItemEntity();
      item.setItemName(name);
      item.setSku(String.format(Locale.ROOT, "KGH-DRUG-%04d", existingItems.size() + createdCount + 1));
      item.setCategory(category);
      item.setUnit("box");
      item.setDepartment(dept);
      item.setQuantityOnHand(stock);
      item.setReorderLevel(minStock);
      item.setStatus("ACTIVE");

      var lot = new InventoryLotEntity();
      lot.setItem(item);
      lot.setLotCode(String.format(Locale.ROOT, "KGH-LOT-%04d", existingItems.size() + createdCount + 1));
      lot.setSupplierName("Kaggle HMIS Pharmacy Supplier");
      lot.setQuantityReceived(stock);
      lot.setQuantityRemaining(stock);
      lot.setExpiresOn(LocalDate.now().plusMonths(18 + (createdCount % 12)));

      var movement = new InventoryMovementEntity();
      movement.setItem(item);
      movement.setLot(lot);
      movement.setMovementType("IMPORT");
      movement.setQuantityDelta(stock);
      movement.setNote("Opening Kaggle HMIS production seed stock");

      toSave.add(item);
      lotsToSave.add(lot);
      movementsToSave.add(movement);
      createdCount++;

      if (toSave.size() >= BATCH_SIZE) {
        var savedItems = inventoryItemRepository.saveAll(List.copyOf(toSave));
        inventoryLotRepository.saveAll(List.copyOf(lotsToSave));
        inventoryMovementRepository.saveAll(List.copyOf(movementsToSave));
        existingItems.addAll(savedItems);
        toSave.clear();
        lotsToSave.clear();
        movementsToSave.clear();
      }
    }

    if (!toSave.isEmpty()) {
      var savedItems = inventoryItemRepository.saveAll(List.copyOf(toSave));
      inventoryLotRepository.saveAll(List.copyOf(lotsToSave));
      inventoryMovementRepository.saveAll(List.copyOf(movementsToSave));
      existingItems.addAll(savedItems);
    }

    LOGGER.info("Seeded inventory items up to total {}.", existingItems.size());
    return existingItems;
  }

  @Transactional
  public void ensureClinicalEnrichment(
      KaggleHmisDataset dataset, List<AppointmentEntity> appointments, List<InventoryItemEntity> inventoryItems) {
    if (appointments.isEmpty()) return;

    var medicalRecordsToSave = new ArrayList<MedicalRecordEntity>();
    var labResultsToSave = new ArrayList<LabResultEntity>();

    int index = 0;
    for (var appointment : appointments) {
      if (appointment.getStatus() != AppointmentStatus.DONE) {
        continue;
      }
      if (appointment.getId() != null && medicalRecordRepository.existsByAppointmentId(appointment.getId())) {
        continue;
      }

      // 90% DONE appointments get a medical record
      if (index % 10 != 0) {
        var record = new MedicalRecordEntity();
        record.setAppointment(appointment);
        record.setDiagnosis("Kaggle HMIS Diagnosis: Acute condition managed and resolved.");
        record.setClinicalNotes("Patient responded well to initial medication course. Vital signs normal.");
        record.setBloodPressure("120/80");
        record.setTemperature(BigDecimal.valueOf(36.8));
        record.setWeight(BigDecimal.valueOf(65.0));
        record.setHeight(BigDecimal.valueOf(170.0));

        // 70% get prescription item
        if (!inventoryItems.isEmpty() && index % 10 < 7) {
          var item = inventoryItems.get(index % inventoryItems.size());
          var pItem = new PrescriptionItemEntity();
          pItem.setMedicalRecord(record);
          pItem.setMedicineName(item.getItemName());
          pItem.setDosage("1 tablet");
          pItem.setFrequency("Twice daily after meals");
          pItem.setDurationDays(7);
          pItem.setInstructions("Take with plenty of water");
          record.getPrescriptionItems().add(pItem);
        }

        medicalRecordsToSave.add(record);
      }

      // 50% get lab result
      if (index % 2 == 0) {
        var lab = new LabResultEntity();
        lab.setPatient(appointment.getPatient());
        lab.setAppointment(appointment);
        lab.setTestName("Complete Blood Count (CBC)");
        lab.setStatus("FINAL");
        lab.setResultSummary("Hematology profile within expected parameters.");
        lab.setDoctorComment("Normal findings.");
        lab.setResultValue("WBC: 6.5, RBC: 4.8, Hemoglobin: 14.2 g/dL, Platelets: 250k");
        lab.setReferenceRange("Standard Hematology Reference Range");
        lab.setCollectedAt(Instant.now());
        labResultsToSave.add(lab);
      }

      index++;
      if (medicalRecordsToSave.size() >= BATCH_SIZE) {
        medicalRecordRepository.saveAll(List.copyOf(medicalRecordsToSave));
        medicalRecordsToSave.clear();
      }
      if (labResultsToSave.size() >= BATCH_SIZE) {
        labResultRepository.saveAll(List.copyOf(labResultsToSave));
        labResultsToSave.clear();
      }
    }

    if (!medicalRecordsToSave.isEmpty()) {
      medicalRecordRepository.saveAll(List.copyOf(medicalRecordsToSave));
    }
    if (!labResultsToSave.isEmpty()) {
      labResultRepository.saveAll(List.copyOf(labResultsToSave));
    }
  }

  @Transactional
  public void ensureAuditLogs(List<UserEntity> staff, int target) {
    if (staff.isEmpty()) return;

    long currentCount = auditLogRepository.count();
    int deficit = properties.additionalAuditLogs(currentCount);
    if (deficit <= 0) return;

    var logsToSave = new ArrayList<AuditLogEntity>();
    var actions = List.of(
        "DEMO_SEED_APPOINTMENT_CREATE",
        "DEMO_SEED_PATIENT_REGISTER",
        "DEMO_SEED_PRESCRIPTION_DISPENSE",
        "DEMO_SEED_LAB_RESULT_UPLOAD",
        "DEMO_SEED_VITAL_SIGNS_RECORD");

    for (int i = 0; i < deficit; i++) {
      var user = staff.get(i % staff.size());
      var log = new AuditLogEntity();
      log.setActor(user);
      log.setAction(actions.get(i % actions.size()));
      log.setEntityType("DEMO_RESOURCE");
      log.setMetadata("{\"source\":\"kaggle-hmis\",\"batchIndex\":" + i + "}");
      logsToSave.add(log);

      if (logsToSave.size() >= BATCH_SIZE) {
        auditLogRepository.saveAll(List.copyOf(logsToSave));
        logsToSave.clear();
      }
    }

    if (!logsToSave.isEmpty()) {
      auditLogRepository.saveAll(List.copyOf(logsToSave));
    }
    LOGGER.info("Seeded audit logs up to target {}.", target);
  }

  private DepartmentEntity findMatchingDepartment(List<DepartmentEntity> departments, String specialty) {
    for (var d : departments) {
      if (d.getName().equalsIgnoreCase(specialty)) {
        return d;
      }
    }
    return departments.get(0);
  }
}
