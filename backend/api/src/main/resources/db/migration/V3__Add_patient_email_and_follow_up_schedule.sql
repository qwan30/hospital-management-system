ALTER TABLE IF EXISTS patients
  ADD COLUMN IF NOT EXISTS email VARCHAR(255);

UPDATE patients
SET email = CONCAT(REPLACE(LOWER(cccd), ' ', '-'), '@pending.local')
WHERE email IS NULL OR BTRIM(email) = '';

ALTER TABLE IF EXISTS patients
  ALTER COLUMN email SET NOT NULL;

ALTER TABLE IF EXISTS medical_records
  ADD COLUMN IF NOT EXISTS reminder_scheduled_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP;

UPDATE medical_records
SET reminder_sent_at = COALESCE(reminder_sent_at, created_at)
WHERE reminder_sent = TRUE AND reminder_sent_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_medical_records_follow_up_due
  ON medical_records(reminder_sent, reminder_scheduled_at);
