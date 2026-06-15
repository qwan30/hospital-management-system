"""Export HMS seed data to a single JSON file."""

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


def export_json(seed: HmsSeed, output_path: str):
    out = Path(output_path); out.parent.mkdir(parents=True, exist_ok=True)
    data = seed.model_dump()
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, cls=_Encoder)
    print(f"  [json] {out.stat().st_size / 1024 / 1024:.1f} MB → {out}")
