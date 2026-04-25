package com.hospital.core.doctor;

import com.hospital.core.common.NotFoundException;
import com.hospital.core.timeslot.TimeSlotRepository;
import com.hospital.core.user.UserRepository;
import com.hospital.shared.doctor.DoctorResponse;
import com.hospital.shared.doctor.DoctorSlotResponse;
import com.hospital.shared.enums.UserRole;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class DoctorReadService {
  private final UserRepository userRepository;
  private final TimeSlotRepository timeSlotRepository;

  public DoctorReadService(UserRepository userRepository, TimeSlotRepository timeSlotRepository) {
    this.userRepository = userRepository;
    this.timeSlotRepository = timeSlotRepository;
  }

  public List<DoctorResponse> listDoctors() {
    return userRepository.findByRoleAndActiveTrueOrderByFullNameAsc(UserRole.DOCTOR).stream()
        .map(entity -> new DoctorResponse(
            entity.getId(),
            entity.getDepartment() == null ? null : entity.getDepartment().getId(),
            entity.getFullName(),
            entity.getEmail(),
            entity.getSpecialty(),
            entity.getQualification(),
            entity.getExperienceYears()))
        .toList();
  }

  public DoctorResponse getDoctor(UUID doctorId) {
    var entity = userRepository.findByIdAndRoleAndActiveTrue(doctorId, UserRole.DOCTOR)
        .orElseThrow(() -> new NotFoundException("Doctor not found"));

    return new DoctorResponse(
        entity.getId(),
        entity.getDepartment() == null ? null : entity.getDepartment().getId(),
        entity.getFullName(),
        entity.getEmail(),
        entity.getSpecialty(),
        entity.getQualification(),
        entity.getExperienceYears());
  }

  public List<DoctorSlotResponse> listDoctorSlots(UUID doctorId, LocalDate slotDate) {
    userRepository.findByIdAndRoleAndActiveTrue(doctorId, UserRole.DOCTOR)
        .orElseThrow(() -> new NotFoundException("Doctor not found"));

    return timeSlotRepository.findByDoctorIdAndSlotDateOrderByStartTimeAsc(doctorId, slotDate).stream()
        .map(slot -> new DoctorSlotResponse(
            slot.getId(),
            slot.getDoctor().getId(),
            slot.getSlotDate(),
            slot.getStartTime(),
            slot.getEndTime(),
            slot.getStatus()))
        .toList();
  }
}
