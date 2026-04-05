CREATE TABLE IF NOT EXISTS patient_accounts (
  patient_id UUID PRIMARY KEY REFERENCES patients(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  test_name VARCHAR(255) NOT NULL,
  status VARCHAR(40) NOT NULL,
  result_summary TEXT,
  doctor_comment TEXT,
  attachment_url VARCHAR(500),
  collected_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patient_message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  channel VARCHAR(40) NOT NULL,
  unread_count INTEGER NOT NULL DEFAULT 0,
  last_message_preview TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patient_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES patient_message_threads(id) ON DELETE CASCADE,
  sender_role VARCHAR(32) NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lab_results_patient
  ON lab_results(patient_id, collected_at DESC);

CREATE INDEX IF NOT EXISTS idx_patient_message_threads_patient
  ON patient_message_threads(patient_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_patient_messages_thread
  ON patient_messages(thread_id, created_at ASC);
