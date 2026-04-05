Hospital Management System  **Tài liệu 10: Database Migration Plan**

**HOSPITAL MANAGEMENT SYSTEM**

Hệ thống Quản lý Bệnh viện

**TÀI LIỆU 10**

**Database Migration Plan**

*Flyway Setup · Convention · Migration Scripts · Rollback Strategy*

Phiên bản: 1.0  |  2025


# **1. Flyway Overview**
## **1.1 Flyway Là Gì**
Flyway là công cụ quản lý database schema migrations theo phiên bản. Mỗi thay đổi schema là một migration file có version number. Flyway theo dõi migration nào đã chạy qua bảng flyway\_schema\_history và chỉ chạy migration mới.
## **1.2 Tại Sao Dùng Flyway**
- Version control cho database schema — tracking thay đổi qua thời gian.
- Team work: nhiều developer không bị conflict schema.
- Tự động chạy khi Spring Boot khởi động — không cần thao tác thủ công.
- Reproducible: môi trường dev/staging/prod đều có cùng schema.
## **1.3 Cấu Hình Trong Spring Boot**
\# application.properties

spring.flyway.enabled=true

spring.flyway.locations=classpath:db/migration

spring.flyway.baseline-on-migrate=false

spring.flyway.validate-on-migrate=true

spring.flyway.out-of-order=false


# **2. Naming Convention**
## **2.1 Format Tên File**
V{version}\_\_{description}.sql

Ví dụ cụ thể:

- V1\_\_Create\_initial\_schema.sql
- V2\_\_Add\_vital\_signs\_to\_medical\_records.sql
- V3\_\_Add\_index\_follow\_up\_date.sql
- V4\_\_Add\_rooms\_table.sql
- V1.1\_\_Fix\_department\_name\_length.sql

## **2.2 Quy Tắc Đặt Tên**

|**Quy tắc**|**Chi tiết**|
| :- | :- |
|**Prefix V**|V = Versioned migration (áp dụng 1 lần). Không dùng R (Repeatable) trừ trường hợp đặc biệt.|
|**Version number**|Số nguyên hoặc decimal (1, 2, 3 hoặc 1.1, 1.2). Không bao giờ trùng.|
|**Dấu phân cách**|Hai dấu gạch dưới \_\_ giữa version và description.|
|**Description**|Snake\_case, mô tả rõ hành động: Create\_, Add\_, Drop\_, Rename\_, Add\_index\_|
|**Không sửa migration đã chạy**|Sau khi file SQL đã chạy trên bất kỳ môi trường nào: KHÔNG ĐƯỢC SỬA. Tạo migration mới.|
|**Không xóa migration file**|Flyway validate sẽ báo lỗi nếu file đã chạy bị xóa.|


# **3. Migration Scripts**
## **V1\_\_Create\_initial\_schema.sql**
-- Kích hoạt extension cho UUID generation

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================

-- BẢNG: departments

-- =============================================

CREATE TABLE departments (

`    `id           UUID        PRIMARY KEY DEFAULT gen\_random\_uuid(),

`    `name         VARCHAR(150) NOT NULL UNIQUE,

`    `description  TEXT,

`    `image\_url    VARCHAR(500),

`    `phone        VARCHAR(20),

`    `is\_active    BOOLEAN     NOT NULL DEFAULT TRUE,

`    `created\_at   TIMESTAMP   NOT NULL DEFAULT NOW(),

`    `updated\_at   TIMESTAMP   NOT NULL DEFAULT NOW()

);

-- =============================================

-- BẢNG: users (staff)

-- =============================================

CREATE TABLE users (

`    `id               UUID        PRIMARY KEY DEFAULT gen\_random\_uuid(),

`    `department\_id    UUID        REFERENCES departments(id) ON DELETE SET NULL,

`    `email            VARCHAR(255) NOT NULL UNIQUE,

`    `password\_hash    VARCHAR(255) NOT NULL,

`    `full\_name        VARCHAR(200) NOT NULL,

`    `phone            VARCHAR(20),

`    `role             VARCHAR(20)  NOT NULL CHECK (role IN ('DOCTOR','NURSE','ACCOUNTANT','ADMIN')),

`    `specialty        VARCHAR(200),

`    `qualification    VARCHAR(200),

`    `avatar\_url       VARCHAR(500),

`    `experience\_years INTEGER,

`    `is\_active        BOOLEAN     NOT NULL DEFAULT TRUE,

`    `created\_at       TIMESTAMP   NOT NULL DEFAULT NOW(),

`    `updated\_at       TIMESTAMP   NOT NULL DEFAULT NOW()

);

-- =============================================

-- BẢNG: time\_slots

-- =============================================

