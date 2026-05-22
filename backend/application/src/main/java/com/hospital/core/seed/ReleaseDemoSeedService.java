package com.hospital.core.seed;

import com.hospital.core.admin.DoctorScheduleTemplateEntity;
import com.hospital.core.admin.DoctorScheduleTemplateRepository;
import com.hospital.core.admin.RoomEntity;
import com.hospital.core.admin.RoomRepository;
import com.hospital.core.admin.SpecialClosureEntity;
import com.hospital.core.admin.SpecialClosureRepository;
import com.hospital.core.appointment.AppointmentEntity;
import com.hospital.core.appointment.AppointmentRepository;
import com.hospital.core.appointment.AppointmentVitalSignsEntity;
import com.hospital.core.appointment.AppointmentVitalSignsRepository;
import com.hospital.core.appointment.FollowUpEntity;
import com.hospital.core.appointment.FollowUpRepository;
import com.hospital.core.audit.AuditLogEntity;
import com.hospital.core.audit.AuditLogRepository;
import com.hospital.core.content.HospitalContentSectionEntity;
import com.hospital.core.content.HospitalContentSectionRepository;
import com.hospital.core.content.NewsArticleEntity;
import com.hospital.core.content.NewsArticleRepository;
import com.hospital.core.department.DepartmentEntity;
import com.hospital.core.department.DepartmentRepository;
import com.hospital.core.inventory.InventoryItemEntity;
import com.hospital.core.inventory.InventoryItemRepository;
import com.hospital.core.inventory.InventoryLotEntity;
import com.hospital.core.inventory.InventoryLotRepository;
import com.hospital.core.inventory.InventoryMovementEntity;
import com.hospital.core.inventory.InventoryMovementRepository;
import com.hospital.core.invoice.InvoiceEntity;
import com.hospital.core.invoice.InvoiceRepository;
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
import com.hospital.core.prescription.PrescriptionItemEntity;
import com.hospital.core.timeslot.TimeSlotEntity;
import com.hospital.core.timeslot.TimeSlotRepository;
import com.hospital.core.user.UserEntity;
import com.hospital.core.user.UserRepository;
import com.hospital.shared.enums.AppointmentStatus;
import com.hospital.shared.enums.InvoiceStatus;
import com.hospital.shared.enums.SlotStatus;
import com.hospital.shared.enums.UserRole;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReleaseDemoSeedService {
  private static final List<LocalTime> AVAILABLE_SLOT_STARTS = List.of(
      LocalTime.of(8, 0),
      LocalTime.of(9, 0),
      LocalTime.of(10, 0),
      LocalTime.of(13, 30),
      LocalTime.of(14, 30));

  private final AppointmentRepository appointmentRepository;
  private final AppointmentVitalSignsRepository appointmentVitalSignsRepository;
  private final AuditLogRepository auditLogRepository;
  private final DepartmentRepository departmentRepository;
  private final DoctorScheduleTemplateRepository doctorScheduleTemplateRepository;
  private final FollowUpRepository followUpRepository;
  private final HospitalContentSectionRepository hospitalContentSectionRepository;
  private final InventoryItemRepository inventoryItemRepository;
  private final InventoryLotRepository inventoryLotRepository;
  private final InventoryMovementRepository inventoryMovementRepository;
  private final InvoiceRepository invoiceRepository;
  private final MedicalRecordRepository medicalRecordRepository;
  private final NewsArticleRepository newsArticleRepository;
  private final PatientAccountRepository patientAccountRepository;
  private final PatientIdentifierProtector patientIdentifierProtector;
  private final PatientMessageRepository patientMessageRepository;
  private final PatientMessageThreadRepository patientMessageThreadRepository;
  private final PatientPortalLabResultRepository labResultRepository;
  private final PatientRepository patientRepository;
  private final PasswordEncoder passwordEncoder;
  private final ReleaseDemoSeedProperties properties;
  private final RoomRepository roomRepository;
  private final ServicePricingRepository servicePricingRepository;
  private final SpecialClosureRepository specialClosureRepository;
  private final TimeSlotRepository timeSlotRepository;
  private final UserRepository userRepository;

  public ReleaseDemoSeedService(
      AppointmentRepository appointmentRepository,
      AppointmentVitalSignsRepository appointmentVitalSignsRepository,
      AuditLogRepository auditLogRepository,
      DepartmentRepository departmentRepository,
      DoctorScheduleTemplateRepository doctorScheduleTemplateRepository,
      FollowUpRepository followUpRepository,
      HospitalContentSectionRepository hospitalContentSectionRepository,
      InventoryItemRepository inventoryItemRepository,
      InventoryLotRepository inventoryLotRepository,
      InventoryMovementRepository inventoryMovementRepository,
      InvoiceRepository invoiceRepository,
      MedicalRecordRepository medicalRecordRepository,
      NewsArticleRepository newsArticleRepository,
      PatientAccountRepository patientAccountRepository,
      PatientIdentifierProtector patientIdentifierProtector,
      PatientMessageRepository patientMessageRepository,
      PatientMessageThreadRepository patientMessageThreadRepository,
      PatientPortalLabResultRepository labResultRepository,
      PatientRepository patientRepository,
      PasswordEncoder passwordEncoder,
      ReleaseDemoSeedProperties properties,
      RoomRepository roomRepository,
      ServicePricingRepository servicePricingRepository,
      SpecialClosureRepository specialClosureRepository,
      TimeSlotRepository timeSlotRepository,
      UserRepository userRepository) {
    this.appointmentRepository = appointmentRepository;
    this.appointmentVitalSignsRepository = appointmentVitalSignsRepository;
    this.auditLogRepository = auditLogRepository;
    this.departmentRepository = departmentRepository;
    this.doctorScheduleTemplateRepository = doctorScheduleTemplateRepository;
    this.followUpRepository = followUpRepository;
    this.hospitalContentSectionRepository = hospitalContentSectionRepository;
    this.inventoryItemRepository = inventoryItemRepository;
    this.inventoryLotRepository = inventoryLotRepository;
    this.inventoryMovementRepository = inventoryMovementRepository;
    this.invoiceRepository = invoiceRepository;
    this.medicalRecordRepository = medicalRecordRepository;
    this.newsArticleRepository = newsArticleRepository;
    this.patientAccountRepository = patientAccountRepository;
    this.patientIdentifierProtector = patientIdentifierProtector;
    this.patientMessageRepository = patientMessageRepository;
    this.patientMessageThreadRepository = patientMessageThreadRepository;
    this.labResultRepository = labResultRepository;
    this.patientRepository = patientRepository;
    this.passwordEncoder = passwordEncoder;
    this.properties = properties;
    this.roomRepository = roomRepository;
    this.servicePricingRepository = servicePricingRepository;
    this.specialClosureRepository = specialClosureRepository;
    this.timeSlotRepository = timeSlotRepository;
    this.userRepository = userRepository;
  }

  @Transactional
  public void seedIfEnabled() {
    if (!properties.isEnabled()) {
      return;
    }

    var departments = seedDepartments();
    var users = seedStaffAccounts(departments);
    var rooms = seedRooms(departments);
    seedScheduleTemplates(users, rooms);
    seedSpecialClosures(users, rooms);
    seedPublicContent();
    seedServicePricing(departments);
    var patients = seedPatients();
    seedPatientAccounts(patients);
    seedAvailableSlots(users);
    var appointments = seedAppointments(users, patients);
    seedClinicalArtifacts(appointments, patients);
    seedPortalArtifacts(patients);
    seedInventory(departments);
    seedInvoices(appointments);
    seedAuditLogs(users);
  }

  private Map<String, DepartmentEntity> seedDepartments() {
    var departmentsByName = mapDepartmentsByName(departmentRepository.findAllByOrderByNameAsc());

    for (var seed : ReleaseDemoSeedCatalog.departments()) {
      var department = departmentsByName.getOrDefault(key(seed.name()), new DepartmentEntity());
      department.setName(seed.name());
      department.setDescription(seed.description());
      department.setPhone(seed.phone());
      department.setImageUrl("https://images.unsplash.com/photo-1576091160550-2173dba999ef");
      department.setActive(true);
      departmentsByName.put(key(seed.name()), departmentRepository.save(department));
    }

    return departmentsByName;
  }

  private Map<String, UserEntity> seedStaffAccounts(Map<String, DepartmentEntity> departments) {
    var usersByEmail = mapUsersByEmail(userRepository.findAllByOrderByFullNameAsc());

    for (var seed : ReleaseDemoSeedCatalog.staffAccounts()) {
      var user = usersByEmail.getOrDefault(key(seed.email()), new UserEntity());
      user.setEmail(seed.email());
      if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
        user.setPasswordHash(passwordEncoder.encode(seed.password()));
      }
      user.setFullName(seed.fullName());
      user.setPhone("0900000000");
      user.setRole(seed.role());
      user.setDepartment(seed.departmentName() == null ? null : departments.get(key(seed.departmentName())));
      user.setSpecialty(seed.specialty());
      user.setQualification(seed.role() == UserRole.DOCTOR ? "MD" : null);
      user.setExperienceYears(seed.role() == UserRole.DOCTOR ? 10 : null);
      user.setActive(true);
      usersByEmail.put(key(seed.email()), userRepository.save(user));
    }

    return usersByEmail;
  }

  private Map<String, RoomEntity> seedRooms(Map<String, DepartmentEntity> departments) {
    var roomsByName = mapRoomsByName(roomRepository.findAllByOrderByNameAsc());

    for (var seed : ReleaseDemoSeedCatalog.rooms()) {
      var room = roomsByName.getOrDefault(key(seed.name()), new RoomEntity());
      room.setName(seed.name());
      room.setDepartment(departments.get(key(seed.departmentName())));
      room.setStatus(seed.status());
      room.setNotes(seed.notes());
      room.setActive(true);
      roomsByName.put(key(seed.name()), roomRepository.save(room));
    }

    return roomsByName;
  }

  private void seedScheduleTemplates(Map<String, UserEntity> users, Map<String, RoomEntity> rooms) {
    var templates = doctorScheduleTemplateRepository.findAllByOrderByDayOfWeekAscStartTimeAsc();

    for (var seed : ReleaseDemoSeedCatalog.scheduleTemplates()) {
      var doctor = users.get(key(seed.doctorEmail()));
      if (doctor == null) {
        continue;
      }
      var existing = templates.stream()
          .filter(template -> template.getDoctor().getId().equals(doctor.getId()))
          .filter(template -> template.getDayOfWeek() == seed.weekday())
          .filter(template -> template.getStartTime().equals(seed.startTime()))
          .findFirst();
      var template = existing.orElseGet(DoctorScheduleTemplateEntity::new);
      template.setDoctor(doctor);
      template.setRoom(rooms.get(key(seed.roomName())));
      template.setDayOfWeek(seed.weekday());
      template.setStartTime(seed.startTime());
      template.setEndTime(seed.endTime());
      template.setSlotDurationMinutes(seed.slotDurationMinutes());
      template.setActive(true);
      doctorScheduleTemplateRepository.save(template);
    }
  }

  private void seedSpecialClosures(Map<String, UserEntity> users, Map<String, RoomEntity> rooms) {
    Map<String, SpecialClosureEntity> closuresByTitle =
        specialClosureRepository.findAllByOrderByClosureDateDescTitleAsc().stream()
            .collect(
                LinkedHashMap::new,
                (map, closure) -> map.put(key(closure.getTitle()), closure),
                Map::putAll);

    for (var seed : ReleaseDemoSeedCatalog.specialClosures()) {
      var closure = closuresByTitle.getOrDefault(key(seed.title()), new SpecialClosureEntity());
      closure.setTitle(seed.title());
      closure.setDoctor(users.get(key(seed.doctorEmail())));
      closure.setRoom(rooms.get(key(seed.roomName())));
      closure.setClosureDate(LocalDate.now().plusDays(seed.dayOffset()));
      closure.setReason(seed.reason());
      closure.setActive(true);
      specialClosureRepository.save(closure);
    }
  }

  private void seedPublicContent() {
    for (var seed : ReleaseDemoSeedCatalog.contentSections()) {
      var section = hospitalContentSectionRepository.findBySlugIgnoreCase(seed.slug())
          .orElseGet(HospitalContentSectionEntity::new);
      section.setSlug(seed.slug());
      section.setTitle(seed.title());
      section.setBody(seed.body());
      section.setCtaLabel(seed.ctaLabel());
      section.setCtaHref(seed.ctaHref());
      section.setSortOrder(seed.sortOrder());
      section.setActive(true);
      hospitalContentSectionRepository.save(section);
    }

    for (var seed : ReleaseDemoSeedCatalog.newsArticles()) {
      var article = newsArticleRepository.findBySlugIgnoreCase(seed.slug())
          .orElseGet(NewsArticleEntity::new);
      article.setSlug(seed.slug());
      article.setTitle(seed.title());
      article.setSummary(seed.summary());
      article.setContent(seed.summary());
      article.setPublishedAt(seed.publishedAt());
      article.setActive(true);
      newsArticleRepository.save(article);
    }
  }

  private void seedServicePricing(Map<String, DepartmentEntity> departments) {
    var existing = servicePricingRepository.findAllByOrderByEffectiveDateDescServiceNameAsc();
    for (var department : departments.values()) {
      var pricing = existing.stream()
          .filter(item -> item.getDepartment() != null && item.getDepartment().getId().equals(department.getId()))
          .filter(item -> item.getServiceName().equalsIgnoreCase("CONSULTATION"))
          .filter(item -> item.getEffectiveDate().equals(LocalDate.now().minusDays(1)))
          .findFirst()
          .orElseGet(ServicePricingEntity::new);
      pricing.setDepartment(department);
      pricing.setServiceName("CONSULTATION");
      pricing.setAmount(BigDecimal.valueOf(250000 + (long) departments.values().stream().toList().indexOf(department) * 25000L));
      pricing.setEffectiveDate(LocalDate.now().minusDays(1));
      servicePricingRepository.save(pricing);
    }
  }

  private Map<String, PatientEntity> seedPatients() {
    var patientsByEmail = mapPatientsByEmail(patientRepository.findAll());

    for (var seed : ReleaseDemoSeedCatalog.patients(properties.getTargetPatients())) {
      var cccdHash = patientIdentifierProtector.hash(seed.citizenId());
      var patient = patientRepository.findByCccdHash(cccdHash)
          .orElseGet(() -> patientsByEmail.getOrDefault(key(seed.email()), new PatientEntity()));
      patient.setFullName(seed.fullName());
      patient.setPhone(seed.phone());
      patient.setEmail(seed.email());
      patient.setDateOfBirth(seed.dateOfBirth());
      patient.setGender(seed.gender());
      if (patient.getCccdHash() == null || !patient.getCccdHash().equals(cccdHash)) {
        patient.setCccd(patientIdentifierProtector.encrypt(seed.citizenId()));
        patient.setCccdHash(cccdHash);
      }
      patient.setProvinceOrCity("Ho Chi Minh City");
      patient.setDistrict("District 1");
      patient.setStreetAddress("Synthetic UAT address");
      patient.setOccupation(seed.occupation());
      patient.setBloodType(seed.bloodType());
      patient.setMedicalHistory(seed.medicalHistory());
      patient.setDrugAllergies(seed.drugAllergies());
      patient.setInsuranceNumber(seed.insuranceNumber());
      patientsByEmail.put(key(seed.email()), patientRepository.save(patient));
    }

    return patientsByEmail;
  }

  private void seedPatientAccounts(Map<String, PatientEntity> patients) {
    Map<String, PatientAccountEntity> accountsByEmail = patientAccountRepository.findAll().stream()
        .collect(
            LinkedHashMap::new,
            (map, account) -> map.put(key(account.getEmail()), account),
            Map::putAll);

    for (var seed : ReleaseDemoSeedCatalog.patients(properties.getTargetPatients())) {
      if (!seed.portalAccount()) {
        continue;
      }
      var patient = patients.get(key(seed.email()));
      if (patient == null) {
        continue;
      }
      var account = accountsByEmail.getOrDefault(key(seed.email()), new PatientAccountEntity());
      account.setPatient(patient);
      account.setEmail(seed.email());
      if (account.getPasswordHash() == null || account.getPasswordHash().isBlank()) {
        account.setPasswordHash(passwordEncoder.encode(ReleaseDemoSeedCatalog.PATIENT_PASSWORD));
      }
      account.setActive(true);
      patientAccountRepository.save(account);
    }
  }

  private void seedAvailableSlots(Map<String, UserEntity> users) {
    var doctors = users.values().stream()
        .filter(user -> user.getRole() == UserRole.DOCTOR)
        .toList();
    for (var doctor : doctors) {
      for (int dayOffset = 1; dayOffset <= properties.getFutureSlotDays(); dayOffset++) {
        var date = LocalDate.now().plusDays(dayOffset);
        for (var start : AVAILABLE_SLOT_STARTS) {
          ensureSlot(doctor, date, start, SlotStatus.AVAILABLE, false);
        }
      }
    }
  }

  private Map<String, AppointmentEntity> seedAppointments(Map<String, UserEntity> users, Map<String, PatientEntity> patients) {
    var patientEmails = patients.keySet().stream().toList();
    var appointments = new LinkedHashMap<String, AppointmentEntity>();

    for (var seed : ReleaseDemoSeedCatalog.appointments(properties.getTargetAppointments(), patientEmails)) {
      var doctor = users.get(key(seed.doctorEmail()));
      var patient = patients.get(key(seed.patientEmail()));
      if (doctor == null || patient == null) {
        continue;
      }
      var appointmentDate = LocalDate.now().plusDays(seed.dayOffset());
      var slot = ensureSlot(doctor, appointmentDate, seed.startTime(), SlotStatus.BOOKED, true);
      var appointment = appointmentRepository.findByConfirmationCode(seed.confirmationCode())
          .orElseGet(AppointmentEntity::new);
      appointment.setPatient(patient);
      appointment.setDoctor(doctor);
      appointment.setFirstSlot(slot);
      appointment.setAppointmentDate(appointmentDate);
      appointment.setAiDurationMinutes(30);
      appointment.setSymptoms(seed.symptoms());
      appointment.setConfirmationCode(seed.confirmationCode());
      appointment.setStatus(seed.status());
      appointment.setBookingContactFullName(patient.getFullName());
      appointment.setBookingContactRelationship("Self");
      appointment.setBookingContactPhone(patient.getPhone());
      appointment.setBookingContactEmail(patient.getEmail());
      appointment.setBookingContactDateOfBirth(patient.getDateOfBirth());
      appointment.setBookingContactGender(patient.getGender());
      appointment.setCheckedInAt(checkedInAt(seed, appointmentDate));
      appointments.put(seed.confirmationCode(), appointmentRepository.save(appointment));
    }

    return appointments;
  }

  private void seedClinicalArtifacts(Map<String, AppointmentEntity> appointments, Map<String, PatientEntity> patients) {
    var seeds = ReleaseDemoSeedCatalog.appointments(properties.getTargetAppointments(), patients.keySet().stream().toList());
    for (var seed : seeds) {
      var appointment = appointments.get(seed.confirmationCode());
      if (appointment == null) {
        continue;
      }
      if (seed.vitals()) {
        seedVitals(appointment);
      }
      if (seed.medicalRecord()) {
        seedMedicalRecord(appointment);
        seedFollowUp(appointment);
      }
      if (seed.labResult()) {
        seedLabResult(appointment);
      }
    }
  }

  private void seedVitals(AppointmentEntity appointment) {
    if (appointmentVitalSignsRepository.existsByAppointmentId(appointment.getId())) {
      return;
    }
    var vitals = new AppointmentVitalSignsEntity();
    vitals.setAppointment(appointment);
    vitals.setBloodPressure("124/78");
    vitals.setTemperature(BigDecimal.valueOf(36.8));
    vitals.setWeight(BigDecimal.valueOf(62.5));
    vitals.setHeight(BigDecimal.valueOf(165));
    vitals.setHeartRate(76);
    vitals.setRespiratoryRate(16);
    vitals.setOxygenSaturation(BigDecimal.valueOf(98.5));
    appointmentVitalSignsRepository.save(vitals);
  }

  private void seedMedicalRecord(AppointmentEntity appointment) {
    if (medicalRecordRepository.existsByAppointmentId(appointment.getId())) {
      return;
    }
    var record = new MedicalRecordEntity();
    record.setAppointment(appointment);
    record.setDiagnosis("Release UAT diagnosis for " + appointment.getConfirmationCode());
    record.setClinicalNotes("Synthetic clinical note for release readiness validation.");
    record.setBloodPressure("124/78");
    record.setTemperature(BigDecimal.valueOf(36.8));
    record.setWeight(BigDecimal.valueOf(62.5));
    record.setHeight(BigDecimal.valueOf(165));
    record.setFollowUpDate(LocalDate.now().plusDays(21));
    record.setReminderScheduledAt(Instant.now().plusSeconds(86_400));

    var item = new PrescriptionItemEntity();
    item.setMedicalRecord(record);
    item.setMedicineName("Cetirizine 10mg");
    item.setDosage("1 tablet");
    item.setFrequency("Once daily");
    item.setDurationDays(7);
    item.setInstructions("Synthetic release prescription item.");
    item.setSortOrder(1);
    record.getPrescriptionItems().add(item);

    medicalRecordRepository.save(record);
  }

  private void seedFollowUp(AppointmentEntity appointment) {
    if (followUpRepository.existsByParentAppointmentId(appointment.getId())) {
      return;
    }
    var followUp = new FollowUpEntity();
    followUp.setParentAppointment(appointment);
    followUp.setFollowUpDate(LocalDate.now().plusDays(21));
    followUp.setReason("Synthetic release follow-up reminder.");
    followUpRepository.save(followUp);
  }

  private void seedLabResult(AppointmentEntity appointment) {
    var patient = appointment.getPatient();
    var testName = "Release UAT Complete Blood Count";
    var exists = labResultRepository.findByPatientIdOrderByCollectedAtDesc(patient.getId()).stream()
        .anyMatch(result -> result.getTestName().equalsIgnoreCase(testName));
    if (exists) {
      return;
    }
    var labResult = new LabResultEntity();
    labResult.setPatient(patient);
    labResult.setAppointment(appointment);
    labResult.setTestName(testName);
    labResult.setStatus("Reviewed");
    labResult.setResultSummary("Synthetic result summary for release portal validation.");
    labResult.setDoctorComment("Continue the release UAT care plan.");
    labResult.setAttachmentUrl("/lab-results/release-uat-cbc.pdf");
    labResult.setCollectedAt(Instant.now().minusSeconds(604_800));
    labResultRepository.save(labResult);
  }

  private void seedPortalArtifacts(Map<String, PatientEntity> patients) {
    for (var seed : ReleaseDemoSeedCatalog.patients(properties.getTargetPatients())) {
      if (!seed.portalAccount()) {
        continue;
      }
      var patient = patients.get(key(seed.email()));
      if (patient == null) {
        continue;
      }
      var subject = "Release UAT care-team follow-up";
      var thread = patientMessageThreadRepository.findByPatientIdOrderByUpdatedAtDesc(patient.getId()).stream()
          .filter(item -> item.getSubject().equalsIgnoreCase(subject))
          .findFirst()
          .orElseGet(PatientMessageThreadEntity::new);
      thread.setPatient(patient);
      thread.setSubject(subject);
      thread.setChannel("Portal");
      thread.setUnreadCount(1);
      thread.setLastMessagePreview("Your synthetic release data is ready for portal validation.");
      thread = patientMessageThreadRepository.save(thread);

      if (patientMessageRepository.findByThreadIdOrderByCreatedAtAsc(thread.getId()).isEmpty()) {
        var staffMessage = new PatientMessageEntity();
        staffMessage.setThread(thread);
        staffMessage.setSenderRole("CARE_TEAM");
        staffMessage.setBody("Your synthetic release data is ready for portal validation.");
        patientMessageRepository.save(staffMessage);

        var patientMessage = new PatientMessageEntity();
        patientMessage.setThread(thread);
        patientMessage.setSenderRole("PATIENT");
        patientMessage.setBody("Confirmed for release UAT.");
        patientMessageRepository.save(patientMessage);
      }
    }
  }

  private void seedInventory(Map<String, DepartmentEntity> departments) {
    Map<String, InventoryItemEntity> itemsBySku =
        inventoryItemRepository.findAllByOrderByItemNameAsc().stream()
            .collect(
                LinkedHashMap::new,
                (map, item) -> map.put(key(item.getSku()), item),
                Map::putAll);
    Map<String, InventoryLotEntity> lotsByCode = inventoryLotRepository.findAllByOrderByExpiresOnAsc().stream()
        .collect(
            LinkedHashMap::new,
            (map, lot) -> map.put(key(lot.getLotCode()), lot),
            Map::putAll);
    var movementKeys = inventoryMovementRepository.findAll().stream()
        .map(InventoryMovementEntity::getNote)
        .filter(note -> note != null && note.contains(ReleaseDemoSeedCatalog.SOURCE))
        .toList();

    for (var seed : ReleaseDemoSeedCatalog.inventoryItems(properties.getTargetInventoryItems())) {
      var item = itemsBySku.getOrDefault(key(seed.sku()), new InventoryItemEntity());
      item.setSku(seed.sku());
      item.setItemName(seed.itemName());
      item.setCategory(seed.category());
      item.setUnit(seed.unit());
      item.setReorderLevel(seed.reorderLevel());
      item.setQuantityOnHand(seed.quantityOnHand());
      item.setStatus(seed.status());
      item.setDepartment(departments.get(key(seed.departmentName())));
      item.setLastRestockedAt(Instant.now().minusSeconds(86_400));
      item = inventoryItemRepository.save(item);

      var lot = lotsByCode.getOrDefault(key(seed.lotCode()), new InventoryLotEntity());
      lot.setItem(item);
      lot.setLotCode(seed.lotCode());
      lot.setSupplierName("Release Demo Supplier");
      lot.setQuantityReceived(seed.quantityOnHand() + 10);
      lot.setQuantityRemaining(seed.quantityOnHand());
      lot.setExpiresOn(seed.status().equals("LOW_STOCK") ? LocalDate.now().plusDays(20) : LocalDate.now().plusMonths(9));
      inventoryLotRepository.save(lot);

      var movementKey = ReleaseDemoSeedCatalog.SOURCE + ":" + seed.sku();
      if (movementKeys.stream().noneMatch(note -> note.contains(movementKey))) {
        var movement = new InventoryMovementEntity();
        movement.setItem(item);
        movement.setMovementType("RESTOCK");
        movement.setQuantityDelta(seed.quantityOnHand());
        movement.setNote(movementKey + ": opening balance");
        inventoryMovementRepository.save(movement);
      }
    }
  }

  private void seedInvoices(Map<String, AppointmentEntity> appointments) {
    var existingInvoices = invoiceRepository.findAllByOrderByCreatedAtDesc();
    var seeds = ReleaseDemoSeedCatalog.appointments(
        properties.getTargetAppointments(),
        appointments.values().stream().map(appointment -> key(appointment.getPatient().getEmail())).toList());
    for (var seed : seeds) {
      if (!seed.invoice()) {
        continue;
      }
      var appointment = appointments.get(seed.confirmationCode());
      if (appointment == null || appointment.getStatus() != AppointmentStatus.DONE) {
        continue;
      }
      var invoice = existingInvoices.stream()
          .filter(item -> item.getAppointment().getId().equals(appointment.getId()))
          .findFirst()
          .orElseGet(InvoiceEntity::new);
      invoice.setAppointment(appointment);
      invoice.setTotalAmount(BigDecimal.valueOf(300000));
      invoice.setStatus(seed.invoiceStatus() == null ? InvoiceStatus.UNPAID : seed.invoiceStatus());
      if (invoice.getStatus() == InvoiceStatus.PAID) {
        invoice.setPaymentMethod("CASH");
        invoice.setPaidAt(Instant.now().minusSeconds(86_400));
      } else {
        invoice.setPaymentMethod(null);
        invoice.setPaidAt(null);
      }
      invoiceRepository.save(invoice);
    }
  }

  private void seedAuditLogs(Map<String, UserEntity> users) {
    var existingKeys = auditLogRepository.findAllByOrderByCreatedAtDesc().stream()
        .map(AuditLogEntity::getMetadata)
        .filter(metadata -> metadata != null && metadata.contains(ReleaseDemoSeedCatalog.SOURCE))
        .toList();
    for (var seed : ReleaseDemoSeedCatalog.auditLogs(properties.getTargetAuditLogs())) {
      if (existingKeys.stream().anyMatch(metadata -> metadata.contains(seed.key()))) {
        continue;
      }
      var log = new AuditLogEntity();
      log.setActor(users.get(key(seed.actorEmail())));
      log.setAction(seed.action());
      log.setEntityType("RELEASE_DEMO");
      log.setMetadata("{\"source\":\"%s\",\"key\":\"%s\"}".formatted(ReleaseDemoSeedCatalog.SOURCE, seed.key()));
      auditLogRepository.save(log);
    }
  }

  private TimeSlotEntity ensureSlot(
      UserEntity doctor,
      LocalDate date,
      LocalTime start,
      SlotStatus status,
      boolean forceStatus) {
    var slot = timeSlotRepository.findByDoctorIdAndSlotDateOrderByStartTimeAsc(doctor.getId(), date).stream()
        .filter(candidate -> candidate.getStartTime().equals(start))
        .findFirst()
        .orElseGet(TimeSlotEntity::new);
    if (slot.getId() == null) {
      slot.setDoctor(doctor);
      slot.setSlotDate(date);
      slot.setStartTime(start);
      slot.setEndTime(start.plusMinutes(30));
    }
    if (forceStatus || slot.getStatus() != SlotStatus.BOOKED) {
      slot.setStatus(status);
    }
    return timeSlotRepository.save(slot);
  }

  private LocalDateTime checkedInAt(ReleaseDemoSeedCatalog.AppointmentSeed seed, LocalDate appointmentDate) {
    if (seed.status() == AppointmentStatus.CHECKED_IN || seed.status() == AppointmentStatus.IN_PROGRESS) {
      return LocalDateTime.now().minusMinutes(seed.status() == AppointmentStatus.IN_PROGRESS ? 45 : 15);
    }
    if (seed.status() == AppointmentStatus.DONE) {
      return appointmentDate.atTime(seed.startTime()).plusMinutes(5);
    }
    return null;
  }

  private Map<String, DepartmentEntity> mapDepartmentsByName(List<DepartmentEntity> departments) {
    return departments.stream()
        .collect(LinkedHashMap::new, (map, department) -> map.put(key(department.getName()), department), Map::putAll);
  }

  private Map<String, UserEntity> mapUsersByEmail(List<UserEntity> users) {
    return users.stream()
        .collect(LinkedHashMap::new, (map, user) -> map.put(key(user.getEmail()), user), Map::putAll);
  }

  private Map<String, RoomEntity> mapRoomsByName(List<RoomEntity> rooms) {
    return rooms.stream()
        .collect(LinkedHashMap::new, (map, room) -> map.put(key(room.getName()), room), Map::putAll);
  }

  private Map<String, PatientEntity> mapPatientsByEmail(List<PatientEntity> patients) {
    return patients.stream()
        .collect(LinkedHashMap::new, (map, patient) -> map.put(key(patient.getEmail()), patient), Map::putAll);
  }

  private String key(String value) {
    return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
  }
}
