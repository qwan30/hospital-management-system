Hospital Management System  **Tài liệu 7: Deployment Guide**

**HOSPITAL MANAGEMENT SYSTEM**

Hệ thống Quản lý Bệnh viện

**TÀI LIỆU 7**

**Deployment Guide**

*Cài đặt · Docker Compose · Biến môi trường · Seed data · Troubleshooting*

Phiên bản: 1.0  |  2025


# **1. Yêu Cầu Hệ Thống**
## **1.1 Phần Mềm Cần Cài**

|**Phần mềm**|**Phiên bản tối thiểu**|**Link tải**|
| :- | :- | :- |
|**Docker Desktop**|24\.x|https://docs.docker.com/desktop|
|**Docker Compose**|2\.x (kèm Docker Desktop)|Tích hợp sẵn trong Docker Desktop|
|**Git**|2\.x|https://git-scm.com|
|**Node.js (optional, dev only)**|18\.x LTS|https://nodejs.org|
|**Java 17 (optional, dev only)**|17 LTS|https://adoptium.net|
|**VS Code / IntelliJ IDEA**|Bất kỳ|IDE tùy chọn|

## **1.2 Tài Nguyên Máy Tính**
- RAM: tối thiểu 8GB (khuyến nghị 16GB khi chạy cả Docker + IDE).
- Disk: tối thiểu 10GB trống cho Docker images + DB data.
- CPU: bất kỳ, hiện đại hơn thì build nhanh hơn.
- OS: Windows 10/11 (WSL2 required), macOS 12+, hoặc Ubuntu 20.04+.


# **2. Cài Đặt Từ Đầu (Fresh Install)**
## **2.1 Clone Repository**
git clone https://github.com/your-org/hospital-management-system.git

cd hospital-management-system

## **2.2 Cấu Hình Biến Môi Trường**
Sao chép file mẫu và điền giá trị thực:

cp .env.example .env

Mở file .env và điền đầy đủ các giá trị sau:

|**Biến môi trường**|**Giá trị cần điền**|
| :- | :- |
|POSTGRES\_DB|hospital\_db|
|POSTGRES\_USER|hospital\_user|
|POSTGRES\_PASSWORD|[Đặt mật khẩu mạnh, VD: H0sp!tal2025]|
|JWT\_SECRET|[Chuỗi ngẫu nhiên ≥32 ký tự, VD: dùng openssl rand -base64 32]|
|JWT\_EXPIRATION\_MS|900000|
|ANTHROPIC\_API\_KEY|sk-ant-api03-... (lấy từ console.anthropic.com)|
|GMAIL\_CLIENT\_ID|[Lấy từ Google Cloud Console]|
|GMAIL\_CLIENT\_SECRET|[Lấy từ Google Cloud Console]|
|GMAIL\_REFRESH\_TOKEN|[Lấy sau bước OAuth2 Authorization]|
|GMAIL\_SENDER\_EMAIL|youremail@gmail.com|
|HOSPITAL\_NAME|Bệnh viện Demo HMS|
|HOSPITAL\_ADDRESS|123 Đường ABC, Quận 1, TP.HCM|
|HOSPITAL\_PHONE|028 1234 5678|
|VITE\_API\_BASE\_URL|http://localhost:8080/api/v1|

## **2.3 Khởi Động Ứng Dụng**
Chạy lệnh sau từ thư mục gốc dự án:

docker-compose up --build -d

Lần đầu chạy sẽ mất 5–10 phút để tải images và build. Các lần sau chỉ mất 30–60 giây.

Kiểm tra tất cả container đang chạy:

docker-compose ps

Kết quả mong đợi — 3 container đều STATUS Up:

hms-postgres    Up    0.0.0.0:5432->5432/tcp

hms-backend     Up    0.0.0.0:8080->8080/tcp

hms-frontend    Up    0.0.0.0:3000->80/tcp

## **2.4 Truy Cập Ứng Dụng**
- Trang web (bệnh nhân): http://localhost:3000
- Dashboard staff: http://localhost:3000/login
- API documentation (Swagger UI): http://localhost:8080/swagger-ui
- Database (nếu cần kết nối trực tiếp): localhost:5432


