# Quy Tac Nghiep Vu (Business Rules)

> Cac quy tac nghiep vu (BR) cua he thong quan ly benh vien. Status: Release Candidate. Cap nhat lan cuoi: 2026-06-14.

## Quy Uoc Dat Ten (Naming Convention)

- **BR-NNN**: Business Rule, danh sach tang dan
- **Domain**: Linh vuc ap dung (Appointment, Queue, Medical Record, etc.)
- **Severity**: BLOCKER (ngan khong cho thao tac), ERROR (bao loi), WARNING (canh bao)
- **Enforcement**: Application (trong code), Database (rang buoc DB), UI (giao dien)

---

## BR-001: Appointment Booking Requires Available Slot
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Appointment |
| Severity | BLOCKER |
| Enforcement | Application |
| Mo ta | A appointment can only be created if the selected slot exists and its status is AVAILABLE. The slot must be locked atomically during booking to prevent race conditions. / Mot lich hen chi co the duoc tao neu khung gio duoc chon ton tai va trang thai la AVAILABLE. Khung gio phai duoc khoa trong qua trinh dat lich de tranh dieu kien chay dua. |

## BR-002: Slot Locking Prevents Double-Booking
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Appointment |
| Severity | BLOCKER |
| Enforcement | Application (transactional + status check) |
| Mo ta | When a slot is booked, its status changes to BOOKED. Any concurrent booking attempt for the same slot must fail. / Khi mot khung gio duoc dat, trang thai cua no chuyen sang BOOKED. Bat ky co gang dat lich dong thoi cho cung khung gio phai that bai. |

## BR-003: Confirmation Code Must Be Unique
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Appointment |
| Severity | BLOCKER |
| Enforcement | Application + Database (unique constraint) |
| Mo ta | Each appointment must have a unique confirmation code (format: `HMS-XXXXXXXX`). Generated as a UUID substring. / Moi lich hen phai co ma xac nhan duy nhat (dinh dang `HMS-XXXXXXXX`). Duoc tao tu UUID. |

## BR-004: Slot Is Immutable After Booking
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Appointment |
| Severity | BLOCKER |
| Enforcement | Application |
| Mo ta | Once a slot's status changes to BOOKED, its time values (startTime, endTime) cannot be modified. The slot reference on the appointment is immutable. / Khi trang thai khung gio chuyen sang BOOKED, cac gia tri thoi gian cua no khong the bi sua doi. Tham chieu khung gio tren lich hen la bat bien. |

## BR-005: PHI Must Be Encrypted Before Storage
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Patient Management |
| Severity | BLOCKER |
| Enforcement | Application (PatientIdentifierProtector) |
| Mo ta | Patient CCCD must be encrypted using AES-256-GCM before being persisted. The ciphertext is stored with an `enc:` prefix. When returned in API responses, the CCCD field will be masked or omitted according to role permissions. / CCCD cua benh nhan phai duoc ma hoa bang AES-256-GCM truoc khi luu. Ban ma duoc luu voi tien to `enc:`. Khi tra ve trong API, truong CCCD se duoc an hoac bo qua theo quyen cua vai tro. |

## BR-006: CCCD Must Be Hashed for Search
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Patient Management |
| Severity | ERROR |
| Enforcement | Application |
| Mo ta | The raw (unencrypted) CCCD is hashed using SHA-256. The hash is stored in plaintext to support duplicate detection and search lookup. The hash is stored as a lowercased hex string. / CCCD tho duoc bam bang SHA-256. Ma bam duoc luu duoi dang van ban ro de ho tro phat hien trung lap va tra cuu. Ma bam duoc luu duoi dang chuoi hex viet thuong. |

## BR-007: Queue States Follow Defined Transitions
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Queue |
| Severity | BLOCKER |
| Enforcement | Application |
| Mo ta | Queue transitions follow a strict state machine. Allowed transitions:
  - CHECKED_IN -> CALLED (nurse calls patient)
  - CALLED -> SKIPPED (patient not present) or IN_PROGRESS (consultation starts)
  - SKIPPED -> CALLED (can be called again)
  - IN_PROGRESS -> COMPLETED (consultation ends)
  Any transition not in this list is invalid and will be rejected. / Cac chuyen trang thai trong hang doi tuan theo may trang thai nghiem ngat. Cac chuyen doi duoc phep duoc dinh nghia o tren. Bat ky chuyen doi khong nam trong danh sach la khong hop le va se bi tu choi. |

