package com.hospital.core.vitalsigns;

import com.hospital.core.appointment.AppointmentRepository;
import com.hospital.core.appointment.AppointmentVitalSignsEntity;
import com.hospital.core.appointment.AppointmentVitalSignsRepository;
import com.hospital.core.common.NotFoundException;
import com.hospital.shared.vitalsigns.VitalSignsCreateRequest;
import com.hospital.shared.vitalsigns.VitalSignsResponse;
import com.hospital.shared.vitalsigns.VitalSignsUpdateRequest;
import java.math.BigDecimal;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VitalSignsService {
  private final AppointmentVitalSignsRepository vitalSignsRepository;
  private final AppointmentRepository appointmentRepository;

  public VitalSignsService(AppointmentVitalSignsRepository vitalSignsRepository, AppointmentRepository appointmentRepository) {
    this.vitalSignsRepository = vitalSignsRepository;
    this.appointmentRepository = appointmentRepository;
  }

  @Transactional
  public VitalSignsResponse createVitalSigns(VitalSignsCreateRequest request) {
    var appointment = appointmentRepository.findById(request.appointmentId())
        .orElseThrow(() -> new NotFoundException("Appointment not found"));

    var entity = new AppointmentVitalSignsEntity();
    entity.setAppointment(appointment);
    entity.setBloodPressure(request.bloodPressure());
    if (request.temperature() != null) entity.setTemperature(BigDecimal.valueOf(request.temperature()));
    if (request.heartRate() != null) entity.setHeartRate(request.heartRate().intValue());
    if (request.height() != null) entity.setHeight(BigDecimal.valueOf(request.height()));
    if (request.weight() != null) entity.setWeight(BigDecimal.valueOf(request.weight()));
    entity.setRespiratoryRate(request.respiratoryRate());
    if (request.oxygenSaturation() != null) entity.setOxygenSaturation(BigDecimal.valueOf(request.oxygenSaturation()));

    var saved = vitalSignsRepository.save(entity);
    return toResponse(saved);
  }

  @Transactional(readOnly = true)
  public VitalSignsResponse getByAppointment(UUID appointmentId) {
    var entity = vitalSignsRepository.findByAppointmentId(appointmentId)
        .orElseThrow(() -> new NotFoundException("Vital signs not found for this appointment"));
    return toResponse(entity);
  }

  @Transactional
  public VitalSignsResponse updateVitalSigns(UUID vitalSignId, VitalSignsUpdateRequest request) {
    var entity = vitalSignsRepository.findById(vitalSignId)
        .orElseThrow(() -> new NotFoundException("Vital signs not found"));

    if (request.bloodPressure() != null) entity.setBloodPressure(request.bloodPressure());
    if (request.temperature() != null) entity.setTemperature(BigDecimal.valueOf(request.temperature()));
    if (request.heartRate() != null) entity.setHeartRate(request.heartRate().intValue());
    if (request.height() != null) entity.setHeight(BigDecimal.valueOf(request.height()));
    if (request.weight() != null) entity.setWeight(BigDecimal.valueOf(request.weight()));
    if (request.respiratoryRate() != null) entity.setRespiratoryRate(request.respiratoryRate());
    if (request.oxygenSaturation() != null) entity.setOxygenSaturation(BigDecimal.valueOf(request.oxygenSaturation()));

    var saved = vitalSignsRepository.save(entity);
    return toResponse(saved);
  }

  @Transactional
  public void deleteVitalSigns(UUID vitalSignId) {
    if (!vitalSignsRepository.existsById(vitalSignId)) {
      throw new NotFoundException("Vital signs not found");
    }
    vitalSignsRepository.deleteById(vitalSignId);
  }

  private VitalSignsResponse toResponse(AppointmentVitalSignsEntity entity) {
    return new VitalSignsResponse(
        entity.getId(),
        entity.getAppointment().getId(),
        entity.getBloodPressure(),
        entity.getTemperature() == null ? null : entity.getTemperature().doubleValue(),
        entity.getHeartRate() == null ? null : entity.getHeartRate().doubleValue(),
        entity.getHeight() == null ? null : entity.getHeight().doubleValue(),
        entity.getWeight() == null ? null : entity.getWeight().intValue(),
        entity.getRespiratoryRate(),
        entity.getOxygenSaturation() == null ? null : entity.getOxygenSaturation().doubleValue(),
        entity.getRecordedAt());
  }
}
