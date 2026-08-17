# Hospital HMIS Dataset for Healthcare Analytics — Source Provenance

- **Dataset Name:** Hospital HMIS Dataset for Healthcare Analytics
- **Owner:** shalakagangurde
- **Dataset Slug:** hospital-hmis-dataset-for-healthcare-analytics
- **Kaggle Ref:** `shalakagangurde/hospital-hmis-dataset-for-healthcare-analytics`
- **Source URL:** https://www.kaggle.com/datasets/shalakagangurde/hospital-hmis-dataset-for-healthcare-analytics
- **License:** MIT License
- **Data Classification:** Fully synthetic HMIS data for educational, research, and demo purposes.
- **Downloaded On:** 2026-08-17
- **Download Command:** `kaggle datasets download shalakagangurde/hospital-hmis-dataset-for-healthcare-analytics -p backend/start/src/main/resources/seed-data/kaggle/hospital-hmis --unzip -o`

## Included CSV Files (19 files)
1. `admission.csv`
2. `bed.csv`
3. `billing.csv`
4. `billing_detail.csv`
5. `department.csv`
6. `diagnostic_test.csv`
7. `disease.csv`
8. `doctor.csv`
9. `drug.csv`
10. `drug_inventory.csv`
11. `drug_manufacturer.csv`
12. `employee.csv`
13. `insurance_provider.csv`
14. `patient.csv`
15. `patient_diagnostic.csv`
16. `patient_insurance.csv`
17. `prescription.csv`
18. `staff_assignment.csv`
19. `ward.csv`

## Usage in Hospital Management System (HMS)
These files are packaged as classpath resources in the backend artifact (`hms-start.jar`). Production deployments read this static dataset locally during non-billing demo seed execution and do not make network calls to Kaggle.
