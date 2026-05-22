package com.hospital.api;

import static org.assertj.core.api.Assertions.assertThat;

import com.hospital.core.admin.RoomRepository;
import com.hospital.core.appointment.AppointmentRepository;
import com.hospital.core.audit.AuditLogRepository;
import com.hospital.core.content.HospitalContentSectionRepository;
import com.hospital.core.content.NewsArticleRepository;
import com.hospital.core.department.DepartmentRepository;
import com.hospital.core.inventory.InventoryItemRepository;
import com.hospital.core.inventory.InventoryLotRepository;
import com.hospital.core.invoice.InvoiceRepository;
import com.hospital.core.patient.PatientRepository;
import com.hospital.core.patientauth.PatientAccountRepository;
import com.hospital.core.patientportal.PatientMessageThreadRepository;
import com.hospital.core.patientportal.PatientPortalLabResultRepository;
import com.hospital.core.seed.ReleaseDemoSeedService;
import com.hospital.core.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.MOCK,
    properties = {
        "hms.seed.release-demo.enabled=true",
        "hms.seed.release-demo.future-slot-days=3",
        "hms.seed.release-demo.target-patients=8",
        "hms.seed.release-demo.target-appointments=12",
        "hms.seed.release-demo.target-inventory-items=8",
        "hms.seed.release-demo.target-audit-logs=16",
        "security.jwt.secret=test-jwt-secret-with-at-least-32-characters",
        "security.patient-identifier.secret=test-patient-identifier-secret",
        "security.http.public-rate-limit-per-minute=0"
    })
@Testcontainers(disabledWithoutDocker = true)
class ReleaseDemoSeedIntegrationTest {
  private static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("pgvector/pgvector:pg15");

  @Autowired
  private AppointmentRepository appointmentRepository;

  @Autowired
  private AuditLogRepository auditLogRepository;

  @Autowired
  private DepartmentRepository departmentRepository;

  @Autowired
  private HospitalContentSectionRepository hospitalContentSectionRepository;

  @Autowired
  private InventoryItemRepository inventoryItemRepository;

  @Autowired
  private InventoryLotRepository inventoryLotRepository;

  @Autowired
  private InvoiceRepository invoiceRepository;

  @Autowired
  private NewsArticleRepository newsArticleRepository;

  @Autowired
  private PatientAccountRepository patientAccountRepository;

  @Autowired
  private PatientMessageThreadRepository patientMessageThreadRepository;

  @Autowired
  private PatientPortalLabResultRepository patientPortalLabResultRepository;

  @Autowired
  private PatientRepository patientRepository;

  @Autowired
  private ReleaseDemoSeedService releaseDemoSeedService;

  @Autowired
  private RoomRepository roomRepository;

  @Autowired
  private UserRepository userRepository;

  @DynamicPropertySource
  static void databaseProperties(DynamicPropertyRegistry registry) {
    if (!POSTGRES.isRunning()) {
      POSTGRES.start();
    }
    registry.add("POSTGRES_HOST", POSTGRES::getHost);
    registry.add("POSTGRES_PORT", () -> POSTGRES.getMappedPort(5432));
    registry.add("POSTGRES_DB", POSTGRES::getDatabaseName);
    registry.add("POSTGRES_USER", POSTGRES::getUsername);
    registry.add("POSTGRES_PASSWORD", POSTGRES::getPassword);
  }

