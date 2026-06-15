"""
Vietnamese demographic data pools for the data ingestion pipeline.

All data is synthetic/demo — no real identities.
"""

import random

# ── Vietnamese Names ──────────────────────────────────────────────

MALE_LAST_NAMES = [
    "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ",
    "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý", "Trịnh", "Đoàn",
]

FEMALE_LAST_NAMES = MALE_LAST_NAMES

MALE_MIDDLE_NAMES = [
    "Văn", "Minh", "Đức", "Quang", "Hoàng", "Thanh", "Tuấn", "Hữu",
    "Anh", "Bá", "Công", "Danh", "Duy", "Gia", "Hải", "Khắc", "Nhật",
]

FEMALE_MIDDLE_NAMES = [
    "Thị", "Minh", "Thanh", "Ngọc", "Thu", "Hồng", "Mỹ", "Diệu",
    "Bích", "Cẩm", "Hương", "Kim", "Lệ", "Mai", "Phương", "Quỳnh", "Thảo",
]

MALE_FIRST_NAMES = [
    "An", "Bình", "Cường", "Dũng", "Đạt", "Giang", "Hải", "Hiếu", "Hoàng",
    "Hùng", "Huy", "Khang", "Khoa", "Lâm", "Long", "Lợi", "Minh", "Nam",
    "Nghĩa", "Phong", "Phúc", "Quang", "Quân", "Sơn", "Tài", "Thành", "Thắng",
    "Thiện", "Thịnh", "Tiến", "Toàn", "Trung", "Tuấn", "Tùng", "Việt", "Vinh",
]

FEMALE_FIRST_NAMES = [
    "Anh", "Bích", "Chi", "Diệp", "Giang", "Hà", "Hạnh", "Hoài", "Hồng",
    "Hương", "Lan", "Linh", "Loan", "Ly", "Mai", "My", "Ngọc", "Nhung",
    "Phương", "Quỳnh", "Thảo", "Thúy", "Trang", "Trâm", "Tuyết", "Uyên",
    "Vân", "Vy", "Xuân", "Yến",
]


def generate_vn_name(gender: str, seed: int = None) -> str:
    """Generate a random Vietnamese full name."""
    rng = random.Random(seed) if seed is not None else random
    last = rng.choice(MALE_LAST_NAMES)
    if gender.upper() == "FEMALE":
        middle = rng.choice(FEMALE_MIDDLE_NAMES)
        first = rng.choice(FEMALE_FIRST_NAMES)
    else:
        middle = rng.choice(MALE_MIDDLE_NAMES)
        first = rng.choice(MALE_FIRST_NAMES)
    return f"{last} {middle} {first}"


# ── CCCD Generation ───────────────────────────────────────────────

def generate_cccd(used_cccds: set, rng: random.Random = None) -> str:
    """Generate a unique 12-digit fake CCCD number."""
    if rng is None:
        rng = random
    max_attempts = 100000
    for _ in range(max_attempts):
        province_code = rng.randint(1, 96)
        century_gender = rng.randint(0, 3)
        year = rng.randint(0, 99)
        random_digits = rng.randint(0, 999999)
        cccd = f"{province_code:03d}{century_gender}{year:02d}{random_digits:06d}"
        if cccd not in used_cccds:
            used_cccds.add(cccd)
            return cccd
    raise RuntimeError("Failed to generate unique CCCD after maximum attempts")


# ── Phone Generation ──────────────────────────────────────────────

VN_PHONE_PREFIXES = ["03", "05", "07", "08", "09"]


def generate_vn_phone(rng: random.Random = None) -> str:
    """Generate a fake Vietnamese phone number."""
    if rng is None:
        rng = random
    prefix = rng.choice(VN_PHONE_PREFIXES)
    suffix = "".join(str(rng.randint(0, 9)) for _ in range(8))
    return f"{prefix}{suffix}"


