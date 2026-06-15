"""Parse Synthea FHIR JSON exports into normalized Python dicts.

Reads FHIR R4 Bundle files. Maps to same structure as parse_synthea_csv.py."""

import json
from pathlib import Path
from typing import Any


def parse_synthea_fhir(synthea_dir: str) -> dict[str, list[dict[str, Any]]]:
    """Read Synthea FHIR JSON files. Returns same dict structure as CSV parser."""
    base = Path(synthea_dir)
    if not base.exists():
        raise FileNotFoundError(f"Synthea FHIR directory not found: {synthea_dir}")

    collected: dict[str, list[dict]] = {
        "patients": [], "encounters": [], "conditions": [], "medications": [],
        "observations": [], "allergies": [], "procedures": [], "careplans": [],
        "providers": [], "organizations": [],
    }

    fhir_mapping = {
        "Patient": "patients", "Encounter": "encounters", "Condition": "conditions",
        "MedicationRequest": "medications", "Observation": "observations",
        "AllergyIntolerance": "allergies", "Procedure": "procedures",
        "CarePlan": "careplans", "Practitioner": "providers", "Organization": "organizations",
    }

    json_files = list(base.glob("*.json")) or list(base.rglob("*.json"))
    if not json_files:
        raise FileNotFoundError(f"No JSON files found in {synthea_dir}")
    print(f"  [parse_fhir] Found {len(json_files)} JSON files")

    for filepath in json_files:
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            print(f"  [parse_fhir] WARNING: {filepath.name}: {e}")
            continue

        resources = _extract_resources(content)
        for resource in resources:
            rt = resource.get("resourceType", "")
            if rt in fhir_mapping:
                normalized = _normalize_resource(rt, resource)
                if normalized:
                    collected[fhir_mapping[rt]].append(normalized)

    for key, items in collected.items():
        print(f"  [parse_fhir] Extracted {len(items)} {key}")
    return collected


def _extract_resources(content: dict) -> list[dict]:
    if content.get("resourceType") == "Bundle":
        return [e.get("resource", {}) for e in content.get("entry", []) if e.get("resource")]
    return [content] if "resourceType" in content else []


