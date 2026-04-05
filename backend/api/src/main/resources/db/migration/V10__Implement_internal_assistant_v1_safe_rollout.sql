ALTER TABLE knowledge_documents
  ADD COLUMN IF NOT EXISTS status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS version_label VARCHAR(80),
  ADD COLUMN IF NOT EXISTS owner_name VARCHAR(160),
  ADD COLUMN IF NOT EXISTS effective_date DATE,
  ADD COLUMN IF NOT EXISTS tags TEXT,
  ADD COLUMN IF NOT EXISTS source_filename VARCHAR(255),
  ADD COLUMN IF NOT EXISTS mime_type VARCHAR(120),
  ADD COLUMN IF NOT EXISTS raw_content TEXT,
  ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMP;

UPDATE knowledge_documents
SET status = 'ACTIVE',
    is_active = TRUE,
    version_label = COALESCE(version_label, 'seed-v1'),
    owner_name = COALESCE(owner_name, 'System Seed'),
    effective_date = COALESCE(effective_date, CURRENT_DATE),
    source_filename = COALESCE(source_filename, source_path),
    activated_at = COALESCE(activated_at, updated_at)
WHERE status IS NULL
   OR version_label IS NULL
   OR owner_name IS NULL
   OR effective_date IS NULL
   OR source_filename IS NULL
   OR activated_at IS NULL;

CREATE TABLE IF NOT EXISTS knowledge_document_ingestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  stage VARCHAR(40) NOT NULL,
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_document_ingestions_document
  ON knowledge_document_ingestions(document_id, created_at DESC);

CREATE TABLE IF NOT EXISTS internal_assistant_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  actor_role VARCHAR(32) NOT NULL,
  mode VARCHAR(20) NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  session_key VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_internal_assistant_sessions_actor
  ON internal_assistant_sessions(actor_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS internal_assistant_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES internal_assistant_sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  scope VARCHAR(20),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_internal_assistant_messages_session
  ON internal_assistant_messages(session_id, created_at ASC);

CREATE TABLE IF NOT EXISTS internal_assistant_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL UNIQUE REFERENCES internal_assistant_messages(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  value VARCHAR(32) NOT NULL,
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_internal_assistant_feedback_actor
  ON internal_assistant_feedback(actor_id, created_at DESC);
