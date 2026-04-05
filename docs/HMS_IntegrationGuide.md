Hospital Management System  **Tài liệu 9: Integration Guide**

**HOSPITAL MANAGEMENT SYSTEM**

Hệ thống Quản lý Bệnh viện

**TÀI LIỆU 9**

**Integration Guide**

*Gmail OAuth2 Step-by-Step · Claude API Setup · Cấu hình tích hợp*

Phiên bản: 1.0  |  2025


# **1. Tích Hợp Gmail API (OAuth2)**
## **1.1 Tại Sao Dùng OAuth2 Thay SMTP Thông Thường**
- Google đã tắt hỗ trợ 'Less Secure Apps' từ tháng 5/2022 — SMTP bằng username/password không còn hoạt động với Gmail.
- OAuth2 an toàn hơn: không cần lưu mật khẩu Gmail, có thể thu hồi quyền bất kỳ lúc nào.
- Phù hợp cho server-side applications: dùng refresh token để gửi email tự động 24/7.

## **1.2 Bước 1 — Tạo Google Cloud Project**
1. Truy cập https://console.cloud.google.com
1. Đăng nhập bằng Gmail account sẽ dùng để gửi email.
1. Nhấn 'Select a project' → 'New Project'.
1. Điền tên project: 'HMS Email Service'. Nhấn 'Create'.
1. Đảm bảo project vừa tạo đang được chọn ở thanh trên cùng.

## **1.3 Bước 2 — Kích Hoạt Gmail API**
1. Trong Google Cloud Console, vào menu bên trái: 'APIs & Services' → 'Library'.
1. Tìm kiếm 'Gmail API'. Nhấn vào kết quả 'Gmail API'.
1. Nhấn nút 'Enable'. Chờ khoảng 30 giây.

## **1.4 Bước 3 — Cấu Hình OAuth Consent Screen**
1. Vào 'APIs & Services' → 'OAuth consent screen'.
1. Chọn 'External'. Nhấn 'Create'.
1. Điền App name: 'HMS Email Service'.
1. Điền User support email: địa chỉ Gmail của bạn.
1. Điền Developer contact information: địa chỉ Gmail của bạn.
1. Nhấn 'Save and Continue'.
1. Mục 'Scopes': Nhấn 'Add or Remove Scopes' → Tìm và chọn 'https://mail.google.com/' (Full Gmail access). Nhấn 'Update' → 'Save and Continue'.
1. Mục 'Test Users': Nhấn '+ Add Users' → thêm Gmail account sẽ gửi email. Nhấn 'Save and Continue'.
1. Nhấn 'Back to Dashboard'.

## **1.5 Bước 4 — Tạo OAuth2 Credentials**
1. Vào 'APIs & Services' → 'Credentials'.
1. Nhấn '+ Create Credentials' → 'OAuth client ID'.
1. Application type: chọn 'Web application'.
1. Name: 'HMS Backend'.
1. Authorized redirect URIs: Nhấn '+ Add URI' → nhập http://localhost:8080/oauth2/callback
1. Nhấn 'Create'.
1. Copy và lưu lại 'Client ID' và 'Client Secret' (chỉ hiển thị 1 lần).
1. Điền vào .env: GMAIL\_CLIENT\_ID=... và GMAIL\_CLIENT\_SECRET=...

## **1.6 Bước 5 — Lấy Refresh Token (Chỉ Cần Làm 1 Lần)**
Mở URL sau trên browser (thay YOUR\_CLIENT\_ID):

https://accounts.google.com/o/oauth2/v2/auth?

`  `client\_id=YOUR\_CLIENT\_ID&

`  `redirect\_uri=http://localhost:8080/oauth2/callback&

`  `response\_type=code&

`  `scope=https://mail.google.com/&

`  `access\_type=offline&

`  `prompt=consent

1. Đăng nhập bằng Gmail sẽ dùng gửi email. Chấp nhận tất cả quyền.
1. Browser redirect về http://localhost:8080/oauth2/callback?code=AUTHORIZATION\_CODE
1. Copy phần AUTHORIZATION\_CODE từ URL.
1. Gửi POST request (dùng Postman hoặc curl):

POST https://oauth2.googleapis.com/token

Body (x-www-form-urlencoded):

`  `code=AUTHORIZATION\_CODE

`  `client\_id=YOUR\_CLIENT\_ID

`  `client\_secret=YOUR\_CLIENT\_SECRET

`  `redirect\_uri=http://localhost:8080/oauth2/callback

`  `grant\_type=authorization\_code