  @Test
  void releaseDemoSeedCoversReleaseDomainsAndCanRunTwiceWithoutDuplicates() {
    var initialCounts = counts();

    assertThat(initialCounts.patients()).isGreaterThanOrEqualTo(8);
    assertThat(initialCounts.appointments()).isGreaterThanOrEqualTo(12);
    assertThat(initialCounts.inventoryItems()).isGreaterThanOrEqualTo(8);
    assertThat(initialCounts.auditLogs()).isGreaterThanOrEqualTo(16);
    assertThat(initialCounts.invoices()).isGreaterThanOrEqualTo(2);
    assertThat(initialCounts.patientMessageThreads()).isGreaterThanOrEqualTo(1);
    assertThat(initialCounts.portalLabResults()).isGreaterThanOrEqualTo(1);

    assertSingleDepartment("Emergency Medicine");
    assertSingleRoom("ER-OBS-01");
    assertSingleUser("receptionist@hospital.vn");
    assertSingleUser("pharmacist@hospital.vn");
    assertSinglePatient("nguyen.van.clinical@example.com");
    assertSinglePatientAccount("nguyen.van.clinical@example.com");
    assertSingleAppointment("HMS-UAT-QUEUE-001");
    assertSingleContentSlug("release-portal");
    assertSingleNewsSlug("release-uat-inventory-finance");
    assertSingleInventorySku("UAT-MED-AML-005");
    assertSingleLotCode("UAT-MED-AML-005-LOT");
    assertAuditKeyPresent("release-demo-001");

    releaseDemoSeedService.seedIfEnabled();

    assertThat(counts()).isEqualTo(initialCounts);
    assertSingleUser("receptionist@hospital.vn");
    assertSinglePatient("nguyen.van.clinical@example.com");
    assertSingleAppointment("HMS-UAT-QUEUE-001");
    assertSingleInventorySku("UAT-MED-AML-005");
    assertSingleLotCode("UAT-MED-AML-005-LOT");
    assertAuditKeyPresent("release-demo-001");
  }

  private SeedCounts counts() {
    return new SeedCounts(
        departmentRepository.count(),
        userRepository.count(),
        roomRepository.count(),
        patientRepository.count(),
        patientAccountRepository.count(),
        appointmentRepository.count(),
        patientPortalLabResultRepository.count(),
        patientMessageThreadRepository.count(),
        inventoryItemRepository.count(),
        inventoryLotRepository.count(),
        invoiceRepository.count(),
        hospitalContentSectionRepository.count(),
        newsArticleRepository.count(),
        auditLogRepository.count());
  }

  private void assertSingleDepartment(String name) {
    assertThat(departmentRepository.findAll()).filteredOn(department -> name.equals(department.getName())).hasSize(1);
  }

  private void assertSingleRoom(String name) {
    assertThat(roomRepository.findAll()).filteredOn(room -> name.equals(room.getName())).hasSize(1);
  }

  private void assertSingleUser(String email) {
    assertThat(userRepository.findAll()).filteredOn(user -> email.equalsIgnoreCase(user.getEmail())).hasSize(1);
  }

  private void assertSinglePatient(String email) {
    assertThat(patientRepository.findAll()).filteredOn(patient -> email.equalsIgnoreCase(patient.getEmail())).hasSize(1);
  }

  private void assertSinglePatientAccount(String email) {
    assertThat(patientAccountRepository.findAll())
        .filteredOn(account -> email.equalsIgnoreCase(account.getEmail()))
        .hasSize(1);
  }

  private void assertSingleAppointment(String confirmationCode) {
    assertThat(appointmentRepository.findAll())
        .filteredOn(appointment -> confirmationCode.equals(appointment.getConfirmationCode()))
        .hasSize(1);
  }

  private void assertSingleContentSlug(String slug) {
    assertThat(hospitalContentSectionRepository.findAll()).filteredOn(section -> slug.equals(section.getSlug())).hasSize(1);
  }

  private void assertSingleNewsSlug(String slug) {
    assertThat(newsArticleRepository.findAll()).filteredOn(article -> slug.equals(article.getSlug())).hasSize(1);
  }

  private void assertSingleInventorySku(String sku) {
    assertThat(inventoryItemRepository.findAll()).filteredOn(item -> sku.equals(item.getSku())).hasSize(1);
  }

  private void assertSingleLotCode(String lotCode) {
    assertThat(inventoryLotRepository.findAll()).filteredOn(lot -> lotCode.equals(lot.getLotCode())).hasSize(1);
  }

  private void assertAuditKeyPresent(String key) {
    assertThat(auditLogRepository.findAll())
        .anySatisfy(log -> assertThat(log.getMetadata()).contains("\"key\": \"" + key + "\""));
  }

  private record SeedCounts(
      long departments,
      long users,
      long rooms,
      long patients,
      long patientAccounts,
      long appointments,
      long portalLabResults,
      long patientMessageThreads,
      long inventoryItems,
      long inventoryLots,
      long invoices,
      long contentSections,
      long newsArticles,
      long auditLogs) {
  }
}
