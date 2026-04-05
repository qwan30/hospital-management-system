package com.hospital.shared.patientportal;

import java.time.Instant;
import java.util.UUID;

public record PatientPortalLabResultResponse(
    UUID labResultId,
    UUID appointmentId,
    String testName,
    String status,
    String resultSummary,
    String doctorComment,
    String attachmentUrl,
    Instant collectedAt
) {}
