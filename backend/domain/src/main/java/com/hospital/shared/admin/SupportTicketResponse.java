package com.hospital.shared.admin;

import java.util.UUID;
import java.time.Instant;

public record SupportTicketResponse(
    UUID id,
    String ticketId,
    String requesterName,
    String department,
    String priority,
    String status,
    String ownerName,
    String waitTime,
    String sla,
    Instant createdAt) {}
