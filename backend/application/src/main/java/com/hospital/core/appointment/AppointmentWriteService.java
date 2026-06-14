package com.hospital.core.appointment;

import com.hospital.core.common.ConflictException;
import com.hospital.core.common.NotFoundException;
import com.hospital.core.email.EmailService;
import com.hospital.core.patient.PatientEntity;
import com.hospital.core.patient.PatientIdentifierProtector;
import com.hospital.core.patient.PatientRepository;
import com.hospital.core.timeslot.TimeSlotRepository;
import com.hospital.core.user.UserRepository;
import com.hospital.shared.booking.AppointmentCreateRequest;
import com.hospital.shared.booking.AppointmentResponse;
import com.hospital.shared.enums.AppointmentStatus;
import com.hospital.shared.enums.SlotStatus;
import com.hospital.shared.enums.UserRole;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AppointmentWriteService implements CreateAppointmentUseCase {
  private final AppointmentRepository appointmentRepository;
  private final PatientRepository patientRepository;
  private final PatientIdentifierProtector patientIdentifierProtector;
  private final TimeSlotRepository timeSlotRepository;
  private final UserRepository userRepository;
  private final EmailService emailService;

  public AppointmentWriteService(
      AppointmentRepository appointmentRepository,
      PatientRepository patientRepository,
      PatientIdentifierProtector patientIdentifierProtector,
      TimeSlotRepository timeSlotRepository,
      UserRepository userRepository,
      EmailService emailService) {
    this.appointmentRepository = appointmentRepository;
    this.patientRepository = patientRepository;
    this.patientIdentifierProtector = patientIdentifierProtector;
    this.timeSlotRepository = timeSlotRepository;
    this.userRepository = userRepository;
    this.emailService = emailService;
  }

  @Transactional
  public AppointmentResponse createAppointment(AppointmentCreateRequest request) {
    var doctor = userRepository.findByIdAndRoleAndActiveTrue(request.doctorId(), UserRole.DOCTOR)
        .orElseThrow(() -> new NotFoundException("Doctor not found"));

    var firstSlot = timeSlotRepository.findByIdForUpdate(request.firstSlotId())
        .orElseThrow(() -> new NotFoundException("Slot not found"));

    if (!firstSlot.getDoctor().getId().equals(doctor.getId())) {
      throw new ConflictException("Selected slot does not belong to doctor");
    }

    var slotsNeeded = Math.max(1, (request.aiDurationMinutes() + 29) / 30);
    var lockedSlots = timeSlotRepository.lockWindow(
        doctor.getId(),
        firstSlot.getSlotDate(),
        firstSlot.getStartTime());

    if (lockedSlots.size() < slotsNeeded) {
      throw new ConflictException("Not enough contiguous slots available");
    }

    var selectedSlots = lockedSlots.subList(0, slotsNeeded);
    validateSlots(selectedSlots);

    var patient = createPatient(request);
    selectedSlots.forEach(slot -> slot.setStatus(SlotStatus.BOOKED));

    var appointment = new AppointmentEntity();
    appointment.setPatient(patient);
    appointment.setDoctor(doctor);
    appointment.setFirstSlot(firstSlot);
    appointment.setAppointmentDate(firstSlot.getSlotDate());
    appointment.setAiDurationMinutes(request.aiDurationMinutes());
    appointment.setSymptoms(request.symptoms());
    appointment.setConfirmationCode("HMS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
    appointment.setStatus(AppointmentStatus.CONFIRMED);
    applyBookingContact(appointment, request);

    var saved = appointmentRepository.save(appointment);
    emailService.sendAppointmentConfirmation(patient.getEmail(), saved.getConfirmationCode());
    return new AppointmentResponse(
        saved.getId(),
        patient.getId(),
        doctor.getId(),
        firstSlot.getId(),
        saved.getConfirmationCode(),
        saved.getStatus(),
        saved.getAppointmentDate());
  }

  private void validateSlots(List<com.hospital.core.timeslot.TimeSlotEntity> slots) {
    for (int index = 0; index < slots.size(); index++) {
      var slot = slots.get(index);
      if (slot.getStatus() != SlotStatus.AVAILABLE) {
        throw new ConflictException("Requested slot window is already reserved");
      }
      if (index > 0) {
        var previous = slots.get(index - 1);
        if (!previous.getEndTime().equals(slot.getStartTime())) {
          throw new ConflictException("Requested slot window is not contiguous");
        }
      }
    }
  }

  private PatientEntity createPatient(AppointmentCreateRequest request) {
    var cccdHash = patientIdentifierProtector.hash(request.patientCccd());
    var patient = patientRepository.findByCccdHash(cccdHash).orElseGet(PatientEntity::new);
    patient.setFullName(request.patientFullName());
    patient.setEmail(request.patientEmail());
    patient.setPhone(request.patientPhone());
    patient.setDateOfBirth(request.patientDateOfBirth());
    patient.setGender(request.patientGender());
    patient.setProvinceOrCity(request.patientAddress().provinceOrCity());
    patient.setDistrict(request.patientAddress().district());
    patient.setStreetAddress(request.patientAddress().streetAddress());
    patient.setOccupation(trimToNull(request.patientOccupation()));
    patient.setBloodType(trimToNull(request.patientBloodType()));
    patient.setMedicalHistory(trimToNull(request.patientMedicalHistory()));
    patient.setDrugAllergies(trimToNull(request.patientDrugAllergies()));
    patient.setInsuranceNumber(trimToNull(request.patientInsuranceNumber()));
    patient.setCccd(patientIdentifierProtector.encrypt(request.patientCccd()));
    patient.setCccdHash(cccdHash);
    return patientRepository.save(patient);
  }

  private void applyBookingContact(AppointmentEntity appointment, AppointmentCreateRequest request) {
    if (request.bookingContact() == null) {
      appointment.setBookingContactFullName(null);
      appointment.setBookingContactRelationship(null);
      appointment.setBookingContactPhone(null);
      appointment.setBookingContactEmail(null);
      appointment.setBookingContactCccd(null);
      appointment.setBookingContactDateOfBirth(null);
      appointment.setBookingContactGender(null);
      return;
    }

    appointment.setBookingContactFullName(request.bookingContact().fullName());
    appointment.setBookingContactRelationship(request.bookingContact().relationship());
    appointment.setBookingContactPhone(trimToNull(request.bookingContact().phone()));
    appointment.setBookingContactEmail(trimToNull(request.bookingContact().email()));
    appointment.setBookingContactCccd(request.bookingContact().cccd() == null || request.bookingContact().cccd().isBlank()
        ? null
        : patientIdentifierProtector.encrypt(request.bookingContact().cccd()));
    appointment.setBookingContactDateOfBirth(request.bookingContact().dateOfBirth());
    appointment.setBookingContactGender(request.bookingContact().gender());
  }

  private String trimToNull(String value) {
    if (value == null) {
      return null;
    }
    var trimmed = value.trim();
    return trimmed.isEmpty() ? null : trimmed;
  }
}
