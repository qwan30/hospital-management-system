package com.hospital.core.admin;

import com.hospital.core.appointment.AppointmentRepository;
import com.hospital.core.common.ConflictException;
import com.hospital.core.common.NotFoundException;
import com.hospital.core.department.DepartmentEntity;
import com.hospital.core.department.DepartmentRepository;
import com.hospital.core.invoice.InvoiceRepository;
import com.hospital.core.user.UserEntity;
import com.hospital.core.user.UserRepository;
import com.hospital.shared.admin.AdminDepartmentResponse;
import com.hospital.shared.admin.AdminDepartmentUpsertRequest;
import com.hospital.shared.admin.AdminStatsResponse;
import com.hospital.shared.admin.AdminUserResponse;
import com.hospital.shared.admin.AdminUserUpsertRequest;
import com.hospital.shared.enums.InvoiceStatus;
import com.hospital.shared.enums.UserRole;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {
  private final AppointmentRepository appointmentRepository;
  private final DepartmentRepository departmentRepository;
  private final InvoiceRepository invoiceRepository;
  private final PasswordEncoder passwordEncoder;
  private final UserRepository userRepository;

  public AdminService(
      AppointmentRepository appointmentRepository,
      DepartmentRepository departmentRepository,
      InvoiceRepository invoiceRepository,
      PasswordEncoder passwordEncoder,
      UserRepository userRepository) {
    this.appointmentRepository = appointmentRepository;
    this.departmentRepository = departmentRepository;
    this.invoiceRepository = invoiceRepository;
    this.passwordEncoder = passwordEncoder;
    this.userRepository = userRepository;
  }

  @Transactional(readOnly = true)
  public List<AdminUserResponse> listUsers() {
    return userRepository.findAllByOrderByFullNameAsc().stream().map(this::toAdminUserResponse).toList();
  }

  @Transactional(readOnly = true)
  public AdminUserResponse getUser(UUID userId) {
    return toAdminUserResponse(
        userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found")));
  }

  @Transactional
  public AdminUserResponse createUser(AdminUserUpsertRequest request) {
    if (userRepository.existsByEmailIgnoreCase(request.email())) {
      throw new ConflictException("User email already exists");
    }
    if (request.password() == null || request.password().isBlank()) {
      throw new ConflictException("Password is required for new users");
    }

    var user = new UserEntity();
    applyUser(user, request, true);
    return toAdminUserResponse(userRepository.save(user));
  }

  @Transactional
  public AdminUserResponse updateUser(UUID userId, AdminUserUpsertRequest request) {
    var user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
    applyUser(user, request, false);
    return toAdminUserResponse(user);
  }

  @Transactional
  public void deleteUser(UUID userId) {
    var user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
    user.setActive(false);
    // Soft-delete: deactivate so existing foreign keys remain intact
  }

  @Transactional
  public AdminUserResponse activateUser(UUID userId) {
    var user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
    user.setActive(true);
    return toAdminUserResponse(user);
  }

  @Transactional
  public AdminUserResponse deactivateUser(UUID userId) {
    var user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
    user.setActive(false);
    return toAdminUserResponse(user);
  }

  @Transactional
  public AdminUserResponse changeUserRole(UUID userId, UserRole newRole) {
    var user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
    user.setRole(newRole);
    return toAdminUserResponse(user);
  }

  @Transactional(readOnly = true)
  public List<AdminDepartmentResponse> listDepartments() {
    return departmentRepository.findAllByOrderByNameAsc().stream().map(this::toAdminDepartmentResponse).toList();
  }

  @Transactional(readOnly = true)
  public AdminDepartmentResponse getDepartment(UUID departmentId) {
    return toAdminDepartmentResponse(
        departmentRepository.findById(departmentId).orElseThrow(() -> new NotFoundException("Department not found")));
  }

  @Transactional
  public AdminDepartmentResponse createDepartment(AdminDepartmentUpsertRequest request) {
    if (departmentRepository.existsByNameIgnoreCase(request.name())) {
      throw new ConflictException("Department already exists");
    }
    var department = new DepartmentEntity();
    applyDepartment(department, request);
    return toAdminDepartmentResponse(departmentRepository.save(department));
  }

  @Transactional
  public AdminDepartmentResponse updateDepartment(UUID departmentId, AdminDepartmentUpsertRequest request) {
    var department = departmentRepository.findById(departmentId)
        .orElseThrow(() -> new NotFoundException("Department not found"));
    applyDepartment(department, request);
    return toAdminDepartmentResponse(department);
  }

  @Transactional
  public void deleteDepartment(UUID departmentId) {
    var department = departmentRepository.findById(departmentId)
        .orElseThrow(() -> new NotFoundException("Department not found"));
    department.setActive(false);
    // Soft-delete: preserves referential integrity with users and rooms
  }

  @Transactional
  public AdminUserResponse assignDoctorToDepartment(UUID departmentId, UUID doctorId) {
    var department = departmentRepository.findById(departmentId)
        .orElseThrow(() -> new NotFoundException("Department not found"));
    var doctor = userRepository.findByIdAndRoleAndActiveTrue(doctorId, UserRole.DOCTOR)
        .orElseThrow(() -> new NotFoundException("Active doctor not found"));
    doctor.setDepartment(department);
    return toAdminUserResponse(doctor);
  }

  @Transactional
  public AdminUserResponse removeDoctorFromDepartment(UUID departmentId, UUID doctorId) {
    // Verify the department exists
    departmentRepository.findById(departmentId)
        .orElseThrow(() -> new NotFoundException("Department not found"));
    var doctor = userRepository.findByIdAndRoleAndActiveTrue(doctorId, UserRole.DOCTOR)
        .orElseThrow(() -> new NotFoundException("Active doctor not found"));
    if (doctor.getDepartment() == null || !doctor.getDepartment().getId().equals(departmentId)) {
      throw new ConflictException("Doctor is not assigned to this department");
    }
    doctor.setDepartment(null);
    return toAdminUserResponse(doctor);
  }

  @Transactional(readOnly = true)
  public AdminStatsResponse getStats() {
    return new AdminStatsResponse(
        userRepository.count(),
        userRepository.countByRoleAndActiveTrue(UserRole.DOCTOR),
        departmentRepository.count(),
        appointmentRepository.countByAppointmentDate(LocalDate.now()),
        invoiceRepository.countByStatus(InvoiceStatus.PAID),
        invoiceRepository.countByStatus(InvoiceStatus.UNPAID));
  }

  private void applyUser(UserEntity user, AdminUserUpsertRequest request, boolean newUser) {
    user.setEmail(request.email().trim().toLowerCase());
    user.setFullName(request.fullName().trim());
    user.setPhone(request.phone());
    user.setRole(request.role());
    user.setSpecialty(request.specialty());
    user.setQualification(request.qualification());
    user.setExperienceYears(request.experienceYears());
    user.setActive(request.active() == null ? true : request.active());
    user.setDepartment(resolveDepartment(request.departmentId()));

    if (request.password() != null && !request.password().isBlank()) {
      user.setPasswordHash(passwordEncoder.encode(request.password()));
    } else if (newUser && (user.getPasswordHash() == null || user.getPasswordHash().isBlank())) {
      throw new ConflictException("Password is required for new users");
    }
  }

  private void applyDepartment(DepartmentEntity department, AdminDepartmentUpsertRequest request) {
    department.setName(request.name().trim());
    department.setDescription(request.description());
    department.setImageUrl(request.imageUrl());
    department.setPhone(request.phone());
    department.setActive(request.active() == null ? true : request.active());
  }

  private DepartmentEntity resolveDepartment(UUID departmentId) {
    if (departmentId == null) {
      return null;
    }
    return departmentRepository.findById(departmentId)
        .orElseThrow(() -> new NotFoundException("Department not found"));
  }

  private AdminUserResponse toAdminUserResponse(UserEntity user) {
    return new AdminUserResponse(
        user.getId(),
        user.getEmail(),
        user.getFullName(),
        user.getPhone(),
        user.getRole(),
        user.getDepartment() == null ? null : user.getDepartment().getId(),
        user.getDepartment() == null ? null : user.getDepartment().getName(),
        user.getSpecialty(),
        user.getQualification(),
        user.getExperienceYears(),
        user.isActive());
  }

  private AdminDepartmentResponse toAdminDepartmentResponse(DepartmentEntity department) {
    return new AdminDepartmentResponse(
        department.getId(),
        department.getName(),
        department.getDescription(),
        department.getImageUrl(),
        department.getPhone(),
        department.isActive());
  }
}
