package com.hospital.core.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.hospital.core.content.ContentAdminService;
import com.hospital.core.department.DepartmentRepository;
import com.hospital.core.inventory.InventoryService;
import com.hospital.core.user.UserRepository;
import com.hospital.shared.inventory.InventoryAlertResponse;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class OperationsAdminServiceTest {
  @Mock private ContentAdminService contentAdminService;
  @Mock private DepartmentRepository departmentRepository;
  @Mock private RoomRepository roomRepository;
  @Mock private DoctorScheduleTemplateRepository doctorScheduleTemplateRepository;
  @Mock private SpecialClosureRepository specialClosureRepository;
  @Mock private UserRepository userRepository;
  @Mock private InventoryService inventoryService;

  private OperationsAdminService service;

  @BeforeEach
  void setUp() {
    service = new OperationsAdminService(
        contentAdminService,
        departmentRepository,
        roomRepository,
        doctorScheduleTemplateRepository,
        specialClosureRepository,
        userRepository,
        inventoryService);
  }

  @Test
  void monitoringSnapshotIncludesInventoryAndScheduleAlertCounts() {
    var activeClosure = closure(true);
    var inactiveClosure = closure(false);
    when(specialClosureRepository.findAllByOrderByClosureDateDescTitleAsc())
        .thenReturn(List.of(activeClosure, inactiveClosure));
    when(inventoryService.listAlerts(any(LocalDate.class)))
        .thenReturn(List.of(alert("LOW_STOCK"), alert("EXPIRING_SOON")));

    var snapshot = service.getMonitoringSnapshot();

    assertThat(snapshot.scheduleAlertCount()).isEqualTo(1);
    assertThat(snapshot.inventoryAlertCount()).isEqualTo(2);
    assertThat(snapshot.activeAlerts()).isEqualTo(3);
    assertThat(snapshot.healthy()).isFalse();
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
