package com.hospital.core.department;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.hospital.core.common.NotFoundException;
import com.hospital.core.user.UserEntity;
import com.hospital.core.user.UserRepository;
import com.hospital.shared.enums.UserRole;
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
class DepartmentReadServiceTest {

  @Mock
  private DepartmentRepository departmentRepository;

  @Mock
  private UserRepository userRepository;

  @InjectMocks
  private DepartmentReadService departmentReadService;

  private UUID deptId;
  private DepartmentEntity activeDept;
  private DepartmentEntity inactiveDept;

  @BeforeEach
  void setUp() {
    deptId = UUID.randomUUID();
    
    activeDept = new DepartmentEntity();
    activeDept.setId(deptId);
    activeDept.setName("Cardiology");
    activeDept.setDescription("Heart care");
    activeDept.setImageUrl("http://img.url");
    activeDept.setPhone("123456");
    activeDept.setActive(true);

    inactiveDept = new DepartmentEntity();
    inactiveDept.setId(UUID.randomUUID());
    inactiveDept.setName("Neurology");
    inactiveDept.setActive(false);
  }

  @Test
  void listDepartments_returnsActiveDepartments() {
    when(departmentRepository.findByActiveTrueOrderByNameAsc())
        .thenReturn(List.of(activeDept));

    var results = departmentReadService.listDepartments();

    assertThat(results).hasSize(1);
    var response = results.get(0);
    assertThat(response.id()).isEqualTo(activeDept.getId());
    assertThat(response.name()).isEqualTo("Cardiology");
    assertThat(response.description()).isEqualTo("Heart care");
    assertThat(response.imageUrl()).isEqualTo("http://img.url");
    assertThat(response.phone()).isEqualTo("123456");
  }

  @Test
  void getDepartmentDetail_nonExistentOrInactiveThrowsNotFound() {
    when(departmentRepository.findById(deptId)).thenReturn(Optional.empty());
    assertThatThrownBy(() -> departmentReadService.getDepartmentDetail(deptId))
        .isInstanceOf(NotFoundException.class)
        .hasMessageContaining("Department not found");

    when(departmentRepository.findById(deptId)).thenReturn(Optional.of(inactiveDept));
    assertThatThrownBy(() -> departmentReadService.getDepartmentDetail(deptId))
        .isInstanceOf(NotFoundException.class)
        .hasMessageContaining("Department not found");
  }

  @Test
  void getDepartmentDetail_returnsDetailsAndDoctorSummaries() {
    when(departmentRepository.findById(deptId)).thenReturn(Optional.of(activeDept));

    var doctor1 = new UserEntity();
    doctor1.setId(UUID.randomUUID());
    doctor1.setFullName("Dr. Gregory House");
    doctor1.setSpecialty("Diagnostic Medicine");
    doctor1.setQualification("M.D.");
    doctor1.setExperienceYears(20);
    doctor1.setAvatarUrl("http://avatar.url");
    doctor1.setRole(UserRole.DOCTOR);
    doctor1.setDepartment(activeDept);

    var doctor2 = new UserEntity();
    doctor2.setId(UUID.randomUUID());
    doctor2.setFullName("Dr. James Wilson");
    doctor2.setRole(UserRole.DOCTOR);
    doctor2.setDepartment(activeDept);

    var otherDoctor = new UserEntity();
    otherDoctor.setId(UUID.randomUUID());
    otherDoctor.setRole(UserRole.DOCTOR);
    otherDoctor.setDepartment(inactiveDept);

    var doctorWithNoDept = new UserEntity();
    doctorWithNoDept.setId(UUID.randomUUID());
    doctorWithNoDept.setRole(UserRole.DOCTOR);
    doctorWithNoDept.setDepartment(null);

    when(userRepository.findByRoleAndActiveTrueOrderByFullNameAsc(UserRole.DOCTOR))
        .thenReturn(List.of(doctor1, doctor2, otherDoctor, doctorWithNoDept));

    var response = departmentReadService.getDepartmentDetail(deptId);

    assertThat(response.id()).isEqualTo(deptId);
    assertThat(response.name()).isEqualTo("Cardiology");
    assertThat(response.activeDoctorCount()).isEqualTo(2);
    assertThat(response.doctors()).hasSize(2);

    var docSummary = response.doctors().get(0);
    assertThat(docSummary.id()).isEqualTo(doctor1.getId());
    assertThat(docSummary.fullName()).isEqualTo("Dr. Gregory House");
    assertThat(docSummary.specialty()).isEqualTo("Diagnostic Medicine");
    assertThat(docSummary.qualification()).isEqualTo("M.D.");
    assertThat(docSummary.experienceYears()).isEqualTo(20);
    assertThat(docSummary.avatarUrl()).isEqualTo("http://avatar.url");
  }
}
