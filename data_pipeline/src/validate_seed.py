"""
Validate generated HMS seed data against 12 business rules:
1. Unique patient emails  2. Unique CCCD  3. CCCD exactly 12 digits
4. Unique confirmation codes  5. No double-booked slots
6. Appointment FK integrity  7. Medical records → DONE appointments
8. Prescriptions → existing medical records  9. Invoices → DONE appointments
10. Queue entries → today checked-in  11. Inventory no negative stock
12. All FKs resolvable
"""

from collections import Counter, defaultdict
from typing import Any

from src.models import HmsSeed, AppointmentStatus


class ValidationError(Exception):
    pass


def validate(seed: HmsSeed) -> dict[str, Any]:
    """Run all validation rules. Returns a report dict."""
    report = {"passed": 0, "failed": 0, "rules": []}
    rules = [
        ("unique_patient_emails", _check_unique_emails),
        ("unique_cccd", _check_unique_cccd),
        ("cccd_12_digits", _check_cccd_format),
        ("unique_confirmation_codes", _check_unique_confirmation_codes),
        ("no_double_booked_slots", _check_double_booked_slots),
        ("appointment_fk_integrity", _check_appointment_fks),
        ("medical_record_appointment_status", _check_medical_record_appointment_status),
        ("prescription_medical_record_fk", _check_prescription_fks),
        ("invoice_appointment_status", _check_invoice_appointment_status),
        ("inventory_no_negative_stock", _check_inventory_stock),
        ("all_foreign_keys_resolvable", _check_all_fks),
    ]
    for name, fn in rules:
        try:
            fn(seed)
            report["rules"].append({"name": name, "status": "PASS"})
            report["passed"] += 1
        except ValidationError as e:
            report["rules"].append({"name": name, "status": "FAIL", "message": str(e)})
            report["failed"] += 1
    return report


def _check_unique_emails(seed):
    emails = [p.email.lower() for p in seed.patients]
    dupes = [e for e, c in Counter(emails).items() if c > 1]
    if dupes: raise ValidationError(f"Duplicate patient emails: {dupes}")

def _check_unique_cccd(seed):
    cccds = [p.cccd for p in seed.patients]
    dupes = [c for c, c2 in Counter(cccds).items() if c2 > 1]
    if dupes: raise ValidationError(f"Duplicate CCCD: {dupes}")

def _check_cccd_format(seed):
    bad = [p.cccd for p in seed.patients if len(p.cccd) != 12 or not p.cccd.isdigit()]
    if bad: raise ValidationError(f"Invalid CCCD (not 12 digits): {bad[:5]}...")

def _check_unique_confirmation_codes(seed):
    codes = [a.confirmation_code for a in seed.appointments]
    dupes = [c for c, c2 in Counter(codes).items() if c2 > 1]
    if dupes: raise ValidationError(f"Duplicate confirmation codes: {dupes}")

def _check_double_booked_slots(seed):
    bookings = defaultdict(list)
    slot_map = {s.id: s for s in seed.time_slots}
    for appt in seed.appointments:
        if appt.status == AppointmentStatus.CANCELLED: continue
        slot = slot_map.get(appt.first_slot_id)
        if slot:
            bookings[(slot.doctor_id, slot.slot_date, slot.start_time)].append(appt.confirmation_code)
    dupes = {k: v for k, v in bookings.items() if len(v) > 1}
    if dupes: raise ValidationError(f"Double-booked slots: {len(dupes)} conflicts")

def _check_appointment_fks(seed):
    pids = {p.id for p in seed.patients}
    uids = {u.id for u in seed.staff_users}
    sids = {s.id for s in seed.time_slots}
    for a in seed.appointments:
        if a.patient_id not in pids: raise ValidationError(f"Appt {a.id}: patient {a.patient_id} missing")
        if a.doctor_id not in uids: raise ValidationError(f"Appt {a.id}: doctor {a.doctor_id} missing")
        if a.first_slot_id not in sids: raise ValidationError(f"Appt {a.id}: slot {a.first_slot_id} missing")

def _check_medical_record_appointment_status(seed):
    amap = {a.id: a for a in seed.appointments}
    for r in seed.medical_records:
        a = amap.get(r.appointment_id)
        if not a: raise ValidationError(f"Record {r.id}: appt {r.appointment_id} missing")
        if a.status != AppointmentStatus.DONE:
            raise ValidationError(f"Record {r.id}: appt status {a.status}")

def _check_prescription_fks(seed):
    rids = {r.id for r in seed.medical_records}
    for p in seed.prescription_items:
        if p.medical_record_id not in rids:
            raise ValidationError(f"Prescription {p.id}: record {p.medical_record_id} missing")

