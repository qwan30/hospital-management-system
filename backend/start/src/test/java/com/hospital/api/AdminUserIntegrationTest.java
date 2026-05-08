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
 * Tests for admin user management endpoints:
 * - GET    /api/v1/admin/users
 * - GET    /api/v1/admin/users/{userId}
 * - POST   /api/v1/admin/users
 * - PUT    /api/v1/admin/users/{userId}
 * - DELETE /api/v1/admin/users/{userId}
 * - POST   /api/v1/admin/users/{userId}/activate
 * - POST   /api/v1/admin/users/{userId}/deactivate
 * - PUT    /api/v1/admin/users/{userId}/role
 */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class AdminUserIntegrationTest extends AbstractIntegrationTest {

  @Test
  void listUsersRequiresAdminRole() throws Exception {
    mockMvc.perform(get("/api/v1/admin/users"))
        .andExpect(status().isUnauthorized());

    mockMvc.perform(get("/api/v1/admin/users")
            .header("Authorization", "Bearer " + doctorOneToken()))
        .andExpect(status().isForbidden());
  }

  @Test
  void listUsersAsAdminReturnsAllStaff() throws Exception {
    mockMvc.perform(get("/api/v1/admin/users")
            .header("Authorization", "Bearer " + adminToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(7))));
  }

  @Test
  void getUserByIdReturnsUserDetails() throws Exception {
    var adminId = userRepository.findByEmailIgnoreCaseAndActiveTrue("admin@hospital.vn")
        .orElseThrow().getId();

    mockMvc.perform(get("/api/v1/admin/users/{userId}", adminId)
            .header("Authorization", "Bearer " + adminToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.email").value("admin@hospital.vn"))
        .andExpect(jsonPath("$.data.role").value("ADMIN"));
  }

  @Test
  void getUserByNonExistentIdReturns404() throws Exception {
    mockMvc.perform(get("/api/v1/admin/users/{userId}", UUID.randomUUID())
            .header("Authorization", "Bearer " + adminToken()))
        .andExpect(status().isNotFound());
  }

  @Test
  void createUserSucceedsWithValidData() throws Exception {
    mockMvc.perform(post("/api/v1/admin/users")
            .header("Authorization", "Bearer " + adminToken())
            .contentType("application/json")
            .content("""
                {
                  "email": "new.doctor@hospital.vn",
                  "password": "NewDoctor@1234",
                  "fullName": "Dr. New Doctor",
                  "phone": "0911111111",
                  "role": "DOCTOR",
                  "specialty": "Pediatrics",
                  "qualification": "MD"
                }
                """))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.email").value("new.doctor@hospital.vn"))
        .andExpect(jsonPath("$.data.role").value("DOCTOR"));
  }

  @Test
  void createUserFailsWithDuplicateEmail() throws Exception {
    mockMvc.perform(post("/api/v1/admin/users")
            .header("Authorization", "Bearer " + adminToken())
            .contentType("application/json")
            .content("""
                {
                  "email": "admin@hospital.vn",
                  "password": "Admin@1234",
                  "fullName": "Duplicate Admin",
                  "phone": "0900000001",
                  "role": "ADMIN"
                }
                """))
        .andExpect(status().isConflict());
  }

  @Test
  void createUserFailsWithMissingRequiredFields() throws Exception {
    mockMvc.perform(post("/api/v1/admin/users")
            .header("Authorization", "Bearer " + adminToken())
            .contentType("application/json")
            .content("""
                {
                  "email": "",
                  "password": ""
                }
                """))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error.code").value("validation_error"));
  }

  @Test
  void updateUserSucceeds() throws Exception {
    var doctorId = doctorOneId();

    mockMvc.perform(put("/api/v1/admin/users/{userId}", doctorId)
            .header("Authorization", "Bearer " + adminToken())
            .contentType("application/json")
            .content("""
                {
                  "email": "doctor1@hospital.vn",
                  "fullName": "Dr. Nguyen Van An (Updated)",
                  "phone": "0900000099",
                  "role": "DOCTOR",
                  "specialty": "Internal Medicine",
                  "qualification": "MD, PhD"
                }
                """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.fullName").value("Dr. Nguyen Van An (Updated)"));
  }

  @Test
  void deactivateAndReactivateUser() throws Exception {
    var doctorId = doctorTwoId();
    var token = adminToken();

    // Deactivate
    mockMvc.perform(post("/api/v1/admin/users/{userId}/deactivate", doctorId)
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("User deactivated"));

    // Activate
    mockMvc.perform(post("/api/v1/admin/users/{userId}/activate", doctorId)
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("User activated"));
  }

  @Test
  void changeUserRole() throws Exception {
    // Create a test user to change role without affecting existing test users
    var createResult = mockMvc.perform(post("/api/v1/admin/users")
            .header("Authorization", "Bearer " + adminToken())
            .contentType("application/json")
            .content("""
                {
                  "email": "role.test@hospital.vn",
                  "password": "RoleTest@1234",
                  "fullName": "Role Test User",
                  "phone": "0900000002",
                  "role": "NURSE"
                }
                """))
        .andExpect(status().isCreated())
        .andReturn();

    var userId = objectMapper.readTree(createResult.getResponse().getContentAsString())
        .get("data").get("userId").asText();

    mockMvc.perform(put("/api/v1/admin/users/{userId}/role", userId)
            .header("Authorization", "Bearer " + adminToken())
            .contentType("application/json")
            .content("""
                {
                  "role": "RECEPTIONIST"
                }
                """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.role").value("RECEPTIONIST"));
  }

  @Test
  void softDeleteUser() throws Exception {
    var createResult = mockMvc.perform(post("/api/v1/admin/users")
            .header("Authorization", "Bearer " + adminToken())
            .contentType("application/json")
            .content("""
                {
                  "email": "delete.test@hospital.vn",
                  "password": "Delete@1234",
                  "fullName": "Delete Test",
                  "phone": "0900000003",
                  "role": "NURSE"
                }
                """))
        .andExpect(status().isCreated())
        .andReturn();

    var userId = objectMapper.readTree(createResult.getResponse().getContentAsString())
        .get("data").get("userId").asText();

    mockMvc.perform(delete("/api/v1/admin/users/{userId}", userId)
            .header("Authorization", "Bearer " + adminToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").value("User deactivated"));
  }

  @Test
  void nurseCannotManageAdminUsers() throws Exception {
    mockMvc.perform(get("/api/v1/admin/users")
            .header("Authorization", "Bearer " + nurseToken()))
        .andExpect(status().isForbidden());
  }

  @Test
  void accountantCannotManageAdminUsers() throws Exception {
    mockMvc.perform(get("/api/v1/admin/users")
            .header("Authorization", "Bearer " + accountantToken()))
        .andExpect(status().isForbidden());
  }
}
