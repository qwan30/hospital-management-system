package com.hospital.core.department;

import com.hospital.core.common.NotFoundException;
import com.hospital.core.user.UserRepository;
import com.hospital.shared.department.DepartmentDetailResponse;
import com.hospital.shared.department.DepartmentDetailResponse.DepartmentDoctorSummary;
import com.hospital.shared.department.DepartmentResponse;
import com.hospital.shared.enums.UserRole;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DepartmentReadService {
  private final DepartmentRepository departmentRepository;
  private final UserRepository userRepository;

  public DepartmentReadService(DepartmentRepository departmentRepository, UserRepository userRepository) {
    this.departmentRepository = departmentRepository;
    this.userRepository = userRepository;
  }

  @Transactional(readOnly = true)
  public List<DepartmentResponse> listDepartments() {
    return departmentRepository.findByActiveTrueOrderByNameAsc().stream()
        .map(entity -> new DepartmentResponse(
            entity.getId(),
            entity.getName(),
            entity.getDescription(),
            entity.getImageUrl(),
            entity.getPhone()))
        .toList();
  }

  @Transactional(readOnly = true)
  public DepartmentDetailResponse getDepartmentDetail(UUID departmentId) {
    var department = departmentRepository.findById(departmentId)
        .filter(d -> d.isActive())
        .orElseThrow(() -> new NotFoundException("Department not found"));

    var doctors = userRepository.findByRoleAndActiveTrueOrderByFullNameAsc(UserRole.DOCTOR).stream()
        .filter(u -> u.getDepartment() != null && u.getDepartment().getId().equals(departmentId))
        .map(u -> new DepartmentDoctorSummary(
            u.getId(),
            u.getFullName(),
            u.getSpecialty(),
            u.getQualification(),
            u.getExperienceYears(),
            u.getAvatarUrl()))
        .toList();

    return new DepartmentDetailResponse(
        department.getId(),
        department.getName(),
        department.getDescription(),
        department.getImageUrl(),
        department.getPhone(),
        doctors.size(),
        doctors);
  }
}
