package com.hospital.core.seed.kaggle;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.DefaultResourceLoader;

class KaggleHmisDatasetReaderTest {

  @TempDir
  Path tempDir;

  private KaggleHmisDatasetReader reader;

  @BeforeEach
  void setUp() {
    reader = new DefaultKaggleHmisDatasetReader(new DefaultResourceLoader());
  }

  @Test
  void throwsExceptionWhenRequiredFileIsMissing() throws IOException {
    createAllDummyCsvFilesExcept("patient.csv");
    assertThatThrownBy(() -> reader.read(tempDir.toUri().toString()))
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("Kaggle HMIS seed dataset is incomplete: missing patient.csv");
  }

  @Test
  void throwsExceptionWhenRequiredColumnIsMissing() throws IOException {
    createAllDummyCsvFilesExcept(null);
    // Overwrite patient.csv without date_of_birth
    Files.writeString(
        tempDir.resolve("patient.csv"),
        "patient_id,gender,blood_group,city,contact_number\n1,Female,O-,City,+12345\n");

    assertThatThrownBy(() -> reader.read(tempDir.toUri().toString()))
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("Kaggle HMIS seed dataset is incompatible: patient.csv missing column date_of_birth");
  }

  @Test
  void parsesCsvWithQuotedCommasBlankOptionalsAndEscapedQuotes() throws IOException {
    createAllDummyCsvFilesExcept(null);
    Files.writeString(
        tempDir.resolve("department.csv"),
        "department_id,department_name,department_type,floor_number,status\n"
            + "1,\"Emergency, Trauma & Care\",Clinical,0,Active\n"
            + "2,Pediatrics,,1,Active\n");

    var dataset = reader.read(tempDir.toUri().toString());

    assertThat(dataset.departments()).hasSize(2);
    var firstDept = dataset.departments().get(0);
    assertThat(firstDept.departmentId()).isEqualTo("1");
    assertThat(firstDept.departmentName()).isEqualTo("Emergency, Trauma & Care");
    assertThat(firstDept.floorNumber()).isEqualTo("0");

    var secondDept = dataset.departments().get(1);
    assertThat(secondDept.departmentId()).isEqualTo("2");
    assertThat(secondDept.departmentName()).isEqualTo("Pediatrics");
    assertThat(secondDept.departmentType()).isEmpty();
  }

  @Test
  void readsRealCommittedClasspathDataset() {
    var dataset = reader.read("file:../start/src/main/resources/seed-data/kaggle/hospital-hmis");

    assertThat(dataset.departments()).isNotEmpty();
    assertThat(dataset.doctors()).isNotEmpty();
    assertThat(dataset.patients()).isNotEmpty();
    assertThat(dataset.admissions()).isNotEmpty();
    assertThat(dataset.drugs()).isNotEmpty();
    assertThat(dataset.drugInventory()).isNotEmpty();
    assertThat(dataset.employees()).isNotEmpty();
    assertThat(dataset.diagnosticTests()).isNotEmpty();
    assertThat(dataset.patientDiagnostics()).isNotEmpty();
    assertThat(dataset.prescriptions()).isNotEmpty();
    assertThat(dataset.billings()).isNotEmpty();
    assertThat(dataset.billingDetails()).isNotEmpty();
    assertThat(dataset.patientInsurance()).isNotEmpty();
    assertThat(dataset.wards()).isNotEmpty();
    assertThat(dataset.beds()).isNotEmpty();
    assertThat(dataset.diseases()).isNotEmpty();
    assertThat(dataset.drugManufacturers()).isNotEmpty();
    assertThat(dataset.insuranceProviders()).isNotEmpty();
    assertThat(dataset.staffAssignments()).isNotEmpty();
  }

  private void createAllDummyCsvFilesExcept(String skipFile) throws IOException {
    String[] files = {
      "admission.csv",
      "bed.csv",
      "billing.csv",
      "billing_detail.csv",
      "department.csv",
      "diagnostic_test.csv",
      "disease.csv",
      "doctor.csv",
      "drug.csv",
      "drug_inventory.csv",
      "drug_manufacturer.csv",
      "employee.csv",
      "insurance_provider.csv",
      "patient.csv",
      "patient_diagnostic.csv",
      "patient_insurance.csv",
      "prescription.csv",
      "staff_assignment.csv",
      "ward.csv"
    };

    for (String file : files) {
      if (file.equals(skipFile)) continue;
      String header = switch (file) {
        case "patient.csv" -> "patient_id,gender,date_of_birth,blood_group,city,contact_number\n1,Female,1990-01-01,O+,City,+1234567890";
        case "department.csv" -> "department_id,department_name,department_type,floor_number,status\n1,Emergency,Clinical,0,Active";
        case "doctor.csv" -> "doctor_id,employee_id,specialization,qualification,experience_years\n1,1,Cardiology,MD,10";
        case "employee.csv" -> "employee_id,employee_name,gender,role,employment_type,date_of_joining,department_id\n1,Dr. John Doe,Male,Doctor,Full-time,2020-01-01,1";
        case "admission.csv" -> "admission_id,admission_date,discharge_date,admission_type,admission_status,patient_id,department_id,ward_id,bed_id,disease_id\n1,2024-01-01,2024-01-05,Emergency,Discharged,1,1,1,1,1";
        case "drug.csv" -> "drug_id,drug_name,brand_name,drug_category,unit_cost,manufacturer_id\n1,Paracetamol,Panadol,Analgesic,10,1";
        case "drug_inventory.csv" -> "inventory_id,current_stock,reorder_level,inventory_status,last_restock_date,drug_id\n1,100,20,Normal,2024-01-01,1";
        case "diagnostic_test.csv" -> "test_id,test_name,test_category,standard_cost,department_id\n1,Blood Test,Lab,50,1";
        case "patient_diagnostic.csv" -> "patient_diagnostic_id,test_date,result_status,admission_id,test_id,doctor_id\n1,2024-01-01,Normal,1,1,1";
        case "prescription.csv" -> "prescription_id,dosage,frequency,duration_days,admission_id,drug_id\n1,500mg,Daily,5,1,1";
        case "billing.csv" -> "bill_id,bill_date,total_amount,insurance_covered_amount,patient_payable_amount,payment_status,payment_mode,admission_id\n1,2024-01-01,100,80,20,Paid,Cash,1";
        case "billing_detail.csv" -> "billing_detail_id,charge_type,reference_id,amount,bill_id\n1,Consultation,1,100,1";
        case "patient_insurance.csv" -> "patient_insurance_id,policy_number,coverage_percentage,policy_start_date,policy_end_date,patient_id,insurance_provider_id\n1,POL123,80,2024-01-01,2024-12-31,1,1";
        case "ward.csv" -> "ward_id,ward_name,ward_type,total_beds,department_id\n1,Ward A,General,10,1";
        case "bed.csv" -> "bed_id,bed_number,bed_status,ward_id\n1,B1,Available,1";
        case "disease.csv" -> "disease_id,disease_name,disease_category\n1,Flu,Infectious";
        case "drug_manufacturer.csv" -> "manufacturer_id,manufacturer_name,country,reliability_rating,contract_status\n1,PharmaCorp,USA,4.5,Active";
        case "insurance_provider.csv" -> "insurance_provider_id,provider_name,provider_type,contact_details,coverage_limit\n1,HealthIns,Private,12345,1000000";
        case "staff_assignment.csv" -> "assignment_id,employee_id,ward_id,shift\n1,1,1,Morning";
        default -> "id\n1";
      };
      Files.writeString(tempDir.resolve(file), header + "\n");
    }
  }
}
