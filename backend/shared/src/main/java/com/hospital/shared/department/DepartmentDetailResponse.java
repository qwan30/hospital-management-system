package com.hospital.shared.department;

import java.util.List;
import java.util.UUID;

public record DepartmentDetailResponse(
    UUID id,
    String name,
    String description,
    String imageUrl,
    String phone,
    int activeDoctorCount,
    List<DepartmentDoctorSummary> doctors
) {
  public record DepartmentDoctorSummary(
      UUID id,
      String fullName,
      String specialty,
      String qualification,
      Integer experienceYears,
      String avatarUrl
  ) {}
}
