# Synthea-to-HMS Data Ingestion Pipeline

Generates Vietnamese hospital demo seed data from [Synthea](https://synthetichealth.github.io/synthea/) synthetic patient records. Produces CSV, JSON, JSONL, and PostgreSQL SQL (Flyway-compatible) output.

**ALL DATA IS SYNTHETIC/FAKE/DEMO. NO REAL PHI. DO NOT USE IN PRODUCTION.**

## Prerequisites

- **Python 3.11+** with pip
- **Java 17+** (for `generate` mode only; not needed for `import-csv`/`import-fhir`)

## Quick Start

```bash
pip install -r requirements.txt

# Full pipeline: download Synthea → generate → vietnamize → export
python src/main.py generate --patients 100

# Import existing Synthea CSV/FHIR
python src/main.py import-csv --synthea-dir ./synthea/output/csv
python src/main.py import-fhir --synthea-dir ./synthea/output/fhir

# Validate and export
python src/main.py validate --input output/json/hms_seed.json
python src/main.py export-sql --input output/json/hms_seed.json
```

## Project Structure

```
data_pipeline/
├── README.md
├── requirements.txt
├── config.yaml
├── src/
│   ├── constants.py         # VN names, addresses, clinical templates
│   ├── models.py            # Pydantic models (mirrors HMS DDL)
│   ├── download_synthea.py  # Download Synthea JAR
│   ├── run_synthea.py       # Execute Synthea
│   ├── parse_synthea_csv.py # Parse CSV exports
│   ├── parse_synthea_fhir.py# Parse FHIR exports
│   ├── vietnamize.py        # Transform to VN context
│   ├── map_to_hms.py        # Core mapping: Synthea → HMS
│   ├── validate_seed.py     # 11 validation rules
│   ├── export_csv.py        # CSV export
│   ├── export_json.py       # JSON export
│   ├── export_jsonl.py      # JSONL export
│   ├── export_sql.py        # PostgreSQL SQL (Flyway)
│   └── main.py              # CLI entry point
├── tests/
│   └── test_pipeline.py
└── output/{csv,json,jsonl,sql}/
```

## Data Mapping: Synthea → HMS

### Patients

| Synthea | HMS Column | Transform |
|---|---|---|
| BIRTHDATE | date_of_birth | Direct |
| GENDER (M/F) | gender (MALE/FEMALE) | Map |
| FIRST+LAST | full_name | Replaced with VN name |
| — | cccd | Generated 12-digit |
| — | cccd_hash | SHA-256 |
| — | email, phone | Generated unique |
| Conditions | medical_history | VN translated |
| Allergies | drug_allergies | Direct |

### Encounters → Appointments

| Synthea | HMS Column | Transform |
|---|---|---|
| START | appointment_date | Date extract |
| REASONDESC | symptoms | Direct |
| — | confirmation_code | HMS-XXXXXXXX |
| — | status | Time-aware workflow |

### Observations → Vital Signs

| LOINC | HMS Field |
|---|---|
| 8480-6 / 8462-4 | blood_pressure |
| 8310-5 | temperature |
| 8867-4 | heart_rate |
| 9279-1 | respiratory_rate |
| 2708-6 | oxygen_saturation |

### Observations → Lab Results

| LOINC | Test Name |
|---|---|
| 6690-2 | Bạch cầu (WBC) |
| 2345-7 | Glucose máu |
| 14959-1 | HbA1c |
| 2093-3 | Cholesterol |

## Validation Rules (11 rules)

1. Unique patient emails
2. Unique CCCD
3. CCCD exactly 12 digits
4. Unique confirmation codes
5. No double-booked slots
6. Appointment FK integrity
7. Medical records → DONE appointments
8. Prescriptions → existing records
9. Invoices → DONE appointments
10. Inventory no negative stock
11. All FKs resolvable

## Running Synthea Locally

```bash
# Automatic (generate mode)
python src/main.py generate --patients 100

# Manual
java -jar synthea/synthea-with-dependencies.jar -p 100 \
  --exporter.csv.export true \
  --exporter.baseDirectory ./synthea/output

# Then import
python src/main.py import-csv --synthea-dir ./synthea/output/csv
```

## Injecting into Spring Boot + PostgreSQL

### Flyway Migration (Recommended)

```bash
cp output/sql/V99__seed_vietnam_demo_data.sql \
   backend/start/src/main/resources/db/migration/
# Restart Spring Boot — Flyway executes migration on startup
```

### Direct SQL Import

```bash
psql -h localhost -U postgres -d hospital_management \
  -f output/sql/V99__seed_vietnam_demo_data.sql
```

### Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `{name}@hospital.vn` | `Demo@1234` |
| Doctor | `{name}@hospital.vn` | `Demo@1234` |
| Patient Portal | `{name}.demo@example.com` | `Patient@1234` |

## Running Tests

```bash
pip install pytest
pytest tests/ -v
```