# ── Addresses ─────────────────────────────────────────────────────

VN_PROVINCES = [
    {
        "name": "TP. Hồ Chí Minh",
        "districts": [
            "Quận 1", "Quận 3", "Quận 5", "Quận 7", "Quận Bình Thạnh",
            "Quận Gò Vấp", "Quận Tân Bình", "Quận Phú Nhuận", "TP. Thủ Đức",
        ],
    },
    {
        "name": "Hà Nội",
        "districts": [
            "Quận Ba Đình", "Quận Hoàn Kiếm", "Quận Đống Đa", "Quận Hai Bà Trưng",
            "Quận Cầu Giấy", "Quận Thanh Xuân", "Quận Long Biên", "Quận Hà Đông",
        ],
    },
    {
        "name": "Đà Nẵng",
        "districts": [
            "Quận Hải Châu", "Quận Thanh Khê", "Quận Sơn Trà",
            "Quận Ngũ Hành Sơn", "Quận Liên Chiểu", "Quận Cẩm Lệ",
        ],
    },
    {
        "name": "Cần Thơ",
        "districts": [
            "Quận Ninh Kiều", "Quận Bình Thủy", "Quận Cái Răng",
            "Quận Ô Môn", "Quận Thốt Nốt",
        ],
    },
    {
        "name": "Hải Phòng",
        "districts": [
            "Quận Hồng Bàng", "Quận Lê Chân", "Quận Ngô Quyền",
            "Quận Kiến An", "Quận Hải An",
        ],
    },
    {
        "name": "Bình Dương",
        "districts": [
            "TP. Thủ Dầu Một", "TP. Thuận An", "TP. Dĩ An",
            "Huyện Bến Cát", "Huyện Tân Uyên",
        ],
    },
    {
        "name": "Đồng Nai",
        "districts": [
            "TP. Biên Hòa", "TP. Long Khánh", "Huyện Nhơn Trạch",
            "Huyện Trảng Bom", "Huyện Long Thành",
        ],
    },
    {
        "name": "Khánh Hòa",
        "districts": [
            "TP. Nha Trang", "TP. Cam Ranh", "Huyện Diên Khánh",
            "Huyện Vạn Ninh", "Thị xã Ninh Hòa",
        ],
    },
]


def generate_vn_address(rng: random.Random = None) -> tuple:
    """Generate a random VN address. Returns (province, district, street_address)."""
    if rng is None:
        rng = random
    province = rng.choice(VN_PROVINCES)
    district = rng.choice(province["districts"])
    street_number = rng.randint(1, 999)
    streets = [
        "Nguyễn Huệ", "Lê Lợi", "Trần Hưng Đạo", "Hai Bà Trưng",
        "Nguyễn Trãi", "Phạm Ngọc Thạch", "Võ Văn Tần", "Cách Mạng Tháng Tám",
        "Điện Biên Phủ", "Lý Thường Kiệt", "Nguyễn Đình Chiểu", "Hoàng Diệu",
    ]
    street = rng.choice(streets)
    street_address = f"{street_number} {street}"
    return province["name"], district, street_address


# ── Staff Names ───────────────────────────────────────────────────

DOCTOR_NAMES = [
    "Nguyễn Văn An", "Trần Thị Bình", "Lê Minh Khoa", "Phạm Như Quỳnh",
    "Hoàng Đức Thắng", "Huỳnh Thanh Hải", "Phan Ngọc Mai", "Vũ Hồng Sơn",
    "Võ Thị Lan", "Đặng Quang Huy", "Bùi Thanh Tùng", "Đỗ Thị Hạnh",
    "Hồ Văn Toàn", "Ngô Minh Đức", "Dương Thúy Vân", "Lý Hữu Phước",
    "Trịnh Bích Phương", "Đoàn Văn Lợi", "Mai Xuân Trường", "Tô Thanh Nga",
]

