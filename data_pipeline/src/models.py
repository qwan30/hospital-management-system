"""
Pydantic models mirroring HMS JPA entity schemas.

Each model matches the exact column names, types, and constraints
found in the PostgreSQL DDL (26 tables via 20 Flyway migrations).

All data is synthetic/demo. Models carry synthetic_metadata to mark this.
"""

from __future__ import annotations

import uuid
from datetime import date, datetime, time, timezone
from decimal import Decimal
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, field_validator


# ── Enums (mirroring com.hospital.shared.enums) ──────────────────


class Gender(str, Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    DOCTOR = "DOCTOR"
    NURSE = "NURSE"
    RECEPTIONIST = "RECEPTIONIST"
    PHARMACIST = "PHARMACIST"
    ACCOUNTANT = "ACCOUNTANT"
    PATIENT = "PATIENT"


class AppointmentStatus(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CHECKED_IN = "CHECKED_IN"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"
    CANCELLED = "CANCELLED"


class SlotStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    BOOKED = "BOOKED"
    BLOCKED = "BLOCKED"


class InvoiceStatus(str, Enum):
    UNPAID = "UNPAID"
    PAID = "PAID"
    CANCELLED = "CANCELLED"


class RoomStatus(str, Enum):
    READY = "READY"
    IN_USE = "IN_USE"
    BREAK = "BREAK"
    MAINTENANCE = "MAINTENANCE"


# ── Helper ────────────────────────────────────────────────────────


def new_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


# ── Department ────────────────────────────────────────────────────


class Department(BaseModel):
    id: str = Field(default_factory=new_uuid)
    name: str = Field(max_length=150)
    description: str = ""
    image_url: str = ""
    phone: str = ""
    is_active: bool = True
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)


# ── User (Staff) ──────────────────────────────────────────────────


class StaffUser(BaseModel):
    id: str = Field(default_factory=new_uuid)
    department_id: Optional[str] = None
    email: str
    password_hash: str
    full_name: str = Field(max_length=200)
    phone: str = ""
    role: UserRole
    specialty: str = ""
    qualification: str = ""
    avatar_url: str = ""
    experience_years: Optional[int] = None
    is_active: bool = True
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)


# ── Patient ───────────────────────────────────────────────────────


class Patient(BaseModel):
    id: str = Field(default_factory=new_uuid)
    full_name: str = Field(max_length=200)
    phone: str = Field(max_length=20)
    email: str = Field(max_length=255)
    date_of_birth: date
    gender: Gender
    cccd: str
    cccd_hash: str = Field(max_length=64)
    province_or_city: str = ""
    district: str = ""
    street_address: str = ""
    occupation: str = ""
    blood_type: str = ""
    medical_history: str = ""
    drug_allergies: str = ""
    insurance_number: str = ""
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)

    @field_validator("cccd")
    @classmethod
    def cccd_must_be_12_digits(cls, v: str) -> str:
        if len(v) != 12 or not v.isdigit():
            raise ValueError(f"CCCD must be exactly 12 digits, got: {v}")
        return v


# ── TimeSlot ──────────────────────────────────────────────────────


class TimeSlot(BaseModel):
    id: str = Field(default_factory=new_uuid)
    doctor_id: str
    slot_date: date
    start_time: time
    end_time: time
    status: SlotStatus = SlotStatus.AVAILABLE
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)


# ── Appointment ───────────────────────────────────────────────────


class Appointment(BaseModel):
    id: str = Field(default_factory=new_uuid)
    patient_id: str
    doctor_id: str
    first_slot_id: str
    appointment_date: date
    ai_duration_minutes: int = 30
    symptoms: str = ""
    confirmation_code: str = Field(max_length=32)
    status: AppointmentStatus
    checked_in_at: Optional[str] = None
    booking_contact_full_name: str = ""
    booking_contact_relationship: str = ""
    booking_contact_phone: str = ""
    booking_contact_email: str = ""
    booking_contact_cccd: str = ""
    booking_contact_date_of_birth: Optional[date] = None
    booking_contact_gender: Optional[Gender] = None
    notes: str = ""
    reason: str = ""
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)


