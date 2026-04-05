package com.hospital.core.department;

import com.hospital.shared.department.DepartmentResponse;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class DepartmentReadService {
  private final DepartmentRepository departmentRepository;

  public DepartmentReadService(DepartmentRepository departmentRepository) {
    this.departmentRepository = departmentRepository;
  }

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
}
