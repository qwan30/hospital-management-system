package com.hospital.core.seed;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "hms.seed.initial-demo")
public class InitialDemoSeedProperties {
  private boolean enabled;
  private Passwords passwords = new Passwords();

  public boolean isEnabled() {
    return enabled;
  }

  public void setEnabled(boolean enabled) {
    this.enabled = enabled;
  }

  public Passwords getPasswords() {
    return passwords;
  }

  public void setPasswords(Passwords passwords) {
    this.passwords = passwords;
  }

  public Passwords requireConfiguredPasswords() {
    passwords.requireComplete("initial-demo");
    return passwords;
  }

  public static class Passwords {
    private String doctor1;
    private String doctor2;
    private String nurse;
    private String receptionist;
    private String pharmacist;
    private String accountant;
    private String admin;
    private String patient;

    public String getDoctor1() { return doctor1; }
    public void setDoctor1(String doctor1) { this.doctor1 = doctor1; }

    public String getDoctor2() { return doctor2; }
    public void setDoctor2(String doctor2) { this.doctor2 = doctor2; }

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

    private void requireComplete(String seedName) {
      var values = new LinkedHashMap<String, String>();
      values.put("doctor1", doctor1);
      values.put("doctor2", doctor2);
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
