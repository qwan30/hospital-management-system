package com.hospital.core.seed.kaggle;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

@Component
public class DefaultKaggleHmisDatasetReader implements KaggleHmisDatasetReader {

  private final ResourceLoader resourceLoader;

  public DefaultKaggleHmisDatasetReader(ResourceLoader resourceLoader) {
    this.resourceLoader = resourceLoader;
  }

  @Override
  public KaggleHmisDataset read(String datasetRoot) {
    var cleanRoot = datasetRoot.endsWith("/") ? datasetRoot.substring(0, datasetRoot.length() - 1) : datasetRoot;

    var departments = readTable(cleanRoot, "department.csv", List.of("department_id", "department_name", "floor_number"), row ->
        new KaggleHmisDataset.KaggleDepartmentRow(
            row.getOrDefault("department_id", ""),
            row.getOrDefault("department_name", ""),
            row.getOrDefault("department_type", ""),
            row.getOrDefault("floor_number", ""),
            row.getOrDefault("status", "")));

    var patients = readTable(cleanRoot, "patient.csv", List.of("patient_id", "gender", "date_of_birth", "blood_group", "city", "contact_number"), row ->
        new KaggleHmisDataset.KagglePatientRow(
            row.getOrDefault("patient_id", ""),
            row.getOrDefault("gender", ""),
            row.getOrDefault("date_of_birth", ""),
            row.getOrDefault("blood_group", ""),
            row.getOrDefault("city", ""),
            row.getOrDefault("contact_number", "")));

    var admissions = readTable(cleanRoot, "admission.csv", List.of("admission_id", "admission_date", "patient_id", "department_id"), row ->
        new KaggleHmisDataset.KaggleAdmissionRow(
            row.getOrDefault("admission_id", ""),
            row.getOrDefault("admission_date", ""),
            row.getOrDefault("discharge_date", ""),
            row.getOrDefault("admission_type", ""),
            row.getOrDefault("admission_status", ""),
            row.getOrDefault("patient_id", ""),
            row.getOrDefault("department_id", ""),
            row.getOrDefault("ward_id", ""),
            row.getOrDefault("bed_id", ""),
            row.getOrDefault("disease_id", "")));

    var drugs = readTable(cleanRoot, "drug.csv", List.of("drug_id", "drug_name", "drug_category"), row ->
        new KaggleHmisDataset.KaggleDrugRow(
            row.getOrDefault("drug_id", ""),
            row.getOrDefault("drug_name", ""),
            row.getOrDefault("brand_name", ""),
            row.getOrDefault("drug_category", ""),
            row.getOrDefault("unit_cost", ""),
            row.getOrDefault("manufacturer_id", "")));

    var drugInventory = readTable(cleanRoot, "drug_inventory.csv", List.of("inventory_id", "current_stock", "reorder_level", "drug_id"), row ->
        new KaggleHmisDataset.KaggleDrugInventoryRow(
            row.getOrDefault("inventory_id", ""),
            row.getOrDefault("current_stock", ""),
            row.getOrDefault("reorder_level", ""),
            row.getOrDefault("inventory_status", ""),
            row.getOrDefault("last_restock_date", ""),
            row.getOrDefault("drug_id", "")));

    var employees = readTable(cleanRoot, "employee.csv", List.of("employee_id", "employee_name"), row ->
        new KaggleHmisDataset.KaggleEmployeeRow(
            row.getOrDefault("employee_id", ""),
            row.getOrDefault("employee_name", ""),
            row.getOrDefault("gender", ""),
            row.getOrDefault("role", ""),
            row.getOrDefault("employment_type", ""),
            row.getOrDefault("date_of_joining", ""),
            row.getOrDefault("department_id", "")));

    var doctors = readTable(cleanRoot, "doctor.csv", List.of("doctor_id", "employee_id", "specialization"), row ->
        new KaggleHmisDataset.KaggleDoctorRow(
            row.getOrDefault("doctor_id", ""),
            row.getOrDefault("employee_id", ""),
            row.getOrDefault("specialization", ""),
            row.getOrDefault("qualification", ""),
            row.getOrDefault("experience_years", "")));

    var diagnosticTests = readTable(cleanRoot, "diagnostic_test.csv", List.of("test_id", "test_name"), row ->
        new KaggleHmisDataset.KaggleDiagnosticTestRow(
            row.getOrDefault("test_id", ""),
            row.getOrDefault("test_name", ""),
            row.getOrDefault("test_category", ""),
            row.getOrDefault("standard_cost", ""),
            row.getOrDefault("department_id", "")));

    var patientDiagnostics = readTable(cleanRoot, "patient_diagnostic.csv", List.of("patient_diagnostic_id", "admission_id", "test_id"), row ->
        new KaggleHmisDataset.KagglePatientDiagnosticRow(
            row.getOrDefault("patient_diagnostic_id", ""),
            row.getOrDefault("test_date", ""),
            row.getOrDefault("result_status", ""),
            row.getOrDefault("admission_id", ""),
            row.getOrDefault("test_id", ""),
            row.getOrDefault("doctor_id", "")));

    var prescriptions = readTable(cleanRoot, "prescription.csv", List.of("prescription_id", "admission_id", "drug_id"), row ->
        new KaggleHmisDataset.KagglePrescriptionRow(
            row.getOrDefault("prescription_id", ""),
            row.getOrDefault("dosage", ""),
            row.getOrDefault("frequency", ""),
            row.getOrDefault("duration_days", ""),
            row.getOrDefault("admission_id", ""),
            row.getOrDefault("drug_id", "")));

    var billings = readTable(cleanRoot, "billing.csv", List.of("bill_id", "admission_id"), row ->
        new KaggleHmisDataset.KaggleBillingRow(
            row.getOrDefault("bill_id", ""),
            row.getOrDefault("bill_date", ""),
            row.getOrDefault("total_amount", ""),
            row.getOrDefault("insurance_covered_amount", ""),
            row.getOrDefault("patient_payable_amount", ""),
            row.getOrDefault("payment_status", ""),
            row.getOrDefault("payment_mode", ""),
            row.getOrDefault("admission_id", "")));

    var billingDetails = readTable(cleanRoot, "billing_detail.csv", List.of("billing_detail_id", "bill_id"), row ->
        new KaggleHmisDataset.KaggleBillingDetailRow(
            row.getOrDefault("billing_detail_id", ""),
            row.getOrDefault("charge_type", ""),
            row.getOrDefault("reference_id", ""),
            row.getOrDefault("amount", ""),
            row.getOrDefault("bill_id", "")));

    var patientInsurance = readTable(cleanRoot, "patient_insurance.csv", List.of("patient_insurance_id", "patient_id"), row ->
        new KaggleHmisDataset.KagglePatientInsuranceRow(
            row.getOrDefault("patient_insurance_id", ""),
            row.getOrDefault("policy_number", ""),
            row.getOrDefault("coverage_percentage", ""),
            row.getOrDefault("policy_start_date", ""),
            row.getOrDefault("policy_end_date", ""),
            row.getOrDefault("patient_id", ""),
            row.getOrDefault("insurance_provider_id", "")));

    var wards = readTable(cleanRoot, "ward.csv", List.of("ward_id", "ward_name"), row ->
        new KaggleHmisDataset.KaggleWardRow(
            row.getOrDefault("ward_id", ""),
            row.getOrDefault("ward_name", ""),
            row.getOrDefault("ward_type", ""),
            row.getOrDefault("total_beds", ""),
            row.getOrDefault("department_id", "")));

    var beds = readTable(cleanRoot, "bed.csv", List.of("bed_id", "bed_number"), row ->
        new KaggleHmisDataset.KaggleBedRow(
            row.getOrDefault("bed_id", ""),
            row.getOrDefault("bed_number", ""),
            row.getOrDefault("bed_status", ""),
            row.getOrDefault("ward_id", "")));

    var diseases = readTable(cleanRoot, "disease.csv", List.of("disease_id", "disease_name"), row ->
        new KaggleHmisDataset.KaggleDiseaseRow(
            row.getOrDefault("disease_id", ""),
            row.getOrDefault("disease_name", ""),
            row.getOrDefault("disease_category", "")));

    var drugManufacturers = readTable(cleanRoot, "drug_manufacturer.csv", List.of("manufacturer_id", "manufacturer_name"), row ->
        new KaggleHmisDataset.KaggleDrugManufacturerRow(
            row.getOrDefault("manufacturer_id", ""),
            row.getOrDefault("manufacturer_name", ""),
            row.getOrDefault("country", ""),
            row.getOrDefault("reliability_rating", ""),
            row.getOrDefault("contract_status", "")));

    var insuranceProviders = readTable(cleanRoot, "insurance_provider.csv", List.of("insurance_provider_id", "provider_name"), row ->
        new KaggleHmisDataset.KaggleInsuranceProviderRow(
            row.getOrDefault("insurance_provider_id", ""),
            row.getOrDefault("provider_name", ""),
            row.getOrDefault("provider_type", ""),
            row.getOrDefault("contact_details", ""),
            row.getOrDefault("coverage_limit", "")));

    var staffAssignments = readTable(cleanRoot, "staff_assignment.csv", List.of("assignment_id", "employee_id"), row ->
        new KaggleHmisDataset.KaggleStaffAssignmentRow(
            row.getOrDefault("assignment_id", ""),
            row.getOrDefault("employee_id", ""),
            row.getOrDefault("ward_id", ""),
            row.getOrDefault("shift", "")));

    return new KaggleHmisDataset(
        departments,
        patients,
        admissions,
        drugs,
        drugInventory,
        employees,
        doctors,
        diagnosticTests,
        patientDiagnostics,
        prescriptions,
        billings,
        billingDetails,
        patientInsurance,
        wards,
        beds,
        diseases,
        drugManufacturers,
        insuranceProviders,
        staffAssignments);
  }

