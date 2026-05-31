CREATE TABLE IF NOT EXISTS email_delivery_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_type VARCHAR(80) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  provider VARCHAR(40) NOT NULL,
  status VARCHAR(40) NOT NULL,
  attachment_file_name VARCHAR(255),
  failure_reason VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_delivery_attempts_created
  ON email_delivery_attempts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_delivery_attempts_status
  ON email_delivery_attempts(status, created_at DESC);
