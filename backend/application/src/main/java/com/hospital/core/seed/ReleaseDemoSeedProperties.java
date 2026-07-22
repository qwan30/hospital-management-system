package com.hospital.core.seed;

import com.hospital.shared.enums.UserRole;
import java.util.LinkedHashMap;
import java.util.Map;
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
  private Passwords passwords = new Passwords();

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

  public Passwords getPasswords() { return passwords; }
  public void setPasswords(Passwords passwords) { this.passwords = passwords; }

  public Passwords requireConfiguredPasswords() {
    passwords.requireComplete("release-demo");
    return passwords;
  }

  public static class Passwords {
    private String doctor;
    private String nurse;
    private String receptionist;
    private String pharmacist;
    private String accountant;
    private String admin;
    private String patient;

    public String getDoctor() { return doctor; }
    public void setDoctor(String doctor) { this.doctor = doctor; }
    public String getNurse() { return nurse; }
    public void setNurse(String nurse) { this.nurse = nurse; }
    public String getReceptionist() { return receptionist; }
    public void setReceptionist(String receptionist) { this.receptionist = receptionist; }
    public String getPharmacist() { return pharmacist; }
    public void setPharmacist(String pharmacist) { this.pharmacist = pharmacist; }
    public String getAccountant() { return accountant; }
    public void setAccountant(String accountant) { this.accountant = accountant; }
    public String getAdmin() { return admin; }
    public void setAdmin(String admin) { this.admin = admin; }
    public String getPatient() { return patient; }
    public void setPatient(String patient) { this.patient = patient; }

    public String forRole(UserRole role) {
      return switch (role) {
        case ADMIN -> admin;
        case DOCTOR -> doctor;
        case NURSE -> nurse;
        case RECEPTIONIST -> receptionist;
        case PHARMACIST -> pharmacist;
        case ACCOUNTANT -> accountant;
        default -> throw new IllegalArgumentException("Release demo seed does not support role: " + role);
      };
    }

    private void requireComplete(String seedName) {
      var values = new LinkedHashMap<String, String>();
      values.put("doctor", doctor);
      values.put("nurse", nurse);
      values.put("receptionist", receptionist);
      values.put("pharmacist", pharmacist);
      values.put("accountant", accountant);
      values.put("admin", admin);
      values.put("patient", patient);
      var missing = values.entrySet().stream()
          .filter(entry -> entry.getValue() == null || entry.getValue().isBlank())
          .map(Map.Entry::getKey)
          .toList();
      if (!missing.isEmpty()) {
        throw new IllegalStateException(
            "Refusing " + seedName + " seed: explicit passwords are required for " + String.join(", ", missing));
      }
    }
  }
}