# **3. Seed Data (Dữ Liệu Mẫu)**
## **3.1 Chạy Seed Script**
Sau khi ứng dụng khởi động lần đầu, Flyway tự động chạy migrations tạo schema. Để nạp dữ liệu mẫu:

docker-compose exec backend java -jar app.jar --seed

Hoặc chạy SQL script trực tiếp vào PostgreSQL:

docker-compose exec postgres psql -U hospital\_user -d hospital\_db -f /seed/seed.sql

## **3.2 Tài Khoản Mặc Định Sau Seed**

|**Email**|**Mật khẩu**|**Role**|**Tên**|
| :- | :- | :- | :- |
|admin@hospital.vn|Admin@1234|**ADMIN**|Quản trị viên|
|doctor1@hospital.vn|Doctor@1234|**DOCTOR**|BS. Nguyễn Văn An|
|doctor2@hospital.vn|Doctor@1234|**DOCTOR**|BS. Trần Thị Bình|
|nurse@hospital.vn|Nurse@1234|**NURSE**|Y tá Lê Thị Cúc|
|accountant@hospital.vn|Acc@1234|**ACCOUNTANT**|KT. Phạm Văn Dũng|


# **4. Cấu Trúc Docker Compose**
version: '3.9'

services:

`  `postgres:

`    `image: postgres:15-alpine

`    `environment:

`      `POSTGRES\_DB: ${POSTGRES\_DB}

`      `POSTGRES\_USER: ${POSTGRES\_USER}

`      `POSTGRES\_PASSWORD: ${POSTGRES\_PASSWORD}

`    `volumes:

`      `- postgres\_data:/var/lib/postgresql/data

`    `healthcheck:

`      `test: ['CMD-SHELL', 'pg\_isready -U ${POSTGRES\_USER}']

`      `interval: 10s

`  `backend:

`    `build: ./backend

`    `depends\_on:

`      `postgres:

`        `condition: service\_healthy

`    `env\_file: .env

`    `ports:

`      `- '8080:8080'

`  `frontend:

`    `build: ./frontend

`    `depends\_on: [backend]

`    `ports:

`      `- '3000:80'

volumes:

`  `postgres\_data:

# **5. Lệnh Thường Dùng**

|**Lệnh**|**Mô tả**|
| :- | :- |
|docker-compose up -d|Khởi động tất cả services (background)|
|docker-compose down|Dừng tất cả services|
|docker-compose restart backend|Restart chỉ backend (sau khi thay đổi code)|
|docker-compose logs -f backend|Xem log backend real-time|
|docker-compose logs -f|Xem log tất cả services|
|docker-compose exec postgres psql -U hospital\_user hospital\_db|Kết nối vào PostgreSQL|
|docker-compose pull && docker-compose up --build -d|Cập nhật và restart|
|docker-compose down -v|Xóa container VÀ data (CẢNH BÁO: mất data!)|


# **6. Troubleshooting — Xử Lý Lỗi Thường Gặp**
## **Lỗi: Port 8080 already in use**
- Nguyên nhân: Một ứng dụng khác đang dùng cổng 8080.
- Cách xử lý: Thay đổi port trong docker-compose.yml từ '8080:8080' thành '8081:8080', sau đó cập nhật VITE\_API\_BASE\_URL=http://localhost:8081/api/v1 trong .env.

## **Lỗi: Backend không kết nối được database**
- Kiểm tra: docker-compose logs postgres — xem postgres có healthcheck pass không.
- Kiểm tra biến POSTGRES\_USER, POSTGRES\_PASSWORD trong .env khớp với postgres service.
- Thử: docker-compose restart backend (đợi postgres khởi động xong mới restart backend).

## **Lỗi: Gmail API — Authentication failed**
- Kiểm tra GMAIL\_REFRESH\_TOKEN còn hợp lệ (xem mục Integration Guide).
- Đảm bảo GMAIL\_SENDER\_EMAIL khớp với email Google account đã cấp OAuth2.
- Nếu test local không muốn gửi email thật: Set GMAIL\_MOCK=true để mock email service.

## **Lỗi: Frontend trắng / không load**
- Kiểm tra: docker-compose logs frontend
- Kiểm tra VITE\_API\_BASE\_URL trong .env có đúng URL backend không.
- Thử hard refresh: Ctrl+Shift+R trên browser.
HMS — Tài liệu 7: Deployment Guide v1.0
