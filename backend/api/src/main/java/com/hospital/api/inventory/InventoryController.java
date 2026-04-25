package com.hospital.api.inventory;

import com.hospital.core.inventory.InventoryService;
import com.hospital.core.inventory.InventoryWriteService;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.inventory.InventoryItemCreateRequest;
import com.hospital.shared.inventory.InventoryItemResponse;
import com.hospital.shared.inventory.InventoryItemUpdateRequest;
import com.hospital.shared.inventory.InventoryLotCreateRequest;
import com.hospital.shared.inventory.InventoryLotResponse;
import com.hospital.shared.inventory.InventoryLotUpdateRequest;
import com.hospital.shared.inventory.InventoryMovementCreateRequest;
import com.hospital.shared.inventory.InventoryMovementResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/inventory")
@PreAuthorize("hasAnyRole('ACCOUNTANT','ADMIN')")
public class InventoryController {
  private final InventoryService inventoryService;
  private final InventoryWriteService inventoryWriteService;

  public InventoryController(InventoryService inventoryService, InventoryWriteService inventoryWriteService) {
    this.inventoryService = inventoryService;
    this.inventoryWriteService = inventoryWriteService;
  }

  @GetMapping("/items")
  public ApiResponse<List<InventoryItemResponse>> listItems() {
    return ApiResponse.ok(inventoryService.listItems());
  }

  @PostMapping("/items")
  public ResponseEntity<ApiResponse<InventoryItemResponse>> createItem(@Valid @RequestBody InventoryItemCreateRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(inventoryWriteService.createItem(request)));
  }

  @PutMapping("/items/{itemId}")
  public ApiResponse<InventoryItemResponse> updateItem(@PathVariable UUID itemId, @Valid @RequestBody InventoryItemUpdateRequest request) {
    return ApiResponse.ok(inventoryWriteService.updateItem(itemId, request));
  }

  @DeleteMapping("/items/{itemId}")
  public ResponseEntity<Void> deleteItem(@PathVariable UUID itemId) {
    inventoryWriteService.deleteItem(itemId);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/lots")
  public ApiResponse<List<InventoryLotResponse>> listLots() {
    return ApiResponse.ok(inventoryService.listLots());
  }

  @PostMapping("/lots")
  public ResponseEntity<ApiResponse<InventoryLotResponse>> createLot(@Valid @RequestBody InventoryLotCreateRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(inventoryWriteService.createLot(request)));
  }

  @PutMapping("/lots/{lotId}")
  public ApiResponse<InventoryLotResponse> updateLot(@PathVariable UUID lotId, @Valid @RequestBody InventoryLotUpdateRequest request) {
    return ApiResponse.ok(inventoryWriteService.updateLot(lotId, request));
  }

  @GetMapping("/movements")
  public ApiResponse<List<InventoryMovementResponse>> listMovements() {
    return ApiResponse.ok(inventoryService.listMovements());
  }

  @PostMapping("/movements")
  public ResponseEntity<ApiResponse<InventoryMovementResponse>> recordMovement(@Valid @RequestBody InventoryMovementCreateRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(inventoryWriteService.recordMovement(request)));
  }
}
