"""
Transform Synthea clinical data into a Vietnamese hospital context.

After reading Synthea patients, encounters, conditions, etc.,
this module:
- Replaces English names with Vietnamese names
- Generates fake 12-digit CCCD numbers
- Generates fake Vietnamese phone numbers
- Generates fake Vietnamese addresses
- Creates Vietnamese staff users and departments
- Translates condition descriptions to Vietnamese

ALL generated data is synthetic/fake/demo. No real identities.
"""

import hashlib
import random
import re
from datetime import date
from typing import Any

from src.constants import (
    generate_vn_name,
    generate_cccd,
    generate_vn_phone,
    generate_vn_address,
    translate_condition,
    BLOOD_TYPES,
    VN_OCCUPATIONS,
    VN_DEPARTMENTS,
    DOCTOR_NAMES,
    NURSE_NAMES,
    RECEPTIONIST_NAMES,
    PHARMACIST_NAMES,
    ACCOUNTANT_NAMES,
    ADMIN_NAMES,
)
from src.models import (
    Gender,
    UserRole,
    Department,
    StaffUser,
    Patient,
    PatientAccount,
)


def _strip_accents(s: str) -> str:
    """Remove Vietnamese diacritics for email generation."""
    s = re.sub(r'[àáảãạâầấẩẫậăằắẳẵặ]', 'a', s)
    s = re.sub(r'[èéẻẽẹêềếểễệ]', 'e', s)
    s = re.sub(r'[ìíỉĩị]', 'i', s)
    s = re.sub(r'[òóỏõọôồốổỗộơờớởỡợ]', 'o', s)
    s = re.sub(r'[ùúủũụưừứửữự]', 'u', s)
    s = re.sub(r'[ỳýỷỹỵ]', 'y', s)
    s = re.sub(r'[đ]', 'd', s)
    return s


def vietnamize_patients(
    synthea_data: dict[str, list[dict]],
    rng: random.Random = None,
) -> tuple[list[Patient], dict[str, str]]:
    """Transform Synthea patients into Vietnamese HMS patients.
    Returns (list[Patient], dict[synthea_id -> hms_patient_id]).
    """
    if rng is None:
        rng = random.Random(42)

    patients: list[Patient] = []
    id_map: dict[str, str] = {}
    used_cccds: set[str] = set()
    used_emails: set[str] = set()

    for i, row in enumerate(synthea_data.get("patients", [])):
        synthea_id = row.get("Id", str(i))
        gender_str = row.get("GENDER", "M").upper()
        gender = Gender.MALE
        if gender_str == "F":
            gender = Gender.FEMALE
        elif gender_str not in ("M", "MALE"):
            gender = Gender.OTHER

        dob_str = row.get("BIRTHDATE", "")
        try:
            dob = date.fromisoformat(dob_str[:10]) if dob_str else date(1980, 1, 1)
        except (ValueError, TypeError):
            dob = date(1980, 1, 1)

        full_name = generate_vn_name(gender.value, seed=i)
        phone = generate_vn_phone(rng)
        province, district, street = generate_vn_address(rng)
        cccd = generate_cccd(used_cccds, rng)
        cccd_hash = hashlib.sha256(cccd.encode()).hexdigest()

        base_email = _strip_accents(full_name.lower()).replace(" ", ".")
        email = f"{base_email}.demo@example.com"
        counter = 1
        original = email
        while email in used_emails:
            email = original.replace("@", f"{counter}@")
            counter += 1
        used_emails.add(email)

        blood_type = rng.choice(BLOOD_TYPES)
        occupation = rng.choice(VN_OCCUPATIONS)

        conditions = [
            c for c in synthea_data.get("conditions", [])
            if c.get("PATIENT") == synthea_id
        ]
        condition_descs = [
            translate_condition(c.get("DESCRIPTION", ""))
            for c in conditions if c.get("DESCRIPTION")
        ]
        medical_history = "; ".join(condition_descs[:5]) if condition_descs else ""

        allergies = [
            a for a in synthea_data.get("allergies", [])
            if a.get("PATIENT") == synthea_id
        ]
        allergy_descs = [a.get("DESCRIPTION", "") for a in allergies if a.get("DESCRIPTION")]
        drug_allergies = "; ".join(allergy_descs[:5]) if allergy_descs else ""

        insurance_number = f"BHYT-{rng.randint(10000000, 99999999)}"

        patient = Patient(
            full_name=full_name,
            phone=phone,
            email=email,
            date_of_birth=dob,
            gender=gender,
            cccd=cccd,
            cccd_hash=cccd_hash,
            province_or_city=province,
            district=district,
            street_address=street,
            occupation=occupation,
            blood_type=blood_type,
            medical_history=medical_history,
            drug_allergies=drug_allergies,
            insurance_number=insurance_number,
        )
        patients.append(patient)
        id_map[synthea_id] = patient.id

    print(f"  [vietnamize] Created {len(patients)} Vietnamese patients")
    return patients, id_map


