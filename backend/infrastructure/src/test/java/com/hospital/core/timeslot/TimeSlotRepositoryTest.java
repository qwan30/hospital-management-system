package com.hospital.core.timeslot;

import static org.assertj.core.api.Assertions.assertThat;

import com.hospital.core.department.DepartmentEntity;
import com.hospital.core.user.UserEntity;
import com.hospital.shared.enums.SlotStatus;
import com.hospital.shared.enums.UserRole;
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
class TimeSlotRepositoryTest {

  @Autowired
  private TimeSlotRepository timeSlotRepository;

  @Autowired
  private TestEntityManager entityManager;

  private UserEntity doctor;

  @BeforeEach
  void setUp() {
    var department = persistDepartment("General Medicine");
    doctor = persistDoctor(department, "generaldoc@test.com", "Dr. General");
  }

  @Test
  void lockWindow_noMatchingSlotsReturnsEmptyList() {
    var results = timeSlotRepository.lockWindow(
        UUID.randomUUID(),
        LocalDate.of(2030, 12, 31),
        LocalTime.of(8, 0));

    assertThat(results).isEmpty();
  }

  @Test
  void lockWindow_withMatchingSlotsReturnsLockedSlots() {
    var slot = persistTimeSlot(doctor, LocalDate.of(2026, 6, 20), LocalTime.of(9, 0));

    var results = timeSlotRepository.lockWindow(
        doctor.getId(),
        LocalDate.of(2026, 6, 20),
        LocalTime.of(8, 0));

    assertThat(results).hasSize(1);
    assertThat(results.get(0).getId()).isEqualTo(slot.getId());
    assertThat(results.get(0).getStartTime()).isEqualTo(LocalTime.of(9, 0));
  }

  @Test
  void lockWindow_withStartTimeFilterExcludesEarlierSlots() {
    persistTimeSlot(doctor, LocalDate.of(2026, 6, 20), LocalTime.of(8, 0));
    var laterSlot = persistTimeSlot(doctor, LocalDate.of(2026, 6, 20), LocalTime.of(10, 0));

    // Only slots with startTime >= 09:00 should be returned
    var results = timeSlotRepository.lockWindow(
        doctor.getId(),
        LocalDate.of(2026, 6, 20),
        LocalTime.of(9, 0));

    assertThat(results).hasSize(1);
    assertThat(results.get(0).getStartTime()).isEqualTo(LocalTime.of(10, 0));
  }

  @Test
  void findTop10BySlotDateGreaterThanEqualAndStatus_noMatchingSlotsReturnsEmptyList() {
    var results = timeSlotRepository
        .findTop10BySlotDateGreaterThanEqualAndStatusOrderBySlotDateAscStartTimeAsc(
            LocalDate.of(2030, 12, 31), SlotStatus.AVAILABLE);

    assertThat(results).isEmpty();
  }

  @Test
  void findTop10BySlotDateGreaterThanEqualAndStatus_withMatchingSlotsReturnsFilteredResults() {
    persistTimeSlot(doctor, LocalDate.of(2026, 7, 1), LocalTime.of(9, 0));

    var results = timeSlotRepository
        .findTop10BySlotDateGreaterThanEqualAndStatusOrderBySlotDateAscStartTimeAsc(
            LocalDate.of(2026, 7, 1), SlotStatus.AVAILABLE);

    assertThat(results).hasSize(1);
    assertThat(results.get(0).getStatus()).isEqualTo(SlotStatus.AVAILABLE);
  }

  @Test
  void findTop10BySlotDateGreaterThanEqualAndStatus_bookedSlotsAreExcluded() {
    var availableSlot = persistTimeSlot(doctor, LocalDate.of(2026, 7, 1), LocalTime.of(9, 0));
    var bookedSlot = persistTimeSlot(doctor, LocalDate.of(2026, 7, 1), LocalTime.of(10, 0));
    bookedSlot.setStatus(SlotStatus.BOOKED);
    entityManager.persist(bookedSlot);
    entityManager.flush();

    var results = timeSlotRepository
        .findTop10BySlotDateGreaterThanEqualAndStatusOrderBySlotDateAscStartTimeAsc(
            LocalDate.of(2026, 7, 1), SlotStatus.AVAILABLE);

    assertThat(results).hasSize(1);
    assertThat(results.get(0).getId()).isEqualTo(availableSlot.getId());
  }

  @Test
  void findByDoctorIdAndSlotDateOrderByStartTimeAsc_noSlotsReturnsEmptyList() {
    var results = timeSlotRepository
        .findByDoctorIdAndSlotDateOrderByStartTimeAsc(
            UUID.randomUUID(), LocalDate.of(2030, 12, 31));

    assertThat(results).isEmpty();
  }

  private DepartmentEntity persistDepartment(String name) {
    var dept = new DepartmentEntity();
    dept.setId(UUID.randomUUID());
    dept.setName(name);
    entityManager.persist(dept);
    return dept;
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
    entityManager.flush();
    return slot;
  }
}
