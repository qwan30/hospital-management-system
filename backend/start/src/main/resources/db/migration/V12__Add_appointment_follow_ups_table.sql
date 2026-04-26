CREATE TABLE IF NOT EXISTS appointment_follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  follow_up_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_appointment_follow_ups_parent UNIQUE (parent_appointment_id)
);

CREATE INDEX IF NOT EXISTS idx_appointment_follow_ups_parent
  ON appointment_follow_ups(parent_appointment_id);
