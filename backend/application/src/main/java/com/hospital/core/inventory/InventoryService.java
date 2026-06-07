package com.hospital.core.inventory;

import com.hospital.shared.inventory.InventoryAlertResponse;
import com.hospital.shared.inventory.InventoryItemResponse;
import com.hospital.shared.inventory.InventoryLotResponse;
import com.hospital.shared.inventory.InventoryMovementResponse;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Stream;
import io.micrometer.core.instrument.Metrics;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService {
  private static final int EXPIRY_WARNING_DAYS = 30;

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

  @Transactional(readOnly = true)
  public List<InventoryAlertResponse> listAlerts(LocalDate asOfDate) {
    var effectiveDate = asOfDate == null ? LocalDate.now() : asOfDate;
    var lowStockAlerts = inventoryItemRepository.findAllByOrderByItemNameAsc().stream()
        .filter(this::isLowStock)
        .map(this::toLowStockAlert)
        .toList();
    var expiryAlerts = inventoryLotRepository.findAllByOrderByExpiresOnAsc().stream()
        .filter(lot -> isExpiryWarning(lot, effectiveDate))
        .map(lot -> toExpiryAlert(lot, effectiveDate))
        .toList();

    var alerts = Stream.concat(lowStockAlerts.stream(), expiryAlerts.stream()).toList();
    recordAlertMetrics(alerts);
    return alerts;
  }

  private void recordAlertMetrics(List<InventoryAlertResponse> alerts) {
    var criticalCount = alerts.stream().filter(alert -> "CRITICAL".equalsIgnoreCase(alert.severity())).count();
    var warningCount = alerts.stream().filter(alert -> "WARNING".equalsIgnoreCase(alert.severity())).count();
    Metrics.counter("hms.inventory.alerts.evaluated", "severity", "CRITICAL").increment(criticalCount);
    Metrics.counter("hms.inventory.alerts.evaluated", "severity", "WARNING").increment(warningCount);
  }

  private boolean isLowStock(InventoryItemEntity item) {
    return item.getQuantityOnHand() <= item.getReorderLevel()
        || !"IN_STOCK".equalsIgnoreCase(item.getStatus());
  }

  private InventoryAlertResponse toLowStockAlert(InventoryItemEntity item) {
    var severity = item.getQuantityOnHand() <= 0 ? "CRITICAL" : "WARNING";
    return new InventoryAlertResponse(
        "LOW_STOCK",
        severity,
        item.getId(),
        item.getItemName(),
        null,
        null,
        item.getQuantityOnHand(),
        item.getReorderLevel(),
        null,
        null,
        item.getItemName() + " is at or below reorder level");
  }

  private boolean isExpiryWarning(InventoryLotEntity lot, LocalDate asOfDate) {
    if (lot.getExpiresOn() == null || lot.getQuantityRemaining() <= 0) {
      return false;
    }

    return ChronoUnit.DAYS.between(asOfDate, lot.getExpiresOn()) <= EXPIRY_WARNING_DAYS;
  }

  private InventoryAlertResponse toExpiryAlert(InventoryLotEntity lot, LocalDate asOfDate) {
    var daysUntilExpiry = Math.toIntExact(ChronoUnit.DAYS.between(asOfDate, lot.getExpiresOn()));
    return new InventoryAlertResponse(
        daysUntilExpiry < 0 ? "EXPIRED" : "EXPIRING_SOON",
        daysUntilExpiry < 0 ? "CRITICAL" : "WARNING",
        lot.getItem().getId(),
        lot.getItem().getItemName(),
        lot.getId(),
        lot.getLotCode(),
        lot.getItem().getQuantityOnHand(),
        lot.getItem().getReorderLevel(),
        lot.getExpiresOn(),
        daysUntilExpiry,
        lot.getLotCode() + " expires on " + lot.getExpiresOn());
  }
}
