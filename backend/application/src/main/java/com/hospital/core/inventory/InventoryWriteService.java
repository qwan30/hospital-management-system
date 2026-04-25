package com.hospital.core.inventory;

import com.hospital.core.common.NotFoundException;
import com.hospital.core.department.DepartmentRepository;
import com.hospital.shared.inventory.InventoryItemCreateRequest;
import com.hospital.shared.inventory.InventoryItemResponse;
import com.hospital.shared.inventory.InventoryItemUpdateRequest;
import com.hospital.shared.inventory.InventoryLotCreateRequest;
import com.hospital.shared.inventory.InventoryLotResponse;
import com.hospital.shared.inventory.InventoryLotUpdateRequest;
import com.hospital.shared.inventory.InventoryMovementCreateRequest;
import com.hospital.shared.inventory.InventoryMovementResponse;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryWriteService {
  private final InventoryItemRepository itemRepository;
  private final InventoryLotRepository lotRepository;
  private final InventoryMovementRepository movementRepository;
  private final DepartmentRepository departmentRepository;

  public InventoryWriteService(
      InventoryItemRepository itemRepository,
      InventoryLotRepository lotRepository,
      InventoryMovementRepository movementRepository,
      DepartmentRepository departmentRepository) {
    this.itemRepository = itemRepository;
    this.lotRepository = lotRepository;
    this.movementRepository = movementRepository;
    this.departmentRepository = departmentRepository;
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
    entity.setStatus(request.quantityOnHand() > 0 ? "IN_STOCK" : "OUT_OF_STOCK");

    if (request.departmentId() != null) {
      var dept = departmentRepository.findById(request.departmentId())
          .orElseThrow(() -> new NotFoundException("Department not found"));
      entity.setDepartment(dept);
    }

    var saved = itemRepository.save(entity);
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

    var saved = itemRepository.save(entity);
    return toItemResponse(saved);
  }

  @Transactional
  public void deleteItem(UUID itemId) {
    if (!itemRepository.existsById(itemId)) {
      throw new NotFoundException("Inventory item not found");
    }
    itemRepository.deleteById(itemId);
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
      entity.setQuantityRemaining(request.quantityRemaining());
    }

    var saved = lotRepository.save(entity);
    return toLotResponse(saved);
  }

  @Transactional
  public InventoryMovementResponse recordMovement(InventoryMovementCreateRequest request) {
    var item = itemRepository.findById(request.itemId())
        .orElseThrow(() -> new NotFoundException("Inventory item not found"));

    var entity = new InventoryMovementEntity();
    entity.setItem(item);
    entity.setMovementType(request.movementType());
    entity.setQuantityDelta(request.quantityDelta());
    entity.setNote(request.note());
    movementRepository.save(entity);

    // Update item quantity on hand
    item.setQuantityOnHand(item.getQuantityOnHand() + request.quantityDelta());
    item.setLastRestockedAt(request.quantityDelta() > 0 ? Instant.now() : item.getLastRestockedAt());
    item.setStatus(item.getQuantityOnHand() > 0 ? "IN_STOCK"
        : item.getQuantityOnHand() <= item.getReorderLevel() ? "LOW_STOCK" : "OUT_OF_STOCK");
    itemRepository.save(item);

    return toMovementResponse(entity);
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
