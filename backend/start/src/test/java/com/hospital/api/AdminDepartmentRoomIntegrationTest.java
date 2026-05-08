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
 * Tests for admin department and room management endpoints.
 */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class AdminDepartmentRoomIntegrationTest extends AbstractIntegrationTest {

  // ── Department Tests ──────────────────────────────────────────────────

  @Test
  void listDepartmentsAsAdmin() throws Exception {
    mockMvc.perform(get("/api/v1/admin/departments")
            .header("Authorization", "Bearer " + adminToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(3))));
  }

  @Test
  void listDepartmentsRejectsNonAdmin() throws Exception {
    mockMvc.perform(get("/api/v1/admin/departments")
            .header("Authorization", "Bearer " + doctorOneToken()))
        .andExpect(status().isForbidden());
  }

  @Test
  void createDepartmentSucceeds() throws Exception {
    mockMvc.perform(post("/api/v1/admin/departments")
            .header("Authorization", "Bearer " + adminToken())
            .contentType("application/json")
            .content("""
                {
                  "name": "Test Department",
                  "description": "A test department for integration testing",
                  "phone": "028 9999 0001",
                  "imageUrl": "https://example.com/dept.jpg"
                }
                """))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.data.name").value("Test Department"));
  }

  @Test
  void getDepartmentByIdReturnsDetails() throws Exception {
    var deptId = departmentRepository.findAllByOrderByNameAsc().get(0).getId();

    mockMvc.perform(get("/api/v1/admin/departments/{departmentId}", deptId)
            .header("Authorization", "Bearer " + adminToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.departmentId").value(deptId.toString()));
  }

  @Test
  void getDepartmentByNonExistentIdReturns404() throws Exception {
    mockMvc.perform(get("/api/v1/admin/departments/{departmentId}", UUID.randomUUID())
            .header("Authorization", "Bearer " + adminToken()))
        .andExpect(status().isNotFound());
  }

  @Test
  void updateDepartmentSucceeds() throws Exception {
    var deptId = departmentRepository.findAllByOrderByNameAsc().get(0).getId();

    mockMvc.perform(put("/api/v1/admin/departments/{departmentId}", deptId)
            .header("Authorization", "Bearer " + adminToken())
            .contentType("application/json")
            .content("""
                {
                  "name": "Updated Department Name",
                  "description": "Updated description",
                  "phone": "028 1111 2222",
                  "imageUrl": "https://example.com/updated.jpg"
                }
                """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.name").value("Updated Department Name"));
  }

  @Test
  void assignDoctorToDepartment() throws Exception {
    var deptId = departmentRepository.findAllByOrderByNameAsc().get(1).getId();
    var doctorId = doctorOneId();

    mockMvc.perform(post("/api/v1/admin/departments/{departmentId}/assign-doctor", deptId)
            .header("Authorization", "Bearer " + adminToken())
            .contentType("application/json")
            .content("""
                {
                  "doctorId": "%s"
                }
                """.formatted(doctorId)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("Doctor assigned"));
  }

  @Test
  void deleteDepartmentSoftDeletes() throws Exception {
    // Create a department to delete
    var createResult = mockMvc.perform(post("/api/v1/admin/departments")
            .header("Authorization", "Bearer " + adminToken())
            .contentType("application/json")
            .content("""
                {
                  "name": "Dept to Delete",
                  "description": "Will be deleted",
                  "phone": "028 0000 0000"
                }
                """))
        .andExpect(status().isCreated())
        .andReturn();

    var deptId = objectMapper.readTree(createResult.getResponse().getContentAsString())
        .get("data").get("departmentId").asText();

    mockMvc.perform(delete("/api/v1/admin/departments/{departmentId}", deptId)
            .header("Authorization", "Bearer " + adminToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("Department deactivated"));
  }

  // ── Room Tests ────────────────────────────────────────────────────────

  @Test
  void listRoomsAsAdmin() throws Exception {
    mockMvc.perform(get("/api/v1/admin/rooms")
            .header("Authorization", "Bearer " + adminToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true));
  }

  @Test
  void listRoomsRejectsNonAdmin() throws Exception {
    mockMvc.perform(get("/api/v1/admin/rooms")
            .header("Authorization", "Bearer " + nurseToken()))
        .andExpect(status().isForbidden());
  }

  @Test
  void createRoomSucceeds() throws Exception {
    var deptId = departmentRepository.findAllByOrderByNameAsc().get(0).getId();

    mockMvc.perform(post("/api/v1/admin/rooms")
            .header("Authorization", "Bearer " + adminToken())
            .contentType("application/json")
            .content("""
                {
                  "name": "Room 101",
                  "departmentId": "%s",
                  "status": "READY",
                  "active": true
                }
                """.formatted(deptId)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.name").value("Room 101"));
  }

  @Test
  void updateRoomStatusSucceeds() throws Exception {
    var deptId = departmentRepository.findAllByOrderByNameAsc().get(0).getId();

    // Create a room first
    var createResult = mockMvc.perform(post("/api/v1/admin/rooms")
            .header("Authorization", "Bearer " + adminToken())
            .contentType("application/json")
            .content("""
                {
                  "name": "Room Status Test",
                  "departmentId": "%s",
                  "status": "READY",
                  "active": true
                }
                """.formatted(deptId)))
        .andExpect(status().isOk())
        .andReturn();

    var roomId = objectMapper.readTree(createResult.getResponse().getContentAsString())
        .get("data").get("roomId").asText();

    mockMvc.perform(put("/api/v1/admin/rooms/{roomId}/status", roomId)
            .header("Authorization", "Bearer " + adminToken())
            .contentType("application/json")
            .content("""
                {
                  "status": "IN_USE"
                }
                """))
        .andExpect(status().isOk());
  }

  @Test
  void deleteRoomSoftDeletes() throws Exception {
    var deptId = departmentRepository.findAllByOrderByNameAsc().get(0).getId();

    var createResult = mockMvc.perform(post("/api/v1/admin/rooms")
            .header("Authorization", "Bearer " + adminToken())
            .contentType("application/json")
            .content("""
                {
                  "name": "Room to Delete",
                  "departmentId": "%s",
                  "status": "READY",
                  "active": true
                }
                """.formatted(deptId)))
        .andExpect(status().isOk())
        .andReturn();

    var roomId = objectMapper.readTree(createResult.getResponse().getContentAsString())
        .get("data").get("roomId").asText();

    mockMvc.perform(delete("/api/v1/admin/rooms/{roomId}", roomId)
            .header("Authorization", "Bearer " + adminToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("Room deactivated"));
  }
}