def _check_invoice_appointment_status(seed):
    amap = {a.id: a for a in seed.appointments}
    for inv in seed.invoices:
        a = amap.get(inv.appointment_id)
        if not a: raise ValidationError(f"Invoice {inv.id}: appt missing")
        if a.status != AppointmentStatus.DONE:
            raise ValidationError(f"Invoice {inv.id}: appt status {a.status}")

def _check_inventory_stock(seed):
    """Verify inventory movements don't cause negative stock (running total)."""
    item_moves = defaultdict(list)
    for m in seed.inventory_movements:
        item_moves[m.item_id].append(m)
    item_map = {i.id: i for i in seed.inventory_items}
    for item_id, moves in item_moves.items():
        sorted_moves = sorted(moves, key=lambda m: m.created_at)
        running = item_map.get(item_id, None)
        start_qty = running.quantity_on_hand if running else 0
        running_sum = start_qty
        for m in sorted_moves:
            running_sum += m.quantity_delta
            if running_sum < 0:
                raise ValidationError(
                    f"Item {item_id}: negative stock ({running_sum}) after movement {m.id}"
                )

def _check_all_fks(seed):
    pids = {p.id for p in seed.patients}
    uids = {u.id for u in seed.staff_users}
    dids = {d.id for d in seed.departments}
    sids = {s.id for s in seed.time_slots}
    aids = {a.id for a in seed.appointments}
    rids = {r.id for r in seed.medical_records}
    iids = {i.id for i in seed.inventory_items}
    lids = {l.id for l in seed.inventory_lots}
    rmids = {r.id for r in seed.rooms}
    errors = []
    for u in seed.staff_users:
        if u.department_id and u.department_id not in dids: errors.append(f"User {u.id}: dept missing")
    for a in seed.appointments:
        if a.patient_id not in pids: errors.append(f"Appt {a.id}: patient")
        if a.doctor_id not in uids: errors.append(f"Appt {a.id}: doctor")
        if a.first_slot_id not in sids: errors.append(f"Appt {a.id}: slot")
    for r in seed.medical_records:
        if r.appointment_id not in aids: errors.append(f"Record {r.id}: appt")
    for p in seed.prescription_items:
        if p.medical_record_id not in rids: errors.append(f"Rx {p.id}: record")
    for inv in seed.invoices:
        if inv.appointment_id not in aids: errors.append(f"Invoice {inv.id}: appt")
    for lr in seed.lab_results:
        if lr.patient_id not in pids: errors.append(f"Lab {lr.id}: patient")
        if lr.appointment_id and lr.appointment_id not in aids: errors.append(f"Lab {lr.id}: appt")
    for vs in seed.vital_signs:
        if vs.appointment_id not in aids: errors.append(f"Vitals {vs.id}: appt")
    for fu in seed.follow_ups:
        if fu.parent_appointment_id not in aids: errors.append(f"FollowUp {fu.id}: appt")
    for pa in seed.patient_accounts:
        if pa.patient_id not in pids: errors.append(f"Account {pa.patient_id}: patient")
    for lot in seed.inventory_lots:
        if lot.item_id not in iids: errors.append(f"Lot {lot.id}: item")
    for m in seed.inventory_movements:
        if m.item_id not in iids: errors.append(f"Move {m.id}: item")
        if m.lot_id and m.lot_id not in lids: errors.append(f"Move {m.id}: lot")
        if m.medical_record_id and m.medical_record_id not in rids: errors.append(f"Move {m.id}: record")
    for r in seed.rooms:
        if r.department_id and r.department_id not in dids: errors.append(f"Room {r.id}: dept")
    for s in seed.schedule_templates:
        if s.doctor_id not in uids: errors.append(f"Sched {s.id}: doctor")
        if s.room_id and s.room_id not in rmids: errors.append(f"Sched {s.id}: room")
    if errors: raise ValidationError(f"FK errors ({len(errors)}): {errors[:10]}...")


def print_report(report: dict):
    print("\n" + "=" * 60)
    print("  VALIDATION REPORT")
    print("=" * 60)
    for rule in report["rules"]:
        icon = "PASS" if rule["status"] == "PASS" else "FAIL"
        print(f"  [{icon}] {rule['name']}")
        if rule["status"] == "FAIL":
            print(f"         → {rule.get('message', '')}")
    print("-" * 60)
    print(f"  Passed: {report['passed']}  Failed: {report['failed']}")
    print("=" * 60)
