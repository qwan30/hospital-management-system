package com.hospital.core.seed.kaggle;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

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
import com.hospital.core.seed.DemoSeedPolicy;
import com.hospital.core.seed.NonBillingDemoSeedProperties;
import com.hospital.core.timeslot.TimeSlotEntity;
import com.hospital.core.timeslot.TimeSlotRepository;
import com.hospital.core.user.UserEntity;
import com.hospital.core.user.UserRepository;
import com.hospital.shared.enums.UserRole;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.security.crypto.password.PasswordEncoder;

class KaggleHmisSeedCertificationTest {

  private KaggleHmisDatasetReader datasetReader;
  private KaggleHmisNormalizer normalizer;
  private SyntheticDemoIdentityFactory identityFactory;
  private NonBillingDemoSeedProperties properties;
  private DemoSeedPolicy demoSeedPolicy;

  private DepartmentRepository departmentRepository;
  private ServicePricingRepository servicePricingRepository;
  private UserRepository userRepository;
  private PatientRepository patientRepository;
  private TimeSlotRepository timeSlotRepository;
  private AppointmentRepository appointmentRepository;
  private InventoryItemRepository inventoryItemRepository;
  private InventoryLotRepository inventoryLotRepository;
  private InventoryMovementRepository inventoryMovementRepository;
  private MedicalRecordRepository medicalRecordRepository;
  private PatientPortalLabResultRepository labResultRepository;
  private AuditLogRepository auditLogRepository;
  private PatientIdentifierProtector patientIdentifierProtector;
  private PasswordEncoder passwordEncoder;

  private final List<DepartmentEntity> inMemoryDepartments = Collections.synchronizedList(new ArrayList<>());
  private final List<ServicePricingEntity> inMemoryPricing = Collections.synchronizedList(new ArrayList<>());
  private final List<UserEntity> inMemoryUsers = Collections.synchronizedList(new ArrayList<>());
  private final List<PatientEntity> inMemoryPatients = Collections.synchronizedList(new ArrayList<>());
  private final List<TimeSlotEntity> inMemorySlots = Collections.synchronizedList(new ArrayList<>());
  private final List<AppointmentEntity> inMemoryAppointments = Collections.synchronizedList(new ArrayList<>());
  private final List<InventoryItemEntity> inMemoryInventory = Collections.synchronizedList(new ArrayList<>());
  private final List<InventoryLotEntity> inMemoryLots = Collections.synchronizedList(new ArrayList<>());
  private final List<InventoryMovementEntity> inMemoryMovements = Collections.synchronizedList(new ArrayList<>());
  private final List<MedicalRecordEntity> inMemoryMedicalRecords = Collections.synchronizedList(new ArrayList<>());
  private final List<LabResultEntity> inMemoryLabResults = Collections.synchronizedList(new ArrayList<>());
  private final List<AuditLogEntity> inMemoryAuditLogs = Collections.synchronizedList(new ArrayList<>());

  private KaggleHmisSeedService seedService;