NURSE_NAMES = [
    "Lê Thị Cúc", "Nguyễn Thị Hồng", "Trần Thị Thắm", "Phạm Thị Đào",
    "Hoàng Thị Sen", "Võ Thị Lan", "Bùi Thị Nhài", "Đặng Thị Quyên",
]

RECEPTIONIST_NAMES = [
    "Nguyễn Thị Tiếp Tân", "Trần Văn Lễ Tân", "Lê Thị Hướng Dẫn",
]

PHARMACIST_NAMES = [
    "Hoàng Văn Dược", "Nguyễn Thị Thuốc", "Trần Minh Dược Sĩ",
]

ACCOUNTANT_NAMES = [
    "Phạm Văn Dũng", "Nguyễn Thị Kế Toán", "Lê Văn Sổ Sách",
]

ADMIN_NAMES = [
    "Nguyễn Quản Trị", "Trần Văn Hệ Thống",
]

# ── Vietnamese Hospital Departments ────────────────────────────────

VN_DEPARTMENTS = [
    {"name": "Khoa Nội tổng quát", "description": "Khám và điều trị các bệnh lý nội khoa tổng quát."},
    {"name": "Khoa Tim mạch", "description": "Chẩn đoán và điều trị các bệnh lý về tim mạch."},
    {"name": "Khoa Nhi", "description": "Khám và điều trị bệnh cho trẻ em từ sơ sinh đến 15 tuổi."},
    {"name": "Khoa Sản phụ khoa", "description": "Chăm sóc sức khỏe sinh sản, thai sản và phụ khoa."},
    {"name": "Khoa Cơ xương khớp", "description": "Điều trị các bệnh lý về cơ, xương và khớp."},
    {"name": "Khoa Da liễu", "description": "Khám và điều trị các bệnh về da và thẩm mỹ da."},
    {"name": "Khoa Tai Mũi Họng", "description": "Chẩn đoán và điều trị bệnh về tai, mũi, họng."},
    {"name": "Khoa Thần kinh", "description": "Điều trị các bệnh lý về hệ thần kinh."},
    {"name": "Khoa Hô hấp", "description": "Chẩn đoán và điều trị bệnh lý về đường hô hấp."},
    {"name": "Khoa Xét nghiệm", "description": "Thực hiện các xét nghiệm cận lâm sàng."},
    {"name": "Khoa Chẩn đoán hình ảnh", "description": "Siêu âm, X-quang, CT, MRI và các kỹ thuật chẩn đoán hình ảnh."},
    {"name": "Khoa Dược", "description": "Quản lý và cấp phát thuốc cho bệnh nhân nội trú và ngoại trú."},
]

# ── Blood Types ───────────────────────────────────────────────────

BLOOD_TYPES = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]

# ── Occupations ───────────────────────────────────────────────────

VN_OCCUPATIONS = [
    "Nhân viên văn phòng", "Giáo viên", "Kỹ sư", "Bác sĩ", "Nông dân",
    "Công nhân", "Kinh doanh tự do", "Nội trợ", "Sinh viên", "Hưu trí",
    "Lái xe", "Thợ xây", "Nhân viên bán hàng", "Kế toán", "Luật sư",
    "Lập trình viên", "Kiến trúc sư", "Nhà báo", "Nghệ sĩ", "Đầu bếp",
]

# ── Clinical Note Templates (Vietnamese) ──────────────────────────