def _normalize_resource(resource_type: str, resource: dict) -> dict | None:
    if resource_type == "Patient":
        name = (resource.get("name", [{}]) or [{}])[0]
        given = " ".join(name.get("given", []))
        family = name.get("family", "")
        telecoms = resource.get("telecom", [])
        email = phone = ""
        for t in telecoms:
            if t.get("system") == "email": email = t.get("value", "")
            elif t.get("system") == "phone": phone = t.get("value", "")
        addr = (resource.get("address", [{}]) or [{}])[0]
        lines = addr.get("line", [])
        city = addr.get("city", "")
        state = addr.get("state", "")
        postal = addr.get("postalCode", "")
        return {
            "Id": resource.get("id", ""),
            "BIRTHDATE": resource.get("birthDate", ""),
            "DEATHDATE": resource.get("deceasedDateTime", ""),
            "FIRST": given, "LAST": family,
            "FULL_NAME": f"{given} {family}".strip(),
            "GENDER": (resource.get("gender", "") or "").upper(),
            "RACE": "", "ETHNICITY": "",
            "ADDRESS": ", ".join(filter(None, lines + [city, state, postal])),
            "EMAIL": email, "PHONE": phone,
        }

    if resource_type == "Encounter":
        period = resource.get("period", {})
        reason_code = resource.get("reasonCode", [])
        codes = []
        descs = []
        for r in reason_code:
            for c in r.get("coding", []):
                if c.get("code"): codes.append(c["code"])
                if c.get("display"): descs.append(c["display"])
        subject = resource.get("subject", {})
        return {
            "Id": resource.get("id", ""),
            "START": period.get("start", ""), "STOP": period.get("end", ""),
            "PATIENT": subject.get("reference", "").replace("urn:uuid:", ""),
            "ENCOUNTERCLASS": resource.get("class", {}).get("code", ""),
            "CODE": ";".join(codes), "DESCRIPTION": "; ".join(descs),
            "REASONCODE": ";".join(codes), "REASONDESC": "; ".join(descs),
        }

    if resource_type == "Condition":
        coding = (resource.get("code", {}) or {}).get("coding", [{}]) or [{}]
        code = coding[0]
        subject = resource.get("subject", {})
        encounter = resource.get("encounter", {})
        return {
            "START": resource.get("onsetDateTime", ""),
            "STOP": resource.get("abatementDateTime", ""),
            "PATIENT": subject.get("reference", "").replace("urn:uuid:", ""),
            "ENCOUNTER": encounter.get("reference", "").replace("urn:uuid:", ""),
            "CODE": code.get("code", ""), "DESCRIPTION": code.get("display", ""),
        }

    if resource_type == "MedicationRequest":
        cc = resource.get("medicationCodeableConcept", {})
        coding = (cc.get("coding", [{}]) or [{}])[0] if cc else {}
        subject = resource.get("subject", {})
        encounter = resource.get("encounter", {})
        dosage = (resource.get("dosageInstruction", [{}]) or [{}])[0]
        return {
            "START": resource.get("authoredOn", ""), "STOP": "",
            "PATIENT": subject.get("reference", "").replace("urn:uuid:", ""),
            "ENCOUNTER": encounter.get("reference", "").replace("urn:uuid:", ""),
            "CODE": coding.get("code", ""), "DESCRIPTION": coding.get("display", ""),
            "DOSAGE": dosage.get("text", ""),
        }

    if resource_type == "Observation":
        coding = (resource.get("code", {}) or {}).get("coding", [{}]) or [{}]
        code = coding[0]
        subject = resource.get("subject", {})
        encounter = resource.get("encounter", {})
        vq = resource.get("valueQuantity", {})
        vs = resource.get("valueString", "") or resource.get("valueCodeableConcept", {}).get("text", "")
        return {
            "DATE": resource.get("effectiveDateTime", ""),
            "PATIENT": subject.get("reference", "").replace("urn:uuid:", ""),
            "ENCOUNTER": encounter.get("reference", "").replace("urn:uuid:", ""),
            "CODE": code.get("code", ""), "DESCRIPTION": code.get("display", ""),
            "VALUE": str(vq.get("value", vs)) if vs else str(vq.get("value", "")),
            "UNITS": vq.get("unit", ""), "TYPE": "numeric" if vq else "text",
        }

    if resource_type == "AllergyIntolerance":
        coding = (resource.get("code", {}) or {}).get("coding", [{}]) or [{}]
        code = coding[0]
        patient = resource.get("patient", {})
        return {
            "START": resource.get("recordedDate", ""),
            "PATIENT": patient.get("reference", "").replace("urn:uuid:", ""),
            "CODE": code.get("code", ""), "DESCRIPTION": code.get("display", ""),
        }

    if resource_type == "Procedure":
        coding = (resource.get("code", {}) or {}).get("coding", [{}]) or [{}]
        code = coding[0]
        subject = resource.get("subject", {})
        encounter = resource.get("encounter", {})
        return {
            "DATE": resource.get("performedDateTime", ""),
            "PATIENT": subject.get("reference", "").replace("urn:uuid:", ""),
            "ENCOUNTER": encounter.get("reference", "").replace("urn:uuid:", ""),
            "CODE": code.get("code", ""), "DESCRIPTION": code.get("display", ""),
        }

    if resource_type == "CarePlan":
        subject = resource.get("subject", {})
        encounter = resource.get("encounter", {})
        return {
            "Id": resource.get("id", ""),
            "START": resource.get("period", {}).get("start", ""),
            "PATIENT": subject.get("reference", "").replace("urn:uuid:", ""),
            "ENCOUNTER": encounter.get("reference", "").replace("urn:uuid:", ""),
            "DESCRIPTION": resource.get("description", ""),
        }

    if resource_type == "Practitioner":
        name = (resource.get("name", [{}]) or [{}])[0]
        given = " ".join(name.get("given", []))
        family = name.get("family", "")
        return {
            "Id": resource.get("id", ""),
            "NAME": f"{given} {family}".strip(),
            "GENDER": (resource.get("gender", "") or "").upper(),
        }

    if resource_type == "Organization":
        return {"Id": resource.get("id", ""), "NAME": resource.get("name", "")}

    return None