  @BeforeEach
  void setUp() {
    datasetReader = new DefaultKaggleHmisDatasetReader(new DefaultResourceLoader());
    normalizer = new KaggleHmisNormalizer();
    identityFactory = new SyntheticDemoIdentityFactory();

    properties = new NonBillingDemoSeedProperties();
    properties.setEnabled(true);
    properties.setSource("kaggle-hmis");
    properties.setDatasetRoot("file:../start/src/main/resources/seed-data/kaggle/hospital-hmis");
    properties.setDoctorPassword("KaggleDemo@2026");
    properties.setTargetDepartments(20);
    properties.setTargetDoctors(50);
    properties.setTargetPatients(500);
    properties.setTargetAppointments(1000);
    properties.setTargetInventoryItems(200);
    properties.setTargetAuditLogs(1000);

    demoSeedPolicy = mock(DemoSeedPolicy.class);
    departmentRepository = mock(DepartmentRepository.class);
    servicePricingRepository = mock(ServicePricingRepository.class);
    userRepository = mock(UserRepository.class);
    patientRepository = mock(PatientRepository.class);
    timeSlotRepository = mock(TimeSlotRepository.class);
    appointmentRepository = mock(AppointmentRepository.class);
    inventoryItemRepository = mock(InventoryItemRepository.class);
    inventoryLotRepository = mock(InventoryLotRepository.class);
    inventoryMovementRepository = mock(InventoryMovementRepository.class);
    medicalRecordRepository = mock(MedicalRecordRepository.class);
    labResultRepository = mock(PatientPortalLabResultRepository.class);
    auditLogRepository = mock(AuditLogRepository.class);
    patientIdentifierProtector = mock(PatientIdentifierProtector.class);
    passwordEncoder = mock(PasswordEncoder.class);

    when(passwordEncoder.encode(any())).thenAnswer(inv -> "encoded_" + inv.getArgument(0));
    when(patientIdentifierProtector.encrypt(any())).thenAnswer(inv -> "enc_" + inv.getArgument(0));
    when(patientIdentifierProtector.hash(any())).thenAnswer(inv -> "hash_" + inv.getArgument(0));

    // In-memory backing for mock repositories
    when(departmentRepository.count()).thenAnswer(inv -> (long) inMemoryDepartments.size());
    when(departmentRepository.findAllByOrderByNameAsc()).thenAnswer(inv -> new ArrayList<>(inMemoryDepartments));
    when(departmentRepository.saveAll(anyList())).thenAnswer(inv -> {
      List<DepartmentEntity> items = inv.getArgument(0);
      inMemoryDepartments.addAll(items);
      return items;
    });

    when(servicePricingRepository.saveAll(anyList())).thenAnswer(inv -> {
      List<ServicePricingEntity> items = inv.getArgument(0);
      inMemoryPricing.addAll(items);
      return items;
    });

    when(userRepository.countByRoleAndActiveTrue(UserRole.DOCTOR)).thenAnswer(
        inv -> (long) inMemoryUsers.stream().filter(u -> u.getRole() == UserRole.DOCTOR && u.isActive()).count());
    when(userRepository.findByRoleAndActiveTrueOrderByFullNameAsc(UserRole.DOCTOR)).thenAnswer(
        inv -> inMemoryUsers.stream().filter(u -> u.getRole() == UserRole.DOCTOR && u.isActive()).toList());
    when(userRepository.findAllByOrderByFullNameAsc()).thenAnswer(inv -> new ArrayList<>(inMemoryUsers));
    when(userRepository.saveAll(anyList())).thenAnswer(inv -> {
      List<UserEntity> items = inv.getArgument(0);
      inMemoryUsers.addAll(items);
      return items;
    });

    when(patientRepository.count()).thenAnswer(inv -> (long) inMemoryPatients.size());
    when(patientRepository.findAll()).thenAnswer(inv -> new ArrayList<>(inMemoryPatients));
    when(patientRepository.saveAll(anyList())).thenAnswer(inv -> {
      List<PatientEntity> items = inv.getArgument(0);
      inMemoryPatients.addAll(items);
      return items;
    });

    when(timeSlotRepository.save(any())).thenAnswer(inv -> {
      TimeSlotEntity slot = inv.getArgument(0);
      slot.setId(UUID.randomUUID());
      inMemorySlots.add(slot);
      return slot;
    });
    when(timeSlotRepository.saveAll(anyList())).thenAnswer(inv -> {
      List<TimeSlotEntity> items = inv.getArgument(0);
      for (var slot : items) {
        if (slot.getId() == null) slot.setId(UUID.randomUUID());
      }
      inMemorySlots.addAll(items);
      return items;
    });

    when(appointmentRepository.count()).thenAnswer(inv -> (long) inMemoryAppointments.size());
    when(appointmentRepository.findAll()).thenAnswer(inv -> new ArrayList<>(inMemoryAppointments));
    when(appointmentRepository.saveAll(anyList())).thenAnswer(inv -> {
      List<AppointmentEntity> items = inv.getArgument(0);
      for (var a : items) {
        if (a.getId() == null) a.setId(UUID.randomUUID());
      }
      inMemoryAppointments.addAll(items);
      return items;
    });

    when(inventoryItemRepository.count()).thenAnswer(inv -> (long) inMemoryInventory.size());
    when(inventoryItemRepository.findAll()).thenAnswer(inv -> new ArrayList<>(inMemoryInventory));
    when(inventoryItemRepository.saveAll(anyList())).thenAnswer(inv -> {
      List<InventoryItemEntity> items = inv.getArgument(0);
      inMemoryInventory.addAll(items);
      return items;
    });

    when(inventoryLotRepository.saveAll(anyList())).thenAnswer(inv -> {
      List<InventoryLotEntity> items = inv.getArgument(0);
      inMemoryLots.addAll(items);
      return items;
    });

    when(inventoryMovementRepository.saveAll(anyList())).thenAnswer(inv -> {
      List<InventoryMovementEntity> items = inv.getArgument(0);
      inMemoryMovements.addAll(items);
      return items;
    });

    when(medicalRecordRepository.saveAll(anyList())).thenAnswer(inv -> {
      List<MedicalRecordEntity> items = inv.getArgument(0);
      for (var m : items) {
        if (m.getId() == null) m.setId(UUID.randomUUID());
      }
      inMemoryMedicalRecords.addAll(items);
      return items;
    });
    when(medicalRecordRepository.existsByAppointmentId(any())).thenAnswer(inv -> {
      UUID appointmentId = inv.getArgument(0);
      return inMemoryMedicalRecords.stream().anyMatch(m -> m.getAppointment().getId().equals(appointmentId));
    });

    when(labResultRepository.saveAll(anyList())).thenAnswer(inv -> {
      List<LabResultEntity> items = inv.getArgument(0);
      inMemoryLabResults.addAll(items);
      return items;
    });

    when(auditLogRepository.count()).thenAnswer(inv -> (long) inMemoryAuditLogs.size());
    when(auditLogRepository.saveAll(anyList())).thenAnswer(inv -> {
      List<AuditLogEntity> items = inv.getArgument(0);
      inMemoryAuditLogs.addAll(items);
      return items;
    });

    seedService = new KaggleHmisSeedService(
        datasetReader,
        normalizer,
        identityFactory,
        properties,
        demoSeedPolicy,
        departmentRepository,
        servicePricingRepository,
        userRepository,
        patientRepository,
        timeSlotRepository,
        appointmentRepository,
        inventoryItemRepository,
        inventoryLotRepository,
        inventoryMovementRepository,
        medicalRecordRepository,
        labResultRepository,
        auditLogRepository,
        patientIdentifierProtector,
        passwordEncoder);
  }

