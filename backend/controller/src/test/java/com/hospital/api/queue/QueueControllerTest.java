package com.hospital.api.queue;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.hospital.api.config.RestExceptionHandler;
import com.hospital.core.appointment.AppointmentWorkflowService;
import com.hospital.core.common.ConflictException;
import com.hospital.core.common.NotFoundException;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class QueueControllerTest {

  private MockMvc mockMvc;
  private AppointmentWorkflowService appointmentWorkflowService;

  @BeforeEach
  void setUp() {
    appointmentWorkflowService = mock(AppointmentWorkflowService.class);

    mockMvc = MockMvcBuilders.standaloneSetup(
            new QueueController(appointmentWorkflowService))
        .setControllerAdvice(new RestExceptionHandler())
        .build();
  }

  @Nested
  class AssignRoom {

    @Test
    void emptyBodyReturns400() throws Exception {
      mockMvc.perform(post("/api/v1/queue/{appointmentId}/assign-room", UUID.randomUUID())
              .contentType(MediaType.APPLICATION_JSON)
              .content(""))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("validation_error"));
    }

    @Test
    void missingRoomNameReturns400() throws Exception {
      mockMvc.perform(post("/api/v1/queue/{appointmentId}/assign-room", UUID.randomUUID())
              .contentType(MediaType.APPLICATION_JSON)
              .content("{}"))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("validation_error"));
    }

    @Test
    void blankRoomNameReturns400() throws Exception {
      mockMvc.perform(post("/api/v1/queue/{appointmentId}/assign-room", UUID.randomUUID())
              .contentType(MediaType.APPLICATION_JSON)
              .content("""
                  {"roomName": ""}
                  """))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("validation_error"));
    }

    @Test
    void nonExistentAppointmentReturns404() throws Exception {
      var appointmentId = UUID.randomUUID();
      when(appointmentWorkflowService.assignQueueRoom(any(UUID.class), any(String.class)))
          .thenThrow(new NotFoundException("Appointment not found"));

      mockMvc.perform(post("/api/v1/queue/{appointmentId}/assign-room", appointmentId)
              .contentType(MediaType.APPLICATION_JSON)
              .content("""
                  {"roomName": "Exam Room 1"}
                  """))
          .andExpect(status().isNotFound())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("not_found"));
    }
  }

  @Nested
  class CallPatient {

    @Test
    void nonExistentAppointmentReturns404() throws Exception {
      var appointmentId = UUID.randomUUID();
      when(appointmentWorkflowService.callQueuePatient(appointmentId))
          .thenThrow(new NotFoundException("Appointment not found"));

      mockMvc.perform(post("/api/v1/queue/{appointmentId}/call", appointmentId))
          .andExpect(status().isNotFound())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("not_found"));
    }

    @Test
    void nonReadyAppointmentReturns409() throws Exception {
      var appointmentId = UUID.randomUUID();
      when(appointmentWorkflowService.callQueuePatient(appointmentId))
          .thenThrow(new ConflictException("Only active queue appointments can be called"));

      mockMvc.perform(post("/api/v1/queue/{appointmentId}/call", appointmentId))
          .andExpect(status().isConflict())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("conflict"));
    }
  }

  @Nested
  class StartConsultation {

    @Test
    void nonExistentAppointmentReturns404() throws Exception {
      var appointmentId = UUID.randomUUID();
      when(appointmentWorkflowService.markInConsultation(appointmentId))
          .thenThrow(new NotFoundException("Appointment not found"));

      mockMvc.perform(post("/api/v1/queue/{appointmentId}/start-consultation", appointmentId))
          .andExpect(status().isNotFound())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("not_found"));
    }

    @Test
    void nonCheckedInAppointmentReturns409() throws Exception {
      var appointmentId = UUID.randomUUID();
      when(appointmentWorkflowService.markInConsultation(appointmentId))
          .thenThrow(new ConflictException("Only ready queue appointments can move into consultation"));

      mockMvc.perform(post("/api/v1/queue/{appointmentId}/start-consultation", appointmentId))
          .andExpect(status().isConflict())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("conflict"));
    }
  }

  @Nested
  class CompleteVisit {

    @Test
    void nonExistentAppointmentReturns404() throws Exception {
      var appointmentId = UUID.randomUUID();
      when(appointmentWorkflowService.completeQueueVisit(appointmentId))
          .thenThrow(new NotFoundException("Appointment not found"));

      mockMvc.perform(post("/api/v1/queue/{appointmentId}/complete", appointmentId))
          .andExpect(status().isNotFound())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("not_found"));
    }

    @Test
    void notInConsultationReturns409() throws Exception {
      var appointmentId = UUID.randomUUID();
      when(appointmentWorkflowService.completeQueueVisit(appointmentId))
          .thenThrow(new ConflictException("Appointment must be in consultation before it can be completed"));

      mockMvc.perform(post("/api/v1/queue/{appointmentId}/complete", appointmentId))
          .andExpect(status().isConflict())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("conflict"));
    }
  }
}
