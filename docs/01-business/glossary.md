# Tu Dien Thong Dung (Ubiquitous Language Glossary)

> Danh sach cac thuat ngu thong nhat su dung trong toan bo he thong. Cap nhat lan cuoi: 2026-06-14.

## Huong Dan Su Dung (Usage Guide)

- **English term** = Tu tieng Anh duoc dung trong ma nguon va API
- **Vietnamese term** = Tu tieng Viet duoc dung trong giao dien nguoi dung
- **Definition** = Giai thich bang tieng Anh (technical) va tieng Viet (business)

---

## Lam Sang & Dat Lich (Clinical & Booking)

| English Term | Vietnamese Term | Dinh Nghia (Definition) |
|---|---|---|
| **Appointment** | Lich hen | A scheduled consultation between a patient and a doctor. Contains status, symptoms, booking contact, and references to patient, doctor, and time slot. / Mot cuoc hen kham duoc xep lich giua benh nhan va bac si. Bao gom trang thai, trieu chung, thong tin lien he dat hen, va tham chieu den benh nhan, bac si, va khung gio. |
| **Slot** | Khung gio | A 30-minute atomic unit of a doctor's available time. Status can be AVAILABLE, BOOKED, or BLOCKED. / Don vi thoi gian 30 phut trong lich lam viec cua bac si. Trang thai co the la AVAILABLE (con trong), BOOKED (da dat), hoac BLOCKED (bi chan). |
| **Confirmation Code** | Ma xac nhan | A unique human-readable identifier for an appointment, format `HMS-XXXXXXXX` (8 uppercase hex digits). Generated as UUID substring at booking creation. / Ma duy nhat de nhan dien mot lich hen, dinh dang `HMS-XXXXXXXX` (8 ky tu hex viet hoa). Duoc tao tu UUID khi tao lich hen. |
| **Check-in** | Diem danh | The process of a patient registering their physical arrival at the hospital. Triggers appointment status transition to CHECKED_IN and creates queue entry. / Quy trinh benh nhan dang ky den benh vien. Kich hoat chuyen trang thai lich hen sang CHECKED_IN va tao ban ghi hang doi. |
| **Queue** | Hang doi | The ordered list of checked-in patients awaiting consultation. Supports actions: call, skip, assign-room, start-consultation, complete. / Danh sach co thu tu cac benh nhan da diem danh dang cho kham. Ho tro cac hanh dong: goi, bo qua, gan phong, bat dau kham, hoan thanh. |
| **Consultation** | Kham benh | The clinical encounter between doctor and patient after the patient is called from the queue. / Cuoc gap lam sang giua bac si va benh nhan sau khi benh nhan duoc goi tu hang doi. |
| **Follow-up** | Tai kham | A recommended future appointment for continued care, created during a current consultation. Includes target date and is tracked for reminder. / Mot lich hen tuong lai duoc de xuat de tiep tuc dieu tri, duoc tao trong buoi kham hien tai. Bao gom ngay du kien va duoc theo doi de nhac nho. |
| **Symptom** | Trieu chung | Patient-reported clinical signs captured at booking time. Free-text field on appointment. Also provides input to booking duration guidance. / Dau hieu lam sang do benh nhan bao cao tai thoi diem dat lich. Truong van ban tu do trong lich hen. Cung cap thong tin cho huong dan thoi gian dat lich. |

## Ho So Benh An (Medical Records)

| English Term | Vietnamese Term | Dinh Nghia (Definition) |
|---|---|---|
| **Medical Record** | Ho so benh an | The complete clinical documentation for one appointment. Includes diagnosis, clinical notes, vital signs, follow-up, and prescription items. 1:1 relationship with appointment. / Tai lieu lam sang day du cho mot lich hen. Bao gom chan doan, ghi chu lam sang, sinh hieu, tai kham, va cac mat hang don thuoc. Quan he 1:1 voi lich hen. |
| **Diagnosis** | Chan doan | The medical condition identified during consultation. Free-text field on medical record. / Tinh trang benh ly duoc xac dinh trong qua trinh kham. Truong van ban tu do trong ho so benh an. |
| **Prescription** | Don thuoc | A list of medications prescribed to a patient as part of a medical record. Stored as PrescriptionItem entities with medicine name, dosage, frequency, duration, and instructions. Can be generated as PDF. / Danh sach thuoc duoc ke cho benh nhan trong ho so benh an. Duoc luu duoi dang cac PrescriptionItem voi ten thuoc, lieu luong, tan suat, thoi gian, va huong dan. Co the xuat PDF. |
| **Prescription Item** | Mat hang don thuoc | Individual medication entry within a prescription. Fields: medicineName, dosage (e.g. "500mg"), frequency (e.g. "3 times/day"), durationDays, instructions, sortOrder. / Muc thuoc rieng le trong don thuoc. Cac truong: ten thuoc, lieu luong (vd "500mg"), tan suat (vd "3 lan/ngay"), so ngay, huong dan, thu tu sap xep. |
| **Vital Signs** | Sinh hieu | Clinical measurements recorded during consultation: blood pressure (e.g. "120/80"), temperature, weight, height, heart rate, respiratory rate, oxygen saturation. / Cac do luong lam sang duoc ghi trong buoi kham: huyet ap, nhiet do, can nang, chieu cao, nhip tim, nhip tho, do bao hoa oxy. |
| **Lab Result** | Ket qua xet nghiem | The outcome of a diagnostic test. Includes test name, summary, doctor comment, and optional attachment link. Linked to patient and optionally to appointment. / Ket qua cua mot xet nghiem chan doan. Bao gom ten xet nghiem, tom tat, nhan xet cua bac si, va lien ket tep dinh kem tuy chon. |

