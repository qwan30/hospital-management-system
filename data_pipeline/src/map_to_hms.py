"""
Map Synthea entities to HMS seed models.

Core transformation module — generates all 22 HMS entity types:
appointments, slots, medical records, prescriptions, lab results,
inventory, invoices, content, news, audit logs.
"""

import random
from datetime import date, datetime, timedelta, time as dtime
from decimal import Decimal
from typing import Optional

from src.constants import (
    generate_confirmation_code,
    VN_CLINICAL_NOTES,
    VN_COMMON_MEDS,
    VN_DOSAGES,
    VN_FREQUENCIES,
    VN_INSTRUCTIONS,
    VN_SUPPLIERS,
    translate_condition,
)
from src.models import (
    HmsSeed, AppointmentStatus, SlotStatus, InvoiceStatus, RoomStatus,
    new_uuid, utc_now, Department, StaffUser, Patient, Room,
    ScheduleTemplate, TimeSlot, Appointment, VitalSigns, MedicalRecord,
    PrescriptionItem, LabResult, FollowUp, InventoryItem, InventoryLot,
    InventoryMovement, Invoice, ServicePricing, PatientAccount,
    AuditLog, ContentSection, NewsArticle,
)


def _today(ref_date: str = "") -> date:
    return date.fromisoformat(ref_date) if ref_date else date.today()


def map_all(
    synthea_data: dict,
    patient_id_map: dict[str, str],
    patients: list[Patient],
    departments: list[Department],
    staff_users: list[StaffUser],
    patient_accounts: list[PatientAccount],
    config: dict,
) -> HmsSeed:
    """Map all Synthea data into HMS seed models."""
    rng = random.Random(42)
    today = _today(config.get("reference_date", ""))
    doctors = [u for u in staff_users if u.role.value == "DOCTOR"]
    if not doctors:
        raise ValueError("No doctors in staff_users")

    rooms = _gen_rooms(departments)
    schedules = _gen_schedules(doctors, rooms, config.get("slot_duration_minutes", 30))
    slots, slot_lookup = _gen_slots(doctors, schedules, today,
                                     config.get("past_slot_days", 14),
                                     config.get("future_slot_days", 30),
                                     config.get("slot_duration_minutes", 30), rng)
    appointments, conf_codes, booked = _gen_appointments(
        synthea_data, patient_id_map, patients, doctors, slots, slot_lookup,
        today, config, rng)
    vitals = _gen_vitals(synthea_data, patient_id_map, appointments, rng)
    records = _gen_records(synthea_data, patient_id_map, appointments, rng)
    prescriptions = _gen_prescriptions(records, rng)
    lab_results = _gen_lab_results(synthea_data, patient_id_map, appointments, patients, rng)
    follow_ups = _gen_follow_ups(records, rng)
    inv_items, inv_lots, inv_moves = _gen_inventory(departments, records, prescriptions, rng)
    pricings = _gen_pricings(departments, config, today)
    invoices = _gen_invoices(appointments, config, rng)
    content = _gen_content()
    news = _gen_news(today)
    audit = _gen_audit(staff_users, patients, appointments, rng)

    return HmsSeed(
        departments=departments, staff_users=staff_users, patients=patients,
        rooms=rooms, schedule_templates=schedules, time_slots=slots,
        appointments=appointments, vital_signs=vitals, medical_records=records,
        prescription_items=prescriptions, lab_results=lab_results,
        follow_ups=follow_ups, inventory_items=inv_items, inventory_lots=inv_lots,
        inventory_movements=inv_moves, invoices=invoices,
        service_pricings=pricings, patient_accounts=patient_accounts,
        audit_logs=audit, content_sections=content, news_articles=news,
    )


# ── Rooms ─────────────────────────────────────────────────────────

def _gen_rooms(departments: list[Department]) -> list[Room]:
    rooms = []
    for i, dept in enumerate(departments):
        for j in range(2):
            rooms.append(Room(department_id=dept.id,
                              name=f"Phòng {i*2+j+1:03d}"))
    print(f"  [map_hms] {len(rooms)} rooms")
    return rooms


# ── Schedules ─────────────────────────────────────────────────────

