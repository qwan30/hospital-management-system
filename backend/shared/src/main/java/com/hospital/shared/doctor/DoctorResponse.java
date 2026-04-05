package com.hospital.shared.doctor;

import java.util.UUID;

public record DoctorResponse(
    UUID id,
    UUID departmentId,
    String fullName,
    String email,
    String specialty,
    String qualification,
    Integer experienceYears
) {}
