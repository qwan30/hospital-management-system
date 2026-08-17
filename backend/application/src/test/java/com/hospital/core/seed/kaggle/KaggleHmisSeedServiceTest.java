package com.hospital.core.seed.kaggle;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
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
import com.hospital.shared.enums.AppointmentStatus;
import com.hospital.shared.enums.UserRole;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.password.PasswordEncoder;

class KaggleHmisSeedServiceTest {

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

  private KaggleHmisSeedService seedService;

  @BeforeEach
  void setUp() {
    datasetReader = mock(KaggleHmisDatasetReader.class);
    normalizer = new KaggleHmisNormalizer();
    identityFactory = new SyntheticDemoIdentityFactory();
    properties = new NonBillingDemoSeedProperties();
    properties.setEnabled(true);
    properties.setDoctorPassword("TestDoc@123");
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

    when(passwordEncoder.encode(any())).thenReturn("hashed_password");
    when(patientIdentifierProtector.encrypt(any())).thenAnswer(inv -> "enc_" + inv.getArgument(0));
    when(patientIdentifierProtector.hash(any())).thenAnswer(inv -> "hash_" + inv.getArgument(0));

    when(departmentRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
    when(userRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
    when(patientRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
    when(timeSlotRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    when(timeSlotRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
    when(appointmentRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
    when(inventoryItemRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
    when(inventoryLotRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
    when(inventoryMovementRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
    when(medicalRecordRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
    when(labResultRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
    when(auditLogRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

    var sampleStaff = new UserEntity();
    sampleStaff.setEmail("staff.seed@hospital.vn");
    when(userRepository.findAllByOrderByFullNameAsc()).thenReturn(List.of(sampleStaff));

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
  void topsUpDepartmentsToDoctorsAndPatientsWhenDatabaseIsEmpty() {
    var dataset = new KaggleHmisDataset(
        List.of(
            new KaggleHmisDataset.KaggleDepartmentRow("1", "Emergency", "Clinical", "0", "Active"),
            new KaggleHmisDataset.KaggleDepartmentRow("2", "Cardiology", "Clinical", "1", "Active")),
        List.of(
            new KaggleHmisDataset.KagglePatientRow("1", "Female", "1990-05-12", "O+", "City", "+1234567890")),
        List.of(),
        List.of(),
        List.of(),
        List.of(
            new KaggleHmisDataset.KaggleEmployeeRow("1", "Sanaya Kalla", "Female", "Doctor", "Full-time", "2020-01-01", "1")),
        List.of(
            new KaggleHmisDataset.KaggleDoctorRow("1", "1", "Emergency", "MD", "10")),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of());

    when(datasetReader.read(any())).thenReturn(dataset);
    when(departmentRepository.count()).thenReturn(0L);
    when(departmentRepository.findAllByOrderByNameAsc()).thenReturn(List.of());
    when(userRepository.countByRoleAndActiveTrue(UserRole.DOCTOR)).thenReturn(0L);
    when(userRepository.findByRoleAndActiveTrueOrderByFullNameAsc(UserRole.DOCTOR)).thenReturn(List.of());
    when(patientRepository.count()).thenReturn(0L);
    when(patientRepository.findAll()).thenReturn(List.of());

    seedService.seedToTargets();

    verify(demoSeedPolicy).requireAllowed("non-billing-demo");
    verify(departmentRepository, atLeastOnce()).saveAll(anyList());
    verify(userRepository, atLeastOnce()).saveAll(anyList());
    verify(patientRepository, atLeastOnce()).saveAll(anyList());
  }

  @Test
  void skipsSeedingWhenAllEntitiesAreAlreadyAtOrAboveTargets() {
    var emptyDataset = new KaggleHmisDataset(
        List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), List.of(),
        List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), List.of(),
        List.of(), List.of(), List.of());
    when(datasetReader.read(any())).thenReturn(emptyDataset);

    var mockDepts = new ArrayList<DepartmentEntity>();
    for (int i = 0; i < 25; i++) {
      var d = new DepartmentEntity();
      d.setName("Dept " + i);
      mockDepts.add(d);
    }
    when(departmentRepository.count()).thenReturn(25L);
    when(departmentRepository.findAllByOrderByNameAsc()).thenReturn(mockDepts);

    var mockDoctors = new ArrayList<UserEntity>();
    for (int i = 0; i < 60; i++) {
      var doc = new UserEntity();
      doc.setEmail("doc" + i + "@demo.vn");
      mockDoctors.add(doc);
    }
    when(userRepository.countByRoleAndActiveTrue(UserRole.DOCTOR)).thenReturn(60L);
    when(userRepository.findByRoleAndActiveTrueOrderByFullNameAsc(UserRole.DOCTOR)).thenReturn(mockDoctors);

    var mockPatients = new ArrayList<PatientEntity>();
    for (int i = 0; i < 600; i++) {
      var p = new PatientEntity();
      p.setEmail("patient" + i + "@demo.vn");
      mockPatients.add(p);
    }
    when(patientRepository.count()).thenReturn(600L);
    when(patientRepository.findAll()).thenReturn(mockPatients);

    when(appointmentRepository.count()).thenReturn(1200L);
    when(appointmentRepository.findAll()).thenReturn(List.of());
    when(inventoryItemRepository.count()).thenReturn(250L);
    when(inventoryItemRepository.findAll()).thenReturn(List.of());
    when(auditLogRepository.count()).thenReturn(1100L);

    seedService.seedToTargets();

    verify(departmentRepository, never()).saveAll(anyList());
    verify(userRepository, never()).saveAll(anyList());
    verify(patientRepository, never()).saveAll(anyList());
  }

  @Test
  void correctlyEncryptsPatientCccdAndAssignsSyntheticDoctorProfiles() {
    var dataset = new KaggleHmisDataset(
        List.of(new KaggleHmisDataset.KaggleDepartmentRow("1", "Emergency", "Clinical", "0", "Active")),
        List.of(new KaggleHmisDataset.KagglePatientRow("101", "Female", "1992-04-15", "AB+", "District 1", "+84901234567")),
        List.of(),
        List.of(),
        List.of(),
        List.of(new KaggleHmisDataset.KaggleEmployeeRow("201", "Dr. Jane Smith", "Female", "Doctor", "Full-time", "2019-01-01", "1")),
        List.of(new KaggleHmisDataset.KaggleDoctorRow("201", "201", "Emergency", "MD, PhD", "12")),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of());

    when(datasetReader.read(any())).thenReturn(dataset);
    when(departmentRepository.count()).thenReturn(0L);
    when(departmentRepository.findAllByOrderByNameAsc()).thenReturn(List.of());
    when(userRepository.countByRoleAndActiveTrue(UserRole.DOCTOR)).thenReturn(0L);
    when(userRepository.findByRoleAndActiveTrueOrderByFullNameAsc(UserRole.DOCTOR)).thenReturn(List.of());
    when(patientRepository.count()).thenReturn(0L);
    when(patientRepository.findAll()).thenReturn(List.of());

    seedService.seedToTargets();

    @SuppressWarnings("unchecked")
    ArgumentCaptor<List<PatientEntity>> patientCaptor = ArgumentCaptor.forClass(List.class);
    verify(patientRepository, atLeastOnce()).saveAll(patientCaptor.capture());

    var allSavedPatients = patientCaptor.getAllValues().stream().flatMap(List::stream).toList();
    assertThat(allSavedPatients).isNotEmpty();
    var firstPatient = allSavedPatients.get(0);
    assertThat(firstPatient.getCccd()).startsWith("enc_");
    assertThat(firstPatient.getCccdHash()).startsWith("hash_");
    assertThat(firstPatient.getEmail()).contains("@example.com");

    @SuppressWarnings("unchecked")
    ArgumentCaptor<List<UserEntity>> doctorCaptor = ArgumentCaptor.forClass(List.class);
    verify(userRepository, atLeastOnce()).saveAll(doctorCaptor.capture());

    var allSavedDoctors = doctorCaptor.getAllValues().stream().flatMap(List::stream).toList();
    assertThat(allSavedDoctors).isNotEmpty();
    var firstDoctor = allSavedDoctors.get(0);
    assertThat(firstDoctor.getRole()).isEqualTo(UserRole.DOCTOR);
    assertThat(firstDoctor.getPasswordHash()).isEqualTo("hashed_password");
  }

  @Test
  void generatesInventoryLotsAndMovementsCorrectly() {
    var dataset = new KaggleHmisDataset(
        List.of(new KaggleHmisDataset.KaggleDepartmentRow("1", "Pharmacy", "Support", "0", "Active")),
        List.of(),
        List.of(),
        List.of(new KaggleHmisDataset.KaggleDrugRow("1", "Paracetamol 500mg", "Panadol", "Analgesic", "15000", "1")),
        List.of(new KaggleHmisDataset.KaggleDrugInventoryRow("1", "100", "50", "In Stock", "2026-01-01", "1")),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of());

    when(datasetReader.read(any())).thenReturn(dataset);
    var dept = new DepartmentEntity();
    dept.setName("Pharmacy");
    when(departmentRepository.findAllByOrderByNameAsc()).thenReturn(List.of(dept));
    when(departmentRepository.count()).thenReturn(20L);
    when(userRepository.countByRoleAndActiveTrue(UserRole.DOCTOR)).thenReturn(50L);
    when(userRepository.findByRoleAndActiveTrueOrderByFullNameAsc(UserRole.DOCTOR)).thenReturn(List.of());
    when(patientRepository.count()).thenReturn(500L);
    when(patientRepository.findAll()).thenReturn(List.of());
    when(appointmentRepository.count()).thenReturn(1000L);
    when(appointmentRepository.findAll()).thenReturn(List.of());
    when(inventoryItemRepository.count()).thenReturn(0L);
    when(inventoryItemRepository.findAll()).thenReturn(List.of());

    seedService.seedToTargets();

    @SuppressWarnings("unchecked")
    ArgumentCaptor<List<InventoryItemEntity>> itemCaptor = ArgumentCaptor.forClass(List.class);
    verify(inventoryItemRepository, atLeastOnce()).saveAll(itemCaptor.capture());

    var savedItems = itemCaptor.getAllValues().stream().flatMap(List::stream).toList();
    assertThat(savedItems).isNotEmpty();
    var firstItem = savedItems.get(0);
    assertThat(firstItem.getSku()).startsWith("KGH-DRUG-");
    assertThat(firstItem.getItemName()).contains("Paracetamol 500mg");

    @SuppressWarnings("unchecked")
    ArgumentCaptor<List<InventoryLotEntity>> lotCaptor = ArgumentCaptor.forClass(List.class);
    verify(inventoryLotRepository, atLeastOnce()).saveAll(lotCaptor.capture());
    var savedLots = lotCaptor.getAllValues().stream().flatMap(List::stream).toList();
    assertThat(savedLots).isNotEmpty();
    assertThat(savedLots.get(0).getLotCode()).startsWith("KGH-LOT-");

    @SuppressWarnings("unchecked")
    ArgumentCaptor<List<InventoryMovementEntity>> movCaptor = ArgumentCaptor.forClass(List.class);
    verify(inventoryMovementRepository, atLeastOnce()).saveAll(movCaptor.capture());
    var savedMovs = movCaptor.getAllValues().stream().flatMap(List::stream).toList();
    assertThat(savedMovs).isNotEmpty();
    assertThat(savedMovs.get(0).getMovementType()).isEqualTo("IMPORT");
  }

  @Test
  void enrichesClinicalRecordsAndLabResultsForCompletedAppointments() {
    var dataset = new KaggleHmisDataset(
        List.of(new KaggleHmisDataset.KaggleDepartmentRow("1", "Emergency", "Clinical", "0", "Active")),
        List.of(new KaggleHmisDataset.KagglePatientRow("1", "Female", "1990-05-12", "O+", "City", "+1234567890")),
        List.of(new KaggleHmisDataset.KaggleAdmissionRow("1", "2025-01-01 08:00:00", "2025-01-05 12:00:00", "Inpatient", "Discharged", "1", "1", "1", "1", "1")),
        List.of(),
        List.of(),
        List.of(new KaggleHmisDataset.KaggleEmployeeRow("1", "Doctor One", "Female", "Doctor", "Full-time", "2020-01-01", "1")),
        List.of(new KaggleHmisDataset.KaggleDoctorRow("1", "1", "Emergency", "MD", "10")),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of(),
        List.of());

    when(datasetReader.read(any())).thenReturn(dataset);
    when(departmentRepository.count()).thenReturn(0L);
    when(departmentRepository.findAllByOrderByNameAsc()).thenReturn(List.of());
    when(userRepository.countByRoleAndActiveTrue(UserRole.DOCTOR)).thenReturn(0L);
    when(userRepository.findByRoleAndActiveTrueOrderByFullNameAsc(UserRole.DOCTOR)).thenReturn(List.of());
    when(patientRepository.count()).thenReturn(0L);
    when(patientRepository.findAll()).thenReturn(List.of());
    when(appointmentRepository.count()).thenReturn(0L);
    when(appointmentRepository.findAll()).thenReturn(List.of());
    when(inventoryItemRepository.count()).thenReturn(0L);
    when(inventoryItemRepository.findAll()).thenReturn(List.of());

    seedService.seedToTargets();

    verify(medicalRecordRepository, atLeastOnce()).saveAll(anyList());
    verify(labResultRepository, atLeastOnce()).saveAll(anyList());
    verify(auditLogRepository, atLeastOnce()).saveAll(anyList());
  }
}