## BR-008: Appointment Status Follows Defined Transitions
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Appointment |
| Severity | BLOCKER |
| Enforcement | Application |
| Mo ta | Appointment status transitions are restricted. Allowed transitions:
  - PENDING -> CONFIRMED (staff confirms)
  - CONFIRMED -> CHECKED_IN (nurse check-in)
  - CHECKED_IN -> IN_PROGRESS (doctor starts consultation)
  - IN_PROGRESS -> DONE (doctor completes)
  - PENDING/CONFIRMED -> CANCELLED (staff cancels)
  Cancellation from later states is not permitted. / Cac chuyen trang thai lich hen bi han che. Cac chuyen doi duoc phep duoc dinh nghia. Huy lich tu cac trang thai muon hon khong duoc phep. |

## BR-009: Invoice Auto-Generated from Service Pricing
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Billing |
| Severity | ERROR |
| Enforcement | Application |
| Mo ta | An invoice total amount is derived from applicable service pricing rules. The system must lookup valid (by date, department) pricing entries when generating an invoice. Manual override of the total amount is not supported. / Tong so tien hoa don duoc tinh tu cac quy tac gia dich vu ap dung. He thong phai tra cuu cac bang gia con hieu luc (theo ngay, phong ban) khi tao hoa don. Khong ho tro ghi de so tien thu cong. |

## BR-010: Invoice Requires Completed Appointment
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Billing |
| Severity | BLOCKER |
| Enforcement | Application |
| Mo ta | An invoice can only be created for an appointment with status DONE. Appointments in any other status cannot be invoiced. / Hoa don chi co the duoc tao cho lich hen co trang thai DONE. Lich hen o bat ky trang thai nao khac khong the xuat hoa don. |

## BR-011: Prescription Dispensing Requires Valid Inventory
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Inventory |
| Severity | BLOCKER |
| Enforcement | Application |
| Mo ta | Dispensing a prescription item requires that the corresponding inventory item has sufficient quantity on hand. If quantity on hand is below the dispense quantity, the dispense operation must fail with an appropriate error. / Cap phat thuoc theo don yeu cau rang vat tu/thuoc tuong ung phai co du so luong ton kho. Neu so luong ton thap hon so luong cap phat, thao tac cap phat phai that bai voi loi thich hop. |

## BR-012: Each Role Has Specific Permissions (RBAC)
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Security |
| Severity | BLOCKER |
| Enforcement | Application (Spring Security + RbacAuthorizationService) |
| Mo ta | Every authenticated request must be checked against the RBAC permission map. Each of the 36 permissions has a defined set of allowed roles. Requests without the required permission MUST be rejected with HTTP 403. / Moi yeu cau da xac thuc phai duoc kiem tra voi ban do quyen RBAC. Moi quyen trong so 36 quyen co mot tap hop vai tro duoc phep xac dinh. Cac yeu cau khong co quyen can thiet phai bi tu choi voi HTTP 403. |

## BR-013: Email Must Be Unique Across Users
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Admin |
| Severity | BLOCKER |
| Enforcement | Database (unique constraint) + Application |
| Mo ta | No two users may share the same email address. Duplicate email registration must be rejected. / Khong co hai nguoi dung nao duoc chia se cung mot dia chi email. Dang ky email trung lap phai bi tu choi. |

## BR-014: Department Name Must Be Unique
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Admin |
| Severity | BLOCKER |
| Enforcement | Database (unique constraint) |
| Mo ta | No two departments may share the same name. Duplicate department names must be rejected during creation or update. / Khong co hai phong ban nao duoc trung ten. Ten phong ban trung phai bi tu choi trong qua trinh tao hoac cap nhat. |

## BR-015: Only Active Doctors Can Be Assigned to Departments
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Admin |
| Severity | BLOCKER |
| Enforcement | Application |
| Mo ta | A user must have role DOCTOR and an active status to be assignable to a department. Inactive doctor assignments must be rejected. / Nguoi dung phai co vai tro DOCTOR va trang thai hoat dong de co the duoc gan vao phong ban. Gan bac si khong hoat dong phai bi tu choi. |

