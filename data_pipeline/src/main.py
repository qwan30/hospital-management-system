#!/usr/bin/env python3
"""
Synthea-to-HMS Data Ingestion Pipeline — CLI Entry Point.

Commands:
  generate       Download Synthea, generate patients, vietnamize, map to HMS
  import-csv     Read existing Synthea CSV exports, vietnamize, map to HMS
  import-fhir    Read existing Synthea FHIR exports, vietnamize, map to HMS
  validate       Validate generated HMS seed data
  export-sql     Export HMS seed JSON to PostgreSQL SQL seed file
"""

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


def cmd_generate(args):
    """Full pipeline: download Synthea, generate, vietnamize, map, export."""
    import bcrypt
    from src.download_synthea import download_synthea
    from src.run_synthea import run_synthea
    from src.parse_synthea_csv import parse_synthea_csv
    from src.vietnamize import (
        vietnamize_patients, create_staff_users,
        create_departments, create_patient_accounts,
    )
    from src.map_to_hms import map_all
    from src.validate_seed import validate, print_report
    from src.export_csv import export_csv
    from src.export_json import export_json
    from src.export_jsonl import export_jsonl
    from src.export_sql import export_sql

    out_dir = args.out or "output"

    print("\n[1/6] Downloading Synthea...")
    jar = download_synthea()

    print(f"\n[2/6] Generating {args.patients} synthetic patients...")
    synthea_output = run_synthea(jar_path=str(jar), population=args.patients,
                                 output_dir="./synthea/output", exporter="csv", seed=args.seed)

    print("\n[3/6] Parsing Synthea CSV...")
    synthea_data = parse_synthea_csv(str(synthea_output / "csv"))

    print("\n[4/6] Vietnamizing data...")
    patients, pid_map = vietnamize_patients(synthea_data)
    departments = create_departments()

    demo_pw = args.demo_password or "Demo@1234"
    portal_pw = args.portal_password or "Patient@1234"
    pw_hash = bcrypt.hashpw(demo_pw.encode(), bcrypt.gensalt()).decode()
    portal_hash = bcrypt.hashpw(portal_pw.encode(), bcrypt.gensalt()).decode()

    staff = create_staff_users(departments, pw_hash)
    accounts = create_patient_accounts(patients, portal_hash)

    print("\n[5/6] Mapping to HMS entities...")
    config = {
        "reference_date": args.reference_date or "",
        "slot_duration_minutes": 30, "past_slot_days": 14, "future_slot_days": 30,
        "cancellation_rate": 0.05, "invoice_paid_rate": 0.70, "invoice_unpaid_rate": 0.25,
    }
    seed = map_all(synthea_data, pid_map, patients, departments, staff, accounts, config)

    print("\n[6/6] Validating and exporting...")
    report = validate(seed); print_report(report)
    if report["failed"] > 0 and not args.force:
        print("\nWARNING: Validation failures. Use --force to continue."); sys.exit(1)

    json_path = f"{out_dir}/json/hms_seed.json"
    export_json(seed, json_path)
    export_csv(seed, f"{out_dir}/csv")
    export_jsonl(seed, f"{out_dir}/jsonl")
    export_sql(seed, f"{out_dir}/sql/V99__seed_vietnam_demo_data.sql")
    print(f"\nDone. Output in: {out_dir}/")


