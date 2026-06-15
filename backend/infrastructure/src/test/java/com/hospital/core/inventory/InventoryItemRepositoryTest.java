package com.hospital.core.inventory;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class InventoryItemRepositoryTest {

  @Autowired
  private InventoryItemRepository inventoryItemRepository;

  @Autowired
  private TestEntityManager entityManager;

  @Test
  void findAllByOrderByItemNameAsc_noItemsReturnsEmptyList() {
    var items = inventoryItemRepository.findAllByOrderByItemNameAsc();

    assertThat(items).isEmpty();
  }

  @Test
  void findBySku_nonExistentSkuReturnsEmpty() {
    var result = inventoryItemRepository.findBySku("NONEXISTENT-SKU-999");

    assertThat(result).isEmpty();
  }

  @Test
  void persistAndRetrieveItem_verifyFieldsMatch() {
    var item = new InventoryItemEntity();
    item.setId(UUID.randomUUID());
    item.setSku("MED-001");
    item.setItemName("Paracetamol 500mg");
    item.setCategory("Medicine");
    item.setUnit("tablet");
    item.setReorderLevel(10);
    item.setQuantityOnHand(100);
    item.setStatus("IN_STOCK");

    entityManager.persist(item);
    entityManager.flush();

    var saved = inventoryItemRepository.findById(item.getId()).orElseThrow();

    assertThat(saved.getSku()).isEqualTo("MED-001");
    assertThat(saved.getItemName()).isEqualTo("Paracetamol 500mg");
    assertThat(saved.getCategory()).isEqualTo("Medicine");
    assertThat(saved.getUnit()).isEqualTo("tablet");
    assertThat(saved.getReorderLevel()).isEqualTo(10);
    assertThat(saved.getQuantityOnHand()).isEqualTo(100);
    assertThat(saved.getStatus()).isEqualTo("IN_STOCK");
    assertThat(saved.getId()).isEqualTo(item.getId());
    assertThat(saved.getCreatedAt()).isNotNull();
    assertThat(saved.getUpdatedAt()).isNotNull();
  }

  @Test
  void findAllByOrderByItemNameAsc_withItemsReturnsSortedList() {
    var itemB = new InventoryItemEntity();
    itemB.setId(UUID.randomUUID());
    itemB.setSku("MED-002");
    itemB.setItemName("Ibuprofen 200mg");
    itemB.setCategory("Medicine");
    itemB.setUnit("tablet");
    itemB.setReorderLevel(10);
    itemB.setQuantityOnHand(50);
    itemB.setStatus("IN_STOCK");
    entityManager.persist(itemB);

    var itemA = new InventoryItemEntity();
    itemA.setId(UUID.randomUUID());
    itemA.setSku("MED-001");
    itemA.setItemName("Amoxicillin 500mg");
    itemA.setCategory("Medicine");
    itemA.setUnit("capsule");
    itemA.setReorderLevel(20);
    itemA.setQuantityOnHand(200);
    itemA.setStatus("IN_STOCK");
    entityManager.persist(itemA);
    entityManager.flush();

    var items = inventoryItemRepository.findAllByOrderByItemNameAsc();

    assertThat(items).hasSize(2);
    assertThat(items.get(0).getItemName()).isEqualTo("Amoxicillin 500mg");
    assertThat(items.get(1).getItemName()).isEqualTo("Ibuprofen 200mg");
  }

  @Test
  void findBySku_existingSkuReturnsItem() {
    var item = new InventoryItemEntity();
    item.setId(UUID.randomUUID());
    item.setSku("MED-UNIQUE-001");
    item.setItemName("Unique Test Item");
    item.setCategory("Supply");
    item.setUnit("piece");
    item.setReorderLevel(5);
    item.setQuantityOnHand(25);
    item.setStatus("IN_STOCK");
    entityManager.persist(item);
    entityManager.flush();

    var result = inventoryItemRepository.findBySku("MED-UNIQUE-001");

    assertThat(result).isPresent();
    assertThat(result.get().getItemName()).isEqualTo("Unique Test Item");
  }
}