# ── Appointment Vital Signs ───────────────────────────────────────


class VitalSigns(BaseModel):
    id: str = Field(default_factory=new_uuid)
    appointment_id: str
    blood_pressure: str = ""
    temperature: Optional[Decimal] = None
    weight: Optional[Decimal] = None
    height: Optional[Decimal] = None
    heart_rate: Optional[int] = None
    respiratory_rate: Optional[int] = None
    oxygen_saturation: Optional[Decimal] = None
    recorded_at: str = Field(default_factory=utc_now)


# ── Medical Record ────────────────────────────────────────────────


class MedicalRecord(BaseModel):
    id: str = Field(default_factory=new_uuid)
    appointment_id: str
    diagnosis: str = ""
    clinical_notes: str = ""
    blood_pressure: str = ""
    temperature: Optional[Decimal] = None
    weight: Optional[Decimal] = None
    height: Optional[Decimal] = None
    prescription_pdf_url: str = ""
    follow_up_date: Optional[date] = None
    reminder_sent: bool = False
    reminder_scheduled_at: Optional[str] = None
    reminder_sent_at: Optional[str] = None
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)


# ── Prescription Item ─────────────────────────────────────────────


class PrescriptionItem(BaseModel):
    id: str = Field(default_factory=new_uuid)
    medical_record_id: str
    medicine_name: str = Field(max_length=255)
    dosage: str = Field(max_length=255)
    frequency: str = ""
    duration_days: Optional[int] = None
    instructions: str = ""
    sort_order: int = 0
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)


# ── Invoice ───────────────────────────────────────────────────────


class Invoice(BaseModel):
    id: str = Field(default_factory=new_uuid)
    appointment_id: str
    total_amount: Decimal = Field(default=Decimal("0"), max_digits=10, decimal_places=2)
    status: InvoiceStatus = InvoiceStatus.UNPAID
    payment_method: str = ""
    paid_at: Optional[str] = None
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)


# ── Service Pricing ───────────────────────────────────────────────


class ServicePricing(BaseModel):
    id: str = Field(default_factory=new_uuid)
    department_id: Optional[str] = None
    service_name: str = Field(max_length=255)
    amount: Decimal = Field(max_digits=10, decimal_places=2)
    effective_date: date
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)


# ── Inventory Item ────────────────────────────────────────────────


class InventoryItem(BaseModel):
    id: str = Field(default_factory=new_uuid)
    department_id: Optional[str] = None
    sku: str = Field(max_length=64)
    item_name: str = Field(max_length=255)
    category: str = Field(max_length=120)
    unit: str = Field(max_length=40)
    reorder_level: int = 0
    quantity_on_hand: int = 0
    status: str = "IN_STOCK"
    last_restocked_at: Optional[str] = None
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)


# ── Inventory Lot ─────────────────────────────────────────────────


class InventoryLot(BaseModel):
    id: str = Field(default_factory=new_uuid)
    item_id: str
    lot_code: str = Field(max_length=80)
    supplier_name: str = ""
    quantity_received: int = 0
    quantity_remaining: int = 0
    expires_on: Optional[date] = None
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)


# ── Inventory Movement ────────────────────────────────────────────


class InventoryMovement(BaseModel):
    id: str = Field(default_factory=new_uuid)
    item_id: str
    lot_id: Optional[str] = None
    medical_record_id: Optional[str] = None
    movement_type: str
    quantity_delta: int
    prescription_item_name: str = ""
    dispensed_to_patient: str = ""
    note: str = ""
    created_at: str = Field(default_factory=utc_now)


# ── Room ──────────────────────────────────────────────────────────


class Room(BaseModel):
    id: str = Field(default_factory=new_uuid)
    department_id: Optional[str] = None
    name: str = Field(max_length=120)
    status: RoomStatus = RoomStatus.READY
    is_active: bool = True
    notes: str = ""
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)


# ── Doctor Schedule Template ──────────────────────────────────────


class ScheduleTemplate(BaseModel):
    id: str = Field(default_factory=new_uuid)
    doctor_id: str
    room_id: Optional[str] = None
    day_of_week: int
    start_time: time
    end_time: time
    slot_duration_minutes: int = 30
    is_active: bool = True
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)


