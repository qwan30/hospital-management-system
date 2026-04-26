package com.hospital.core.chatbot;

import com.hospital.core.department.DepartmentRepository;
import com.hospital.core.timeslot.TimeSlotRepository;
import com.hospital.core.user.UserRepository;
import com.hospital.shared.chatbot.ChatbotMessageResponse;
import com.hospital.shared.enums.SlotStatus;
import com.hospital.shared.enums.UserRole;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ChatbotService {
  private final DepartmentRepository departmentRepository;
  private final TimeSlotRepository timeSlotRepository;
  private final UserRepository userRepository;

  public ChatbotService(
      DepartmentRepository departmentRepository,
      TimeSlotRepository timeSlotRepository,
      UserRepository userRepository) {
    this.departmentRepository = departmentRepository;
    this.timeSlotRepository = timeSlotRepository;
    this.userRepository = userRepository;
  }

  @Transactional(readOnly = true)
  public ChatbotMessageResponse reply(String message) {
    var normalized = message.toLowerCase().trim();

    if (mentionsAvailability(normalized)) {
      return availabilityAnswer();
    }

    if (mentionsDoctor(normalized)) {
      return doctorAnswer();
    }

    if (mentionsDepartment(normalized)) {
      return departmentAnswer();
    }

    if (mentionsBooking(normalized)) {
      return new ChatbotMessageResponse(
          "You can book in four steps: choose a department and doctor, describe symptoms for clinical triage, pick an available slot, then confirm patient details.",
          List.of("Show available departments", "Who is available this week?", "Open the booking page"),
          "/booking");
    }

    return new ChatbotMessageResponse(
        "I can help with departments, doctors, and the next available appointment slots. Ask about a doctor, a department, or how to start booking.",
        List.of("Show departments", "List doctors", "Find available slots"),
        "/booking");
  }

  private ChatbotMessageResponse departmentAnswer() {
    var departments = departmentRepository.findByActiveTrueOrderByNameAsc().stream()
        .map(department -> department.getName())
        .limit(6)
        .toList();
    return new ChatbotMessageResponse(
        "Current active departments: " + String.join(", ", departments) + ".",
        List.of("List doctors", "Find available slots", "Open the booking page"),
        "/departments");
  }

  private ChatbotMessageResponse doctorAnswer() {
    var doctors = userRepository.findByRoleAndActiveTrueOrderByFullNameAsc(UserRole.DOCTOR).stream()
        .limit(6)
        .map(doctor -> doctor.getFullName() + (doctor.getSpecialty() == null ? "" : " - " + doctor.getSpecialty()))
        .toList();
    return new ChatbotMessageResponse(
        "Available doctors in the system: " + String.join(", ", doctors) + ".",
        List.of("Which departments are available?", "Find the next open slot", "Open the booking page"),
        "/doctors");
  }

  private ChatbotMessageResponse availabilityAnswer() {
    var slots = timeSlotRepository.findTop10BySlotDateGreaterThanEqualAndStatusOrderBySlotDateAscStartTimeAsc(
        LocalDate.now(),
        SlotStatus.AVAILABLE);
    if (slots.isEmpty()) {
      return new ChatbotMessageResponse(
          "I could not find an open appointment slot right now. Please try again later or call the hospital hotline.",
          List.of("Show doctors", "Show departments", "Open the booking page"),
          "/booking");
    }

    var slotSummary = slots.stream()
        .limit(5)
        .map(slot -> slot.getDoctor().getFullName() + " on " + slot.getSlotDate() + " at " + slot.getStartTime())
        .toList();
    return new ChatbotMessageResponse(
        "The next available appointment windows are: " + String.join("; ", slotSummary) + ".",
        List.of("Open the booking page", "Show doctors", "Show departments"),
        "/booking");
  }

  private boolean mentionsAvailability(String message) {
    return message.contains("available")
        || message.contains("slot")
        || message.contains("rảnh")
        || message.contains("lich")
        || message.contains("schedule");
  }

  private boolean mentionsDoctor(String message) {
    return message.contains("doctor") || message.contains("bác sĩ") || message.contains("bac si");
  }

  private boolean mentionsDepartment(String message) {
    return message.contains("department") || message.contains("khoa");
  }

  private boolean mentionsBooking(String message) {
    return message.contains("booking") || message.contains("appointment") || message.contains("đặt lịch") || message.contains("dat lich");
  }
}