def _gen_schedules(doctors: list[StaffUser], rooms: list[Room],
                   slot_dur: int) -> list[ScheduleTemplate]:
    scheds = []
    for i, doc in enumerate(doctors):
        room = rooms[i % len(rooms)] if rooms else None
        for wd in range(1, 6):  # Mon-Fri
            scheds.append(ScheduleTemplate(doctor_id=doc.id, room_id=room.id if room else None,
                                           day_of_week=wd, start_time=dtime(7, 0),
                                           end_time=dtime(11, 30), slot_duration_minutes=slot_dur))
            if i % 2 == 0:
                scheds.append(ScheduleTemplate(doctor_id=doc.id, room_id=room.id if room else None,
                                               day_of_week=wd, start_time=dtime(13, 0),
                                               end_time=dtime(16, 30), slot_duration_minutes=slot_dur))
    print(f"  [map_hms] {len(scheds)} schedule templates")
    return scheds


# ── Slots ─────────────────────────────────────────────────────────

def _gen_slots(doctors, schedules, today, past_d, future_d, slot_dur, rng):
    slots: list[TimeSlot] = []
    lookup: dict[tuple, str] = {}
    for doc in doctors:
        doc_scheds = [s for s in schedules if s.doctor_id == doc.id]
        for offset in range(-past_d, future_d + 1):
            sd = today + timedelta(days=offset)
            our_dow = (sd.weekday() + 1) % 7  # 0=Sun
            for sched in doc_scheds:
                if sched.day_of_week != our_dow:
                    continue
                cur = sched.start_time
                end = sched.end_time
                while cur < end:
                    nxt = (datetime.combine(date.today(), cur) + timedelta(minutes=slot_dur)).time()
                    if nxt > end:
                        break
                    status = SlotStatus.AVAILABLE
                    if offset < 0:
                        status = SlotStatus.BOOKED
                    elif offset == 0 and cur < dtime(12, 0):
                        status = SlotStatus.BOOKED
                    slot = TimeSlot(doctor_id=doc.id, slot_date=sd,
                                    start_time=cur, end_time=nxt, status=status)
                    slots.append(slot)
                    lookup[(doc.id, sd, cur)] = slot.id
                    cur = nxt
    print(f"  [map_hms] {len(slots)} time slots")
    return slots, lookup


# ── Appointments ────────────────────────────────────────────────

def _gen_appointments(synthea_data, pid_map, patients, doctors, slots, slot_lookup,
                      today, config, rng):
    appointments: list[Appointment] = []
    conf_codes: set[str] = set()
    booked: set[tuple] = set()
    used_slots: set[str] = set()
    encounters = synthea_data.get("encounters", [])
    cancel_rate = config.get("cancellation_rate", 0.05)

    for i, enc in enumerate(encounters):
        spid = enc.get("PATIENT", "")
        hpid = pid_map.get(spid)
        if not hpid:
            continue
        enc_start = enc.get("START", "")
        try:
            enc_date = date.fromisoformat(enc_start[:10]) if enc_start else today
        except (ValueError, TypeError):
            continue
        doc = doctors[i % len(doctors)]
        slot = _find_slot(doc.id, enc_date, slots, slot_lookup, used_slots, booked, today, rng)
        if not slot:
            continue
        used_slots.add(slot.id)
        booked.add((doc.id, slot.slot_date, slot.start_time))

        days_diff = (slot.slot_date - today).days
        status = _assign_status(days_diff, slot, today, rng, cancel_rate)

        cc = generate_confirmation_code(rng)
        while cc in conf_codes:
            cc = generate_confirmation_code(rng)
        conf_codes.add(cc)

        symptoms = enc.get("REASONDESC", "") or enc.get("DESCRIPTION", "")
        patient = next((p for p in patients if p.id == hpid), None)

        appointments.append(Appointment(
            patient_id=hpid, doctor_id=doc.id, first_slot_id=slot.id,
            appointment_date=slot.slot_date,
            ai_duration_minutes=config.get("slot_duration_minutes", 30),
            symptoms=symptoms[:2000] if symptoms else "",
            confirmation_code=cc, status=status,
            checked_in_at=(datetime.combine(slot.slot_date, slot.start_time).isoformat()
                           if status in (AppointmentStatus.CHECKED_IN, AppointmentStatus.IN_PROGRESS)
                           else None),
            booking_contact_full_name=patient.full_name if patient else "",
            booking_contact_phone=patient.phone if patient else "",
            booking_contact_email=patient.email if patient else "",
            reason=symptoms[:500] if symptoms else "",
        ))
    print(f"  [map_hms] {len(appointments)} appointments")
    return appointments, conf_codes, booked