## BR-016: Users Are Soft-Deleted (Deactivated)
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Admin |
| Severity | ERROR |
| Enforcement | Application |
| Mo ta | When a user is "deleted", the account is deactivated (active = false) rather than physically removed. This preserves referential integrity with appointments, medical records, and audit logs. / Khi nguoi dung bi "xoa", tai khoan bi vo hieu hoa (active = false) thay vi xoa vat ly. Dieu nay bao toan tinh toan ven tham chieu voi lich hen, ho so benh an, va nhat ky kiem toan. |

## BR-017: Rooms Are Soft-Deleted
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Admin |
| Severity | ERROR |
| Enforcement | Application |
| Mo ta | Rooms are soft-deleted to preserve historical appointment room references. Physical deletion would break the audit trail and historical appointment data. / Phong duoc xoa mem de bao toan cac tham chieu phong lich su cua lich hen. Xoa vat ly se lam hong vet kiem toan va du lieu lich hen lich su. |

## BR-018: Departments Are Soft-Deleted
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Admin |
| Severity | ERROR |
| Enforcement | Application |
| Mo ta | Departments are soft-deleted to preserve referential integrity with staff assignments, pricing rules, and inventory items. / Phong ban duoc xoa mem de bao toan tinh toan ven tham chieu voi phan cong nhan vien, quy tac gia, va vat tu ton kho. |

## BR-019: Audit Log Must Be Immutable
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Audit |
| Severity | BLOCKER |
| Enforcement | Application (REQUIRES_NEW propagation, no update/delete API) |
| Mo ta | Audit log entries, once written, MUST NOT be modified or deleted. The system must not expose any update or delete endpoints for audit logs. Writing audit logs uses REQUIRES_NEW propagation to ensure the log is persisted independently of the triggering transaction. / Cac muc nhat ky kiem toan, sau khi duoc ghi, KHONG DUOC phep sua doi hoac xoa. He thong khong duoc phep expose bat ky endpoint cap nhat hoac xoa nao cho nhat ky kiem toan. |

## BR-020: Slots Are Generated from Schedule Templates
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Admin |
| Severity | ERROR |
| Enforcement | Application |
| Mo ta | Available slots are generated from doctor schedule templates. A template defines a recurring weekly pattern (day of week, start time, end time, slot duration). Slots are generated per doctor per date, excluding dates covered by special closures. Slot duration is fixed at 30 minutes. / Cac khung gio trong duoc tao tu mau lich lam viec cua bac si. Mot mau dinh nghia mot lich hang tuan (thu, gio bat dau, gio ket thuc, thoi gian slot). Cac slot duoc tao theo tung bac si theo tung ngay, loai tru cac ngay co lich nghi dac biet. Thoi gian slot co dinh la 30 phut. |

## BR-021: Booking Duration Must Be at Least One Slot
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Appointment |
| Severity | BLOCKER |
| Enforcement | Application |
| Mo ta | Each appointment must span at least one slot (30 minutes). The `firstSlotId` references the first slot; the `aiDurationMinutes` field tracks the estimated duration though the current implementation creates single-slot appointments. / Moi lich hen phai keo dai it nhat mot slot (30 phut). `firstSlotId` tham chieu slot dau tien; truong `aiDurationMinutes` theo doi thoi gian du kien mac du hien tai tao lich hen mot slot. |

## BR-022: Rate Limiting for Public Endpoints
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Security |
| Severity | WARNING |
| Enforcement | Application (RateLimitingFilter) |
| Mo ta | Public endpoints (no authentication required) are rate-limited to 30 requests per minute per IP by default. Exceeding this limit results in HTTP 429 Too Many Requests. Admin can adjust this limit via configuration. / Cac endpoint cong khong yeu cau xac thuc bi gioi han toc do 30 yeu cau moi phut moi IP theo mac dinh. Vuot qua gioi han nay dan den HTTP 429 Too Many Requests. Admin co the dieu chinh gioi han nay qua cau hinh. |

## BR-023: Patient Portal Messages Are Read-Only
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Patient Portal |
| Severity | ERROR |
| Enforcement | Application (no send/reply API exists) |
| Mo ta | The current API does not expose endpoints for patients to compose, send, or reply to messages. The patient message feature is list-and-read only. / API hien tai khong expose endpoint cho benh nhan de soan, gui, hoac tra loi tin nhan. Tinh nang tin nhan cua benh nhan chi co the xem danh sach va doc. |

