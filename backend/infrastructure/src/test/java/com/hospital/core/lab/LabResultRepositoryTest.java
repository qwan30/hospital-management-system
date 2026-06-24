package com.hospital.core.lab;

import static org.assertj.core.api.Assertions.assertThat;

import com.hospital.core.appointment.AppointmentEntity;
import com.hospital.core.department.DepartmentEntity;
import com.hospital.core.patient.PatientEntity;
import com.hospital.core.timeslot.TimeSlotEntity;
import com.hospital.core.user.UserEntity;
import com.hospital.shared.enums.AppointmentStatus;
import com.hospital.shared.enums.Gender;
import com.hospital.shared.enums.SlotStatus;
import com.hospital.shared.enums.UserRole;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class LabResultRepositoryTest {

  @Autowired
  private LabResultRepository labResultRepository;

  @Autowired
  private TestEntityManager entityManager;

  private PatientEntity patient;
  private AppointmentEntity appointment;

  @BeforeEach
  void setUp() {
    var department = persistDepartment("Lab");
    patient = persistPatient("Lab Patient", "labpatient@test.com");
    var doctor = persistDoctor(department, "labdoctor@test.com", "Dr. Lab");
    var slot = persistTimeSlot(doctor, LocalDate.of(2026, 6, 15), LocalTime.of(10, 0));
    appointment = persistAppointment(patient, doctor, slot);
  }

  @Test
  void findByIdAndDeletedFalse_deletedEntityReturnsEmpty() {
    var labResult = persistLabResult(true);

    var result = labResultRepository.findByIdAndDeletedFalse(labResult.getId());

    assertThat(result).isEmpty();
  }

  @Test
  void findByIdAndDeletedFalse_nonDeletedEntityReturnsPresent() {
    var labResult = persistLabResult(false);

    var result = labResultRepository.findByIdAndDeletedFalse(labResult.getId());

    assertThat(result).isPresent();
    assertThat(result.get().getTestName()).isEqualTo("Complete Blood Count");
    assertThat(result.get().isDeleted()).isFalse();
  }

  @Test
  void findByAppointmentIdAndDeletedFalseOrderByCreatedAtDesc_noResultsReturnsEmpty() {
    var results = labResultRepository
        .findByAppointmentIdAndDeletedFalseOrderByCreatedAtDesc(UUID.randomUUID());

    assertThat(results).isEmpty();
  }

  @Test
  void findByAppointmentIdAndDeletedFalseOrderByCreatedAtDesc_withResultsReturnsNonDeletedOnly() {
    // Persist a non-deleted lab result for the appointment
    persistLabResult(false);

    // Persist a deleted lab result for the same appointment
    var deletedResult = new LabResultEntity();
    deletedResult.setId(UUID.randomUUID());
    deletedResult.setPatient(patient);
    deletedResult.setAppointment(appointment);
    deletedResult.setTestName("Deleted Test");
    deletedResult.setResultValue("Should be excluded");
    deletedResult.setStatus("completed");
    deletedResult.setDeleted(true);
    entityManager.persist(deletedResult);
    entityManager.flush();

    var results = labResultRepository
        .findByAppointmentIdAndDeletedFalseOrderByCreatedAtDesc(appointment.getId());

    assertThat(results).hasSize(1);
    assertThat(results.get(0).getTestName()).isEqualTo("Complete Blood Count");
  }

  @Test
  void findByIdAndDeletedFalse_nonExistentIdReturnsEmpty() {
    var result = labResultRepository.findByIdAndDeletedFalse(UUID.randomUUID());

    assertThat(result).isEmpty();
  }

  private DepartmentEntity persistDepartment(String name) {
    var dept = new DepartmentEntity();
    dept.setId(UUID.randomUUID());
    dept.setName(name);
    entityManager.persist(dept);
    return dept;
  }

  private PatientEntity persistPatient(String fullName, String email) {
    var p = new PatientEntity();
    p.setId(UUID.randomUUID());
    p.setFullName(fullName);
    p.setPhone("0987654321");
    p.setEmail(email);
    p.setDateOfBirth(LocalDate.of(1985, 5, 15));
    p.setGender(Gender.FEMALE);
    p.setCccd("encrypted-cccd-" + UUID.randomUUID());
    entityManager.persist(p);
    return p;
  }

  private UserEntity persistDoctor(DepartmentEntity department, String email, String fullName) {
    var u = new UserEntity();
    u.setId(UUID.randomUUID());
    u.setDepartment(department);
    u.setEmail(email);
    u.setPasswordHash("$2a$10$hash");
    u.setFullName(fullName);
    u.setRole(UserRole.DOCTOR);
    entityManager.persist(u);
    return u;
  }

  private TimeSlotEntity persistTimeSlot(UserEntity doc, LocalDate date, LocalTime start) {
    var slot = new TimeSlotEntity();
    slot.setId(UUID.randomUUID());
    slot.setDoctor(doc);
    slot.setSlotDate(date);
    slot.setStartTime(start);
    slot.setEndTime(start.plusMinutes(30));
    slot.setStatus(SlotStatus.AVAILABLE);
    entityManager.persist(slot);
    return slot;
  }

  private AppointmentEntity persistAppointment(
      PatientEntity pat, UserEntity doc, TimeSlotEntity firstSlot) {
    var appt = new AppointmentEntity();
    appt.setId(UUID.randomUUID());
    appt.setPatient(pat);
    appt.setDoctor(doc);
    appt.setFirstSlot(firstSlot);
    appt.setAppointmentDate(firstSlot.getSlotDate());
    appt.setAiDurationMinutes(30);
    appt.setConfirmationCode("LR-TEST-001");
    appt.setStatus(AppointmentStatus.CONFIRMED);
    entityManager.persist(appt);
    entityManager.flush();
    return appt;
  }

  private LabResultEntity persistLabResult(boolean deleted) {
    var lr = new LabResultEntity();
    lr.setId(UUID.randomUUID());
    lr.setPatient(patient);
    lr.setAppointment(appointment);
    lr.setTestName("Complete Blood Count");
    lr.setResultValue("All values within normal range");
    lr.setReferenceRange("See attached");
    lr.setStatus("completed");
    lr.setCollectedAt(Instant.now());
    lr.setDeleted(deleted);
    entityManager.persist(lr);
    entityManager.flush();
    return lr;
  }
}