## Benh Nhan (Patient)

| English Term | Vietnamese Term | Dinh Nghia (Definition) |
|---|---|---|
| **Patient** | Benh nhan | An individual receiving healthcare services. Core entity with personal info, encrypted CCCD, CCCD hash, address, medical history, drug allergies, insurance number. / Ca nhan nhan dich vu cham soc suc khoe. Thuc the chinh voi thong tin ca nhan, CCCD ma hoa, ma bam CCCD, dia chi, tien su benh, di ung thuoc, so bao hiem. |
| **CCCD** | Can cuoc cong dan | Vietnamese national identity card number (12 digits). Stored as AES-256-GCM ciphertext with `enc:` prefix to protect PHI. / So can cuoc cong dan Viet Nam (12 chu so). Duoc luu duoi dang ma hoa AES-256-GCM voi tien to `enc:` de bao ve PHI. |
| **CCCD Hash** | Ma bam CCCD | SHA-256 hash of the raw CCCD, stored in plaintext for duplicate patient detection and search lookup. Lowercased hex string. / Ma bam SHA-256 cua CCCD tho, duoc luu duoi dang van ban ro de phat hien benh nhan trung lap va tra cuu. |
| **Patient Portal** | Cong thong tin benh nhan | The patient-facing web interface providing access to appointment history, lab results, messages, and profile. Authenticated via separate patient auth endpoints. / Giao dien web cho benh nhan cung cap quyen truy cap lich su lich hen, ket qua xet nghiem, tin nhan, va ho so. Xac thuc qua endpoint xac thuc benh nhan rieng. |
| **PHI** | Thong tin suc khoe ca nhan | Protected Health Information. Any patient data that can identify an individual, including name, CCCD, phone, email, medical history, diagnosis, and clinical records. Must be encrypted, access-controlled, and audited. / Thong tin suc khoe duoc bao ve. Bat ky du lieu benh nhan nao co the dinh danh ca nhan, bao gom ten, CCCD, dien thoai, email, tien su benh, chan doan, va ho so lam sang. Phai duoc ma hoa, kiem soat truy cap, va ghi nhan kiem toan. |

## Nha Thuoc & Ton Kho (Pharmacy & Inventory)

| English Term | Vietnamese Term | Dinh Nghia (Definition) |
|---|---|---|
| **Inventory Item** | Vat tu / Thuoc | A distinct product tracked in hospital inventory. Has SKU, name, quantity on hand, reorder level, and optional department scoping. / Mot san pham rieng biet duoc theo doi trong ton kho benh vien. Co ma SKU, ten, so luong ton, muc dat lai hang, va pham vi phong ban tuy chon. |
| **Lot** | Lo thuoc | A batch of items from a single supplier delivery. Tracks lot code, quantity remaining, expiry date. / Mot lo hang tu mot lan giao hang cua nha cung cap. Theo doi ma lo, so luong con lai, ngay het han. |
| **Inventory Movement** | Xuat nhap ton | Any change in inventory quantity. Records movement type (IN/OUT), quantity delta, optional lot reference, optional medical record link, and dispense patient info. / Bat ky thay doi nao ve so luong ton kho. Ghi lai loai xuat nhap, so luong thay doi, tham chieu lo tuy chon, lien ket ho so benh an tuy chon, va thong tin benh nhan cap phat. |
| **Dispense** | Cap phat thuoc | Providing medication to a patient against a prescription. Recorded as an inventory movement with type OUT, linked to the medical record and prescription item. Validates that sufficient inventory exists. / Phat thuoc cho benh nhan theo don thuoc. Duoc ghi lai la mot bien dong ton kho loai XUAT, lien ket voi ho so benh an va mat hang don thuoc. Kiem tra ton kho con du. |

## Tai Chinh (Finance)

