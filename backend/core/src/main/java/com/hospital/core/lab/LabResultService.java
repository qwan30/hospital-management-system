package com.hospital.core.lab;

import com.hospital.core.appointment.AppointmentRepository;
import com.hospital.core.common.NotFoundException;
import com.hospital.shared.lab.LabResultCreateRequest;
import com.hospital.shared.lab.LabResultResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LabResultService {
  private final LabResultRepository labResultRepository;
  private final AppointmentRepository appointmentRepository;

  public LabResultService(LabResultRepository labResultRepository, AppointmentRepository appointmentRepository) {
    this.labResultRepository = labResultRepository;
    this.appointmentRepository = appointmentRepository;
  }

  @Transactional
  public LabResultResponse createLabResult(LabResultCreateRequest request) {
    var appointment = appointmentRepository.findById(request.appointmentId())
        .orElseThrow(() -> new NotFoundException("Appointment not found"));

    var entity = new LabResultEntity();
    entity.setAppointment(appointment);
    entity.setTestName(request.testName());
    entity.setResultValue(request.resultValue());
    entity.setReferenceRange(request.referenceRange());
    entity.setStatus(request.status());
    entity.setNotes(request.notes());
    entity.setDeleted(false);
    var saved = labResultRepository.save(entity);
    return toResponse(saved);
  }

  @Transactional(readOnly = true)
  public LabResultResponse getLabResult(UUID resultId) {
    var entity = labResultRepository.findByIdAndDeletedFalse(resultId)
        .orElseThrow(() -> new NotFoundException("Lab result not found"));
    return toResponse(entity);
  }

  @Transactional(readOnly = true)
  public List<LabResultResponse> getLabResultsByAppointment(UUID appointmentId) {
    return labResultRepository.findByAppointmentIdAndDeletedFalseOrderByCreatedAtDesc(appointmentId)
        .stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional
  public void deleteLabResult(UUID resultId) {
    var entity = labResultRepository.findByIdAndDeletedFalse(resultId)
        .orElseThrow(() -> new NotFoundException("Lab result not found"));
    entity.setDeleted(true);
  }

  private LabResultResponse toResponse(LabResultEntity entity) {
    return new LabResultResponse(
        entity.getId(),
        entity.getAppointment().getId(),
        entity.getTestName(),
        entity.getResultValue(),
        entity.getReferenceRange(),
        entity.getStatus(),
        entity.getNotes(),
        entity.isDeleted(),
        entity.getCreatedAt());
  }
}