## BR-024: Refresh Tokens Use HTTP-Only Cookies
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Security |
| Severity | BLOCKER |
| Enforcement | Application (SecurityConfig) |
| Mo ta | Refresh tokens MUST be stored in HTTP-only cookies for both staff and patient authentication. This prevents client-side JavaScript from accessing the refresh token, mitigating XSS-based token theft. / Refresh token PHAI duoc luu trong HTTP-only cookie cho ca xac thuc nhan vien va benh nhan. Dieu nay ngan JavaScript phia client truy cap refresh token, giam thieu nguy co danh cap token qua XSS. |

## BR-025: Prescription PDF Includes Specific Required Fields
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Medical Records |
| Severity | ERROR |
| Enforcement | Application (Apache PDFBox) |
| Mo ta | The generated prescription PDF must include: patient name and date of birth, doctor name and department, prescription date, medicine name/dosage/frequency/duration for each item, instructions, and the hospital header. / PDF don thuoc duoc tao phai bao gom: ten va ngay sinh benh nhan, ten bac si va phong ban, ngay ke don, ten thuoc/lieu luong/tan suat/thoi gian cho moi mat hang, huong dan, va tieu de benh vien. |

## BR-026: Duplicate Patient Detection Uses CCCD Hash
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Patient Management |
| Severity | ERROR |
| Enforcement | Application |
| Mo ta | When creating a patient record, the system must check the SHA-256 hash of the provided CCCD against existing hashes. If a match is found, the system should return the existing patient record rather than creating a duplicate. / Khi tao ho so benh nhan, he thong phai kiem tra ma bam SHA-256 cua CCCD duoc cung cap voi cac ma bam hien co. Neu tim thay trung khop, he thong se tra ve ho so benh nhan hien tai thay vi tao ban sao. |

## BR-027: JWT Access Token Must Be Short-Lived
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Security |
| Severity | WARNING |
| Enforcement | Application (JWT configuration) |
| Mo ta | Access tokens (JWT) must have a short expiration time (e.g., 15-30 minutes). Refresh tokens have a longer lifespan. Token expiration must result in a 401 response, triggering the refresh flow. / Access token (JWT) phai co thoi gian het han ngan (vd 15-30 phut). Refresh token co thoi gian song dai hon. Het han token phai dan den phan hoi 401, kich hoat luong lam moi. |

## BR-028: Audit Actions Must Be Specific to Domain Events
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Audit |
| Severity | ERROR |
| Enforcement | Application |
| Mo ta | Audit logs must record specific domain actions with appropriate metadata. Each audit entry includes: `actorId`, `action` (e.g., USER_CREATED, DEPARTMENT_CREATED, APPOINTMENT_STATUS_CHANGED), `entityType`, `entityId`, and `metadata` (JSONB). / Nhat ky kiem toan phai ghi lai cac hanh dong domain cu the voi metadata thich hop. Moi muc nhat ky bao gom: actorId, action, entityType, entityId, va metadata (JSONB). |

## BR-029: Inventory Stock Status Is Derived
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Inventory |
| Severity | WARNING |
| Enforcement | Application (derived, not stored) |
| Mo ta | Stock status (IN_STOCK, LOW_STOCK, OUT_OF_STOCK) is derived from quantity on hand vs reorder level, not stored as a separate field. IN_STOCK when qty >= reorder level. LOW_STOCK when 0 < qty < reorder level. OUT_OF_STOCK when qty = 0. / Trang thai ton kho (IN_STOCK, LOW_STOCK, OUT_OF_STOCK) duoc suy ra tu so luong ton so voi muc dat lai hang, khong duoc luu lai nhu mot truong rieng. |

## BR-030: Follow-up Date Must Be in the Future
| Thuoc tinh | Gia tri |
|------------|---------|
| Domain | Medical Records |
| Severity | ERROR |
| Enforcement | Application |
| Mo ta | When creating a follow-up recommendation, the follow-up date must be after the current consultation date. Past or same-day follow-up dates are invalid. / Khi tao de xuat tai kham, ngay tai kham phai sau ngay kham hien tai. Ngay tai kham trong qua khu hoac cung ngay la khong hop le. |