def _find_slot(doc_id, target, slots, lookup, used, booked, today, rng):
    for offset in range(0, 14):
        for d in ([1, -1] if offset > 0 else [0]):
            try_date = target + timedelta(days=offset * d)
            candidates = [s for s in slots if s.doctor_id == doc_id
                          and s.slot_date == try_date and s.id not in used
                          and (doc_id, s.slot_date, s.start_time) not in booked]
            if candidates:
                return rng.choice(candidates)
    return None


def _assign_status(days_diff, slot, today, rng, cancel_rate):
    if rng.random() < cancel_rate:
        return AppointmentStatus.CANCELLED
    if days_diff < -1:
        return AppointmentStatus.DONE
    elif days_diff == -1:
        return AppointmentStatus.DONE
    elif days_diff == 0:
        if slot.start_time < dtime(9, 0):
            return rng.choice([AppointmentStatus.DONE, AppointmentStatus.IN_PROGRESS])
        elif slot.start_time < dtime(12, 0):
            return rng.choice([AppointmentStatus.CHECKED_IN, AppointmentStatus.IN_PROGRESS])
        else:
            return rng.choice([AppointmentStatus.CONFIRMED, AppointmentStatus.CHECKED_IN])
    elif days_diff <= 7:
        return rng.choice([AppointmentStatus.CONFIRMED, AppointmentStatus.CONFIRMED,
                           AppointmentStatus.PENDING])
    else:
        return rng.choice([AppointmentStatus.PENDING, AppointmentStatus.PENDING,
                           AppointmentStatus.CONFIRMED])


# ── Vital Signs ─────────────────────────────────────────────────

def _gen_vitals(synthea_data, pid_map, appointments, rng):
    vitals: list[VitalSigns] = []
    for appt in appointments:
        if appt.status not in (AppointmentStatus.DONE, AppointmentStatus.IN_PROGRESS):
            continue
        if rng.random() < 0.3:
            continue
        spid = None
        for sid, hid in pid_map.items():
            if hid == appt.patient_id:
                spid = sid; break
        obs = [o for o in synthea_data.get("observations", []) if o.get("PATIENT") == spid]
        bp_s = bp_d = ""; temp = weight = height = None; hr = rr = None; o2 = None
        for o in obs:
            code = o.get("CODE", ""); vs = o.get("VALUE", "")
            try: v = Decimal(vs)
            except: v = None
            if code == "8480-6" and v: bp_s = str(int(v))
            elif code == "8462-4" and v: bp_d = str(int(v))
            elif code == "8310-5" and v: temp = v
            elif code == "29463-7" and v: weight = v
            elif code == "8302-2" and v: height = v
            elif code == "8867-4" and v: hr = int(v)
            elif code == "9279-1" and v: rr = int(v)
            elif code == "2708-6" and v: o2 = v
        bp = f"{bp_s}/{bp_d}" if bp_s and bp_d else ""
        if not temp: temp = Decimal(str(round(rng.uniform(36.0, 37.5), 1)))
        if not hr: hr = rng.randint(60, 100)
        if not rr: rr = rng.randint(12, 20)
        if not o2: o2 = Decimal(str(round(rng.uniform(95.0, 100.0), 1)))
        vitals.append(VitalSigns(
            appointment_id=appt.id, blood_pressure=bp, temperature=temp,
            weight=weight, height=height, heart_rate=hr, respiratory_rate=rr,
            oxygen_saturation=o2,
            recorded_at=datetime.combine(appt.appointment_date, dtime(8, 0)).isoformat(),
        ))
    print(f"  [map_hms] {len(vitals)} vital signs")
    return vitals


# ── Medical Records ─────────────────────────────────────────────

def _gen_records(synthea_data, pid_map, appointments, rng):
    records: list[MedicalRecord] = []
    for appt in appointments:
        if appt.status != AppointmentStatus.DONE or rng.random() < 0.15:
            continue
        spid = None
        for sid, hid in pid_map.items():
            if hid == appt.patient_id: spid = sid; break
        conditions = [c for c in synthea_data.get("conditions", []) if c.get("PATIENT") == spid]
        diag_parts = [translate_condition(c.get("DESCRIPTION", ""))
                      for c in conditions[:3] if c.get("DESCRIPTION")]
        diagnosis = "; ".join(diag_parts) if diag_parts else "Khám sức khỏe định kỳ"
        notes = rng.choice(VN_CLINICAL_NOTES)
        fu = appt.appointment_date + timedelta(days=rng.randint(30, 180)) if rng.random() < 0.3 else None
        records.append(MedicalRecord(
            appointment_id=appt.id, diagnosis=diagnosis, clinical_notes=notes,
            follow_up_date=fu, reminder_sent=fu is not None,
        ))
    print(f"  [map_hms] {len(records)} medical records")
    return records


