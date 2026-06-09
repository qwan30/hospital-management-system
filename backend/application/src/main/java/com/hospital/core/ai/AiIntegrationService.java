package com.hospital.core.ai;

import com.hospital.core.appointment.AppointmentEntity;
import com.hospital.core.appointment.AppointmentRepository;
import com.hospital.core.patientportal.LabResultEntity;
import com.hospital.core.patientportal.PatientPortalLabResultRepository;
import com.hospital.core.user.UserEntity;
import com.hospital.core.user.UserRepository;

import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AiIntegrationService {

  private final AppointmentRepository appointmentRepository;
  private final PatientPortalLabResultRepository labResultRepository;
  private final UserRepository userRepository;
  private final EntityManager entityManager;

  public AiIntegrationService(
      AppointmentRepository appointmentRepository,
      PatientPortalLabResultRepository labResultRepository,
      UserRepository userRepository,
      EntityManager entityManager) {
    this.appointmentRepository = appointmentRepository;
    this.labResultRepository = labResultRepository;
    this.userRepository = userRepository;
    this.entityManager = entityManager;
  }

  @Transactional(readOnly = true)
  public List<AppointmentEntity> getPatientAppointments(UUID patientId) {
    return appointmentRepository.findByPatientIdOrderByAppointmentDateDescFirstSlotStartTimeDesc(patientId);
  }

  @Transactional(readOnly = true)
  public List<LabResultEntity> getPatientLabs(UUID patientId) {
    return labResultRepository.findByPatientIdOrderByCollectedAtDesc(patientId);
  }

  @Transactional(readOnly = true)
  public Optional<UserEntity> getUser(UUID userId) {
    return userRepository.findById(userId);
  }

  @Transactional(readOnly = true)
  public boolean hasAppointmentWith(UUID doctorId, UUID patientId) {
    return appointmentRepository.existsByDoctorIdAndPatientId(doctorId, patientId);
  }

  @Transactional(readOnly = true)
  public List<UUID> getChangedPatientIds(Instant since) {
    return entityManager.createQuery(
        "select p.id from PatientEntity p where p.updatedAt >= :since", UUID.class)
        .setParameter("since", since)
        .getResultList();
  }

  @Transactional(readOnly = true)
  public List<UUID> getChangedAppointmentIds(Instant since) {
    return entityManager.createQuery(
        "select a.id from AppointmentEntity a where a.updatedAt >= :since", UUID.class)
        .setParameter("since", since)
        .getResultList();
  }

  @Transactional(readOnly = true)
  public List<UUID> getChangedLabResultIds(Instant since) {
    return entityManager.createQuery(
        "select l.id from PatientPortalLabResultEntity l where l.updatedAt >= :since", UUID.class)
        .setParameter("since", since)
        .getResultList();
  }

  @Transactional(readOnly = true)
  public List<UUID> getChangedMedicalRecordIds(Instant since) {
    return entityManager.createQuery(
        "select m.id from MedicalRecordEntity m where m.updatedAt >= :since", UUID.class)
        .setParameter("since", since)
        .getResultList();
  }
}
