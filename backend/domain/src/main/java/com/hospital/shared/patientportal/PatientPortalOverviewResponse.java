package com.hospital.shared.patientportal;

public record PatientPortalOverviewResponse(
    String patientFullName,
    int upcomingAppointments,
    int unreadThreads,
    int availableLabResults,
    PatientPortalAppointmentResponse nextAppointment
) {}