# ── Prescriptions ───────────────────────────────────────────────

def _gen_prescriptions(records, rng):
    items: list[PrescriptionItem] = []
    for rec in records:
        if rng.random() < 0.2: continue
        for j in range(rng.randint(1, 4)):
            med = rng.choice(VN_COMMON_MEDS)
            items.append(PrescriptionItem(
                medical_record_id=rec.id, medicine_name=med["name"],
                dosage=rng.choice(VN_DOSAGES), frequency=rng.choice(VN_FREQUENCIES),
                duration_days=rng.randint(3, 14), instructions=rng.choice(VN_INSTRUCTIONS),
                sort_order=j + 1,
            ))
    print(f"  [map_hms] {len(items)} prescription items")
    return items


# ── Lab Results ─────────────────────────────────────────────────

LOINC_LABS = {
    "6690-2": ("Bạch cầu (WBC)", "4.0-10.0 x10^9/L"),
    "789-8": ("Hồng cầu (RBC)", "4.5-5.9 x10^12/L"),
    "718-7": ("Hemoglobin (HGB)", "13.5-17.5 g/dL"),
    "2345-7": ("Glucose máu", "3.9-6.1 mmol/L"),
    "14959-1": ("HbA1c", "< 6.5%"),
    "2093-3": ("Cholesterol toàn phần", "< 5.2 mmol/L"),
    "2160-0": ("Creatinine máu", "62-106 µmol/L"),
}

def _gen_lab_results(synthea_data, pid_map, appointments, patients, rng):
    results: list[LabResult] = []
    for appt in appointments:
        if appt.status != AppointmentStatus.DONE or rng.random() < 0.6:
            continue
        spid = None
        for sid, hid in pid_map.items():
            if hid == appt.patient_id: spid = sid; break
        obs = [o for o in synthea_data.get("observations", [])
               if o.get("PATIENT") == spid and o.get("CODE", "") in LOINC_LABS]
        if not obs:
            code = rng.choice(list(LOINC_LABS.keys()))
            name, ref = LOINC_LABS[code]
            results.append(LabResult(
                patient_id=appt.patient_id, appointment_id=appt.id,
                test_name=name, status="COMPLETED",
                result_value=f"{rng.uniform(3.5, 12.0):.1f}",
                reference_range=ref,
                collected_at=datetime.combine(appt.appointment_date, dtime(7, 30)).isoformat(),
            ))
            continue
        for o in obs[:3]:
            code = o.get("CODE", ""); name, ref = LOINC_LABS.get(code, (o.get("DESCRIPTION", ""), ""))
            v = o.get("VALUE", ""); u = o.get("UNITS", "")
            results.append(LabResult(
                patient_id=appt.patient_id, appointment_id=appt.id,
                test_name=name, status="COMPLETED",
                result_value=f"{v} {u}".strip(),
                reference_range=ref,
                collected_at=datetime.combine(appt.appointment_date, dtime(7, 30)).isoformat(),
            ))
    print(f"  [map_hms] {len(results)} lab results")
    return results


# ── Follow-Ups ──────────────────────────────────────────────────

def _gen_follow_ups(records, rng):
    fus = [FollowUp(parent_appointment_id=rec.appointment_id,
                    follow_up_date=rec.follow_up_date, reason="Tái khám theo hẹn")
           for rec in records if rec.follow_up_date and rng.random() < 0.5]
    print(f"  [map_hms] {len(fus)} follow-ups")
    return fus


# ── Inventory ───────────────────────────────────────────────────