1. Response trả về JSON chứa 'refresh\_token'. Copy giá trị này.
1. Điền vào .env: GMAIL\_REFRESH\_TOKEN=...

Lưu ý quan trọng: refresh\_token chỉ trả về 1 lần duy nhất khi có prompt=consent. Nếu mất, phải revoke và làm lại từ đầu.

## **1.7 Bước 6 — Test Gửi Email**
Khởi động ứng dụng, sau đó gọi API test (cần đăng nhập admin):

POST http://localhost:8080/api/v1/admin/test-email

Authorization: Bearer <admin\_token>

Body: { "to": "your@email.com", "subject": "Test HMS" }

Nếu nhận được email → tích hợp thành công. Nếu lỗi, kiểm tra log backend.


# **2. Tích Hợp Claude API**
## **2.1 Lấy API Key**
1. Truy cập https://console.anthropic.com
1. Đăng ký hoặc đăng nhập tài khoản Anthropic.
1. Vào 'API Keys' → Nhấn 'Create Key'.
1. Đặt tên: 'HMS Production'. Copy key (bắt đầu bằng sk-ant-api03-...).
1. Điền vào .env: ANTHROPIC\_API\_KEY=sk-ant-api03-...

Cảnh báo: API key là bí mật, không bao giờ commit vào Git. Kiểm tra .gitignore đã có .env.

## **2.2 Model Được Dùng**
- Model: claude-sonnet-4-5 — cân bằng giữa chất lượng và chi phí.
- Max tokens: 1000 (đủ cho phân tích triệu chứng và chatbot).
- Timeout: 15 giây — nếu quá thì fallback về 30 phút mặc định.

## **2.3 Prompt Template — Phân Tích Triệu Chứng**
System: Bạn là AI hỗ trợ phân tích triệu chứng bệnh để ước tính thời gian

khám phù hợp. Chỉ trả về JSON, không giải thích thêm.

User: Khoa: {department}

Triệu chứng bệnh nhân: {symptoms}

Phân tích và trả về JSON format:

{

`  `"durationMinutes": <30|45|60|90>,

`  `"complexity": "<SIMPLE|MEDIUM|COMPLEX|VERY\_COMPLEX>",

`  `"reasoning": "<giải thích ngắn gọn bằng tiếng Việt, tối đa 100 ký tự>"

}

## **2.4 Prompt Template — Chatbot**
System: Bạn là trợ lý tư vấn của {HOSPITAL\_NAME}. Chỉ trả lời các câu hỏi

liên quan đến đặt lịch khám và thông tin bệnh viện. Từ chối lịch sự các

câu hỏi về chẩn đoán bệnh hoặc tư vấn y tế. Trả lời bằng tiếng Việt.

Thông tin bệnh viện: {hospital\_info}

Dữ liệu real-time từ hệ thống: {db\_query\_results}

Lịch sử hội thoại: {conversation\_history}

Câu hỏi người dùng: {user\_message}

## **2.5 Quản Lý Chi Phí API**
- Claude API tính phí theo số token. Ước tính chi phí: ~$0.003/1K input tokens, ~$0.015/1K output tokens.
- Caching: Cache kết quả phân tích triệu chứng tương tự trong 1 giờ (Redis hoặc Caffeine cache).
- Rate limiting: Tối đa 20 requests/phút từ hệ thống (xem Security doc).
- Monitoring: Log số token dùng mỗi request, alert khi vượt ngưỡng budget.


# **3. Kiểm Tra Tích Hợp**
## **3.1 Checklist Gmail**
- [ ] Gmail API enabled trong Google Cloud Console.
- [ ] OAuth consent screen có scope https://mail.google.com/.
- [ ] Credentials tạo đúng loại 'Web application'.
- [ ] Test user đã được thêm vào consent screen.
- [ ] GMAIL\_CLIENT\_ID, GMAIL\_CLIENT\_SECRET, GMAIL\_REFRESH\_TOKEN đã điền trong .env.
- [ ] GMAIL\_SENDER\_EMAIL khớp với Gmail account đã authorize.
- [ ] Test email gửi thành công từ API /admin/test-email.
## **3.2 Checklist Claude API**
- [ ] ANTHROPIC\_API\_KEY đã điền trong .env, bắt đầu bằng sk-ant-api03-.
- [ ] Gọi POST /api/v1/ai/analyze-symptoms trả về JSON hợp lệ.
- [ ] Fallback hoạt động khi thêm network delay > 15s.
- [ ] Chatbot trả lời câu hỏi về bác sĩ rảnh dựa trên dữ liệu DB thật.
HMS — Tài liệu 9: Integration Guide v1.0