def create_staff_users(
    departments: list[Department],
    password_hash: str,
    staff_email_domain: str = "hospital.vn",
    rng: random.Random = None,
) -> list[StaffUser]:
    """Create Vietnamese staff users for all roles."""
    if rng is None:
        rng = random.Random(42)

    users: list[StaffUser] = []
    used_emails: set[str] = set()

    def _mk(name: str, role: UserRole, dept_idx: int = 0,
            specialty: str = "", qualification: str = "",
            exp_yrs: int = None) -> StaffUser:
        parts = name.lower().split()
        base = parts[-1] if parts else name.lower()
        em = f"{base}@{staff_email_domain}"
        c = 1
        while em in used_emails:
            em = f"{base}{c}@{staff_email_domain}"
            c += 1
        used_emails.add(em)
        dept_id = departments[dept_idx].id if dept_idx < len(departments) else None
        return StaffUser(
            department_id=dept_id,
            email=em,
            password_hash=password_hash,
            full_name=name,
            phone=generate_vn_phone(rng),
            role=role,
            specialty=specialty,
            qualification=qualification,
            experience_years=exp_yrs,
        )

    # Admin (2)
    for name in ADMIN_NAMES[:2]:
        users.append(_mk(name, UserRole.ADMIN))

    # Doctors
    specialties = ["Nội tổng quát", "Tim mạch", "Nhi khoa", "Sản phụ khoa",
                   "Cơ xương khớp", "Da liễu", "Tai Mũi Họng", "Thần kinh",
                   "Hô hấp", "Chẩn đoán hình ảnh"]
    qualifications = ["Bác sĩ Chuyên khoa I", "Bác sĩ Chuyên khoa II",
                      "Thạc sĩ Y khoa", "Tiến sĩ Y khoa", "Bác sĩ Đa khoa"]
    for i, name in enumerate(DOCTOR_NAMES[:20]):
        di = i % min(len(departments), 10)
        users.append(_mk(name, UserRole.DOCTOR, di,
                         specialty=specialties[di] if di < len(specialties) else "Đa khoa",
                         qualification=rng.choice(qualifications),
                         exp_yrs=rng.randint(3, 25)))

    # Nurses
    for i, name in enumerate(NURSE_NAMES[:8]):
        users.append(_mk(name, UserRole.NURSE, i % min(len(departments), 8)))

    # Receptionists
    for name in RECEPTIONIST_NAMES[:3]:
        users.append(_mk(name, UserRole.RECEPTIONIST))

    # Pharmacists
    pharm_idx = next((i for i, d in enumerate(departments) if "Dược" in d.name), 0)
    for name in PHARMACIST_NAMES[:3]:
        users.append(_mk(name, UserRole.PHARMACIST, pharm_idx))

    # Accountants
    for name in ACCOUNTANT_NAMES[:3]:
        users.append(_mk(name, UserRole.ACCOUNTANT))

    print(f"  [vietnamize] Created {len(users)} staff users")
    return users


def create_departments() -> list[Department]:
    """Create Vietnamese hospital departments."""
    depts = [Department(name=d["name"], description=d.get("description", ""),
                        phone=generate_vn_phone())
             for d in VN_DEPARTMENTS]
    print(f"  [vietnamize] Created {len(depts)} departments")
    return depts


def create_patient_accounts(
    patients: list[Patient], password_hash: str,
) -> list[PatientAccount]:
    """Create patient portal accounts for all patients."""
    accounts = [PatientAccount(patient_id=p.id, email=p.email, password_hash=password_hash)
                for p in patients]
    print(f"  [vietnamize] Created {len(accounts)} patient portal accounts")
    return accounts