VN_CLINICAL_NOTES = [
    "Bệnh nhân tỉnh, tiếp xúc tốt. Các chỉ số sinh tồn trong giới hạn bình thường.",
    "Triệu chứng cải thiện sau điều trị. Tiếp tục theo dõi và tái khám theo hẹn.",
    "Bệnh nhân tỉnh táo, hợp tác tốt. Không ghi nhận dấu hiệu bất thường.",
    "Khuyến nghị tái khám nếu triệu chứng không giảm sau 7 ngày.",
    "Dặn dò theo dõi huyết áp, đường huyết, nhiệt độ tại nhà. Uống thuốc đúng liều.",
    "Bệnh nhân đáp ứng tốt với phác đồ điều trị. Tiếp tục duy trì thuốc hiện tại.",
    "Các triệu chứng đã thuyên giảm đáng kể. Có thể giảm liều thuốc trong lần tái khám sau.",
    "Đã giải thích tình trạng bệnh và hướng dẫn chế độ ăn uống, sinh hoạt phù hợp.",
    "Bệnh nhân cần theo dõi thêm tại nhà. Hẹn tái khám sau 2 tuần.",
    "Không ghi nhận biến chứng. Vết thương/ vết mổ khô, không nhiễm trùng.",
    "Đã tư vấn về chế độ dinh dưỡng và vận động phù hợp với tình trạng bệnh.",
    "Kết quả xét nghiệm trong giới hạn tham chiếu. Có thể xuất viện.",
]

# ── Common Vietnamese Medication Names ────────────────────────────

VN_COMMON_MEDS = [
    {"name": "Paracetamol", "category": "Giảm đau/Hạ sốt", "unit": "viên"},
    {"name": "Amoxicillin", "category": "Kháng sinh", "unit": "viên"},
    {"name": "Omeprazole", "category": "Dạ dày", "unit": "viên"},
    {"name": "Metformin", "category": "Đái tháo đường", "unit": "viên"},
    {"name": "Amlodipine", "category": "Tim mạch", "unit": "viên"},
    {"name": "Loratadine", "category": "Dị ứng", "unit": "viên"},
    {"name": "Ibuprofen", "category": "Giảm đau/Kháng viêm", "unit": "viên"},
    {"name": "Cetirizine", "category": "Dị ứng", "unit": "viên"},
    {"name": "Vitamin C", "category": "Vitamin/Khoáng chất", "unit": "viên"},
    {"name": "Vitamin D3", "category": "Vitamin/Khoáng chất", "unit": "viên"},
    {"name": "Calcium", "category": "Khoáng chất", "unit": "viên"},
    {"name": "Aspirin", "category": "Tim mạch/Giảm đau", "unit": "viên"},
    {"name": "Atorvastatin", "category": "Mỡ máu", "unit": "viên"},
    {"name": "Losartan", "category": "Huyết áp", "unit": "viên"},
    {"name": "Metronidazole", "category": "Kháng sinh", "unit": "viên"},
    {"name": "Ciprofloxacin", "category": "Kháng sinh", "unit": "viên"},
    {"name": "Diclofenac", "category": "Giảm đau/Kháng viêm", "unit": "viên"},
    {"name": "Domperidone", "category": "Tiêu hóa", "unit": "viên"},
    {"name": "Clorpheniramin", "category": "Dị ứng", "unit": "viên"},
    {"name": "Berberin", "category": "Tiêu hóa", "unit": "viên"},
]

# ── Vietnamese Drug Dosage Templates ──────────────────────────────

VN_DOSAGES = ["250mg", "500mg", "100mg", "200mg", "400mg", "5mg", "10mg", "20mg", "40mg"]
VN_FREQUENCIES = ["1 lần/ngày", "2 lần/ngày", "3 lần/ngày", "4 lần/ngày"]
VN_INSTRUCTIONS = [
    "Uống sau ăn", "Uống trước ăn 30 phút", "Uống vào buổi sáng",
    "Uống vào buổi tối trước khi ngủ", "Uống với nhiều nước",
    "Ngậm dưới lưỡi", "Uống khi đau", "Uống cách nhau ít nhất 6 giờ",
]

# ── Vietnamese Condition Translations ─────────────────────────────

