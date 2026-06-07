package com.hospital.core.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.hospital.core.content.ContentAdminService;
import com.hospital.core.department.DepartmentRepository;
import com.hospital.core.inventory.InventoryService;
import com.hospital.core.appointment.AppointmentRepository;
import com.hospital.core.user.UserRepository;
import com.hospital.shared.inventory.InventoryAlertResponse;
import java.sql.Connection;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import javax.sql.DataSource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;

@ExtendWith(MockitoExtension.class)
class OperationsAdminServiceTest {
  @Mock private ContentAdminService contentAdminService;
  @Mock private DepartmentRepository departmentRepository;
  @Mock private RoomRepository roomRepository;
  @Mock private DoctorScheduleTemplateRepository doctorScheduleTemplateRepository;
  @Mock private SpecialClosureRepository specialClosureRepository;
  @Mock private UserRepository userRepository;
  @Mock private InventoryService inventoryService;
  @Mock private AppointmentRepository appointmentRepository;
  @Mock private DataSource dataSource;
  @Mock private Connection connection;
  @Mock private Environment environment;

  private OperationsAdminService service;
  private final Clock fixedClock = Clock.fixed(Instant.parse("2026-06-06T06:00:00Z"), ZoneOffset.UTC);

  @BeforeEach
  void setUp() {
    service = new OperationsAdminService(
        contentAdminService,
        departmentRepository,
        roomRepository,
        doctorScheduleTemplateRepository,
        specialClosureRepository,
        userRepository,
        inventoryService,
        appointmentRepository,
        dataSource,
        environment,
        fixedClock);
  }

  @Test
  void monitoringSnapshotIncludesInventoryAndScheduleAlertCounts() throws Exception {
    var activeClosure = closure(true);
    var inactiveClosure = closure(false);
    when(specialClosureRepository.findAllByOrderByClosureDateDescTitleAsc())
        .thenReturn(List.of(activeClosure, inactiveClosure));
    when(inventoryService.listAlerts(any(LocalDate.class)))
        .thenReturn(List.of(alert("LOW_STOCK"), alert("EXPIRING_SOON")));
    when(dataSource.getConnection()).thenReturn(connection);
    when(connection.isValid(2)).thenReturn(true);
    when(appointmentRepository.countByAppointmentDate(LocalDate.of(2026, 6, 6))).thenReturn(4L);
    when(environment.getProperty("management.endpoints.web.exposure.include", ""))
        .thenReturn("health,info,metrics,prometheus");
    when(environment.getProperty("management.tracing.enabled", Boolean.class, true)).thenReturn(true);
    when(environment.getProperty("management.otlp.tracing.endpoint", ""))
        .thenReturn("http://otel-collector:4318/v1/traces");
    when(environment.getProperty("hms.observability.structured-logging-enabled", Boolean.class, true))
        .thenReturn(true);

    var snapshot = service.getMonitoringSnapshot();

    assertThat(snapshot.scheduleAlertCount()).isEqualTo(1);
    assertThat(snapshot.inventoryAlertCount()).isEqualTo(2);
    assertThat(snapshot.activeAlerts()).isEqualTo(3);
    assertThat(snapshot.healthy()).isFalse();
    assertThat(snapshot.databaseStatus()).isEqualTo("UP");
    assertThat(snapshot.queueStatus()).isEqualTo("UP");
    assertThat(snapshot.todayQueueCount()).isEqualTo(4);
    assertThat(snapshot.metricsStatus()).isEqualTo("UP");
    assertThat(snapshot.tracingStatus()).isEqualTo("UP");
    assertThat(snapshot.loggingStatus()).isEqualTo("UP");
    assertThat(snapshot.observabilityStatus()).isEqualTo("UP");
  }

  private SpecialClosureEntity closure(boolean active) {
    var closure = new SpecialClosureEntity();
    closure.setId(UUID.randomUUID());
    closure.setTitle("Clinic closure");
    closure.setClosureDate(LocalDate.of(2026, 5, 1));
    closure.setActive(active);
    return closure;
  }

  private InventoryAlertResponse alert(String alertType) {
    return new InventoryAlertResponse(
        alertType,
        "WARNING",
        UUID.randomUUID(),
        "Paracetamol",
        null,
        null,
        8,
        10,
        null,
        null,
        "Inventory warning");
  }
}
