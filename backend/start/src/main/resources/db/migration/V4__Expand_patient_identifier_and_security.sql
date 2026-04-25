ALTER TABLE patients
  ALTER COLUMN cccd TYPE TEXT;

ALTER TABLE patients
  DROP CONSTRAINT IF EXISTS patients_cccd_key;

ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS cccd_hash VARCHAR(64);

CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_cccd_hash
  ON patients (cccd_hash);