CONDITION_TRANSLATIONS = {
    "essential hypertension": "Tăng huyết áp vô căn",
    "hypertension": "Tăng huyết áp",
    "diabetes mellitus": "Đái tháo đường",
    "type 2 diabetes": "Đái tháo đường type 2",
    "type 1 diabetes": "Đái tháo đường type 1",
    "asthma": "Hen phế quản",
    "pneumonia": "Viêm phổi",
    "bronchitis": "Viêm phế quản",
    "sinusitis": "Viêm xoang",
    "allergic rhinitis": "Viêm mũi dị ứng",
    "gastritis": "Viêm dạ dày",
    "gastroenteritis": "Viêm dạ dày ruột",
    "peptic ulcer": "Loét dạ dày tá tràng",
    "urinary tract infection": "Nhiễm trùng đường tiết niệu",
    "anemia": "Thiếu máu",
    "iron deficiency anemia": "Thiếu máu thiếu sắt",
    "hyperlipidemia": "Rối loạn lipid máu",
    "hypercholesterolemia": "Tăng cholesterol máu",
    "obesity": "Béo phì",
    "osteoarthritis": "Viêm xương khớp",
    "rheumatoid arthritis": "Viêm khớp dạng thấp",
    "back pain": "Đau lưng",
    "neck pain": "Đau cổ",
    "headache": "Đau đầu",
    "migraine": "Đau nửa đầu",
    "conjunctivitis": "Viêm kết mạc",
    "otitis media": "Viêm tai giữa",
    "pharyngitis": "Viêm họng",
    "tonsillitis": "Viêm amidan",
    "dermatitis": "Viêm da",
    "eczema": "Chàm",
    "psoriasis": "Vảy nến",
    "coronary heart disease": "Bệnh mạch vành",
    "heart failure": "Suy tim",
    "atrial fibrillation": "Rung nhĩ",
    "stroke": "Đột quỵ",
    "chronic kidney disease": "Bệnh thận mạn",
    "depression": "Trầm cảm",
    "anxiety": "Rối loạn lo âu",
    "insomnia": "Mất ngủ",
    "cataract": "Đục thủy tinh thể",
    "glaucoma": "Thiên đầu thống",
    "hypothyroidism": "Suy giáp",
    "gout": "Gút",
    "cellulitis": "Viêm mô tế bào",
    "acute bronchitis": "Viêm phế quản cấp",
}


def translate_condition(english_desc: str) -> str:
    """Attempt to translate a condition description to Vietnamese."""
    if not english_desc:
        return "Không xác định"
    desc_lower = english_desc.strip().lower()
    if desc_lower in CONDITION_TRANSLATIONS:
        return CONDITION_TRANSLATIONS[desc_lower]
    best_match = None
    best_len = 0
    for en_term, vn_term in CONDITION_TRANSLATIONS.items():
        if en_term in desc_lower and len(en_term) > best_len:
            best_match = vn_term
            best_len = len(en_term)
    if best_match:
        return best_match
    return english_desc


# ── Inventory Suppliers ───────────────────────────────────────────

VN_SUPPLIERS = [
    "Công ty Dược phẩm TW1",
    "Công ty Dược phẩm TW2",
    "Công ty CP Dược Hậu Giang",
    "Công ty CP Dược phẩm Imexpharm",
    "Công ty CP Dược phẩm Bidiphar",
    "Công ty CP Dược phẩm OPC",
    "Công ty TNHH Dược phẩm Sanofi Việt Nam",
    "Công ty CP Dược liệu TW1",
]

# ── Invoice Codes ─────────────────────────────────────────────────

def generate_invoice_code(appointment_index: int) -> str:
    """Generate an invoice code from an appointment index."""
    return f"INV-{appointment_index + 1:06d}"


# ── Confirmation Codes ────────────────────────────────────────────

def generate_confirmation_code(rng: random.Random = None) -> str:
    """Generate a confirmation code in format HMS-XXXXXXXX."""
    if rng is None:
        rng = random
    chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    suffix = "".join(rng.choice(chars) for _ in range(8))
    return f"HMS-{suffix}"