| English Term | Vietnamese Term | Dinh Nghia (Definition) |
|---|---|---|
| **Invoice** | Hoa don | A bill for services rendered. Created for completed appointments, references service pricing. Status: UNPAID, PAID, CANCELLED. Tracks total amount, payment method, payment date. / Hoa don cho dich vu da cung cap. Duoc tao cho cac lich hen da hoan thanh, tham chieu gia dich vu. Trang thai: UNPAID (chua thanh toan), PAID (da thanh toan), CANCELLED (da huy). |
| **Service Pricing** | Bang gia dich vu | The amount charged for a specific medical service (e.g., consultation fee, lab test). Can be scoped by department with effective dates. / So tien tinh cho mot dich vu y te cu the (vd phi kham, xet nghiem). Co the duoc gioi han theo phong ban voi ngay hieu luc. |
| **Revenue Report** | Bao cao doanh thu | Aggregated financial reports showing daily or monthly revenue. Can be filtered by department. / Bao cao tai chinh tong hop hien thi doanh thu theo ngay hoac thang. Co the loc theo phong ban. |

## Hanh Chinh & Quan Tri (Admin & Operations)

| English Term | Vietnamese Term | Dinh Nghia (Definition) |
|---|---|---|
| **Department** | Phong ban / Khoa | A hospital organizational unit (e.g., Cardiology, Neurology, General Internal Medicine). Soft-deletable. / Mot don vi to chuc benh vien (vd Tim mach, Than kinh, Noi tong hop). Co the xoa mem. |
| **Room** | Phong | A physical consultation or examination room. Status: READY, IN_USE, BREAK, MAINTENANCE. Soft-deletable for historical reference. / Mot phong kham benh thuc te. Trang thai: SAN SANG, DANG SU DUNG, NGHI, BAO TRI. Co the xoa mem de giu tham chieu lich su. |
| **Schedule Template** | Mau lich lam viec | A recurring weekly pattern defining a doctor's available hours. Specifies day of week, start time, end time, and slot duration (default 30 min). / Mau hang tuan dinh nghia gio lam viec cua bac si. Xac dinh thu trong tuan, gio bat dau, gio ket thuc, va thoi gian moi slot (mac dinh 30 phut). |
| **Special Closure** | Lich nghi dac biet | A one-off exception to normal scheduling (holiday, training, conference, etc.). Blocks slot generation for a specific doctor/room on a specific date. / Moc ngoai le mot lan cho lich lam viec binh thuong (ngay le, dao tao, hoi nghi, v.v.). Chan tao slot cho mot bac si/phong vao mot ngay cu the. |
| **Audit Log** | Nhat ky kiem toan | An immutable, timestamped record of a domain action (create, update, delete, status change). Includes actor ID, action type, entity type and ID, and JSON metadata. / Ban ghi bat bien co danh dau thoi gian ve mot hanh dong mien (tao, sua, xoa, thay doi trang thai). Bao gom ID tac tu, loai hanh dong, loai va ID thuc the, va JSON metadata. |
| **User** | Nguoi dung | A staff member with system access. Identified by email (unique), role, and active status. Soft-deletable (deactivated). Password stored as BCrypt hash. / Nhan vien co quyen truy cap he thong. Xac dinh bang email (duy nhat), vai tro, va trang thai hoat dong. Co the xoa mem (vo hieu hoa). |
| **Role** | Vai tro | Access level granted to a user. Values: ADMIN, DOCTOR, NURSE, RECEPTIONIST, PHARMACIST, ACCOUNTANT, PATIENT. Determines permissions across the system. / Cap do truy cap duoc cap cho nguoi dung. Gia tri: ADMIN, DOCTOR, NURSE, RECEPTIONIST, PHARMACIST, ACCOUNTANT, PATIENT. Xac dinh quyen trong he thong. |

## Enumerations

| English Term | Gia tri (Values) | Nganh canh (Context) |
|---|---|---|
| **AppointmentStatus** | PENDING, CONFIRMED, CHECKED_IN, IN_PROGRESS, DONE, CANCELLED | Appointment Management |
| **SlotStatus** | AVAILABLE, BOOKED, BLOCKED | Appointment Management |
| **RoomStatus** | READY, IN_USE, BREAK, MAINTENANCE | Admin & Operations |
| **InvoiceStatus** | UNPAID, PAID, CANCELLED | Billing & Revenue |
| **UserRole** | ADMIN, DOCTOR, NURSE, RECEPTIONIST, PHARMACIST, ACCOUNTANT, PATIENT | Admin & Operations |
| **Gender** | MALE, FEMALE, OTHER | Patient Management |
| **Inventory Stock Status** | IN_STOCK, LOW_STOCK, OUT_OF_STOCK (derived from quantity on hand vs reorder level) | Inventory & Pharmacy |
