package com.hospital.core.inventory;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {
  @Mock private InventoryItemRepository itemRepository;
  @Mock private InventoryLotRepository lotRepository;
  @Mock private InventoryMovementRepository movementRepository;

  private InventoryService service;

  @BeforeEach
  void setUp() {
    service = new InventoryService(itemRepository, lotRepository, movementRepository);
  }

  @Test
  void listAlertsReturnsLowStockAndExpiringLotWarnings() {
    var lowStockItem = item("MED-001", "Paracetamol", 8, 10, "IN_STOCK");
    var healthyItem = item("MED-002", "Ibuprofen", 80, 10, "IN_STOCK");
    var expiringLot = lot(lowStockItem, "LOT-A", 12, LocalDate.of(2026, 5, 10));
    var emptyExpiringLot = lot(lowStockItem, "LOT-B", 0, LocalDate.of(2026, 5, 11));
    var farExpiryLot = lot(healthyItem, "LOT-C", 30, LocalDate.of(2026, 9, 1));

    when(itemRepository.findAllByOrderByItemNameAsc()).thenReturn(List.of(healthyItem, lowStockItem));
    when(lotRepository.findAllByOrderByExpiresOnAsc()).thenReturn(List.of(expiringLot, emptyExpiringLot, farExpiryLot));

    var alerts = service.listAlerts(LocalDate.of(2026, 4, 26));

    assertThat(alerts).hasSize(2);
    assertThat(alerts)
        .extracting("alertType")
        .containsExactly("LOW_STOCK", "EXPIRING_SOON");
    assertThat(alerts.get(0).itemName()).isEqualTo("Paracetamol");
    assertThat(alerts.get(0).quantityOnHand()).isEqualTo(8);
    assertThat(alerts.get(1).lotCode()).isEqualTo("LOT-A");
    assertThat(alerts.get(1).daysUntilExpiry()).isEqualTo(14);
  }

  private InventoryItemEntity item(
      String sku,
      String itemName,
      int quantityOnHand,
      int reorderLevel,
      String status) {
    var item = new InventoryItemEntity();
    item.setId(UUID.randomUUID());
    item.setSku(sku);
    item.setItemName(itemName);
    item.setCategory("Medicine");
    item.setUnit("tablet");
    item.setQuantityOnHand(quantityOnHand);
    item.setReorderLevel(reorderLevel);
    item.setStatus(status);
    return item;
  }

  private InventoryLotEntity lot(
      InventoryItemEntity item,
      String lotCode,
      int quantityRemaining,
      LocalDate expiresOn) {
    var lot = new InventoryLotEntity();
    lot.setId(UUID.randomUUID());
    lot.setItem(item);
    lot.setLotCode(lotCode);
    lot.setQuantityReceived(quantityRemaining);
    lot.setQuantityRemaining(quantityRemaining);
    lot.setExpiresOn(expiresOn);
    return lot;
  }
}
