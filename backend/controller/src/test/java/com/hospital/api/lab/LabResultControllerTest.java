package com.hospital.api.lab;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.hospital.api.config.RestExceptionHandler;
import com.hospital.core.common.NotFoundException;
import com.hospital.core.lab.LabResultService;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class LabResultControllerTest {

  private MockMvc mockMvc;
  private LabResultService labResultService;

  @BeforeEach
  void setUp() {
    labResultService = mock(LabResultService.class);
    // Permissive mock: this suite covers routing, validation and error mapping. Object-level
    // authorization is covered by the guard's own tests and the integration suite.
    var clinicalAccessGuard = mock(com.hospital.api.config.ClinicalAccessGuard.class);

    mockMvc = MockMvcBuilders.standaloneSetup(
            new LabResultController(labResultService, clinicalAccessGuard))
        .setControllerAdvice(new RestExceptionHandler())
        .build();
  }

  @Nested
  class CreateLabResult {

    @Test
    void emptyBodyReturns400() throws Exception {
      mockMvc.perform(post("/api/v1/lab-results")
              .contentType(MediaType.APPLICATION_JSON)
              .content(""))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("validation_error"));
    }

    @Test
    void missingRequiredFieldsReturns400() throws Exception {
      mockMvc.perform(post("/api/v1/lab-results")
              .contentType(MediaType.APPLICATION_JSON)
              .content("{}"))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("validation_error"));
    }

    @Test
    void missingTestNameReturns400() throws Exception {
      mockMvc.perform(post("/api/v1/lab-results")
              .contentType(MediaType.APPLICATION_JSON)
              .content("""
                  {
                    "appointmentId": "%s",
                    "resultValue": "5.5"
                  }
                  """.formatted(UUID.randomUUID())))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("validation_error"));
    }

    @Test
    void missingResultValueReturns400() throws Exception {
      mockMvc.perform(post("/api/v1/lab-results")
              .contentType(MediaType.APPLICATION_JSON)
              .content("""
                  {
                    "appointmentId": "%s",
                    "testName": "Blood Glucose"
                  }
                  """.formatted(UUID.randomUUID())))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("validation_error"));
    }

    @Test
    void missingAppointmentIdReturns400() throws Exception {
      mockMvc.perform(post("/api/v1/lab-results")
              .contentType(MediaType.APPLICATION_JSON)
              .content("""
                  {
                    "testName": "Blood Glucose",
                    "resultValue": "5.5"
                  }
                  """))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("validation_error"));
    }
  }

  @Nested
  class GetLabResult {

    @Test
    void nonExistentReturns404() throws Exception {
      var resultId = UUID.randomUUID();
      when(labResultService.getLabResult(resultId))
          .thenThrow(new NotFoundException("Lab result not found"));

      mockMvc.perform(get("/api/v1/lab-results/{resultId}", resultId))
          .andExpect(status().isNotFound())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("not_found"));
    }
  }

  @Nested
  class DeleteLabResult {

    @Test
    void nonExistentReturns404() throws Exception {
      var resultId = UUID.randomUUID();
      doThrow(new NotFoundException("Lab result not found"))
          .when(labResultService).deleteLabResult(resultId);

      mockMvc.perform(delete("/api/v1/lab-results/{resultId}", resultId))
          .andExpect(status().isNotFound())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("not_found"));
    }
  }
}
