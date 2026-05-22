package com.hospital.core.seed;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "hms.seed.release-demo")
public class ReleaseDemoSeedProperties {
  private boolean enabled;
  private int futureSlotDays = 14;
  private int targetPatients = 8;
  private int targetAppointments = 12;
  private int targetInventoryItems = 8;
  private int targetAuditLogs = 16;

  public boolean isEnabled() {
    return enabled;
  }

  public void setEnabled(boolean enabled) {
    this.enabled = enabled;
  }

  public int getFutureSlotDays() {
    return futureSlotDays;
  }

  public void setFutureSlotDays(int futureSlotDays) {
    this.futureSlotDays = futureSlotDays;
  }

  public int getTargetPatients() {
    return targetPatients;
  }

  public void setTargetPatients(int targetPatients) {
    this.targetPatients = targetPatients;
  }

  public int getTargetAppointments() {
    return targetAppointments;
  }

  public void setTargetAppointments(int targetAppointments) {
    this.targetAppointments = targetAppointments;
  }

  public int getTargetInventoryItems() {
    return targetInventoryItems;
  }

  public void setTargetInventoryItems(int targetInventoryItems) {
    this.targetInventoryItems = targetInventoryItems;
  }

  public int getTargetAuditLogs() {
    return targetAuditLogs;
  }

  public void setTargetAuditLogs(int targetAuditLogs) {
    this.targetAuditLogs = targetAuditLogs;
  }
}
