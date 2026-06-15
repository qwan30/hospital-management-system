"""Parse Synthea CSV exports into normalized Python dicts."""

from pathlib import Path
from typing import Any

import pandas as pd


def parse_synthea_csv(synthea_dir: str) -> dict[str, list[dict[str, Any]]]:
    """Read all Synthea CSV files from a directory.

    Returns dict with keys: patients, encounters, conditions, medications,
    observations, allergies, procedures, careplans, providers, organizations.
    """
    base = Path(synthea_dir)
    if not base.exists():
        raise FileNotFoundError(f"Synthea CSV directory not found: {synthea_dir}")

    csv_files = {
        "patients": "patients.csv",
        "encounters": "encounters.csv",
        "conditions": "conditions.csv",
        "medications": "medications.csv",
        "observations": "observations.csv",
        "allergies": "allergies.csv",
        "procedures": "procedures.csv",
        "careplans": "careplans.csv",
        "providers": "providers.csv",
        "organizations": "organizations.csv",
    }

    data: dict[str, list[dict]] = {}
    for key, filename in csv_files.items():
        filepath = base / filename
        if not filepath.exists():
            print(f"  [parse_csv] WARNING: {filename} not found, skipping.")
            data[key] = []
            continue
        try:
            df = pd.read_csv(filepath, dtype=str, keep_default_na=False)
            data[key] = df.to_dict(orient="records")
            print(f"  [parse_csv] Loaded {len(data[key])} rows from {filename}")
        except Exception as e:
            print(f"  [parse_csv] ERROR reading {filename}: {e}")
            data[key] = []
    return data


# ── Query helpers ─────────────────────────────────────────────────

def _g(row: dict, key: str, default: Any = "") -> Any:
    return row.get(key, default)


def get_patient_encounters(data: dict, patient_id: str) -> list[dict]:
    return [e for e in data.get("encounters", []) if _g(e, "PATIENT") == patient_id]

def get_patient_conditions(data: dict, patient_id: str) -> list[dict]:
    return [c for c in data.get("conditions", []) if _g(c, "PATIENT") == patient_id]

def get_patient_medications(data: dict, patient_id: str) -> list[dict]:
    return [m for m in data.get("medications", []) if _g(m, "PATIENT") == patient_id]

def get_patient_observations(data: dict, patient_id: str) -> list[dict]:
    return [o for o in data.get("observations", []) if _g(o, "PATIENT") == patient_id]

def get_patient_allergies(data: dict, patient_id: str) -> list[dict]:
    return [a for a in data.get("allergies", []) if _g(a, "PATIENT") == patient_id]

def get_encounter_conditions(data: dict, encounter_id: str) -> list[dict]:
    return [c for c in data.get("conditions", []) if _g(c, "ENCOUNTER") == encounter_id]

def get_encounter_observations(data: dict, encounter_id: str) -> list[dict]:
    return [o for o in data.get("observations", []) if _g(o, "ENCOUNTER") == encounter_id]

def get_encounter_medications(data: dict, encounter_id: str) -> list[dict]:
    return [m for m in data.get("medications", []) if _g(m, "ENCOUNTER") == encounter_id]

def get_encounter_procedures(data: dict, encounter_id: str) -> list[dict]:
    return [p for p in data.get("procedures", []) if _g(p, "ENCOUNTER") == encounter_id]