# ── Patient Account ───────────────────────────────────────────────


class PatientAccount(BaseModel):
    patient_id: str
    email: str
    password_hash: str
    is_active: bool = True
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)


# ── Lab Result ────────────────────────────────────────────────────


class LabResult(BaseModel):
    id: str = Field(default_factory=new_uuid)
    patient_id: str
    appointment_id: Optional[str] = None
    test_name: str = Field(max_length=255)
    status: str = "COMPLETED"
    result_summary: str = ""
    result_value: str = ""
    reference_range: str = ""
    notes: str = ""
    doctor_comment: str = ""
    attachment_url: str = ""
    collected_at: str
    deleted: bool = False
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)


# ── Follow-Up ─────────────────────────────────────────────────────


class FollowUp(BaseModel):
    id: str = Field(default_factory=new_uuid)
    parent_appointment_id: str
    follow_up_date: date
    reason: str = ""
    created_at: str = Field(default_factory=utc_now)


# ── Audit Log ─────────────────────────────────────────────────────


class AuditLog(BaseModel):
    id: str = Field(default_factory=new_uuid)
    actor_id: Optional[str] = None
    action: str = Field(max_length=120)
    entity_type: str = Field(max_length=120)
    entity_id: Optional[str] = None
    metadata: dict = Field(default_factory=dict)
    created_at: str = Field(default_factory=utc_now)


# ── Hospital Content Section ──────────────────────────────────────


class ContentSection(BaseModel):
    id: str = Field(default_factory=new_uuid)
    slug: str = Field(max_length=100)
    title: str = Field(max_length=200)
    body: str = ""
    image_url: str = ""
    cta_label: str = ""
    cta_href: str = ""
    sort_order: int = 0
    is_active: bool = True
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)


# ── News Article ─────────────────────────────────────────────────


class NewsArticle(BaseModel):
    id: str = Field(default_factory=new_uuid)
    slug: str = Field(max_length=150)
    title: str = Field(max_length=250)
    summary: str
    content: str = ""
    image_url: str = ""
    published_at: str = Field(default_factory=utc_now)
    is_active: bool = True
    created_at: str = Field(default_factory=utc_now)
    updated_at: str = Field(default_factory=utc_now)


# ── HMS Seed (aggregate container) ────────────────────────────────


class HmsSeed(BaseModel):
    """Top-level container for all generated HMS seed data."""

    synthetic_metadata: dict = Field(
        default_factory=lambda: {
            "source": "Synthea synthetic data (synthetichealth/synthea)",
            "pipeline_version": "1.0.0",
            "disclaimer": "ALL DATA IS SYNTHETIC/FAKE/DEMO. No real PHI. Do not use in production.",
        }
    )

    departments: list[Department] = Field(default_factory=list)
    staff_users: list[StaffUser] = Field(default_factory=list)
    patients: list[Patient] = Field(default_factory=list)
    rooms: list[Room] = Field(default_factory=list)
    schedule_templates: list[ScheduleTemplate] = Field(default_factory=list)
    time_slots: list[TimeSlot] = Field(default_factory=list)
    appointments: list[Appointment] = Field(default_factory=list)
    vital_signs: list[VitalSigns] = Field(default_factory=list)
    medical_records: list[MedicalRecord] = Field(default_factory=list)
    prescription_items: list[PrescriptionItem] = Field(default_factory=list)
    lab_results: list[LabResult] = Field(default_factory=list)
    follow_ups: list[FollowUp] = Field(default_factory=list)
    inventory_items: list[InventoryItem] = Field(default_factory=list)
    inventory_lots: list[InventoryLot] = Field(default_factory=list)
    inventory_movements: list[InventoryMovement] = Field(default_factory=list)
    invoices: list[Invoice] = Field(default_factory=list)
    service_pricings: list[ServicePricing] = Field(default_factory=list)
    patient_accounts: list[PatientAccount] = Field(default_factory=list)
    audit_logs: list[AuditLog] = Field(default_factory=list)
    content_sections: list[ContentSection] = Field(default_factory=list)
    news_articles: list[NewsArticle] = Field(default_factory=list)