CREATE TABLE time\_slots (

`    `id         UUID        PRIMARY KEY DEFAULT gen\_random\_uuid(),

`    `doctor\_id  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,

`    `start\_time TIMESTAMP   NOT NULL,

`    `end\_time   TIMESTAMP   NOT NULL,

`    `status     VARCHAR(20)  NOT NULL DEFAULT 'AVAILABLE'

`               `CHECK (status IN ('AVAILABLE','BOOKED','BLOCKED','OFF')),

`    `created\_at TIMESTAMP   NOT NULL DEFAULT NOW(),

`    `CONSTRAINT no\_overlap UNIQUE (doctor\_id, start\_time)

);

-- =============================================

-- BẢNG: patients

-- =============================================

CREATE TABLE patients (

`    `id               UUID        PRIMARY KEY DEFAULT gen\_random\_uuid(),

`    `full\_name        VARCHAR(200) NOT NULL,

`    `cccd             VARCHAR(12)  NOT NULL UNIQUE,

`    `phone            VARCHAR(20)  NOT NULL,

`    `email            VARCHAR(255) NOT NULL,

`    `date\_of\_birth    DATE        NOT NULL,

`    `gender           VARCHAR(10)  NOT NULL CHECK (gender IN ('MALE','FEMALE','OTHER')),

`    `address          TEXT        NOT NULL,

`    `occupation       VARCHAR(150),

`    `blood\_type       VARCHAR(5),

`    `medical\_history  TEXT,

`    `drug\_allergies   TEXT,

`    `insurance\_number VARCHAR(20),

`    `created\_at       TIMESTAMP   NOT NULL DEFAULT NOW(),

`    `updated\_at       TIMESTAMP   NOT NULL DEFAULT NOW()

);

-- =============================================

-- BẢNG: appointments

-- =============================================

CREATE TABLE appointments (

`    `id                  UUID        PRIMARY KEY DEFAULT gen\_random\_uuid(),

`    `patient\_id          UUID        NOT NULL REFERENCES patients(id),

`    `doctor\_id           UUID        NOT NULL REFERENCES users(id),

`    `first\_slot\_id       UUID        NOT NULL REFERENCES time\_slots(id),

`    `symptoms            TEXT        NOT NULL,

`    `ai\_duration\_minutes INTEGER     NOT NULL DEFAULT 30,

`    `ai\_complexity       VARCHAR(20),

`    `is\_for\_family       BOOLEAN     NOT NULL DEFAULT FALSE,

`    `status              VARCHAR(20)  NOT NULL DEFAULT 'PENDING'

`                        `CHECK (status IN ('PENDING','CONFIRMED','CHECKED\_IN',

`                               `'IN\_PROGRESS','DONE','CANCELLED')),

`    `confirmation\_code   VARCHAR(20)  NOT NULL UNIQUE,

`    `checked\_in\_at       TIMESTAMP,

`    `reminder\_sent       BOOLEAN     NOT NULL DEFAULT FALSE,

`    `created\_at          TIMESTAMP   NOT NULL DEFAULT NOW(),

`    `updated\_at          TIMESTAMP   NOT NULL DEFAULT NOW()

);

-- =============================================

-- BẢNG: family\_members

-- =============================================

CREATE TABLE family\_members (

`    `id             UUID       PRIMARY KEY DEFAULT gen\_random\_uuid(),

`    `appointment\_id UUID       NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,

`    `full\_name      VARCHAR(200) NOT NULL,

`    `relationship   VARCHAR(50)  NOT NULL,

`    `cccd           VARCHAR(12),

`    `date\_of\_birth  DATE,

`    `gender         VARCHAR(10)

);

-- =============================================

-- BẢNG: medical\_records

-- =============================================

CREATE TABLE medical\_records (

`    `id             UUID    PRIMARY KEY DEFAULT gen\_random\_uuid(),

`    `appointment\_id UUID    NOT NULL UNIQUE REFERENCES appointments(id),

`    `doctor\_id      UUID    NOT NULL REFERENCES users(id),

`    `diagnosis      TEXT    NOT NULL,

`    `clinical\_notes TEXT,

`    `vital\_signs    JSONB,

`    `follow\_up\_date DATE,

`    `follow\_up\_slot\_id UUID REFERENCES time\_slots(id),

`    `pdf\_url        VARCHAR(500),

`    `email\_sent     BOOLEAN NOT NULL DEFAULT FALSE,

`    `created\_at     TIMESTAMP NOT NULL DEFAULT NOW()

);

-- =============================================

-- BẢNG: prescription\_items

-- =============================================

CREATE TABLE prescription\_items (

`    `id             UUID       PRIMARY KEY DEFAULT gen\_random\_uuid(),

`    `record\_id      UUID       NOT NULL REFERENCES medical\_records(id) ON DELETE CASCADE,

`    `medicine\_name  VARCHAR(200) NOT NULL,

`    `dosage         VARCHAR(100) NOT NULL,

`    `frequency      VARCHAR(100) NOT NULL,

`    `duration\_days  INTEGER     NOT NULL,

`    `instructions   TEXT,

`    `sort\_order     INTEGER     NOT NULL DEFAULT 0

);

