"""Tests for Synthea-to-HMS Data Ingestion Pipeline."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


class TestConstants:
    def test_generate_vn_name(self):
        from src.constants import generate_vn_name
        name = generate_vn_name("MALE")
        assert len(name.split()) >= 3
        female = generate_vn_name("FEMALE")
        assert len(female.split()) >= 3

    def test_generate_cccd(self):
        from src.constants import generate_cccd
        used = set()
        cccd = generate_cccd(used)
        assert len(cccd) == 12 and cccd.isdigit()
        cccd2 = generate_cccd(used)
        assert cccd2 != cccd

    def test_generate_vn_phone(self):
        from src.constants import generate_vn_phone
        phone = generate_vn_phone()
        assert len(phone) == 10
        assert phone[:2] in ["03", "05", "07", "08", "09"]

    def test_generate_vn_address(self):
        from src.constants import generate_vn_address
        prov, district, street = generate_vn_address()
        assert all(isinstance(x, str) and len(x) > 0 for x in [prov, district, street])

    def test_confirmation_code(self):
        from src.constants import generate_confirmation_code
        code = generate_confirmation_code()
        assert code.startswith("HMS-") and len(code) == 12

    def test_translate_condition(self):
        from src.constants import translate_condition
        assert "huyết áp" in translate_condition("hypertension").lower()
        assert "đái tháo đường" in translate_condition("diabetes mellitus").lower()
        assert translate_condition("xyz unknown") == "xyz unknown"


class TestModels:
    def test_patient_cccd_validation(self):
        from src.models import Patient, Gender
        from datetime import date
        p = Patient(full_name="Test", phone="0912345678", email="t@t.com",
                    date_of_birth=date(1990, 1, 1), gender=Gender.MALE,
                    cccd="001012345678", cccd_hash="abc")
        assert p.cccd == "001012345678"

    def test_patient_cccd_rejects_bad(self):
        from src.models import Patient, Gender
        from datetime import date
        import pytest
        from pydantic import ValidationError
        with pytest.raises(ValidationError):
            Patient(full_name="T", phone="09", email="t@t.com",
                    date_of_birth=date(1990, 1, 1), gender=Gender.MALE,
                    cccd="short", cccd_hash="abc")


class TestVietnamize:
    def test_create_departments(self):
        from src.vietnamize import create_departments
        depts = create_departments()
        assert len(depts) >= 10
        assert all(d.name and d.id for d in depts)

    def test_create_staff_users(self):
        from src.vietnamize import create_staff_users, create_departments
        depts = create_departments()
        users = create_staff_users(depts, "$2a$dummy")
        assert len(users) >= 35
        roles = {u.role.value for u in users}
        assert roles >= {"ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST", "PHARMACIST", "ACCOUNTANT"}


class TestValidate:
    def test_empty_seed_passes(self):
        from src.models import HmsSeed
        from src.validate_seed import validate
        report = validate(HmsSeed())
        assert report["passed"] >= 0

    def test_duplicate_emails_detected(self):
        from src.models import HmsSeed, Patient, Gender
        from datetime import date
        from src.validate_seed import _check_unique_emails
        import pytest
        from src.validate_seed import ValidationError
        p1 = Patient(full_name="A", phone="01", email="same@x.com",
                     date_of_birth=date(1990, 1, 1), gender=Gender.MALE,
                     cccd="001012345678", cccd_hash="h1")
        p2 = Patient(full_name="B", phone="02", email="same@x.com",
                     date_of_birth=date(1990, 1, 1), gender=Gender.FEMALE,
                     cccd="001012345679", cccd_hash="h2")
        with pytest.raises(ValidationError):
            _check_unique_emails(HmsSeed(patients=[p1, p2]))


class TestEndToEnd:
    def test_full_pipeline_with_mock_data(self):
        """End-to-end test with 3 mock patients (no Synthea required)."""
        from src.vietnamize import vietnamize_patients, create_staff_users, create_departments, create_patient_accounts
        from src.map_to_hms import map_all
        from src.validate_seed import validate

        mock = {
            "patients": [
                {"Id": "p1", "BIRTHDATE": "1985-03-15", "GENDER": "M"},
                {"Id": "p2", "BIRTHDATE": "1990-07-22", "GENDER": "F"},
                {"Id": "p3", "BIRTHDATE": "1978-11-08", "GENDER": "M"},
            ],
            "encounters": [
                {"Id": "e1", "START": "2026-06-10T08:00:00Z", "PATIENT": "p1",
                 "REASONDESC": "Đau đầu, chóng mặt", "ENCOUNTERCLASS": "AMBULATORY"},
                {"Id": "e2", "START": "2026-06-12T09:00:00Z", "PATIENT": "p2",
                 "REASONDESC": "Ho, sốt", "ENCOUNTERCLASS": "AMBULATORY"},
                {"Id": "e3", "START": "2026-06-13T10:00:00Z", "PATIENT": "p1",
                 "REASONDESC": "Tái khám", "ENCOUNTERCLASS": "AMBULATORY"},
            ],
            "conditions": [
                {"PATIENT": "p1", "DESCRIPTION": "essential hypertension", "CODE": "59621000"},
                {"PATIENT": "p2", "DESCRIPTION": "acute bronchitis", "CODE": "10509002"},
            ],
            "medications": [
                {"PATIENT": "p1", "ENCOUNTER": "e1", "DESCRIPTION": "Amlodipine 5mg"},
                {"PATIENT": "p2", "ENCOUNTER": "e2", "DESCRIPTION": "Amoxicillin 500mg"},
            ],
            "observations": [
                {"PATIENT": "p1", "ENCOUNTER": "e1", "CODE": "8480-6", "VALUE": "135", "UNITS": "mmHg"},
                {"PATIENT": "p1", "ENCOUNTER": "e1", "CODE": "8867-4", "VALUE": "72", "UNITS": "/min"},
            ],
            "allergies": [
                {"PATIENT": "p1", "DESCRIPTION": "Penicillin"},
            ],
            "procedures": [], "careplans": [], "providers": [], "organizations": [],
        }

        patients, pid_map = vietnamize_patients(mock)
        assert len(patients) == 3
        assert all(len(p.cccd) == 12 and p.cccd.isdigit() for p in patients)
        assert len({p.email for p in patients}) == 3

        depts = create_departments()
        staff = create_staff_users(depts, "$2a$test")
        accounts = create_patient_accounts(patients, "$2a$test")

        config = {"reference_date": "2026-06-15", "slot_duration_minutes": 30,
                  "past_slot_days": 14, "future_slot_days": 14,
                  "cancellation_rate": 0.05, "invoice_paid_rate": 0.70, "invoice_unpaid_rate": 0.25}
        seed = map_all(mock, pid_map, patients, depts, staff, accounts, config)

        assert len(seed.appointments) > 0
        assert len(seed.time_slots) > 0

        report = validate(seed)
        assert report["failed"] == 0, f"Validation failures: {report['rules']}"
        assert report["passed"] == 11
