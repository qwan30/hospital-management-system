"""
Export HMS seed data to a PostgreSQL SQL seed file (Flyway-compatible).

Generates INSERT statements with ON CONFLICT (upsert) semantics,
matching the idempotent seed pattern used by ReleaseDemoSeedService.
"""

import json
from pathlib import Path
from typing import Any, Optional

from src.models import HmsSeed


def _esc(val: Any) -> str:
    if val is None: return "NULL"
    if isinstance(val, bool): return "TRUE" if val else "FALSE"
    if isinstance(val, (int, float)): return str(val)
    s = str(val).replace("'", "''")
    return f"'{s}'"


def _uuid_str(val: Optional[str]) -> str:
    return _esc(val)


def _ts(val: Optional[str]) -> str:
    if not val: return "NULL"
    s = val.replace("T", " ").replace("Z", "+00")
    return _esc(s)


def _date_str(val) -> str:
    return "NULL" if val is None else _esc(str(val))


def _time_str(val) -> str:
    return "NULL" if val is None else _esc(str(val))


def _num(val, precision=2) -> str:
    if val is None: return "NULL"
    return str(round(float(val), precision))


def export_sql(seed: HmsSeed, output_path: str, disclaimer: str = ""):
    """Generate PostgreSQL SQL seed file."""
    out = Path(output_path); out.parent.mkdir(parents=True, exist_ok=True)
    lines = [disclaimer or _default_disclaimer(), "", "BEGIN;", ""]

    # Departments
    for d in seed.departments:
        lines.append(
            f"INSERT INTO departments (id, name, description, image_url, phone, is_active, created_at, updated_at) "
            f"VALUES ({_uuid_str(d.id)}, {_esc(d.name)}, {_esc(d.description)}, {_esc(d.image_url)}, "
            f"{_esc(d.phone)}, {_esc(d.is_active)}, {_ts(d.created_at)}, {_ts(d.updated_at)}) "
            f"ON CONFLICT (name) DO NOTHING;")
    lines.append(f"-- {len(seed.departments)} departments\n")

    # Users (staff)
    for u in seed.staff_users:
        did = _uuid_str(u.department_id) if u.department_id else "NULL"
        ey = str(u.experience_years) if u.experience_years is not None else "NULL"
        lines.append(
            f"INSERT INTO users (id, department_id, email, password_hash, full_name, phone, role, "
            f"specialty, qualification, avatar_url, experience_years, is_active, created_at, updated_at) "
            f"VALUES ({_uuid_str(u.id)}, {did}, {_esc(u.email)}, {_esc(u.password_hash)}, "
            f"{_esc(u.full_name)}, {_esc(u.phone)}, {_esc(u.role.value)}, "
            f"{_esc(u.specialty)}, {_esc(u.qualification)}, {_esc(u.avatar_url)}, "
            f"{ey}, {_esc(u.is_active)}, {_ts(u.created_at)}, {_ts(u.updated_at)}) "
            f"ON CONFLICT (email) DO NOTHING;")
    lines.append(f"-- {len(seed.staff_users)} staff users\n")

    # Patients
    for p in seed.patients:
        lines.append(
            f"INSERT INTO patients (id, full_name, phone, email, date_of_birth, gender, cccd, cccd_hash, "
            f"province_or_city, district, street_address, occupation, blood_type, "
            f"medical_history, drug_allergies, insurance_number, created_at, updated_at) "
            f"VALUES ({_uuid_str(p.id)}, {_esc(p.full_name)}, {_esc(p.phone)}, {_esc(p.email)}, "
            f"{_date_str(p.date_of_birth)}, {_esc(p.gender.value)}, {_esc(p.cccd)}, {_esc(p.cccd_hash)}, "
            f"{_esc(p.province_or_city)}, {_esc(p.district)}, {_esc(p.street_address)}, "
            f"{_esc(p.occupation)}, {_esc(p.blood_type)}, "
            f"{_esc(p.medical_history)}, {_esc(p.drug_allergies)}, {_esc(p.insurance_number)}, "
            f"{_ts(p.created_at)}, {_ts(p.updated_at)}) "
            f"ON CONFLICT (cccd_hash) DO NOTHING;")
    lines.append(f"-- {len(seed.patients)} patients\n")

    # Rooms
    for r in seed.rooms:
        did = _uuid_str(r.department_id) if r.department_id else "NULL"
        lines.append(
            f"INSERT INTO rooms (id, department_id, name, status, is_active, notes, created_at, updated_at) "
            f"VALUES ({_uuid_str(r.id)}, {did}, {_esc(r.name)}, {_esc(r.status.value)}, "
            f"{_esc(r.is_active)}, {_esc(r.notes)}, {_ts(r.created_at)}, {_ts(r.updated_at)}) "
            f"ON CONFLICT (department_id, name) DO NOTHING;")
    lines.append(f"-- {len(seed.rooms)} rooms\n")

    # Schedule templates
    for s in seed.schedule_templates:
        rid = _uuid_str(s.room_id) if s.room_id else "NULL"
        lines.append(
            f"INSERT INTO doctor_work_schedules (id, doctor_id, room_id, day_of_week, "
            f"start_time, end_time, slot_duration_minutes, is_active, created_at, updated_at) "
            f"VALUES ({_uuid_str(s.id)}, {_uuid_str(s.doctor_id)}, {rid}, {s.day_of_week}, "
            f"{_time_str(s.start_time)}, {_time_str(s.end_time)}, {s.slot_duration_minutes}, "
            f"{_esc(s.is_active)}, {_ts(s.created_at)}, {_ts(s.updated_at)}) "
            f"ON CONFLICT DO NOTHING;")
    lines.append(f"-- {len(seed.schedule_templates)} schedule templates\n")

    # Time slots
    for s in seed.time_slots:
        lines.append(
            f"INSERT INTO time_slots (id, doctor_id, slot_date, start_time, end_time, status, created_at, updated_at) "
            f"VALUES ({_uuid_str(s.id)}, {_uuid_str(s.doctor_id)}, {_date_str(s.slot_date)}, "
            f"{_time_str(s.start_time)}, {_time_str(s.end_time)}, {_esc(s.status.value)}, "
            f"{_ts(s.created_at)}, {_ts(s.updated_at)}) "
            f"ON CONFLICT DO NOTHING;")
    lines.append(f"-- {len(seed.time_slots)} time slots\n")

    # Appointments
    for a in seed.appointments:
        ci = _ts(a.checked_in_at) if a.checked_in_at else "NULL"
        bg = _esc(a.booking_contact_gender.value) if a.booking_contact_gender else "NULL"
        bd = _date_str(a.booking_contact_date_of_birth) if a.booking_contact_date_of_birth else "NULL"
        lines.append(
            f"INSERT INTO appointments (id, patient_id, doctor_id, first_slot_id, appointment_date, "
            f"ai_duration_minutes, symptoms, confirmation_code, status, checked_in_at, "
            f"booking_contact_full_name, booking_contact_relationship, booking_contact_phone, "
            f"booking_contact_email, booking_contact_cccd, booking_contact_date_of_birth, "
            f"booking_contact_gender, notes, reason, created_at, updated_at) "
            f"VALUES ({_uuid_str(a.id)}, {_uuid_str(a.patient_id)}, {_uuid_str(a.doctor_id)}, "
            f"{_uuid_str(a.first_slot_id)}, {_date_str(a.appointment_date)}, {a.ai_duration_minutes}, "
            f"{_esc(a.symptoms)}, {_esc(a.confirmation_code)}, {_esc(a.status.value)}, {ci}, "
            f"{_esc(a.booking_contact_full_name)}, {_esc(a.booking_contact_relationship)}, "
            f"{_esc(a.booking_contact_phone)}, {_esc(a.booking_contact_email)}, "
            f"{_esc(a.booking_contact_cccd)}, {bd}, {bg}, "
            f"{_esc(a.notes)}, {_esc(a.reason)}, {_ts(a.created_at)}, {_ts(a.updated_at)}) "
            f"ON CONFLICT (confirmation_code) DO NOTHING;")
    lines.append(f"-- {len(seed.appointments)} appointments\n")

    # Vital signs
    for vs in seed.vital_signs:
        lines.append(
            f"INSERT INTO appointment_vital_signs (id, appointment_id, blood_pressure, temperature, "
            f"weight, height, heart_rate, respiratory_rate, oxygen_saturation, recorded_at) "
            f"VALUES ({_uuid_str(vs.id)}, {_uuid_str(vs.appointment_id)}, "
            f"{_esc(vs.blood_pressure)}, {_num(vs.temperature, 2)}, {_num(vs.weight, 2)}, "
            f"{_num(vs.height, 2)}, {vs.heart_rate or 'NULL'}, {vs.respiratory_rate or 'NULL'}, "
            f"{_num(vs.oxygen_saturation, 2)}, {_ts(vs.recorded_at)}) "
            f"ON CONFLICT (appointment_id) DO NOTHING;")
    lines.append(f"-- {len(seed.vital_signs)} vital signs\n")

    # Medical records
    for r in seed.medical_records:
        fu = _date_str(r.follow_up_date) if r.follow_up_date else "NULL"
        rsa = _ts(r.reminder_scheduled_at) if r.reminder_scheduled_at else "NULL"
        rsat = _ts(r.reminder_sent_at) if r.reminder_sent_at else "NULL"
        lines.append(
            f"INSERT INTO medical_records (id, appointment_id, diagnosis, clinical_notes, "
            f"blood_pressure, temperature, weight, height, prescription_pdf_url, "
            f"follow_up_date, reminder_sent, reminder_scheduled_at, reminder_sent_at, "
            f"created_at, updated_at) "
            f"VALUES ({_uuid_str(r.id)}, {_uuid_str(r.appointment_id)}, {_esc(r.diagnosis)}, "
            f"{_esc(r.clinical_notes)}, {_esc(r.blood_pressure)}, {_num(r.temperature, 2)}, "
            f"{_num(r.weight, 2)}, {_num(r.height, 2)}, {_esc(r.prescription_pdf_url)}, "
            f"{fu}, {_esc(r.reminder_sent)}, {rsa}, {rsat}, "
            f"{_ts(r.created_at)}, {_ts(r.updated_at)}) "
            f"ON CONFLICT (appointment_id) DO NOTHING;")
    lines.append(f"-- {len(seed.medical_records)} medical records\n")

    # Prescription items
    for p in seed.prescription_items:
        dur = str(p.duration_days) if p.duration_days is not None else "NULL"
        lines.append(
            f"INSERT INTO prescription_items (id, medical_record_id, medicine_name, dosage, "
            f"frequency, duration_days, instructions, sort_order, created_at, updated_at) "
            f"VALUES ({_uuid_str(p.id)}, {_uuid_str(p.medical_record_id)}, "
            f"{_esc(p.medicine_name)}, {_esc(p.dosage)}, {_esc(p.frequency)}, "
            f"{dur}, {_esc(p.instructions)}, {p.sort_order}, "
            f"{_ts(p.created_at)}, {_ts(p.updated_at)}) "
            f"ON CONFLICT DO NOTHING;")
    lines.append(f"-- {len(seed.prescription_items)} prescription items\n")

    # Lab results
    for lr in seed.lab_results:
        av = _uuid_str(lr.appointment_id) if lr.appointment_id else "NULL"
        lines.append(
            f"INSERT INTO lab_results (id, patient_id, appointment_id, test_name, status, "
            f"result_summary, result_value, reference_range, notes, doctor_comment, "
            f"attachment_url, collected_at, deleted, created_at, updated_at) "
            f"VALUES ({_uuid_str(lr.id)}, {_uuid_str(lr.patient_id)}, {av}, "
            f"{_esc(lr.test_name)}, {_esc(lr.status)}, {_esc(lr.result_summary)}, "
            f"{_esc(lr.result_value)}, {_esc(lr.reference_range)}, {_esc(lr.notes)}, "
            f"{_esc(lr.doctor_comment)}, {_esc(lr.attachment_url)}, "
            f"{_ts(lr.collected_at)}, {_esc(lr.deleted)}, {_ts(lr.created_at)}, {_ts(lr.updated_at)}) "
            f"ON CONFLICT DO NOTHING;")
    lines.append(f"-- {len(seed.lab_results)} lab results\n")

    # Follow-ups
    for fu in seed.follow_ups:
        lines.append(
            f"INSERT INTO appointment_follow_ups (id, parent_appointment_id, follow_up_date, reason, created_at) "
            f"VALUES ({_uuid_str(fu.id)}, {_uuid_str(fu.parent_appointment_id)}, "
            f"{_date_str(fu.follow_up_date)}, {_esc(fu.reason)}, {_ts(fu.created_at)}) "
            f"ON CONFLICT (parent_appointment_id) DO NOTHING;")
    lines.append(f"-- {len(seed.follow_ups)} follow-ups\n")

    # Inventory items
    for it in seed.inventory_items:
        did = _uuid_str(it.department_id) if it.department_id else "NULL"
        lr = _ts(it.last_restocked_at) if it.last_restocked_at else "NULL"
        lines.append(
            f"INSERT INTO inventory_items (id, department_id, sku, item_name, category, unit, "
            f"reorder_level, quantity_on_hand, status, last_restocked_at, created_at, updated_at) "
            f"VALUES ({_uuid_str(it.id)}, {did}, {_esc(it.sku)}, {_esc(it.item_name)}, "
            f"{_esc(it.category)}, {_esc(it.unit)}, {it.reorder_level}, {it.quantity_on_hand}, "
            f"{_esc(it.status)}, {lr}, {_ts(it.created_at)}, {_ts(it.updated_at)}) "
            f"ON CONFLICT (sku) DO NOTHING;")
    lines.append(f"-- {len(seed.inventory_items)} inventory items\n")

    # Inventory lots
    for lot in seed.inventory_lots:
        ex = _date_str(lot.expires_on) if lot.expires_on else "NULL"
        lines.append(
            f"INSERT INTO inventory_lots (id, item_id, lot_code, supplier_name, "
            f"quantity_received, quantity_remaining, expires_on, created_at, updated_at) "
            f"VALUES ({_uuid_str(lot.id)}, {_uuid_str(lot.item_id)}, {_esc(lot.lot_code)}, "
            f"{_esc(lot.supplier_name)}, {lot.quantity_received}, {lot.quantity_remaining}, "
            f"{ex}, {_ts(lot.created_at)}, {_ts(lot.updated_at)}) "
            f"ON CONFLICT DO NOTHING;")
    lines.append(f"-- {len(seed.inventory_lots)} inventory lots\n")

    # Inventory movements
    for m in seed.inventory_movements:
        lv = _uuid_str(m.lot_id) if m.lot_id else "NULL"
        rv = _uuid_str(m.medical_record_id) if m.medical_record_id else "NULL"
        lines.append(
            f"INSERT INTO inventory_movements (id, item_id, lot_id, medical_record_id, "
            f"movement_type, quantity_delta, prescription_item_name, dispensed_to_patient, note, created_at) "
            f"VALUES ({_uuid_str(m.id)}, {_uuid_str(m.item_id)}, {lv}, {rv}, "
            f"{_esc(m.movement_type)}, {m.quantity_delta}, {_esc(m.prescription_item_name)}, "
            f"{_esc(m.dispensed_to_patient)}, {_esc(m.note)}, {_ts(m.created_at)}) "
            f"ON CONFLICT DO NOTHING;")
    lines.append(f"-- {len(seed.inventory_movements)} inventory movements\n")

    # Invoices
    for inv in seed.invoices:
        pat = _ts(inv.paid_at) if inv.paid_at else "NULL"
        lines.append(
            f"INSERT INTO invoices (id, appointment_id, total_amount, status, payment_method, "
            f"paid_at, created_at, updated_at) "
            f"VALUES ({_uuid_str(inv.id)}, {_uuid_str(inv.appointment_id)}, "
            f"{_num(inv.total_amount, 2)}, {_esc(inv.status.value)}, "
            f"{_esc(inv.payment_method)}, {pat}, {_ts(inv.created_at)}, {_ts(inv.updated_at)}) "
            f"ON CONFLICT (appointment_id) DO NOTHING;")
    lines.append(f"-- {len(seed.invoices)} invoices\n")

    # Service pricings
    for sp in seed.service_pricings:
        did = _uuid_str(sp.department_id) if sp.department_id else "NULL"
        lines.append(
            f"INSERT INTO service_pricing (id, department_id, service_name, amount, effective_date, "
            f"created_at, updated_at) "
            f"VALUES ({_uuid_str(sp.id)}, {did}, {_esc(sp.service_name)}, "
            f"{_num(sp.amount, 2)}, {_date_str(sp.effective_date)}, "
            f"{_ts(sp.created_at)}, {_ts(sp.updated_at)}) "
            f"ON CONFLICT DO NOTHING;")
    lines.append(f"-- {len(seed.service_pricings)} service pricings\n")

    # Patient accounts
    for pa in seed.patient_accounts:
        lines.append(
            f"INSERT INTO patient_accounts (patient_id, email, password_hash, is_active, created_at, updated_at) "
            f"VALUES ({_uuid_str(pa.patient_id)}, {_esc(pa.email)}, {_esc(pa.password_hash)}, "
            f"{_esc(pa.is_active)}, {_ts(pa.created_at)}, {_ts(pa.updated_at)}) "
            f"ON CONFLICT (email) DO NOTHING;")
    lines.append(f"-- {len(seed.patient_accounts)} patient accounts\n")

    # Audit logs
    for al in seed.audit_logs:
        av = _uuid_str(al.actor_id) if al.actor_id else "NULL"
        ev = _uuid_str(al.entity_id) if al.entity_id else "NULL"
        meta_json = json.dumps(al.metadata, ensure_ascii=False, default=str)
        lines.append(
            f"INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, metadata, created_at) "
            f"VALUES ({_uuid_str(al.id)}, {av}, {_esc(al.action)}, {_esc(al.entity_type)}, "
            f"{ev}, {_esc(meta_json)}::jsonb, {_ts(al.created_at)}) "
            f"ON CONFLICT DO NOTHING;")
    lines.append(f"-- {len(seed.audit_logs)} audit logs\n")

    # Content sections
    for cs in seed.content_sections:
        lines.append(
            f"INSERT INTO hospital_content_sections (id, slug, title, body, image_url, "
            f"cta_label, cta_href, sort_order, is_active, created_at, updated_at) "
            f"VALUES ({_uuid_str(cs.id)}, {_esc(cs.slug)}, {_esc(cs.title)}, {_esc(cs.body)}, "
            f"{_esc(cs.image_url)}, {_esc(cs.cta_label)}, {_esc(cs.cta_href)}, "
            f"{cs.sort_order}, {_esc(cs.is_active)}, {_ts(cs.created_at)}, {_ts(cs.updated_at)}) "
            f"ON CONFLICT (slug) DO NOTHING;")
    lines.append(f"-- {len(seed.content_sections)} content sections\n")

    # News articles
    for na in seed.news_articles:
        lines.append(
            f"INSERT INTO news_articles (id, slug, title, summary, content, image_url, "
            f"published_at, is_active, created_at, updated_at) "
            f"VALUES ({_uuid_str(na.id)}, {_esc(na.slug)}, {_esc(na.title)}, {_esc(na.summary)}, "
            f"{_esc(na.content)}, {_esc(na.image_url)}, {_ts(na.published_at)}, "
            f"{_esc(na.is_active)}, {_ts(na.created_at)}, {_ts(na.updated_at)}) "
            f"ON CONFLICT (slug) DO NOTHING;")
    lines.append(f"-- {len(seed.news_articles)} news articles\n")

    lines.append("COMMIT;")
    with open(out, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"  [sql] {out.stat().st_size / 1024 / 1024:.1f} MB → {out}")


def _default_disclaimer() -> str:
    return """-- ============================================================================
-- DEMO / SYNTHETIC DATA — NOT FOR PRODUCTION USE
-- Generated by Synthea-to-HMS Data Ingestion Pipeline
-- Source: Synthea (synthetichealth/synthea)
-- All patient identities are FABRICATED. No real PHI.
-- CCCD numbers are randomly generated 12-digit strings.
-- Phone numbers use fake VN prefixes.
-- Clinical data is synthetic and may not reflect real medical practice.
-- ============================================================================"""
