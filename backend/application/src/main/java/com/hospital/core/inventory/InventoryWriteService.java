package com.hospital.core.inventory;

import com.hospital.core.audit.AuditLogService;
import com.hospital.core.common.ConflictException;
import com.hospital.core.common.NotFoundException;
import com.hospital.core.department.DepartmentRepository;
import com.hospital.core.medicalrecord.MedicalRecordEntity;
import com.hospital.core.medicalrecord.MedicalRecordRepository;
import com.hospital.core.prescription.PrescriptionItemEntity;
import com.hospital.shared.inventory.InventoryDispenseRequest;
import com.hospital.shared.inventory.InventoryDispenseResponse;
import com.hospital.shared.inventory.InventoryItemCreateRequest;
import com.hospital.shared.inventory.InventoryItemResponse;
import com.hospital.shared.inventory.InventoryItemUpdateRequest;
import com.hospital.shared.inventory.InventoryLotCreateRequest;
import com.hospital.shared.inventory.InventoryLotResponse;
import com.hospital.shared.inventory.InventoryLotUpdateRequest;
import com.hospital.shared.inventory.InventoryMovementCreateRequest;
import com.hospital.shared.inventory.InventoryMovementResponse;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryWriteService {
  private final InventoryItemRepository itemRepository;
  private final InventoryLotRepository lotRepository;
  private final InventoryMovementRepository movementRepository;
  private final DepartmentRepository departmentRepository;
  private final MedicalRecordRepository medicalRecordRepository;
  private final AuditLogService auditLogService;

  public InventoryWriteService(
      InventoryItemRepository itemRepository,
      InventoryLotRepository lotRepository,
      InventoryMovementRepository movementRepository,
      DepartmentRepository departmentRepository,
      MedicalRecordRepository medicalRecordRepository,
      AuditLogService auditLogService) {
    this.itemRepository = itemRepository;
    this.lotRepository = lotRepository;
    this.movementRepository = movementRepository;
    this.departmentRepository = departmentRepository;
    this.medicalRecordRepository = medicalRecordRepository;
    this.auditLogService = auditLogService;
  }

  @Transactional
  public InventoryItemResponse createItem(InventoryItemCreateRequest request) {
    var entity = new InventoryItemEntity();
    entity.setSku(request.sku());
    entity.setItemName(request.itemName());
    entity.setCategory(request.category());
    entity.setUnit(request.unit());
    entity.setReorderLevel(request.reorderLevel());
    entity.setQuantityOnHand(request.quantityOnHand());
    entity.setStatus(toStockStatus(request.quantityOnHand(), request.reorderLevel()));

    if (request.departmentId() != null) {
      var dept = departmentRepository.findById(request.departmentId())
          .orElseThrow(() -> new NotFoundException("Department not found"));
      entity.setDepartment(dept);
    }
    entity.setStatus(toStockStatus(entity.getQuantityOnHand(), entity.getReorderLevel()));

    var saved = itemRepository.save(entity);
    recordInventoryAudit("INVENTORY_ITEM_CREATED", saved, Map.of(
        "sku", saved.getSku(),
        "quantityOnHand", saved.getQuantityOnHand(),
        "reorderLevel", saved.getReorderLevel(),
        "status", saved.getStatus()));
    return toItemResponse(saved);
  }

  @Transactional
  public InventoryItemResponse updateItem(UUID itemId, InventoryItemUpdateRequest request) {
    var entity = itemRepository.findById(itemId)
        .orElseThrow(() -> new NotFoundException("Inventory item not found"));

    if (request.itemName() != null) {
      entity.setItemName(request.itemName());
    }
    if (request.category() != null) {
      entity.setCategory(request.category());
    }
    if (request.unit() != null) {
      entity.setUnit(request.unit());
    }
    if (request.reorderLevel() != null) {
      entity.setReorderLevel(request.reorderLevel());
    }
    if (request.departmentId() != null) {
      var dept = departmentRepository.findById(request.departmentId())
          .orElseThrow(() -> new NotFoundException("Department not found"));
      entity.setDepartment(dept);
    }
    entity.setStatus(toStockStatus(entity.getQuantityOnHand(), entity.getReorderLevel()));

    var saved = itemRepository.save(entity);
    recordInventoryAudit("INVENTORY_ITEM_UPDATED", saved, Map.of(
        "sku", saved.getSku(),
        "quantityOnHand", saved.getQuantityOnHand(),
        "reorderLevel", saved.getReorderLevel(),
        "status", saved.getStatus()));
    return toItemResponse(saved);
  }

  @Transactional
  public void deleteItem(UUID itemId) {
    if (!itemRepository.existsById(itemId)) {
      throw new NotFoundException("Inventory item not found");
    }
    itemRepository.deleteById(itemId);
    auditLogService.record("INVENTORY_ITEM_DELETED", "INVENTORY_ITEM", itemId, Map.of());
  }

  @Transactional
  public InventoryLotResponse createLot(InventoryLotCreateRequest request) {
    var item = itemRepository.findById(request.itemId())
        .orElseThrow(() -> new NotFoundException("Inventory item not found"));

    var entity = new InventoryLotEntity();
    entity.setItem(item);
    entity.setLotCode(request.lotCode());
    entity.setSupplierName(request.supplierName());
    entity.setQuantityReceived(request.quantityReceived());
    entity.setQuantityRemaining(request.quantityReceived());
    entity.setExpiresOn(request.expiresOn());

    var saved = lotRepository.save(entity);
    auditLogService.record("INVENTORY_LOT_CREATED", "INVENTORY_LOT", saved.getId(), Map.of(
        "itemId", item.getId().toString(),
        "lotCode", saved.getLotCode(),
        "quantityRemaining", saved.getQuantityRemaining()));
    return toLotResponse(saved);
  }

  @Transactional
  public InventoryLotResponse updateLot(UUID lotId, InventoryLotUpdateRequest request) {
    var entity = lotRepository.findById(lotId)
        .orElseThrow(() -> new NotFoundException("Inventory lot not found"));

    if (request.supplierName() != null) {
      entity.setSupplierName(request.supplierName());
    }
    if (request.quantityRemaining() != null) {
      validateLotQuantityRemaining(request.quantityRemaining(), entity.getQuantityReceived());
      entity.setQuantityRemaining(request.quantityRemaining());
    }

    var saved = lotRepository.save(entity);
    auditLogService.record("INVENTORY_LOT_UPDATED", "INVENTORY_LOT", saved.getId(), Map.of(
        "itemId", saved.getItem().getId().toString(),
        "lotCode", saved.getLotCode(),
        "quantityRemaining", saved.getQuantityRemaining()));
    return toLotResponse(saved);
  }

  @Transactional
  public InventoryMovementResponse recordMovement(InventoryMovementCreateRequest request) {
    var item = itemRepository.findById(request.itemId())
        .orElseThrow(() -> new NotFoundException("Inventory item not found"));
    var nextQuantityOnHand = item.getQuantityOnHand() + request.quantityDelta();
    if (nextQuantityOnHand < 0) {
      throw new ConflictException("Inventory movement cannot make quantity on hand negative");
    }

    var entity = new InventoryMovementEntity();
    entity.setItem(item);
    entity.setMovementType(request.movementType());
    entity.setQuantityDelta(request.quantityDelta());
    entity.setNote(request.note());
    movementRepository.save(entity);

    // Update item quantity on hand
    item.setQuantityOnHand(nextQuantityOnHand);
    item.setLastRestockedAt(request.quantityDelta() > 0 ? Instant.now() : item.getLastRestockedAt());
    item.setStatus(toStockStatus(item.getQuantityOnHand(), item.getReorderLevel()));
    itemRepository.save(item);
    recordInventoryAudit("INVENTORY_MOVEMENT_RECORDED", item, Map.of(
        "movementId", entity.getId().toString(),
        "movementType", entity.getMovementType(),
        "quantityDelta", entity.getQuantityDelta(),
        "quantityOnHand", item.getQuantityOnHand(),
        "status", item.getStatus()));

    return toMovementResponse(entity);
  }

  @Transactional
  public InventoryDispenseResponse dispenseMedication(InventoryDispenseRequest request) {
    if (request.quantity() == null || request.quantity() <= 0) {
      throw new ConflictException("Dispense quantity must be greater than zero");
    }

    var item = itemRepository.findById(request.itemId())
        .orElseThrow(() -> new NotFoundException("Inventory item not found"));
    var lot = lotRepository.findById(request.lotId())
        .orElseThrow(() -> new NotFoundException("Inventory lot not found"));
    if (!lot.getItem().getId().equals(item.getId())) {
      throw new ConflictException("Inventory lot does not belong to the selected item");
    }

    var record = medicalRecordRepository.findDetailedById(request.medicalRecordId())
        .orElseThrow(() -> new NotFoundException("Medical record not found"));
    var prescriptionItem = findPrescriptionItem(record, request.prescriptionItemName());

    if (lot.getQuantityRemaining() < request.quantity()) {
      throw new ConflictException("Inventory lot does not have enough quantity remaining");
    }
    if (item.getQuantityOnHand() < request.quantity()) {
      throw new ConflictException("Inventory item does not have enough quantity on hand");
    }

    lot.setQuantityRemaining(lot.getQuantityRemaining() - request.quantity());
    item.setQuantityOnHand(item.getQuantityOnHand() - request.quantity());
    item.setStatus(toStockStatus(item.getQuantityOnHand(), item.getReorderLevel()));

    var movement = new InventoryMovementEntity();
    movement.setItem(item);
    movement.setLot(lot);
    movement.setMedicalRecord(record);
    movement.setMovementType("DISPENSE");
    movement.setQuantityDelta(-request.quantity());
    movement.setPrescriptionItemName(prescriptionItem.getMedicineName());
    movement.setDispensedToPatient(record.getAppointment().getPatient().getFullName());
    movement.setNote(dispenseNote(request, lot, record));
    movementRepository.save(movement);
    lotRepository.save(lot);
    itemRepository.save(item);

    recordInventoryAudit("PHARMACY_MEDICATION_DISPENSED", item, Map.of(
        "movementId", movement.getId().toString(),
        "lotId", lot.getId().toString(),
        "lotCode", lot.getLotCode(),
        "medicalRecordId", record.getId().toString(),
        "prescriptionItemName", prescriptionItem.getMedicineName(),
        "quantityDispensed", request.quantity(),
        "quantityOnHand", item.getQuantityOnHand(),
        "lotQuantityRemaining", lot.getQuantityRemaining(),
        "status", item.getStatus()));

    return new InventoryDispenseResponse(
        movement.getId(),
        item.getId(),
        item.getItemName(),
        lot.getId(),
        lot.getLotCode(),
        record.getId(),
        prescriptionItem.getMedicineName(),
        request.quantity(),
        item.getQuantityOnHand(),
        lot.getQuantityRemaining(),
        movement.getNote(),
        movement.getCreatedAt());
  }

  private PrescriptionItemEntity findPrescriptionItem(MedicalRecordEntity record, String medicineName) {
    var normalized = normalize(medicineName);
    return record.getPrescriptionItems().stream()
        .filter(item -> normalize(item.getMedicineName()).equals(normalized))
        .findFirst()
        .orElseThrow(() -> new ConflictException("Prescription item is not present on the selected medical record"));
  }

  private String dispenseNote(InventoryDispenseRequest request, InventoryLotEntity lot, MedicalRecordEntity record) {
    var note = request.note() == null ? "" : request.note().trim();
    var trace = "lot=" + lot.getLotCode() + ", medicalRecordId=" + record.getId();
    return note.isBlank() ? trace : note + " (" + trace + ")";
  }

  private String normalize(String value) {
    return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
  }

  private String toStockStatus(int quantityOnHand, int reorderLevel) {
    if (quantityOnHand <= 0) {
      return "OUT_OF_STOCK";
    }

    if (quantityOnHand <= reorderLevel) {
      return "LOW_STOCK";
    }

    return "IN_STOCK";
  }

  private void validateLotQuantityRemaining(int quantityRemaining, int quantityReceived) {
    if (quantityRemaining < 0) {
      throw new ConflictException("Quantity remaining cannot be negative");
    }

    if (quantityRemaining > quantityReceived) {
      throw new ConflictException("Quantity remaining cannot exceed quantity received");
    }
  }

  private void recordInventoryAudit(
      String action,
      InventoryItemEntity item,
      Map<String, Object> metadata) {
    auditLogService.record(action, "INVENTORY_ITEM", item.getId(), metadata);
  }

  private InventoryItemResponse toItemResponse(InventoryItemEntity entity) {
    return new InventoryItemResponse(
        entity.getId(),
        entity.getSku(),
        entity.getItemName(),
        entity.getCategory(),
        entity.getUnit(),
        entity.getReorderLevel(),
        entity.getQuantityOnHand(),
        entity.getStatus(),
        entity.getDepartment() == null ? null : entity.getDepartment().getName(),
        entity.getLastRestockedAt());
  }

  private InventoryLotResponse toLotResponse(InventoryLotEntity entity) {
    return new InventoryLotResponse(
        entity.getId(),
        entity.getItem().getId(),
        entity.getItem().getItemName(),
        entity.getLotCode(),
        entity.getSupplierName(),
        entity.getQuantityReceived(),
        entity.getQuantityRemaining(),
        entity.getExpiresOn());
  }

  private InventoryMovementResponse toMovementResponse(InventoryMovementEntity entity) {
    return new InventoryMovementResponse(
        entity.getId(),
        entity.getItem().getId(),
        entity.getItem().getItemName(),
        entity.getMovementType(),
        entity.getQuantityDelta(),
        entity.getNote(),
        entity.getCreatedAt());
  }
}
