package com.hospital.api.medicalrecord;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.hospital.api.config.RestExceptionHandler;
import com.hospital.core.common.ConflictException;
import com.hospital.core.common.NotFoundException;
import com.hospital.core.medicalrecord.MedicalRecordService;
import com.hospital.shared.enums.UserRole;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class MedicalRecordControllerTest {

  private static final String DOCTOR_UUID = "00000000-0000-0000-0000-000000000001";

  private MockMvc mockMvc;
  private MedicalRecordService medicalRecordService;

  @BeforeEach
  void setUp() {
    medicalRecordService = mock(MedicalRecordService.class);

    mockMvc = MockMvcBuilders.standaloneSetup(
            new MedicalRecordController(medicalRecordService))
        .setControllerAdvice(new RestExceptionHandler())
        .build();
  }

  private static UsernamePasswordAuthenticationToken doctorAuth() {
    return new UsernamePasswordAuthenticationToken(
        DOCTOR_UUID, null,
        List.of(new SimpleGrantedAuthority("ROLE_DOCTOR")));
  }

  @Nested
  class CreateMedicalRecord {

    @Test
    void emptyBodyReturns400() throws Exception {
      mockMvc.perform(post("/api/v1/medical-records")
              .contentType(MediaType.APPLICATION_JSON)
              .content(""))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("validation_error"));
    }

    @Test
    void missingRequiredFieldsReturns400() throws Exception {
      mockMvc.perform(post("/api/v1/medical-records")
              .contentType(MediaType.APPLICATION_JSON)
              .content("{}"))
          .andExpect(status().isBadRequest())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("validation_error"));
    }

    @Test
    void duplicateAppointmentReturns409() throws Exception {
      when(medicalRecordService.createMedicalRecord(
              any(UUID.class), any(UserRole.class),
              any(com.hospital.shared.medicalrecord.MedicalRecordCreateRequest.class)))
          .thenThrow(new ConflictException("Medical record already exists for this appointment"));

      mockMvc.perform(post("/api/v1/medical-records")
              .principal(doctorAuth())
              .contentType(MediaType.APPLICATION_JSON)
              .content("""
                  {
                    "appointmentId": "%s",
                    "diagnosis": "Hypertension"
                  }
                  """.formatted(UUID.randomUUID())))
          .andExpect(status().isConflict())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("conflict"));
    }

    @Test
    void nonExistentAppointmentReturns404() throws Exception {
      when(medicalRecordService.createMedicalRecord(
              any(UUID.class), any(UserRole.class),
              any(com.hospital.shared.medicalrecord.MedicalRecordCreateRequest.class)))
          .thenThrow(new NotFoundException("Appointment not found"));

      mockMvc.perform(post("/api/v1/medical-records")
              .principal(doctorAuth())
              .contentType(MediaType.APPLICATION_JSON)
              .content("""
                  {
                    "appointmentId": "%s",
                    "diagnosis": "Hypertension"
                  }
                  """.formatted(UUID.randomUUID())))
          .andExpect(status().isNotFound())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("not_found"));
    }
  }

  @Nested
  class DownloadPrescriptionPdf {

    @Test
    void nonExistentRecordReturns404() throws Exception {
      var recordId = UUID.randomUUID();
      when(medicalRecordService.generatePrescriptionPdf(
              any(UUID.class), any(UserRole.class), any(UUID.class)))
          .thenThrow(new NotFoundException("Medical record not found"));

      mockMvc.perform(get("/api/v1/medical-records/{recordId}/prescription.pdf", recordId)
              .principal(doctorAuth()))
          .andExpect(status().isNotFound())
          .andExpect(jsonPath("$.success").value(false))
          .andExpect(jsonPath("$.error.code").value("not_found"));
    }
  }
}
