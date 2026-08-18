package com.hospital.core.seed;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.hospital.core.appointment.AppointmentRepository;
import com.hospital.core.audit.AuditLogRepository;
import com.hospital.core.department.DepartmentRepository;
import com.hospital.core.inventory.InventoryItemRepository;
import com.hospital.core.inventory.InventoryLotRepository;
import com.hospital.core.inventory.InventoryMovementRepository;
import com.hospital.core.invoice.ServicePricingRepository;
import com.hospital.core.medicalrecord.MedicalRecordRepository;
import com.hospital.core.patient.PatientIdentifierProtector;
import com.hospital.core.patient.PatientRepository;
import com.hospital.core.patientauth.PatientAccountRepository;
import com.hospital.core.patientportal.PatientMessageRepository;
import com.hospital.core.patientportal.PatientMessageThreadRepository;
import com.hospital.core.patientportal.PatientPortalLabResultRepository;
import com.hospital.core.timeslot.TimeSlotRepository;
import com.hospital.core.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

class SeedDataServiceLifecycleTest {

  private AppointmentRepository appointmentRepository;
  private AuditLogRepository auditLogRepository;
  private DepartmentRepository departmentRepository;
  private InventoryItemRepository inventoryItemRepository;
  private InventoryLotRepository inventoryLotRepository;
  private InventoryMovementRepository inventoryMovementRepository;
  private PatientPortalLabResultRepository labResultRepository;
  private MedicalRecordRepository medicalRecordRepository;
  private PatientAccountRepository patientAccountRepository;
  private PatientIdentifierProtector patientIdentifierProtector;
  private PatientMessageRepository patientMessageRepository;
  private PatientMessageThreadRepository patientMessageThreadRepository;
  private PatientRepository patientRepository;
  private ServicePricingRepository servicePricingRepository;
  private UserRepository userRepository;
  private TimeSlotRepository timeSlotRepository;
  private PasswordEncoder passwordEncoder;
  private NonBillingDemoSeedProperties nonBillingDemoSeedProperties;
  private InitialDemoSeedProperties initialDemoSeedProperties;
  private DemoSeedPolicy demoSeedPolicy;

  private SeedDataService seedDataService;

  @BeforeEach
  void setUp() {
    appointmentRepository = mock(AppointmentRepository.class);
    auditLogRepository = mock(AuditLogRepository.class);
    departmentRepository = mock(DepartmentRepository.class);
    inventoryItemRepository = mock(InventoryItemRepository.class);
    inventoryLotRepository = mock(InventoryLotRepository.class);
    inventoryMovementRepository = mock(InventoryMovementRepository.class);
    labResultRepository = mock(PatientPortalLabResultRepository.class);
    medicalRecordRepository = mock(MedicalRecordRepository.class);
    patientAccountRepository = mock(PatientAccountRepository.class);
    patientIdentifierProtector = mock(PatientIdentifierProtector.class);
    patientMessageRepository = mock(PatientMessageRepository.class);
    patientMessageThreadRepository = mock(PatientMessageThreadRepository.class);
    patientRepository = mock(PatientRepository.class);
    servicePricingRepository = mock(ServicePricingRepository.class);
    userRepository = mock(UserRepository.class);
    timeSlotRepository = mock(TimeSlotRepository.class);
    passwordEncoder = mock(PasswordEncoder.class);
    nonBillingDemoSeedProperties = new NonBillingDemoSeedProperties();
    initialDemoSeedProperties = new InitialDemoSeedProperties();
    demoSeedPolicy = mock(DemoSeedPolicy.class);

    seedDataService = new SeedDataService(
        appointmentRepository,
        auditLogRepository,
        departmentRepository,
        inventoryItemRepository,
        inventoryLotRepository,
        inventoryMovementRepository,
        labResultRepository,
        medicalRecordRepository,
        patientAccountRepository,
        patientIdentifierProtector,
        patientMessageRepository,
        patientMessageThreadRepository,
        patientRepository,
        servicePricingRepository,
        userRepository,
        timeSlotRepository,
        passwordEncoder,
        nonBillingDemoSeedProperties,
        initialDemoSeedProperties,
        demoSeedPolicy);
  }

  @Test
  void nonBillingSeedIsIndependentFromInitialDemoSeed() {
    initialDemoSeedProperties.setEnabled(false);
    nonBillingDemoSeedProperties.setEnabled(true);
    nonBillingDemoSeedProperties.setDoctorPassword("Doctor@123456");

    seedDataService.seedInitialDemoIfEnabled();
    verify(departmentRepository, never()).count();

    seedDataService.seedNonBillingDemoIfEnabled();
    verify(demoSeedPolicy).requireAllowed("non-billing-demo");
    verify(departmentRepository).findAllByOrderByNameAsc();
  }

  @Test
  void nonBillingSeedEnforcesDemoSeedPolicy() {
    nonBillingDemoSeedProperties.setEnabled(true);
    org.mockito.Mockito.doThrow(new IllegalStateException("Disallowed in production"))
        .when(demoSeedPolicy).requireAllowed("non-billing-demo");

    assertThatThrownBy(() -> seedDataService.seedNonBillingDemoIfEnabled())
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("Disallowed in production");
  }

  @Test
  void initialDemoSeed_whenExistingUsersAndNewsEmpty_seedsNewsArticles() {
    var newsRepo = mock(com.hospital.core.content.NewsArticleRepository.class);
    when(newsRepo.count()).thenReturn(0L);

    var serviceWithNews = new SeedDataService(
        appointmentRepository,
        auditLogRepository,
        departmentRepository,
        inventoryItemRepository,
        inventoryLotRepository,
        inventoryMovementRepository,
        labResultRepository,
        medicalRecordRepository,
        patientAccountRepository,
        patientIdentifierProtector,
        patientMessageRepository,
        patientMessageThreadRepository,
        patientRepository,
        servicePricingRepository,
        userRepository,
        timeSlotRepository,
        passwordEncoder,
        nonBillingDemoSeedProperties,
        initialDemoSeedProperties,
        demoSeedPolicy,
        null,
        newsRepo);

    initialDemoSeedProperties.setEnabled(true);
    var passwords = new InitialDemoSeedProperties.Passwords();
    passwords.setAdmin("Admin@123");
    passwords.setDoctor1("Doctor@123");
    passwords.setDoctor2("Doctor@123");
    passwords.setNurse("Nurse@123");
    passwords.setReceptionist("Recep@123");
    passwords.setPharmacist("Pharm@123");
    passwords.setAccountant("Account@123");
    passwords.setPatient("Patient@123");
    initialDemoSeedProperties.setPasswords(passwords);

    when(departmentRepository.count()).thenReturn(1L);

    serviceWithNews.seedInitialDemoIfEnabled();

    verify(newsRepo).saveAll(org.mockito.ArgumentMatchers.anyList());
  }
}
