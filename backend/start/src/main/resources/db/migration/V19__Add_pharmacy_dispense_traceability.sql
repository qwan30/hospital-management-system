ALTER TABLE inventory_movements
  ADD COLUMN IF NOT EXISTS lot_id UUID REFERENCES inventory_lots(id) ON DELETE SET NULL;

ALTER TABLE inventory_movements
  ADD COLUMN IF NOT EXISTS medical_record_id UUID REFERENCES medical_records(id) ON DELETE SET NULL;

ALTER TABLE inventory_movements
  ADD COLUMN IF NOT EXISTS prescription_item_name VARCHAR(255);

ALTER TABLE inventory_movements
  ADD COLUMN IF NOT EXISTS dispensed_to_patient VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_lot
  ON inventory_movements(lot_id);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_medical_record
  ON inventory_movements(medical_record_id);
