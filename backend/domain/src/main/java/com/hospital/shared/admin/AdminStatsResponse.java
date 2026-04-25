package com.hospital.shared.admin;

public record AdminStatsResponse(
    long totalUsers,
    long activeDoctors,
    long totalDepartments,
    long todayAppointments,
    long paidInvoices,
    long unpaidInvoices
) {}
