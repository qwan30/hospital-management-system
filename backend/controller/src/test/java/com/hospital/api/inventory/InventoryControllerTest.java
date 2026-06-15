package com.hospital.api.inventory;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.hospital.api.config.RestExceptionHandler;
import com.hospital.core.common.ConflictException;
import com.hospital.core.common.NotFoundException;
import com.hospital.core.inventory.InventoryService;
import com.hospital.core.inventory.InventoryWriteService;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class InventoryControllerTest {

  private MockMvc mockMvc;
  private InventoryWriteService inventoryWriteService;

  @BeforeEach
  void setUp() {
    var inventoryService = mock(InventoryService.class);
    inventoryWriteService = mock(InventoryWriteService.class);

    mockMvc = MockMvcBuilders.standaloneSetup(
            new InventoryController(inventoryService, inventoryWriteService))
        .setControllerAdvice(new RestExceptionHandler())
        .build();
  }

  @Nested
  class CreateItem {

    @Test
    void emptyBodyReturns400() throws Exception {
      mockMvc.perform(post("/api/v1/inventory/items")
              .contentType(MediaType.APPLICATION_JSON)
              .content(""))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("validation_error"));
    }

    @Test
    void missingRequiredFieldsReturns400() throws Exception {
      mockMvc.perform(post("/api/v1/inventory/items")
              .contentType(MediaType.APPLICATION_JSON)
              .content("{}"))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("validation_error"));
    }

    @Test
    void blankRequiredFieldsReturns400() throws Exception {
      mockMvc.perform(post("/api/v1/inventory/items")
              .contentType(MediaType.APPLICATION_JSON)
              .content("""
                  {
                    "sku": "",
                    "itemName": "",
                    "category": "",
                    "unit": "",
                    "reorderLevel": -1
                  }
                  """))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("validation_error"));
    }
  }

  @Nested
  class RecordMovement {

    @Test
    void emptyBodyReturns400() throws Exception {
      mockMvc.perform(post("/api/v1/inventory/movements")
              .contentType(MediaType.APPLICATION_JSON)
              .content(""))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("validation_error"));
    }

    @Test
    void missingRequiredFieldsReturns400() throws Exception {
      mockMvc.perform(post("/api/v1/inventory/movements")
              .contentType(MediaType.APPLICATION_JSON)
              .content("{}"))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("validation_error"));
    }

    @Test
    void negativeDeltaCausingInsufficientStockReturns409() throws Exception {
      when(inventoryWriteService.recordMovement(any()))
          .thenThrow(new ConflictException("Inventory movement cannot make quantity on hand negative"));

      mockMvc.perform(post("/api/v1/inventory/movements")
              .contentType(MediaType.APPLICATION_JSON)
              .content("""
                  {
                    "itemId": "%s",
                    "movementType": "OUT",
                    "quantityDelta": -999
                  }
                  """.formatted(UUID.randomUUID())))
          .andExpect(status().isConflict())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("conflict"));
    }
  }

  @Nested
  class DeleteItem {

    @Test
    void nonExistentItemReturns404() throws Exception {
      var itemId = UUID.randomUUID();
      doThrow(new NotFoundException("Inventory item not found"))
          .when(inventoryWriteService).deleteItem(itemId);

      mockMvc.perform(delete("/api/v1/inventory/items/{itemId}", itemId))
          .andExpect(status().isNotFound())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("not_found"));
    }
  }
}
