package com.hospital.api.appointment;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.hospital.api.config.RestExceptionHandler;
import com.hospital.core.appointment.AppointmentWorkflowService;
import com.hospital.core.appointment.CreateAppointmentUseCase;
import com.hospital.core.common.NotFoundException;
import com.hospital.shared.booking.AppointmentCreateRequest;
import com.hospital.shared.booking.AppointmentResponse;
import com.hospital.shared.enums.AppointmentStatus;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class AppointmentControllerTest {

  private MockMvc mockMvc;
  private CreateAppointmentUseCase createAppointmentUseCase;
  private AppointmentWorkflowService appointmentWorkflowService;

  @BeforeEach
  void setUp() {
    createAppointmentUseCase = mock(CreateAppointmentUseCase.class);
    appointmentWorkflowService = mock(AppointmentWorkflowService.class);

    mockMvc = MockMvcBuilders.standaloneSetup(
            new AppointmentController(createAppointmentUseCase, appointmentWorkflowService))
        .setControllerAdvice(new RestExceptionHandler())
        .build();
  }

  @Nested
  class CreateAppointment {
    @Test
    void missingRequestBodyReturns400() throws Exception {
      mockMvc.perform(post("/api/v1/appointments")
              .contentType(MediaType.APPLICATION_JSON)
              .content(""))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void malformedJsonReturns400() throws Exception {
      mockMvc.perform(post("/api/v1/appointments")
              .contentType(MediaType.APPLICATION_JSON)
              .content("{invalid json"))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void missingRequiredFieldsReturns400() throws Exception {
      mockMvc.perform(post("/api/v1/appointments")
              .contentType(MediaType.APPLICATION_JSON)
              .content("{}"))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void validRequestSucceeds() throws Exception {
      var doctorId = UUID.randomUUID();
      var slotId = UUID.randomUUID();
      var response = new AppointmentResponse(
          UUID.randomUUID(), UUID.randomUUID(), doctorId, slotId,
          "CONF-123", AppointmentStatus.CONFIRMED, LocalDate.of(2026, 6, 15));

      when(createAppointmentUseCase.createAppointment(any(AppointmentCreateRequest.class)))
          .thenReturn(response);

      mockMvc.perform(post("/api/v1/appointments")
              .contentType(MediaType.APPLICATION_JSON)
              .content("""
                  {
                    "doctorId": "%s",
                    "firstSlotId": "%s",
                    "aiDurationMinutes": 30,
                    "patientFullName": "Test Patient",
                    "patientCccd": "012345678901",
                    "patientEmail": "test@example.com",
                    "patientPhone": "0900000000",
                    "patientDateOfBirth": "1990-01-01",
                    "patientGender": "MALE",
                    "patientAddress": {
                      "provinceOrCity": "HCM",
                      "district": "D1",
                      "streetAddress": "123 St"
                    },
                    "symptoms": "Headache"
                  }
                  """.formatted(doctorId, slotId)))
          .andExpect(status().isCreated())
          .andExpect(jsonPath("$.success").value(true));
    }
  }

  @Nested
  class NotFoundResponses {
    @Test
    void nonExistentAppointmentReturns404() throws Exception {
      var appointmentId = UUID.randomUUID();
      when(appointmentWorkflowService.getVitalSigns(appointmentId))
          .thenThrow(new NotFoundException("Vital signs not found"));

      mockMvc.perform(get("/api/v1/appointments/{appointmentId}/vital-signs", appointmentId))
          .andExpect(status().isNotFound())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("not_found"));
    }
  }
}