def _gen_inventory(departments, records, prescriptions, rng):
    items, lots, moves = [], [], []
    today = date.today(); sku_used = set()
    for i, med in enumerate(VN_COMMON_MEDS):
        sku = f"MED-{med['name'][:4].upper()}-{i+1:03d}"
        if sku in sku_used: continue
        sku_used.add(sku)
        dept = departments[i % len(departments)] if departments else None
        qty = rng.randint(100, 5000)
        item = InventoryItem(
            department_id=dept.id if dept else None, sku=sku, item_name=med["name"],
            category=med.get("category", "Thuốc"), unit=med.get("unit", "viên"),
            reorder_level=rng.randint(20, 100), quantity_on_hand=qty, status="IN_STOCK",
        )
        items.append(item)
        for _ in range(rng.randint(1, 2)):
            lot = InventoryLot(
                item_id=item.id,
                lot_code=f"LOT-{med['name'][:4].upper()}-{rng.randint(1,999):03d}",
                supplier_name=rng.choice(VN_SUPPLIERS),
                quantity_received=qty * 2, quantity_remaining=qty,
                expires_on=today + timedelta(days=rng.randint(180, 1095)),
            )
            lots.append(lot)
            moves.append(InventoryMovement(
                item_id=item.id, lot_id=lot.id, movement_type="IN",
                quantity_delta=lot.quantity_received,
                note=f"Nhập kho từ {lot.supplier_name} — {lot.lot_code}",
            ))
    med_map = {it.item_name: it for it in items}
    for presc in prescriptions:
        item = med_map.get(presc.medicine_name)
        if not item: continue
        dq = presc.duration_days or 5
        if presc.frequency and "2 lần" in presc.frequency: dq *= 2
        elif presc.frequency and "3 lần" in presc.frequency: dq *= 3
        ilots = [l for l in lots if l.item_id == item.id]
        lot = ilots[0] if ilots else None
        rec = next((r for r in records if r.id == presc.medical_record_id), None)
        moves.append(InventoryMovement(
            item_id=item.id, lot_id=lot.id if lot else None,
            medical_record_id=presc.medical_record_id, movement_type="OUT",
            quantity_delta=-dq, prescription_item_name=presc.medicine_name,
            dispensed_to_patient="Bệnh nhân",
            note=f"Xuất thuốc theo đơn — {presc.medicine_name} {presc.dosage}",
        ))
    print(f"  [map_hms] {len(items)} inventory items, {len(lots)} lots, {len(moves)} movements")
    return items, lots, moves


# ── Service Pricing ─────────────────────────────────────────────

def _gen_pricings(departments, config, today):
    svc = {
        "kham_tong_quat": "Khám tổng quát", "kham_chuyen_khoa": "Khám chuyên khoa",
        "xet_nghiem_mau": "Xét nghiệm máu", "xet_nghiem_nuoc_tieu": "Xét nghiệm nước tiểu",
        "dien_tim": "Điện tim", "sieu_am": "Siêu âm",
        "noi_soi": "Nội soi", "x_quang": "X-quang", "ct_scan": "CT Scan", "mri": "MRI",
    }
    pricings = []
    dept = departments[0] if departments else None
    for key, name in svc.items():
        amt = config.get("service_pricing", {}).get(key, 100000)
        pricings.append(ServicePricing(
            department_id=dept.id if dept else None, service_name=name,
            amount=Decimal(str(amt)), effective_date=today,
        ))
    print(f"  [map_hms] {len(pricings)} service pricings")
    return pricings


# ── Invoices ────────────────────────────────────────────────────

def _gen_invoices(appointments, config, rng):
    invoices = []
    done = [a for a in appointments if a.status == AppointmentStatus.DONE]
    svc_prices = [150000, 250000, 120000, 80000, 180000, 250000, 350000, 200000, 800000, 1500000]
    paid_r = config.get("invoice_paid_rate", 0.70)
    unpaid_r = config.get("invoice_unpaid_rate", 0.25)

    for appt in done:
        if rng.random() < 0.1: continue
        total = sum(rng.choice(svc_prices) for _ in range(rng.randint(1, 4)))
        roll = rng.random()
        if roll < paid_r:
            status, method, pat = InvoiceStatus.PAID, rng.choice(["CASH", "BANK_TRANSFER", "CARD"]), utc_now()
        elif roll < paid_r + unpaid_r:
            status, method, pat = InvoiceStatus.UNPAID, rng.choice(["CASH", "BANK_TRANSFER", "CARD"]), None
        else:
            status, method, pat = InvoiceStatus.CANCELLED, "", None
        invoices.append(Invoice(
            appointment_id=appt.id, total_amount=Decimal(str(total)),
            status=status, payment_method=method, paid_at=pat,
        ))
    print(f"  [map_hms] {len(invoices)} invoices")
    return invoices


# ── Content Sections ────────────────────────────────────────────

