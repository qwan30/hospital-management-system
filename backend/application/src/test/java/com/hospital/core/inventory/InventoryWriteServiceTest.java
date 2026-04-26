package com.hospital.core.inventory;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.hospital.core.audit.AuditLogService;
import com.hospital.core.common.NotFoundException;
import com.hospital.core.department.DepartmentEntity;
import com.hospital.core.department.DepartmentRepository;
import com.hospital.shared.inventory.InventoryItemCreateRequest;
import com.hospital.shared.inventory.InventoryItemUpdateRequest;
import com.hospital.shared.inventory.InventoryLotCreateRequest;
import com.hospital.shared.inventory.InventoryLotUpdateRequest;
import com.hospital.shared.inventory.InventoryMovementCreateRequest;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class InventoryWriteServiceTest {

  @Mock private InventoryItemRepository itemRepository;
  @Mock private InventoryLotRepository lotRepository;
  @Mock private InventoryMovementRepository movementRepository;
  @Mock private DepartmentRepository departmentRepository;
  @Mock private AuditLogService auditLogService;

  private InventoryWriteService service;

  @BeforeEach
  void setUp() {
    service = new InventoryWriteService(
        itemRepository,
        lotRepository,
        movementRepository,
        departmentRepository,
        auditLogService);
  }

  // ── createItem ──────────────────────────────────────────────────────────

  @Test
  void createItem_withoutDepartment_savesAndReturnsResponse() {
    when(itemRepository.save(any(InventoryItemEntity.class))).thenAnswer(inv -> {
      var e = inv.getArgument(0, InventoryItemEntity.class);
      e.prePersist();
      return e;
    });

    var request = new InventoryItemCreateRequest("MED-001", "Paracetamol 500mg", "Medicine", "tablet", 50, 200, null);
    var response = service.createItem(request);

    assertThat(response.itemId()).isNotNull();
    assertThat(response.sku()).isEqualTo("MED-001");
    assertThat(response.itemName()).isEqualTo("Paracetamol 500mg");
    assertThat(response.category()).isEqualTo("Medicine");
    assertThat(response.quantityOnHand()).isEqualTo(200);
    assertThat(response.status()).isEqualTo("IN_STOCK");
    assertThat(response.departmentName()).isNull();
    verify(itemRepository).save(any(InventoryItemEntity.class));
  }

  @Test
  void createItem_withDepartment_setsDepartmentAndReturns() {
    var deptId = UUID.randomUUID();
    var dept = new DepartmentEntity();
    dept.setId(deptId);
    dept.setName("Cardiology");
    when(departmentRepository.findById(deptId)).thenReturn(Optional.of(dept));
    when(itemRepository.save(any(InventoryItemEntity.class))).thenAnswer(inv -> {
      var e = inv.getArgument(0, InventoryItemEntity.class);
      e.prePersist();
      return e;
    });

    var request = new InventoryItemCreateRequest("SURG-001", "Scalpel", "Surgical", "unit", 10, 50, deptId);
    var response = service.createItem(request);

    assertThat(response.departmentName()).isEqualTo("Cardiology");
  }

  @Test
  void createItem_withInvalidDepartment_throwsNotFound() {
    var deptId = UUID.randomUUID();
    when(departmentRepository.findById(deptId)).thenReturn(Optional.empty());

    var request = new InventoryItemCreateRequest("X-001", "Test", "Cat", "unit", 0, 0, deptId);
    assertThatThrownBy(() -> service.createItem(request))
        .isInstanceOf(NotFoundException.class)
        .hasMessageContaining("Department not found");
  }

  @Test
  void createItem_belowReorderLevelMarksLowStockAndAudits() {
    when(itemRepository.save(any(InventoryItemEntity.class))).thenAnswer(inv -> {
      var e = inv.getArgument(0, InventoryItemEntity.class);
      e.prePersist();
      return e;
    });

    var request = new InventoryItemCreateRequest("MED-LOW", "Low stock medicine", "Medicine", "box", 20, 12, null);
    var response = service.createItem(request);

    assertThat(response.status()).isEqualTo("LOW_STOCK");
    verify(auditLogService).record(eq("INVENTORY_ITEM_CREATED"), eq("INVENTORY_ITEM"), eq(response.itemId()), anyMap());
  }

  // ── updateItem ──────────────────────────────────────────────────────────

  @Test
  void updateItem_existingItem_updatesAndReturns() {
    var itemId = UUID.randomUUID();
    var existing = buildItemEntity(itemId, "OLD-001", "Old name");
    when(itemRepository.findById(itemId)).thenReturn(Optional.of(existing));
    when(itemRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

    var request = new InventoryItemUpdateRequest("New name", "New category", null, 100, null);
    var response = service.updateItem(itemId, request);

    assertThat(response.itemName()).isEqualTo("New name");
    assertThat(response.category()).isEqualTo("New category");
    assertThat(response.reorderLevel()).isEqualTo(100);
    assertThat(response.unit()).isEqualTo("tablet"); // unchanged
  }

  @Test
  void updateItem_whenReorderLevelCrossesQuantityMarksLowStockAndAudits() {
    var itemId = UUID.randomUUID();
    var existing = buildItemEntity(itemId, "MED-LOW", "Tracked medicine");
    existing.setQuantityOnHand(100);
    existing.setReorderLevel(10);
    existing.setStatus("IN_STOCK");
    when(itemRepository.findById(itemId)).thenReturn(Optional.of(existing));
    when(itemRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

    var response = service.updateItem(itemId, new InventoryItemUpdateRequest(null, null, null, 120, null));

    assertThat(response.status()).isEqualTo("LOW_STOCK");
    verify(auditLogService).record(eq("INVENTORY_ITEM_UPDATED"), eq("INVENTORY_ITEM"), eq(itemId), anyMap());
  }

  @Test
  void updateItem_notFound_throwsNotFound() {
    var itemId = UUID.randomUUID();
    when(itemRepository.findById(itemId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> service.updateItem(itemId, new InventoryItemUpdateRequest(null, null, null, null, null)))
        .isInstanceOf(NotFoundException.class);
  }

  // ── deleteItem ──────────────────────────────────────────────────────────

  @Test
  void deleteItem_existingItem_deletesSuccessfully() {
    var itemId = UUID.randomUUID();
    when(itemRepository.existsById(itemId)).thenReturn(true);

    service.deleteItem(itemId);

    verify(itemRepository).deleteById(itemId);
  }

  @Test
  void deleteItem_notFound_throwsNotFound() {
    var itemId = UUID.randomUUID();
    when(itemRepository.existsById(itemId)).thenReturn(false);

    assertThatThrownBy(() -> service.deleteItem(itemId))
        .isInstanceOf(NotFoundException.class);
  }

  // ── createLot ──────────────────────────────────────────────────────────

  @Test
  void createLot_validItem_savesAndReturnsResponse() {
    var itemId = UUID.randomUUID();
    var item = buildItemEntity(itemId, "MED-001", "Paracetamol");
    when(itemRepository.findById(itemId)).thenReturn(Optional.of(item));
    when(lotRepository.save(any(InventoryLotEntity.class))).thenAnswer(inv -> {
      var e = inv.getArgument(0, InventoryLotEntity.class);
      e.prePersist();
      return e;
    });

    var request = new InventoryLotCreateRequest(itemId, "LOT-2026-A", "PharmaCo", 500, LocalDate.of(2027, 6, 30));
    var response = service.createLot(request);

    assertThat(response.lotId()).isNotNull();
    assertThat(response.lotCode()).isEqualTo("LOT-2026-A");
    assertThat(response.itemName()).isEqualTo("Paracetamol");
    assertThat(response.quantityReceived()).isEqualTo(500);
    assertThat(response.quantityRemaining()).isEqualTo(500);
  }

  @Test
  void createLot_invalidItem_throwsNotFound() {
    var itemId = UUID.randomUUID();
    when(itemRepository.findById(itemId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> service.createLot(new InventoryLotCreateRequest(itemId, "LOT", null, 1, null)))
        .isInstanceOf(NotFoundException.class);
  }

  // ── updateLot ──────────────────────────────────────────────────────────

  @Test
  void updateLot_existingLot_updatesAndReturns() {
    var lotId = UUID.randomUUID();
    var item = buildItemEntity(UUID.randomUUID(), "MED-001", "Paracetamol");
    var lot = new InventoryLotEntity();
    lot.setId(lotId);
    lot.setItem(item);
    lot.setLotCode("LOT-A");
    lot.setSupplierName("OldSupplier");
    lot.setQuantityReceived(100);
    lot.setQuantityRemaining(80);
    when(lotRepository.findById(lotId)).thenReturn(Optional.of(lot));
    when(lotRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

    var response = service.updateLot(lotId, new InventoryLotUpdateRequest("NewSupplier", 60));

    assertThat(response.supplierName()).isEqualTo("NewSupplier");
    assertThat(response.quantityRemaining()).isEqualTo(60);
  }

  @Test
  void updateLot_negativeQuantityRemaining_throwsConflict() {
    var lotId = UUID.randomUUID();
    var item = buildItemEntity(UUID.randomUUID(), "MED-001", "Paracetamol");
    var lot = new InventoryLotEntity();
    lot.setId(lotId);
    lot.setItem(item);
    lot.setLotCode("LOT-A");
    lot.setQuantityReceived(100);
    lot.setQuantityRemaining(80);
    when(lotRepository.findById(lotId)).thenReturn(Optional.of(lot));

    assertThatThrownBy(() -> service.updateLot(lotId, new InventoryLotUpdateRequest(null, -1)))
        .isInstanceOf(com.hospital.core.common.ConflictException.class)
        .hasMessageContaining("Quantity remaining cannot be negative");
  }

  @Test
  void updateLot_quantityRemainingAboveReceived_throwsConflict() {
    var lotId = UUID.randomUUID();
    var item = buildItemEntity(UUID.randomUUID(), "MED-001", "Paracetamol");
    var lot = new InventoryLotEntity();
    lot.setId(lotId);
    lot.setItem(item);
    lot.setLotCode("LOT-A");
    lot.setQuantityReceived(100);
    lot.setQuantityRemaining(80);
    when(lotRepository.findById(lotId)).thenReturn(Optional.of(lot));

    assertThatThrownBy(() -> service.updateLot(lotId, new InventoryLotUpdateRequest(null, 101)))
        .isInstanceOf(com.hospital.core.common.ConflictException.class)
        .hasMessageContaining("Quantity remaining cannot exceed quantity received");
  }

  @Test
  void updateLot_notFound_throwsNotFound() {
    var lotId = UUID.randomUUID();
    when(lotRepository.findById(lotId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> service.updateLot(lotId, new InventoryLotUpdateRequest(null, null)))
        .isInstanceOf(NotFoundException.class);
  }

  // ── recordMovement ────────────────────────────────────────────────────

  @Test
  void recordMovement_validItem_savesAndUpdatesQuantity() {
    var itemId = UUID.randomUUID();
    var item = buildItemEntity(itemId, "MED-001", "Paracetamol");
    item.setQuantityOnHand(100);
    when(itemRepository.findById(itemId)).thenReturn(Optional.of(item));
    when(movementRepository.save(any(InventoryMovementEntity.class))).thenAnswer(inv -> {
      var e = inv.getArgument(0, InventoryMovementEntity.class);
      e.prePersist();
      return e;
    });
    when(itemRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

    var request = new InventoryMovementCreateRequest(itemId, "RECEIPT", 50, "Monthly restock");
    var response = service.recordMovement(request);

    assertThat(response.movementId()).isNotNull();
    assertThat(response.movementType()).isEqualTo("RECEIPT");
    assertThat(response.quantityDelta()).isEqualTo(50);
    assertThat(item.getQuantityOnHand()).isEqualTo(150); // 100 + 50
    verify(auditLogService).record(eq("INVENTORY_MOVEMENT_RECORDED"), eq("INVENTORY_ITEM"), eq(itemId), anyMap());
  }

  @Test
  void recordMovement_whenQuantityFallsBelowReorderLevelMarksLowStockAndAudits() {
    var itemId = UUID.randomUUID();
    var item = buildItemEntity(itemId, "MED-001", "Paracetamol");
    item.setQuantityOnHand(12);
    item.setReorderLevel(10);
    when(itemRepository.findById(itemId)).thenReturn(Optional.of(item));
    when(movementRepository.save(any(InventoryMovementEntity.class))).thenAnswer(inv -> {
      var e = inv.getArgument(0, InventoryMovementEntity.class);
      e.prePersist();
      return e;
    });
    when(itemRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

    service.recordMovement(new InventoryMovementCreateRequest(itemId, "ISSUE", -4, "Dispensed"));

    assertThat(item.getQuantityOnHand()).isEqualTo(8);
    assertThat(item.getStatus()).isEqualTo("LOW_STOCK");
    verify(auditLogService).record(eq("INVENTORY_MOVEMENT_RECORDED"), eq("INVENTORY_ITEM"), eq(itemId), anyMap());
  }

  @Test
  void recordMovement_whenQuantityWouldBecomeNegative_throwsConflict() {
    var itemId = UUID.randomUUID();
    var item = buildItemEntity(itemId, "MED-001", "Paracetamol");
    item.setQuantityOnHand(3);
    when(itemRepository.findById(itemId)).thenReturn(Optional.of(item));

    assertThatThrownBy(() -> service.recordMovement(new InventoryMovementCreateRequest(itemId, "ISSUE", -4, "Dispensed")))
        .isInstanceOf(com.hospital.core.common.ConflictException.class)
        .hasMessageContaining("Inventory movement cannot make quantity on hand negative");
  }

  @Test
  void recordMovement_invalidItem_throwsNotFound() {
    var itemId = UUID.randomUUID();
    when(itemRepository.findById(itemId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> service.recordMovement(new InventoryMovementCreateRequest(itemId, "ISSUE", -10, null)))
        .isInstanceOf(NotFoundException.class);
  }

  // ── helpers ─────────────────────────────────────────────────────────────

  private InventoryItemEntity buildItemEntity(UUID id, String sku, String name) {
    var entity = new InventoryItemEntity();
    entity.setId(id);
    entity.setSku(sku);
    entity.setItemName(name);
    entity.setCategory("Medicine");
    entity.setUnit("tablet");
    entity.setReorderLevel(10);
    entity.setQuantityOnHand(100);
    entity.setStatus("IN_STOCK");
    entity.setCreatedAt(Instant.now());
    entity.setUpdatedAt(Instant.now());
    return entity;
  }
}
