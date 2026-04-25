package com.hospital.shared.admin;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record AdminDepartmentDoctorRequest(@NotNull UUID doctorId) {}
