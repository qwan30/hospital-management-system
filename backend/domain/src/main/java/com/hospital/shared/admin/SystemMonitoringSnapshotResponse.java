package com.hospital.shared.admin;

import java.time.Instant;

public record SystemMonitoringSnapshotResponse(
    Instant generatedAt,
    long uptimeSeconds,
    boolean healthy,
    int activeAlerts,
    int scheduleAlertCount,
    int inventoryAlertCount,
    String databaseStatus,
    String queueStatus
) {}
