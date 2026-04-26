package com.hospital.core.seed;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "hms.seed.non-billing-demo")
public class NonBillingDemoSeedProperties {
  private boolean enabled;
  private int targetDepartments = 20;
  private int targetDoctors = 50;
  private int targetPatients = 500;
  private int targetAppointments = 1000;
  private int targetInventoryItems = 200;
  private int targetAuditLogs = 1000;

  public boolean isEnabled() {
    return enabled;
  }

  public void setEnabled(boolean enabled) {
    this.enabled = enabled;
  }

  public int getTargetDepartments() {
    return targetDepartments;
  }

  public void setTargetDepartments(int targetDepartments) {
    this.targetDepartments = targetDepartments;
  }

  public int getTargetDoctors() {
    return targetDoctors;
  }

  public void setTargetDoctors(int targetDoctors) {
    this.targetDoctors = targetDoctors;
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

  public int additionalDepartments(long currentCount) {
    return remaining(targetDepartments, currentCount);
  }

  public int additionalDoctors(long currentCount) {
    return remaining(targetDoctors, currentCount);
  }

  public int additionalPatients(long currentCount) {
    return remaining(targetPatients, currentCount);
  }

  public int additionalAppointments(long currentCount) {
    return remaining(targetAppointments, currentCount);
  }

  public int additionalInventoryItems(long currentCount) {
    return remaining(targetInventoryItems, currentCount);
  }

  public int additionalAuditLogs(long currentCount) {
    return remaining(targetAuditLogs, currentCount);
  }

  private int remaining(int target, long currentCount) {
    return (int) Math.max(target - currentCount, 0);
  }
}
