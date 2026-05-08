package com.hospital.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

/**
 * Tests for public (unauthenticated) endpoints:
 * - GET /api/v1/content/home
 * - GET /api/v1/news
 * - GET /api/v1/departments
 * - GET /api/v1/doctors
 */
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class PublicEndpointIntegrationTest extends AbstractIntegrationTest {

  @Test
  void homePageContentReturnsSuccessEnvelope() throws Exception {
    mockMvc.perform(get("/api/v1/content/home"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data").exists());
  }

  @Test
  void newsListReturnsSuccessEnvelope() throws Exception {
    mockMvc.perform(get("/api/v1/news"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data").isArray());
  }

  @Test
  void departmentListReturnsSeededDepartments() throws Exception {
    mockMvc.perform(get("/api/v1/departments"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data").isArray())
        .andExpect(jsonPath("$.data.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(3)));
  }

  @Test
  void doctorListReturnsSeededDoctors() throws Exception {
    mockMvc.perform(get("/api/v1/doctors"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data").isArray())
        .andExpect(jsonPath("$.data.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(2)));
  }

  @Test
  void nonExistentEndpointReturns404OrMethodNotAllowed() throws Exception {
    mockMvc.perform(get("/api/v1/totally-bogus-endpoint"))
        .andExpect(status().is4xxClientError());
  }

  @Test
  void publicEndpointsDoNotRequireAuthentication() throws Exception {
    // All these should succeed without any Authorization header
    mockMvc.perform(get("/api/v1/content/home"))
        .andExpect(status().isOk());
    mockMvc.perform(get("/api/v1/departments"))
        .andExpect(status().isOk());
    mockMvc.perform(get("/api/v1/doctors"))
        .andExpect(status().isOk());
  }
}
