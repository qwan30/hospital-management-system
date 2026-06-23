package com.hospital.core.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.hospital.core.appointment.AppointmentEntity;
import com.hospital.core.appointment.AppointmentRepository;
import com.hospital.core.patientportal.LabResultEntity;
import com.hospital.core.patientportal.PatientPortalLabResultRepository;
import com.hospital.core.user.UserEntity;
import com.hospital.core.user.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AiIntegrationServiceTest {

  @Mock
  private AppointmentRepository appointmentRepository;

  @Mock
  private PatientPortalLabResultRepository labResultRepository;

  @Mock
  private UserRepository userRepository;

  @Mock
  private EntityManager entityManager;

  @InjectMocks
  private AiIntegrationService aiIntegrationService;

  private UUID patientId;
  private UUID doctorId;

  @BeforeEach
  void setUp() {
    patientId = UUID.randomUUID();
    doctorId = UUID.randomUUID();
  }

  @Test
  void getPatientAppointments_success() {
    var appointment = new AppointmentEntity();
    when(appointmentRepository.findByPatientIdOrderByAppointmentDateDescFirstSlotStartTimeDesc(patientId))
        .thenReturn(List.of(appointment));

    var results = aiIntegrationService.getPatientAppointments(patientId);
    assertThat(results).hasSize(1);
  }

  @Test
  void getPatientLabs_success() {
    var lab = new LabResultEntity();
    when(labResultRepository.findByPatientIdOrderByCollectedAtDesc(patientId))
        .thenReturn(List.of(lab));

    var results = aiIntegrationService.getPatientLabs(patientId);
    assertThat(results).hasSize(1);
  }

  @Test
  void getUser_success() {
    var user = new UserEntity();
    when(userRepository.findById(doctorId)).thenReturn(Optional.of(user));

    var result = aiIntegrationService.getUser(doctorId);
    assertThat(result).isPresent();
  }

  @Test
  void hasAppointmentWith_success() {
    when(appointmentRepository.existsByDoctorIdAndPatientId(doctorId, patientId)).thenReturn(true);
    boolean exists = aiIntegrationService.hasAppointmentWith(doctorId, patientId);
    assertThat(exists).isTrue();
  }

  @SuppressWarnings("unchecked")
  @Test
  void getChangedIds_success() {
    var since = Instant.now();
    var queryMock = mock(TypedQuery.class);
    var idList = List.of(UUID.randomUUID());

    when(queryMock.setParameter(eq("since"), any())).thenReturn(queryMock);
    when(queryMock.getResultList()).thenReturn(idList);

    when(entityManager.createQuery(any(String.class), eq(UUID.class))).thenReturn(queryMock);

    var resPatients = aiIntegrationService.getChangedPatientIds(since);
    assertThat(resPatients).isEqualTo(idList);

    var resAppts = aiIntegrationService.getChangedAppointmentIds(since);
    assertThat(resAppts).isEqualTo(idList);

    var resLabs = aiIntegrationService.getChangedLabResultIds(since);
    assertThat(resLabs).isEqualTo(idList);

    var resRecords = aiIntegrationService.getChangedMedicalRecordIds(since);
    assertThat(resRecords).isEqualTo(idList);
  }
}
