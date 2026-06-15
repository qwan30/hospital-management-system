"""Export HMS seed data to CSV files (one per entity type)."""

import csv
from pathlib import Path

from src.models import HmsSeed


def _flatten(model) -> dict:
    d = model.model_dump()
    flat = {}
    for k, v in d.items():
        if isinstance(v, (dict, list)):
            import json
            flat[k] = json.dumps(v, ensure_ascii=False, default=str)
        elif v is None:
            flat[k] = ""
        else:
            flat[k] = str(v) if not isinstance(v, (int, float, bool, str)) else v
    return flat


def export_csv(seed: HmsSeed, output_dir: str):
    out = Path(output_dir); out.mkdir(parents=True, exist_ok=True)
    entities = [
        ("departments", seed.departments), ("staff_users", seed.staff_users),
        ("patients", seed.patients), ("rooms", seed.rooms),
        ("schedule_templates", seed.schedule_templates), ("time_slots", seed.time_slots),
        ("appointments", seed.appointments), ("vital_signs", seed.vital_signs),
        ("medical_records", seed.medical_records),
        ("prescription_items", seed.prescription_items),
        ("lab_results", seed.lab_results), ("follow_ups", seed.follow_ups),
        ("inventory_items", seed.inventory_items), ("inventory_lots", seed.inventory_lots),
        ("inventory_movements", seed.inventory_movements), ("invoices", seed.invoices),
        ("service_pricings", seed.service_pricings),
        ("patient_accounts", seed.patient_accounts), ("audit_logs", seed.audit_logs),
        ("content_sections", seed.content_sections), ("news_articles", seed.news_articles),
    ]
    for name, items in entities:
        if not items: continue
        fp = out / f"{name}.csv"
        rows = [_flatten(item) for item in items]
        if not rows: continue
        with open(fp, "w", newline="", encoding="utf-8-sig") as f:
            w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
            w.writeheader(); w.writerows(rows)
        print(f"  [csv] {len(rows)} rows → {fp}")