def _gen_content():
    data = [
        ("gioi-thieu", "Giới thiệu bệnh viện", "Bệnh viện Đa khoa DEMO là bệnh viện hạng I...",
         "Tìm hiểu thêm", "/about", 1),
        ("dich-vu", "Dịch vụ y tế", "Chúng tôi cung cấp đầy đủ các dịch vụ khám chữa bệnh...",
         "Xem dịch vụ", "/services", 2),
        ("dat-lich", "Đặt lịch khám", "Đặt lịch khám trực tuyến nhanh chóng, tiện lợi...",
         "Đặt lịch ngay", "/appointments", 3),
        ("lien-he", "Liên hệ", "Địa chỉ: 123 Đường DEMO, Quận 1, TP. Hồ Chí Minh...",
         "Liên hệ", "/contact", 4),
        ("chinh-sach", "Chính sách bảo mật", "Bệnh viện cam kết bảo mật thông tin cá nhân...",
         "Xem chi tiết", "/privacy", 5),
    ]
    return [ContentSection(slug=s[0], title=s[1], body=s[2],
                           cta_label=s[3], cta_href=s[4], sort_order=s[5]) for s in data]


# ── News Articles ───────────────────────────────────────────────

def _gen_news(today):
    data = [
        ("khai-truong-phong-kham", "Khai trương phòng khám Tim mạch mới",
         "Bệnh viện vừa khai trương phòng khám Tim mạch với trang thiết bị hiện đại..."),
        ("kham-suc-khoe-mien-phi", "Chương trình khám sức khỏe miễn phí tháng 6",
         "Bệnh viện tổ chức chương trình khám sức khỏe miễn phí cho người dân..."),
        ("tiep-nhan-mri", "Tiếp nhận máy MRI 3.0 Tesla thế hệ mới",
         "Bệnh viện vừa đưa vào sử dụng máy chụp cộng hưởng từ MRI 3.0 Tesla..."),
        ("hoi-thao-y-khoa", "Hội thảo Y khoa quốc tế 2026",
         "Bệnh viện tổ chức hội thảo y khoa quốc tế với sự tham gia của các chuyên gia..."),
        ("tuyen-dung", "Tuyển dụng bác sĩ chuyên khoa",
         "Bệnh viện cần tuyển thêm bác sĩ chuyên khoa Nội, Nhi, Sản..."),
        ("nang-cao-chat-luong", "Nâng cao chất lượng dịch vụ y tế",
         "Bệnh viện triển khai chương trình nâng cao chất lượng dịch vụ y tế toàn diện..."),
        ("hop-tac-quoc-te", "Hợp tác quốc tế với Bệnh viện Chợ Rẫy",
         "Bệnh viện ký kết hợp tác chuyên môn với Bệnh viện Chợ Rẫy..."),
        ("phong-chong-dich", "Tăng cường phòng chống dịch bệnh mùa hè",
         "Bệnh viện triển khai các biện pháp phòng chống dịch bệnh mùa hè..."),
    ]
    arts = []
    for i, (slug, title, summary) in enumerate(data):
        pub = today - timedelta(days=i * 15)
        arts.append(NewsArticle(
            slug=slug, title=title, summary=summary,
            content=summary + "\n\nĐây là dữ liệu demo. Không sử dụng trong thực tế.",
            published_at=datetime.combine(pub, dtime(8, 0)).isoformat(),
        ))
    print(f"  [map_hms] {len(arts)} news articles")
    return arts


# ── Audit Logs ──────────────────────────────────────────────────

def _gen_audit(staff, patients, appointments, rng):
    logs = []
    admin = next((u for u in staff if u.role.value == "ADMIN"), None)
    aid = admin.id if admin else None
    actions = [
        ("USER_LOGIN", "UserEntity"), ("CREATE_APPOINTMENT", "AppointmentEntity"),
        ("UPDATE_APPOINTMENT_STATUS", "AppointmentEntity"),
        ("CREATE_MEDICAL_RECORD", "MedicalRecordEntity"),
        ("CREATE_INVOICE", "InvoiceEntity"), ("CREATE_PATIENT", "PatientEntity"),
        ("UPDATE_INVENTORY", "InventoryItemEntity"), ("VIEW_DASHBOARD", "Dashboard"),
    ]
    for i in range(50):
        action, entity = rng.choice(actions)
        eid = None
        if "Appointment" in entity and appointments: eid = rng.choice(appointments).id
        elif "Patient" in entity and patients: eid = rng.choice(patients).id
        logs.append(AuditLog(actor_id=aid, action=action, entity_type=entity,
                             entity_id=eid, metadata={"key": f"demo-audit-{i}"}))
    print(f"  [map_hms] {len(logs)} audit logs")
    return logs
