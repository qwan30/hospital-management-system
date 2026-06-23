package com.hospital.core.doctor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.hospital.core.common.NotFoundException;
import com.hospital.core.timeslot.TimeSlotEntity;
import com.hospital.core.timeslot.TimeSlotRepository;
import com.hospital.core.user.UserEntity;
import com.hospital.core.user.UserRepository;
import com.hospital.shared.enums.SlotStatus;
import com.hospital.shared.enums.UserRole;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DoctorReadServiceTest {

  @Mock
  private UserRepository userRepository;

  @Mock
  private TimeSlotRepository timeSlotRepository;

  @InjectMocks
  private DoctorReadService doctorReadService;

  private UUID doctorId;
  private UserEntity doctor;

  @BeforeEach
  void setUp() {
    doctorId = UUID.randomUUID();
    doctor = new UserEntity();
    doctor.setId(doctorId);
    doctor.setFullName("Dr. Gregory House");
    doctor.setEmail("house@hospital.com");
    doctor.setSpecialty("Diagnostics");
    doctor.setQualification("MD");
    doctor.setExperienceYears(20);
    doctor.setRole(UserRole.DOCTOR);
  }

  @Test
  void listDoctors_returnsActiveDoctors() {
    var dept = new com.hospital.core.department.DepartmentEntity();
    UUID deptId = UUID.randomUUID();
    dept.setId(deptId);
    doctor.setDepartment(dept);

    when(userRepository.findByRoleAndActiveTrueOrderByFullNameAsc(UserRole.DOCTOR))
        .thenReturn(List.of(doctor));

    var results = doctorReadService.listDoctors();

    assertThat(results).hasSize(1);
    var response = results.get(0);
    assertThat(response.id()).isEqualTo(doctorId);
    assertThat(response.departmentId()).isEqualTo(deptId);
    assertThat(response.fullName()).isEqualTo("Dr. Gregory House");
    assertThat(response.email()).isEqualTo("house@hospital.com");
    assertThat(response.specialty()).isEqualTo("Diagnostics");
    assertThat(response.qualification()).isEqualTo("MD");
    assertThat(response.experienceYears()).isEqualTo(20);
  }

  @Test
  void getDoctor_nonExistentThrowsNotFound() {
    when(userRepository.findByIdAndRoleAndActiveTrue(doctorId, UserRole.DOCTOR))
        .thenReturn(Optional.empty());

    assertThatThrownBy(() -> doctorReadService.getDoctor(doctorId))
        .isInstanceOf(NotFoundException.class)
        .hasMessageContaining("Doctor not found");
  }

  @Test
  void getDoctor_returnsDoctor() {
    when(userRepository.findByIdAndRoleAndActiveTrue(doctorId, UserRole.DOCTOR))
        .thenReturn(Optional.of(doctor));

    var response = doctorReadService.getDoctor(doctorId);

    assertThat(response.id()).isEqualTo(doctorId);
    assertThat(response.fullName()).isEqualTo("Dr. Gregory House");
  }

  @Test
  void listDoctorSlots_nonExistentDoctorThrowsNotFound() {
    LocalDate date = LocalDate.of(2026, 6, 23);
    when(userRepository.findByIdAndRoleAndActiveTrue(doctorId, UserRole.DOCTOR))
        .thenReturn(Optional.empty());

    assertThatThrownBy(() -> doctorReadService.listDoctorSlots(doctorId, date))
        .isInstanceOf(NotFoundException.class)
        .hasMessageContaining("Doctor not found");
  }

  @Test
  void listDoctorSlots_returnsSlots() {
    LocalDate date = LocalDate.of(2026, 6, 23);
    when(userRepository.findByIdAndRoleAndActiveTrue(doctorId, UserRole.DOCTOR))
        .thenReturn(Optional.of(doctor));

    var slot = new TimeSlotEntity();
    slot.setId(UUID.randomUUID());
    slot.setDoctor(doctor);
    slot.setSlotDate(date);
    slot.setStartTime(LocalTime.of(9, 0));
    slot.setEndTime(LocalTime.of(9, 30));
    slot.setStatus(SlotStatus.AVAILABLE);

    when(timeSlotRepository.findByDoctorIdAndSlotDateOrderByStartTimeAsc(doctorId, date))
        .thenReturn(List.of(slot));

    var results = doctorReadService.listDoctorSlots(doctorId, date);

    assertThat(results).hasSize(1);
    var response = results.get(0);
    assertThat(response.id()).isEqualTo(slot.getId());
    assertThat(response.doctorId()).isEqualTo(doctorId);
    assertThat(response.slotDate()).isEqualTo(date);
    assertThat(response.startTime()).isEqualTo(LocalTime.of(9, 0));
    assertThat(response.endTime()).isEqualTo(LocalTime.of(9, 30));
    assertThat(response.status()).isEqualTo(SlotStatus.AVAILABLE);
  }

  @Test
  void getDoctor_withDepartment_returnsDoctorWithDepartmentId() {
    var dept = new com.hospital.core.department.DepartmentEntity();
    UUID deptId = UUID.randomUUID();
    dept.setId(deptId);
    doctor.setDepartment(dept);

    when(userRepository.findByIdAndRoleAndActiveTrue(doctorId, UserRole.DOCTOR))
        .thenReturn(Optional.of(doctor));

    var response = doctorReadService.getDoctor(doctorId);

    assertThat(response.id()).isEqualTo(doctorId);
    assertThat(response.departmentId()).isEqualTo(deptId);
  }
}