def cmd_import_csv(args):
    """Import from existing Synthea CSV output."""
    import bcrypt
    from src.parse_synthea_csv import parse_synthea_csv
    from src.vietnamize import (
        vietnamize_patients, create_staff_users,
        create_departments, create_patient_accounts,
    )
    from src.map_to_hms import map_all
    from src.validate_seed import validate, print_report
    from src.export_csv import export_csv
    from src.export_json import export_json
    from src.export_jsonl import export_jsonl
    from src.export_sql import export_sql

    out_dir = args.out or "output"
    print(f"\n[1/4] Parsing Synthea CSV from {args.synthea_dir}...")
    synthea_data = parse_synthea_csv(args.synthea_dir)

    print("\n[2/4] Vietnamizing data...")
    patients, pid_map = vietnamize_patients(synthea_data)
    departments = create_departments()
    demo_pw = args.demo_password or "Demo@1234"
    portal_pw = args.portal_password or "Patient@1234"
    pw_hash = bcrypt.hashpw(demo_pw.encode(), bcrypt.gensalt()).decode()
    portal_hash = bcrypt.hashpw(portal_pw.encode(), bcrypt.gensalt()).decode()
    staff = create_staff_users(departments, pw_hash)
    accounts = create_patient_accounts(patients, portal_hash)

    print("\n[3/4] Mapping to HMS entities...")
    config = {
        "reference_date": args.reference_date or "",
        "slot_duration_minutes": 30, "past_slot_days": 14, "future_slot_days": 30,
        "cancellation_rate": 0.05, "invoice_paid_rate": 0.70, "invoice_unpaid_rate": 0.25,
    }
    seed = map_all(synthea_data, pid_map, patients, departments, staff, accounts, config)

    print("\n[4/4] Validating and exporting...")
    report = validate(seed); print_report(report)
    if report["failed"] > 0 and not args.force:
        print("\nWARNING: Validation failures. Use --force to continue."); sys.exit(1)

    json_path = f"{out_dir}/json/hms_seed.json"
    export_json(seed, json_path)
    export_csv(seed, f"{out_dir}/csv")
    export_jsonl(seed, f"{out_dir}/jsonl")
    export_sql(seed, f"{out_dir}/sql/V99__seed_vietnam_demo_data.sql")
    print(f"\nImport complete. Output in: {out_dir}/")


def cmd_import_fhir(args):
    """Import from existing Synthea FHIR output."""
    import bcrypt
    from src.parse_synthea_fhir import parse_synthea_fhir
    from src.vietnamize import (
        vietnamize_patients, create_staff_users,
        create_departments, create_patient_accounts,
    )
    from src.map_to_hms import map_all
    from src.validate_seed import validate, print_report
    from src.export_csv import export_csv
    from src.export_json import export_json
    from src.export_jsonl import export_jsonl
    from src.export_sql import export_sql

    out_dir = args.out or "output"
    print(f"\n[1/4] Parsing Synthea FHIR from {args.synthea_dir}...")
    synthea_data = parse_synthea_fhir(args.synthea_dir)

    print("\n[2/4] Vietnamizing data...")
    patients, pid_map = vietnamize_patients(synthea_data)
    departments = create_departments()
    demo_pw = args.demo_password or "Demo@1234"
    portal_pw = args.portal_password or "Patient@1234"
    pw_hash = bcrypt.hashpw(demo_pw.encode(), bcrypt.gensalt()).decode()
    portal_hash = bcrypt.hashpw(portal_pw.encode(), bcrypt.gensalt()).decode()
    staff = create_staff_users(departments, pw_hash)
    accounts = create_patient_accounts(patients, portal_hash)

    print("\n[3/4] Mapping to HMS entities...")
    config = {
        "reference_date": args.reference_date or "",
        "slot_duration_minutes": 30, "past_slot_days": 14, "future_slot_days": 30,
        "cancellation_rate": 0.05, "invoice_paid_rate": 0.70, "invoice_unpaid_rate": 0.25,
    }
    seed = map_all(synthea_data, pid_map, patients, departments, staff, accounts, config)

    print("\n[4/4] Validating and exporting...")
    report = validate(seed); print_report(report)
    if report["failed"] > 0 and not args.force:
        print("\nWARNING: Validation failures. Use --force to continue."); sys.exit(1)

    json_path = f"{out_dir}/json/hms_seed.json"
    export_json(seed, json_path)
    export_csv(seed, f"{out_dir}/csv")
    export_jsonl(seed, f"{out_dir}/jsonl")
    export_sql(seed, f"{out_dir}/sql/V99__seed_vietnam_demo_data.sql")
    print(f"\nImport complete. Output in: {out_dir}/")