-- =============================================

-- BẢNG: invoices

-- =============================================

CREATE TABLE invoices (

`    `id              UUID           PRIMARY KEY DEFAULT gen\_random\_uuid(),

`    `appointment\_id  UUID           NOT NULL UNIQUE REFERENCES appointments(id),

`    `invoice\_number  VARCHAR(30)    NOT NULL UNIQUE,

`    `base\_fee        DECIMAL(12,2)  NOT NULL,

`    `additional\_fees JSONB,

`    `total\_amount    DECIMAL(12,2)  NOT NULL,

`    `status          VARCHAR(20)    NOT NULL DEFAULT 'PENDING'

`                    `CHECK (status IN ('PENDING','PAID','CANCELLED')),

`    `payment\_method  VARCHAR(20),

`    `paid\_at         TIMESTAMP,

`    `collected\_by    UUID           REFERENCES users(id),

`    `created\_at      TIMESTAMP      NOT NULL DEFAULT NOW(),

`    `updated\_at      TIMESTAMP      NOT NULL DEFAULT NOW()

);

-- =============================================

-- BẢNG: service\_pricing

-- =============================================

CREATE TABLE service\_pricing (

`    `id             UUID          PRIMARY KEY DEFAULT gen\_random\_uuid(),

`    `department\_id  UUID          REFERENCES departments(id) ON DELETE SET NULL,

`    `service\_name   VARCHAR(200)  NOT NULL,

`    `price          DECIMAL(12,2) NOT NULL,

`    `effective\_from DATE          NOT NULL,

`    `effective\_to   DATE,

`    `created\_by     UUID          REFERENCES users(id),

`    `created\_at     TIMESTAMP     NOT NULL DEFAULT NOW()

);

## **V2\_\_Add\_performance\_indexes.sql**
-- Index cho cron job nhắc tái khám (chạy mỗi ngày)

CREATE INDEX idx\_medical\_records\_followup

`    `ON medical\_records(follow\_up\_date, reminder\_sent)

`    `WHERE follow\_up\_date IS NOT NULL AND reminder\_sent = FALSE;

-- Index cho query slots available theo bác sĩ và ngày

CREATE INDEX idx\_time\_slots\_doctor\_date

`    `ON time\_slots(doctor\_id, start\_time, status);

-- Index cho tìm kiếm bệnh nhân theo CCCD

CREATE INDEX idx\_patients\_cccd ON patients(cccd);

-- Index cho query appointments theo bác sĩ + ngày

CREATE INDEX idx\_appointments\_doctor\_date

`    `ON appointments(doctor\_id, created\_at, status);

-- Index cho báo cáo doanh thu theo ngày

CREATE INDEX idx\_invoices\_paid\_date

`    `ON invoices(paid\_at, status) WHERE status = 'PAID';

## **V3\_\_Add\_audit\_log\_table.sql**
CREATE TABLE audit\_logs (

`    `id          UUID        PRIMARY KEY DEFAULT gen\_random\_uuid(),

`    `user\_id     UUID        REFERENCES users(id) ON DELETE SET NULL,

`    `action      VARCHAR(50)  NOT NULL,

`    `entity\_type VARCHAR(50)  NOT NULL,

`    `entity\_id   UUID,

`    `old\_value   JSONB,

`    `new\_value   JSONB,

`    `ip\_address  VARCHAR(45),

`    `created\_at  TIMESTAMP   NOT NULL DEFAULT NOW()

);

CREATE INDEX idx\_audit\_logs\_created ON audit\_logs(created\_at DESC);


# **4. Rollback Strategy**
## **4.1 Flyway Không Hỗ Trợ Undo Miễn Phí**
Flyway Community Edition không có tính năng undo/rollback tự động. Chiến lược rollback là tạo migration mới để reverse thay đổi.
## **4.2 Rollback Pattern**
- Thêm cột: Rollback = tạo V{n+1}\_\_Drop\_column\_X.sql với ALTER TABLE DROP COLUMN.
- Xóa cột: Cực kỳ nguy hiểm, cần backup trước. Rollback = tạo lại cột và restore data.
- Tạo bảng: Rollback = DROP TABLE IF EXISTS.
- Thêm constraint: Rollback = ALTER TABLE DROP CONSTRAINT.
## **4.3 Checklist Trước Khi Merge Migration**
- [ ] Migration file tên đúng convention V{version}\_\_.sql.
- [ ] Version number chưa tồn tại (kiểm tra folder db/migration).
- [ ] SQL đã test trên local Docker PostgreSQL.
- [ ] Không có lệnh DROP TABLE hoặc DROP COLUMN không có backup plan.
- [ ] Không sửa file migration đã commit.
- [ ] Có rollback script tương ứng trong thư mục db/rollback/ (để tham khảo).
HMS — Tài liệu 10: Database Migration Plan v1.0
