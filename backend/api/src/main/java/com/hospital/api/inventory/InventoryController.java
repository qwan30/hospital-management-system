package com.hospital.api.inventory;

import com.hospital.core.inventory.InventoryService;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.inventory.InventoryItemResponse;
import com.hospital.shared.inventory.InventoryLotResponse;
import com.hospital.shared.inventory.InventoryMovementResponse;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/inventory")
@PreAuthorize("hasAnyRole('ACCOUNTANT','ADMIN')")
public class InventoryController {
  private final InventoryService inventoryService;

  public InventoryController(InventoryService inventoryService) {
    this.inventoryService = inventoryService;
  }

  @GetMapping("/items")
  public ApiResponse<List<InventoryItemResponse>> listItems() {
    return ApiResponse.ok(inventoryService.listItems());
  }

  @GetMapping("/lots")
  public ApiResponse<List<InventoryLotResponse>> listLots() {
    return ApiResponse.ok(inventoryService.listLots());
  }

  @GetMapping("/movements")
  public ApiResponse<List<InventoryMovementResponse>> listMovements() {
    return ApiResponse.ok(inventoryService.listMovements());
  }
}