  @Test
  void certifiyRealKaggleDatasetSeedingAndIdempotency() {
    // Phase 1: First Run on empty state
    seedService.seedToTargets();

    assertThat(inMemoryDepartments).hasSize(20);
    assertThat(inMemoryPricing).hasSize(20);
    assertThat(inMemoryUsers).hasSize(50);
    assertThat(inMemoryPatients).hasSize(500);
    assertThat(inMemoryAppointments).hasSize(1000);
    assertThat(inMemoryInventory).hasSize(200);
    assertThat(inMemoryLots).hasSize(200);
    assertThat(inMemoryMovements).hasSize(200);
    assertThat(inMemoryAuditLogs).hasSize(1000);

    // Verify security & encryption invariants
    for (var patient : inMemoryPatients) {
      assertThat(patient.getCccd()).startsWith("enc_");
      assertThat(patient.getCccdHash()).startsWith("hash_");
      assertThat(patient.getEmail()).contains("@example.com");
      assertThat(patient.getPhone()).startsWith("09");
    }

    for (var doctor : inMemoryUsers) {
      assertThat(doctor.getRole()).isEqualTo(UserRole.DOCTOR);
      assertThat(doctor.getPasswordHash()).startsWith("encoded_");
      assertThat(doctor.getEmail()).contains("@hospital.demo");
      assertThat(doctor.getDepartment()).isNotNull();
    }

    // Phase 2: Idempotency Run (Run 2 on already populated state)
    seedService.seedToTargets();

    // Verify no duplicate records were created
    assertThat(inMemoryDepartments).hasSize(20);
    assertThat(inMemoryPricing).hasSize(20);
    assertThat(inMemoryUsers).hasSize(50);
    assertThat(inMemoryPatients).hasSize(500);
    assertThat(inMemoryAppointments).hasSize(1000);
    assertThat(inMemoryInventory).hasSize(200);
    assertThat(inMemoryLots).hasSize(200);
    assertThat(inMemoryMovements).hasSize(200);
    assertThat(inMemoryAuditLogs).hasSize(1000);
  }
}
