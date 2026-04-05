ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS gender VARCHAR(20);

UPDATE patients
SET gender = COALESCE(gender, 'OTHER')
WHERE gender IS NULL;

ALTER TABLE patients
  ALTER COLUMN gender SET NOT NULL;

ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS province_or_city VARCHAR(120),
  ADD COLUMN IF NOT EXISTS district VARCHAR(120),
  ADD COLUMN IF NOT EXISTS street_address TEXT,
  ADD COLUMN IF NOT EXISTS occupation VARCHAR(120),
  ADD COLUMN IF NOT EXISTS blood_type VARCHAR(20),
  ADD COLUMN IF NOT EXISTS medical_history TEXT,
  ADD COLUMN IF NOT EXISTS drug_allergies TEXT,
  ADD COLUMN IF NOT EXISTS insurance_number VARCHAR(64);

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS booking_contact_full_name VARCHAR(200),
  ADD COLUMN IF NOT EXISTS booking_contact_relationship VARCHAR(100),
  ADD COLUMN IF NOT EXISTS booking_contact_phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS booking_contact_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS booking_contact_cccd TEXT,
  ADD COLUMN IF NOT EXISTS booking_contact_date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS booking_contact_gender VARCHAR(20);

CREATE TABLE IF NOT EXISTS hospital_content_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  body TEXT,
  image_url VARCHAR(500),
  cta_label VARCHAR(120),
  cta_href VARCHAR(500),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(150) NOT NULL UNIQUE,
  title VARCHAR(250) NOT NULL,
  summary TEXT NOT NULL,
  content TEXT,
  image_url VARCHAR(500),
  published_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  name VARCHAR(120) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'READY',
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_rooms_department_name UNIQUE (department_id, name)
);

CREATE TABLE IF NOT EXISTS doctor_work_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  day_of_week INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS special_closures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  closure_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_articles_published_at
  ON news_articles (published_at DESC);

CREATE INDEX IF NOT EXISTS idx_doctor_work_schedules_doctor_day
  ON doctor_work_schedules (doctor_id, day_of_week);

CREATE INDEX IF NOT EXISTS idx_special_closures_date
  ON special_closures (closure_date);
