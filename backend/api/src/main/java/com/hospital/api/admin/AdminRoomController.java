package com.hospital.api.admin;

import com.hospital.core.admin.OperationsAdminService;
import com.hospital.shared.admin.AdminRoomResponse;
import com.hospital.shared.admin.AdminRoomUpsertRequest;
import com.hospital.shared.api.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
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
public class AdminRoomController {
  private final OperationsAdminService operationsAdminService;

  public AdminRoomController(OperationsAdminService operationsAdminService) {
    this.operationsAdminService = operationsAdminService;
  }

  @GetMapping
  public ApiResponse<List<AdminRoomResponse>> listRooms() {
    return ApiResponse.ok(operationsAdminService.listRooms());
  }

  @PostMapping
  public ApiResponse<AdminRoomResponse> createRoom(@Valid @RequestBody AdminRoomUpsertRequest request) {
    return ApiResponse.ok(operationsAdminService.createRoom(request));
  }

  @PutMapping("/{roomId}")
  public ApiResponse<AdminRoomResponse> updateRoom(
      @PathVariable UUID roomId,
      @Valid @RequestBody AdminRoomUpsertRequest request) {
    return ApiResponse.ok(operationsAdminService.updateRoom(roomId, request));
  }
}
