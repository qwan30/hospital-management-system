package com.hospital.core.inventory;

import com.hospital.shared.inventory.InventoryItemResponse;
import com.hospital.shared.inventory.InventoryLotResponse;
import com.hospital.shared.inventory.InventoryMovementResponse;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService {
  private final InventoryItemRepository inventoryItemRepository;
  private final InventoryLotRepository inventoryLotRepository;
  private final InventoryMovementRepository inventoryMovementRepository;

  public InventoryService(
      InventoryItemRepository inventoryItemRepository,
      InventoryLotRepository inventoryLotRepository,
      InventoryMovementRepository inventoryMovementRepository) {
    this.inventoryItemRepository = inventoryItemRepository;
    this.inventoryLotRepository = inventoryLotRepository;
    this.inventoryMovementRepository = inventoryMovementRepository;
  }

  @Transactional(readOnly = true)
  public List<InventoryItemResponse> listItems() {
    return inventoryItemRepository.findAllByOrderByItemNameAsc().stream()
        .map(item -> new InventoryItemResponse(
            item.getId(),
            item.getSku(),
            item.getItemName(),
            item.getCategory(),
            item.getUnit(),
            item.getReorderLevel(),
            item.getQuantityOnHand(),
            item.getStatus(),
            item.getDepartment() == null ? null : item.getDepartment().getName(),
            item.getLastRestockedAt()))
        .toList();
  }

  @Transactional(readOnly = true)
  public List<InventoryLotResponse> listLots() {
    return inventoryLotRepository.findAllByOrderByExpiresOnAsc().stream()
        .map(lot -> new InventoryLotResponse(
            lot.getId(),
            lot.getItem().getId(),
            lot.getItem().getItemName(),
            lot.getLotCode(),
            lot.getSupplierName(),
            lot.getQuantityReceived(),
            lot.getQuantityRemaining(),
            lot.getExpiresOn()))
        .toList();
  }

  @Transactional(readOnly = true)
  public List<InventoryMovementResponse> listMovements() {
    return inventoryMovementRepository.findTop20ByOrderByCreatedAtDesc().stream()
        .map(movement -> new InventoryMovementResponse(
            movement.getId(),
            movement.getItem().getId(),
            movement.getItem().getItemName(),
            movement.getMovementType(),
            movement.getQuantityDelta(),
            movement.getNote(),
            movement.getCreatedAt()))
        .toList();
  }
}
