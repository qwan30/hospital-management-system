CREATE TABLE IF NOT EXISTS appointment_vital_signs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  blood_pressure VARCHAR(32),
  temperature NUMERIC(5,2),
  weight NUMERIC(6,2),
  height NUMERIC(5,2),
  heart_rate INTEGER,
  respiratory_rate INTEGER,
  oxygen_saturation NUMERIC(5,2),
  recorded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uk_appointment_vital_signs_appointment UNIQUE (appointment_id)
);

CREATE INDEX IF NOT EXISTS idx_appointment_vital_signs_appointment
  ON appointment_vital_signs(appointment_id);
