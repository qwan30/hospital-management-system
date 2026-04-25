package com.hospital.core.vitalsigns;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.hospital.core.appointment.AppointmentEntity;
import com.hospital.core.appointment.AppointmentRepository;
import com.hospital.core.appointment.AppointmentVitalSignsEntity;
import com.hospital.core.appointment.AppointmentVitalSignsRepository;
import com.hospital.core.common.NotFoundException;
import com.hospital.shared.vitalsigns.VitalSignsCreateRequest;
import com.hospital.shared.vitalsigns.VitalSignsUpdateRequest;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class VitalSignsServiceTest {

  @Mock private AppointmentVitalSignsRepository vitalSignsRepository;
  @Mock private AppointmentRepository appointmentRepository;

  private VitalSignsService service;

  @BeforeEach
  void setUp() {
    service = new VitalSignsService(vitalSignsRepository, appointmentRepository);
  }

  @Test
  void createVitalSigns_validAppointment_savesAndReturns() {
    var appointmentId = UUID.randomUUID();
    var appointment = new AppointmentEntity();
    appointment.setId(appointmentId);
    when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));
    when(vitalSignsRepository.save(any(AppointmentVitalSignsEntity.class))).thenAnswer(inv -> {
      var e = inv.getArgument(0, AppointmentVitalSignsEntity.class);
      e.setId(UUID.randomUUID());
      e.setRecordedAt(Instant.now());
      return e;
    });

    var request = new VitalSignsCreateRequest(appointmentId, "120/80", 36.5, 72.0, 170.0, 70, 16, 98.0);
    var response = service.createVitalSigns(request);

    assertThat(response.id()).isNotNull();
    assertThat(response.appointmentId()).isEqualTo(appointmentId);
    assertThat(response.bloodPressure()).isEqualTo("120/80");
    assertThat(response.temperature()).isEqualTo(36.5);
  }

  @Test
  void createVitalSigns_invalidAppointment_throwsNotFound() {
    var appointmentId = UUID.randomUUID();
    when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> service.createVitalSigns(
        new VitalSignsCreateRequest(appointmentId, "120/80", 36.5, 72.0, 170.0, 70, 16, 98.0)))
        .isInstanceOf(NotFoundException.class);
  }

  @Test
  void getByAppointment_existing_returnsResponse() {
    var appointmentId = UUID.randomUUID();
    var entity = buildVitalSigns(UUID.randomUUID(), appointmentId);
    when(vitalSignsRepository.findByAppointmentId(appointmentId)).thenReturn(Optional.of(entity));

    var response = service.getByAppointment(appointmentId);

    assertThat(response.bloodPressure()).isEqualTo("130/85");
  }

  @Test
  void getByAppointment_notFound_throwsNotFound() {
    var appointmentId = UUID.randomUUID();
    when(vitalSignsRepository.findByAppointmentId(appointmentId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> service.getByAppointment(appointmentId))
        .isInstanceOf(NotFoundException.class);
  }

  @Test
  void updateVitalSigns_existing_updatesAndReturns() {
    var vitalId = UUID.randomUUID();
    var entity = buildVitalSigns(vitalId, UUID.randomUUID());
    when(vitalSignsRepository.findById(vitalId)).thenReturn(Optional.of(entity));
    when(vitalSignsRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

    var response = service.updateVitalSigns(vitalId, new VitalSignsUpdateRequest("140/90", 37.0, null, null, null, null, null));

    assertThat(response.bloodPressure()).isEqualTo("140/90");
    assertThat(response.temperature()).isEqualTo(37.0);
    assertThat(response.heartRate()).isEqualTo(72.0); // unchanged
  }

  @Test
  void updateVitalSigns_notFound_throwsNotFound() {
    var vitalId = UUID.randomUUID();
    when(vitalSignsRepository.findById(vitalId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> service.updateVitalSigns(vitalId, new VitalSignsUpdateRequest(null, null, null, null, null, null, null)))
        .isInstanceOf(NotFoundException.class);
  }

  @Test
  void deleteVitalSigns_existing_deletes() {
    var vitalId = UUID.randomUUID();
    when(vitalSignsRepository.existsById(vitalId)).thenReturn(true);

    service.deleteVitalSigns(vitalId);

    verify(vitalSignsRepository).deleteById(vitalId);
  }

  @Test
  void deleteVitalSigns_notFound_throwsNotFound() {
    var vitalId = UUID.randomUUID();
    when(vitalSignsRepository.existsById(vitalId)).thenReturn(false);

    assertThatThrownBy(() -> service.deleteVitalSigns(vitalId))
        .isInstanceOf(NotFoundException.class);
  }

  private AppointmentVitalSignsEntity buildVitalSigns(UUID id, UUID appointmentId) {
    var appointment = new AppointmentEntity();
    appointment.setId(appointmentId);

    var entity = new AppointmentVitalSignsEntity();
    entity.setId(id);
    entity.setAppointment(appointment);
    entity.setBloodPressure("130/85");
    entity.setTemperature(BigDecimal.valueOf(36.8));
    entity.setHeartRate(72);
    entity.setHeight(BigDecimal.valueOf(175.0));
    entity.setWeight(BigDecimal.valueOf(80));
    entity.setRespiratoryRate(14);
    entity.setOxygenSaturation(BigDecimal.valueOf(99.0));
    entity.setRecordedAt(Instant.now());
    return entity;
  }
}
