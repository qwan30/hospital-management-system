package com.hospital.api;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

/**
 * Tests for inventory management endpoints:
 * - GET    /api/v1/inventory/items
 * - POST   /api/v1/inventory/items
 * - PUT    /api/v1/inventory/items/{itemId}
 * - DELETE /api/v1/inventory/items/{itemId}
 * - GET    /api/v1/inventory/lots
 * - POST   /api/v1/inventory/lots
 * - PUT    /api/v1/inventory/lots/{lotId}
 * - GET    /api/v1/inventory/movements
 * - POST   /api/v1/inventory/movements
 * - GET    /api/v1/inventory/alerts
 */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class InventoryIntegrationTest extends AbstractIntegrationTest {

  // ── Items ─────────────────────────────────────────────────────────────

  @Test
  void listItemsRequiresAuthentication() throws Exception {
    mockMvc.perform(get("/api/v1/inventory/items"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void listItemsReturnsSeededItems() throws Exception {
    mockMvc.perform(get("/api/v1/inventory/items")
            .header("Authorization", "Bearer " + pharmacistToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(3))));
  }

  @Test
  void createItemSucceeds() throws Exception {
    var deptId = departmentRepository.findAllByOrderByNameAsc().get(0).getId();

    mockMvc.perform(post("/api/v1/inventory/items")
            .header("Authorization", "Bearer " + adminToken())
            .contentType("application/json")
            .content("""
                {
                  "sku": "TEST-ITEM-001",
                  "itemName": "Test Bandage Roll",
                  "category": "Consumable",
                  "unit": "roll",
                  "reorderLevel": 20,
                  "quantityOnHand": 100,
                  "departmentId": "%s"
                }
                """.formatted(deptId)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.data.sku").value("TEST-ITEM-001"))
        .andExpect(jsonPath("$.data.itemName").value("Test Bandage Roll"));
  }

  @Test
  void createItemFailsWithMissingSku() throws Exception {
    mockMvc.perform(post("/api/v1/inventory/items")
            .header("Authorization", "Bearer " + adminToken())
            .contentType("application/json")
            .content("""
                {
                  "itemName": "No SKU Item",
                  "category": "Test",
                  "unit": "pcs",
                  "reorderLevel": 10
                }
                """))
        .andExpect(status().isBadRequest());
  }

  @Test
  void updateItemSucceeds() throws Exception {
    var items = inventoryItemRepository.findAll();
    if (!items.isEmpty()) {
      var itemId = items.get(0).getId();

      mockMvc.perform(put("/api/v1/inventory/items/{itemId}", itemId)
              .header("Authorization", "Bearer " + adminToken())
              .contentType("application/json")
              .content("""
                  {
                    "itemName": "%s (Updated)",
                    "category": "%s",
                    "unit": "%s",
                    "reorderLevel": 25
                  }
                  """.formatted(items.get(0).getItemName(), items.get(0).getCategory(),
                  items.get(0).getUnit())))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.data.reorderLevel").value(25));
    }
  }

  @Test
  void deleteItemReturnsNoContent() throws Exception {
    var deptId = departmentRepository.findAllByOrderByNameAsc().get(0).getId();

    var createResult = mockMvc.perform(post("/api/v1/inventory/items")
            .header("Authorization", "Bearer " + adminToken())
            .contentType("application/json")
            .content("""
                {
                  "sku": "DEL-TEST-001",
                  "itemName": "Item to Delete",
                  "category": "Equipment",
                  "unit": "unit",
                  "reorderLevel": 5,
                  "quantityOnHand": 10,
                  "departmentId": "%s"
                }
                """.formatted(deptId)))
        .andExpect(status().isCreated())
        .andReturn();

    var itemId = objectMapper.readTree(createResult.getResponse().getContentAsString())
        .get("data").get("itemId").asText();

    mockMvc.perform(delete("/api/v1/inventory/items/{itemId}", itemId)
            .header("Authorization", "Bearer " + adminToken()))
        .andExpect(status().isNoContent());
  }

  // ── Lots ──────────────────────────────────────────────────────────────

  @Test
  void listLotsReturnsSeededLots() throws Exception {
    mockMvc.perform(get("/api/v1/inventory/lots")
            .header("Authorization", "Bearer " + pharmacistToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(3))));
  }

  @Test
  void createLotSucceeds() throws Exception {
    var items = inventoryItemRepository.findAll();
    if (!items.isEmpty()) {
      mockMvc.perform(post("/api/v1/inventory/lots")
              .header("Authorization", "Bearer " + adminToken())
              .contentType("application/json")
              .content("""
                  {
                    "itemId": "%s",
                    "lotCode": "LOT-TEST-001",
                    "supplierName": "Test Supplier",
                    "quantityReceived": 50,
                    "expiresOn": "2027-12-31"
                  }
                  """.formatted(items.get(0).getId())))
          .andExpect(status().isCreated())
          .andExpect(jsonPath("$.data.lotCode").value("LOT-TEST-001"));
    }
  }

  // ── Movements ─────────────────────────────────────────────────────────

  @Test
  void listMovementsReturnsSeededMovements() throws Exception {
    mockMvc.perform(get("/api/v1/inventory/movements")
            .header("Authorization", "Bearer " + pharmacistToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(3))));
  }

  @Test
  void recordMovementSucceeds() throws Exception {
    var items = inventoryItemRepository.findAll();
    if (!items.isEmpty()) {
      mockMvc.perform(post("/api/v1/inventory/movements")
              .header("Authorization", "Bearer " + adminToken())
              .contentType("application/json")
              .content("""
                  {
                    "itemId": "%s",
                    "movementType": "RESTOCK",
                    "quantityDelta": 20,
                    "note": "Test restock movement"
                  }
                  """.formatted(items.get(0).getId())))
          .andExpect(status().isCreated())
          .andExpect(jsonPath("$.data.movementType").value("RESTOCK"));
    }
  }

  // ── Alerts ────────────────────────────────────────────────────────────

  @Test
  void alertsListReturnsProperly() throws Exception {
    mockMvc.perform(get("/api/v1/inventory/alerts")
            .header("Authorization", "Bearer " + pharmacistToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data").isArray());
  }

  // ── RBAC ──────────────────────────────────────────────────────────────

  @Test
  void doctorCannotManageInventory() throws Exception {
    mockMvc.perform(post("/api/v1/inventory/items")
            .header("Authorization", "Bearer " + doctorOneToken())
            .contentType("application/json")
            .content("""
                {
                  "sku": "UNAUTH-001",
                  "itemName": "Unauthorized Item",
                  "category": "Test",
                  "unit": "pcs",
                  "reorderLevel": 5
                }
                """))
        .andExpect(status().isForbidden());
  }
}
