package com.hospital.core.appointment;

import com.hospital.shared.booking.AppointmentCreateRequest;
import com.hospital.shared.booking.AppointmentResponse;

/**
 * Input port (use case interface) for the appointment booking flow.
 * Clean Architecture Phase 7.4 — controllers depend on this abstraction,
 * not on concrete {@link AppointmentWriteService}.
 *
 * <p>Called by: {@code AppointmentController.createAppointment()} (line 56)</p>
 */
@FunctionalInterface
public interface CreateAppointmentUseCase {

  /**
   * Creates a new appointment booking with slot locking, patient creation,
   * and confirmation email.
   *
   * @param request booking request (doctor, slots, patient identity, symptoms)
   * @return created appointment with ID, confirmation code, status
   * @throws com.hospital.core.common.NotFoundException if doctor/slot not found
   * @throws com.hospital.core.common.ConflictException if slot unavailable
   */
  AppointmentResponse createAppointment(AppointmentCreateRequest request);
}
