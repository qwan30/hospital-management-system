package com.hospital.api.admin;

import com.hospital.core.admin.OperationsAdminService;
import com.hospital.shared.admin.AdminRoomResponse;
import com.hospital.shared.admin.AdminRoomStatusRequest;
import com.hospital.shared.admin.AdminRoomUpsertRequest;
import com.hospital.shared.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
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
@RequestMapping("/api/v1/admin/rooms")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin – Rooms", description = "Room management")
public class AdminRoomController {
  private final OperationsAdminService operationsAdminService;

  public AdminRoomController(OperationsAdminService operationsAdminService) {
    this.operationsAdminService = operationsAdminService;
  }

  @GetMapping
  @Operation(summary = "List all rooms")
  public ApiResponse<List<AdminRoomResponse>> listRooms() {
    return ApiResponse.ok(operationsAdminService.listRooms());
  }

  @GetMapping("/{roomId}")
  @Operation(summary = "Get a single room by ID")
  public ApiResponse<AdminRoomResponse> getRoom(@PathVariable UUID roomId) {
    return ApiResponse.ok(operationsAdminService.getRoom(roomId));
  }

  @PostMapping
  @Operation(summary = "Create a new room")
  public ApiResponse<AdminRoomResponse> createRoom(@Valid @RequestBody AdminRoomUpsertRequest request) {
    return ApiResponse.ok(operationsAdminService.createRoom(request));
  }

  @PutMapping("/{roomId}")
  @Operation(summary = "Update room details (name, department, active)")
  public ApiResponse<AdminRoomResponse> updateRoom(
      @PathVariable UUID roomId,
      @Valid @RequestBody AdminRoomUpsertRequest request) {
    return ApiResponse.ok(operationsAdminService.updateRoom(roomId, request));
  }

  @PutMapping("/{roomId}/status")
  @Operation(summary = "Update room operational status (READY / OCCUPIED / MAINTENANCE)")
  public ApiResponse<AdminRoomResponse> updateRoomStatus(
      @PathVariable UUID roomId,
      @Valid @RequestBody AdminRoomStatusRequest request) {
    return ApiResponse.ok(operationsAdminService.updateRoomStatus(roomId, request.status()));
  }

  @DeleteMapping("/{roomId}")
  @Operation(summary = "Soft-delete (deactivate) a room")
  public ApiResponse<Void> deleteRoom(@PathVariable UUID roomId) {
    operationsAdminService.deleteRoom(roomId);
    return ApiResponse.ok(null, "Room deactivated");
  }
}
