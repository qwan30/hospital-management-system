package com.hospital.core.seed.kaggle;

import java.util.List;

public record KaggleHmisDataset(
    List<KaggleDepartmentRow> departments,
    List<KagglePatientRow> patients,
    List<KaggleAdmissionRow> admissions,
    List<KaggleDrugRow> drugs,
    List<KaggleDrugInventoryRow> drugInventory,
    List<KaggleEmployeeRow> employees,
    List<KaggleDoctorRow> doctors,
    List<KaggleDiagnosticTestRow> diagnosticTests,
    List<KagglePatientDiagnosticRow> patientDiagnostics,
    List<KagglePrescriptionRow> prescriptions,
    List<KaggleBillingRow> billings,
    List<KaggleBillingDetailRow> billingDetails,
    List<KagglePatientInsuranceRow> patientInsurance,
    List<KaggleWardRow> wards,
    List<KaggleBedRow> beds,
    List<KaggleDiseaseRow> diseases,
    List<KaggleDrugManufacturerRow> drugManufacturers,
    List<KaggleInsuranceProviderRow> insuranceProviders,
    List<KaggleStaffAssignmentRow> staffAssignments) {

  public record KaggleDepartmentRow(
      String departmentId,
      String departmentName,
      String departmentType,
      String floorNumber,
      String status) {}

  public record KagglePatientRow(
      String patientId,
      String gender,
      String dateOfBirth,
      String bloodGroup,
      String city,
      String contactNumber) {}

  public record KaggleAdmissionRow(
      String admissionId,
      String admissionDate,
      String dischargeDate,
      String admissionType,
      String admissionStatus,
      String patientId,
      String departmentId,
      String wardId,
      String bedId,
      String diseaseId) {}

  public record KaggleDrugRow(
      String drugId,
      String drugName,
      String brandName,
      String drugCategory,
      String unitCost,
      String manufacturerId) {}

  public record KaggleDrugInventoryRow(
      String inventoryId,
      String currentStock,
      String reorderLevel,
      String inventoryStatus,
      String lastRestockDate,
      String drugId) {}

  public record KaggleEmployeeRow(
      String employeeId,
      String employeeName,
      String gender,
      String role,
      String employmentType,
      String dateOfJoining,
      String departmentId) {}

  public record KaggleDoctorRow(
      String doctorId,
      String employeeId,
      String specialization,
      String qualification,
      String experienceYears) {}

  public record KaggleDiagnosticTestRow(
      String testId,
      String testName,
      String testCategory,
      String standardCost,
      String departmentId) {}

  public record KagglePatientDiagnosticRow(
      String patientDiagnosticId,
      String testDate,
      String resultStatus,
      String admissionId,
      String testId,
      String doctorId) {}

  public record KagglePrescriptionRow(
      String prescriptionId,
      String dosage,
      String frequency,
      String durationDays,
      String admissionId,
      String drugId) {}

  public record KaggleBillingRow(
      String billId,
      String billDate,
      String totalAmount,
      String insuranceCoveredAmount,
      String patientPayableAmount,
      String paymentStatus,
      String paymentMode,
      String admissionId) {}

  public record KaggleBillingDetailRow(
      String billingDetailId,
      String chargeType,
      String referenceId,
      String amount,
      String billId) {}

  public record KagglePatientInsuranceRow(
      String patientInsuranceId,
      String policyNumber,
      String coveragePercentage,
      String policyStartDate,
      String policyEndDate,
      String patientId,
      String insuranceProviderId) {}

  public record KaggleWardRow(
      String wardId,
      String wardName,
      String wardType,
      String totalBeds,
      String departmentId) {}

  public record KaggleBedRow(
      String bedId,
      String bedNumber,
      String bedStatus,
      String wardId) {}

  public record KaggleDiseaseRow(
      String diseaseId,
      String diseaseName,
      String diseaseCategory) {}

  public record KaggleDrugManufacturerRow(
      String manufacturerId,
      String manufacturerName,
      String country,
      String reliabilityRating,
      String contractStatus) {}

  public record KaggleInsuranceProviderRow(
      String insuranceProviderId,
      String providerName,
      String providerType,
      String contactDetails,
      String coverageLimit) {}

  public record KaggleStaffAssignmentRow(
      String assignmentId,
      String employeeId,
      String wardId,
      String shift) {}
}