  @FunctionalInterface
  private interface RowMapper<T> {
    T map(Map<String, String> row);
  }

  private <T> List<T> readTable(
      String root, String fileName, List<String> requiredColumns, RowMapper<T> mapper) {
    String location = root + "/" + fileName;
    Resource resource = resourceLoader.getResource(location);
    if (!resource.exists()) {
      throw new IllegalStateException("Kaggle HMIS seed dataset is incomplete: missing " + fileName);
    }

    try (var reader = new BufferedReader(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
      String headerLine = reader.readLine();
      if (headerLine == null) {
        throw new IllegalStateException("Kaggle HMIS seed dataset is incomplete: missing " + fileName);
      }

      List<String> headers = parseCsvLine(headerLine);
      for (String requiredCol : requiredColumns) {
        if (!headers.contains(requiredCol)) {
          throw new IllegalStateException(
              "Kaggle HMIS seed dataset is incompatible: " + fileName + " missing column " + requiredCol);
        }
      }

      List<T> results = new ArrayList<>();
      String line;
      while ((line = reader.readLine()) != null) {
        if (line.trim().isEmpty()) {
          continue;
        }
        List<String> values = parseCsvLine(line);
        Map<String, String> row = new HashMap<>();
        for (int i = 0; i < headers.size() && i < values.size(); i++) {
          row.put(headers.get(i), values.get(i));
        }
        results.add(mapper.map(row));
      }
      return results;
    } catch (IllegalStateException e) {
      throw e;
    } catch (Exception e) {
      throw new IllegalStateException("Failed to read Kaggle seed file " + fileName + ": " + e.getMessage(), e);
    }
  }

  private List<String> parseCsvLine(String line) {
    List<String> tokens = new ArrayList<>();
    StringBuilder sb = new StringBuilder();
    boolean inQuotes = false;
    for (int i = 0; i < line.length(); i++) {
      char c = line.charAt(i);
      if (c == '"') {
        if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
          sb.append('"');
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c == ',' && !inQuotes) {
        tokens.add(sb.toString().trim());
        sb.setLength(0);
      } else {
        sb.append(c);
      }
    }
    tokens.add(sb.toString().trim());
    return tokens;
  }
}
