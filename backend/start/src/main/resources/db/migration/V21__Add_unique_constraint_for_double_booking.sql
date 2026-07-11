CREATE UNIQUE INDEX idx_appointments_first_slot_unique 
ON appointments(first_slot_id) 
WHERE status != 'CANCELLED';