def cmd_validate(args):
    """Validate an existing HMS seed JSON file."""
    from src.models import HmsSeed
    from src.validate_seed import validate, print_report

    print(f"\nLoading seed data from {args.input}...")
    with open(args.input, "r", encoding="utf-8") as f:
        data = json.load(f)
    seed = HmsSeed(**data)
    print(f"  Loaded: {len(seed.patients)} patients, {len(seed.appointments)} appointments, "
          f"{len(seed.staff_users)} staff")
    report = validate(seed); print_report(report)
    if report["failed"] > 0: sys.exit(1)


def cmd_export_sql(args):
    """Export HMS seed JSON to PostgreSQL SQL."""
    from src.models import HmsSeed
    from src.export_sql import export_sql, _default_disclaimer

    print(f"\nLoading seed data from {args.input}...")
    with open(args.input, "r", encoding="utf-8") as f:
        data = json.load(f)
    seed = HmsSeed(**data)
    print(f"  Loaded: {len(seed.patients)} patients, {len(seed.appointments)} appointments")
    out_path = args.out or "output/sql/V99__seed_vietnam_demo_data.sql"
    export_sql(seed, out_path, _default_disclaimer())
    print(f"\nSQL export complete: {out_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Synthea-to-HMS Data Ingestion Pipeline",
        epilog="Examples:\n"
               "  python src/main.py generate --patients 100\n"
               "  python src/main.py import-csv --synthea-dir ./synthea/output/csv\n"
               "  python src/main.py validate --input output/json/hms_seed.json\n"
               "  python src/main.py export-sql --input output/json/hms_seed.json",
    )
    sub = parser.add_subparsers(dest="command")

    p = sub.add_parser("generate", help="Download Synthea, generate patients, full pipeline")
    p.add_argument("--patients", "-p", type=int, default=100)
    p.add_argument("--out", "-o", default="output")
    p.add_argument("--seed", type=int, default=42)
    p.add_argument("--demo-password", default="Demo@1234")
    p.add_argument("--portal-password", default="Patient@1234")
    p.add_argument("--reference-date", default="")
    p.add_argument("--force", action="store_true")

    p = sub.add_parser("import-csv", help="Import from Synthea CSV exports")
    p.add_argument("--synthea-dir", required=True)
    p.add_argument("--out", "-o", default="output")
    p.add_argument("--demo-password", default="Demo@1234")
    p.add_argument("--portal-password", default="Patient@1234")
    p.add_argument("--reference-date", default="")
    p.add_argument("--force", action="store_true")

    p = sub.add_parser("import-fhir", help="Import from Synthea FHIR exports")
    p.add_argument("--synthea-dir", required=True)
    p.add_argument("--out", "-o", default="output")
    p.add_argument("--demo-password", default="Demo@1234")
    p.add_argument("--portal-password", default="Patient@1234")
    p.add_argument("--reference-date", default="")
    p.add_argument("--force", action="store_true")

    p = sub.add_parser("validate", help="Validate an HMS seed JSON file")
    p.add_argument("--input", "-i", required=True)

    p = sub.add_parser("export-sql", help="Export JSON to PostgreSQL SQL")
    p.add_argument("--input", "-i", required=True)
    p.add_argument("--out", "-o", default="output/sql/V99__seed_vietnam_demo_data.sql")

    args = parser.parse_args()
    if args.command == "generate": cmd_generate(args)
    elif args.command == "import-csv": cmd_import_csv(args)
    elif args.command == "import-fhir": cmd_import_fhir(args)
    elif args.command == "validate": cmd_validate(args)
    elif args.command == "export-sql": cmd_export_sql(args)
    else: parser.print_help(); sys.exit(1)


if __name__ == "__main__":
    main()
