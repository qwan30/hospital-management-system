"""Export HMS seed data to JSONL files (one JSON object per line)."""

import json
from pathlib import Path

from src.models import HmsSeed


class _Encoder(json.JSONEncoder):
    def default(self, obj):
        from datetime import date, datetime, time
        from decimal import Decimal
        from enum import Enum
        if isinstance(obj, (date, datetime, time)): return obj.isoformat()
        if isinstance(obj, Decimal): return float(obj)
        if isinstance(obj, Enum): return obj.value
        return super().default(obj)


def export_jsonl(seed: HmsSeed, output_dir: str):
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
        fp = out / f"{name}.jsonl"
        with open(fp, "w", encoding="utf-8") as f:
            for item in items:
                f.write(json.dumps(item.model_dump(), ensure_ascii=False, cls=_Encoder) + "\n")
        print(f"  [jsonl] {len(items)} lines → {fp}")
