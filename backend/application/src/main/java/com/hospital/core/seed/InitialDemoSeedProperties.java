package com.hospital.core.seed;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "hms.seed.initial-demo")
public class InitialDemoSeedProperties {
  private boolean enabled = true;
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

  public static class Passwords {
    private String doctor1 = "Doctor@1234";
    private String doctor2 = "Doctor@1234";
    private String nurse = "Nurse@1234";
    private String receptionist = "Reception@1234";
    private String pharmacist = "Pharma@1234";
    private String accountant = "Acc@1234";
    private String admin = "Admin@1234";
    private String patient = "Patient@1234";

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
  }
}
