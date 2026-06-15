package com.hospital.core.appointment;

import static org.assertj.core.api.Assertions.assertThat;

import com.hospital.core.department.DepartmentEntity;
import com.hospital.core.patient.PatientEntity;
import com.hospital.core.timeslot.TimeSlotEntity;
import com.hospital.core.user.UserEntity;
import com.hospital.shared.enums.AppointmentStatus;
import com.hospital.shared.enums.Gender;
import com.hospital.shared.enums.SlotStatus;
import com.hospital.shared.enums.UserRole;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class AppointmentRepositoryTest {

  @Autowired
  private AppointmentRepository appointmentRepository;

  @Autowired
  private TestEntityManager entityManager;

  private PatientEntity patient;
  private UserEntity doctor;
  private TimeSlotEntity slot;

  @BeforeEach
  void setUp() {
    var department = persistDepartment("Cardiology");
    patient = persistPatient("Test Patient", "patient@test.com");
    doctor = persistDoctor(department, "doctor@test.com", "Dr. Smith");
    slot = persistTimeSlot(doctor, LocalDate.of(2026, 6, 15), LocalTime.of(9, 0));
  }

  @Test
  void findDetailedById_nonExistentIdReturnsEmpty() {
    var result = appointmentRepository.findDetailedById(UUID.randomUUID());
    assertThat(result).isEmpty();
  }

  @Test
  void findByAppointmentDateAndStatusIn_emptyResultReturnsEmptyList() {
    var dateWithNoAppointments = LocalDate.of(2030, 12, 31);
    var results = appointmentRepository
        .findByAppointmentDateAndStatusInOrderByCheckedInAtAscFirstSlotStartTimeAsc(
            dateWithNoAppointments, List.of(AppointmentStatus.PENDING));
    assertThat(results).isEmpty();
  }

  @Test
  void existsByDoctorIdAndPatientId_noMatchReturnsFalse() {
    var exists = appointmentRepository.existsByDoctorIdAndPatientId(
        UUID.randomUUID(), UUID.randomUUID());
    assertThat(exists).isFalse();
  }

  @Test
  void countByAppointmentDate_noAppointmentsReturnsZero() {
    var dateWithNoAppointments = LocalDate.of(2030, 12, 31);
    var count = appointmentRepository.countByAppointmentDate(dateWithNoAppointments);
    assertThat(count).isZero();
  }

  @Test
  void findDetailedById_withExistingAppointmentReturnsEntity() {
    var appointment = persistAppointment(patient, doctor, slot);
    var result = appointmentRepository.findDetailedById(appointment.getId());
    assertThat(result).isPresent();
    assertThat(result.get().getConfirmationCode()).isEqualTo("CONF-001");
  }

  @Test
  void findByAppointmentDateAndStatusIn_withMatchingDataReturnsList() {
    var appointment = persistAppointment(patient, doctor, slot);

    var results = appointmentRepository
        .findByAppointmentDateAndStatusInOrderByCheckedInAtAscFirstSlotStartTimeAsc(
            appointment.getAppointmentDate(),
            List.of(AppointmentStatus.CONFIRMED));
    assertThat(results).hasSize(1);
    assertThat(results.get(0).getConfirmationCode()).isEqualTo("CONF-001");
  }

  @Test
  void existsByDoctorIdAndPatientId_withMatchReturnsTrue() {
    persistAppointment(patient, doctor, slot);
    var exists = appointmentRepository.existsByDoctorIdAndPatientId(
        doctor.getId(), patient.getId());
    assertThat(exists).isTrue();
  }

  @Test
  void countByAppointmentDate_withAppointmentsReturnsCorrectCount() {
    persistAppointment(patient, doctor, slot);
    var count = appointmentRepository.countByAppointmentDate(
        LocalDate.of(2026, 6, 15));
    assertThat(count).isEqualTo(1);
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
    p.setPhone("0123456789");
    p.setEmail(email);
    p.setDateOfBirth(LocalDate.of(1990, 1, 1));
    p.setGender(Gender.MALE);
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
    appt.setConfirmationCode("CONF-001");
    appt.setStatus(AppointmentStatus.CONFIRMED);
    entityManager.persist(appt);
    entityManager.flush();
    return appt;
  }
}
